import { NextRequest, NextResponse } from 'next/server';
import mysql, { type Connection } from 'mysql2/promise';
import crypto from 'node:crypto';
import { gzipSync } from 'node:zlib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const quoteIdentifier = (identifier: string): string =>
  `\`${identifier.replace(/`/g, '``')}\``;

const jsonError = (message: string, status: number): NextResponse =>
  NextResponse.json({ error: message }, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });

const getSessionUserId = (request: NextRequest, secret: string): number | null => {
  const token = request.cookies.get('otzo_session')?.value;
  const [payload, providedSignature, ...extraParts] = token?.split('.') ?? [];
  if (!payload || !providedSignature || extraParts.length > 0) return null;

  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest();
  let signature: Buffer;
  try {
    signature = Buffer.from(providedSignature, 'base64url');
  } catch {
    return null;
  }
  if (signature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      userId?: unknown;
      expiresAt?: unknown;
    };
    if (typeof session.userId !== 'number' || !Number.isSafeInteger(session.userId) ||
        typeof session.expiresAt !== 'number' || !Number.isFinite(session.expiresAt) ||
        session.expiresAt <= Date.now()) {
      return null;
    }
    return session.userId;
  } catch {
    return null;
  }
};

export async function POST(request: NextRequest): Promise<Response> {
  let connection: Connection | undefined;

  try {
    const sessionSecret = process.env.TIDB_PRIVATE_KEY?.trim();
    if (!sessionSecret) return jsonError('No hay una sesión autenticada.', 401);
    const usuarioId = getSessionUserId(request, sessionSecret);
    if (!usuarioId) return jsonError('No hay una sesión autenticada.', 401);

    const host = process.env.TIDB_DB_HOST;
    const user = process.env.TIDB_DB_USER;
    const password = process.env.TIDB_DB_PASSWORD;
    const database = process.env.TIDB_DB_NAME;
    const portValue = process.env.TIDB_DB_PORT;
    const port = Number(portValue);

    if (!host || !user || !password || !database || !portValue ||
        !Number.isInteger(port) || port < 1 || port > 65535) {
      console.error('Falta configurar una o más variables directas de conexión a TiDB.');
      return jsonError('El servicio de respaldos no está configurado.', 500);
    }

    connection = await mysql.createConnection({
      host,
      user,
      password,
      database,
      port,
      ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
      supportBigNumbers: true,
      bigNumberStrings: true,
      dateStrings: true,
    });

    const [usuarios] = await connection.query(
      'SELECT rol, estado FROM `usuarios` WHERE `id` = ? LIMIT 1',
      [usuarioId],
    );
    const usuario = (usuarios as Array<{ rol?: string; estado?: string }>)[0];

    if (!usuario) {
      return jsonError('La sesión no corresponde a un usuario válido.', 401);
    }
    if (usuario.rol !== 'Administrador' || usuario.estado !== 'Activo') {
      return jsonError('Solo un administrador activo puede generar respaldos.', 403);
    }

    const sql: string[] = [
      '-- Respaldo completo de TiDB Cloud generado por Cafeteria Otzo.',
      `-- Base de datos: ${database}`,
      `-- Fecha: ${new Date().toISOString()}`,
      'SET NAMES utf8mb4;',
      'SET FOREIGN_KEY_CHECKS=0;',
      '',
    ];
    const viewDefinitions: string[] = [];

    const [tableResults] = await connection.query('SHOW TABLES');
    const tableNames = (tableResults as Array<Record<string, unknown>>)
      .map((row) => Object.values(row)[0])
      .filter((tableName): tableName is string => typeof tableName === 'string');

    for (const tableName of tableNames) {
      const quotedTable = quoteIdentifier(tableName);
      const [createResults] = await connection.query(`SHOW CREATE TABLE ${quotedTable}`);
      const createRow = (createResults as Array<Record<string, unknown>>)[0];
      const createTable = createRow?.['Create Table'];
      const createView = createRow?.['Create View'];

      if (typeof createView === 'string') {
        viewDefinitions.push(`DROP VIEW IF EXISTS ${quotedTable};\n${createView};\n`);
        continue;
      }
      if (typeof createTable !== 'string') {
        throw new Error(`No se pudo leer la estructura de la tabla ${tableName}.`);
      }

      sql.push(`-- Estructura de ${tableName}`);
      sql.push(`DROP TABLE IF EXISTS ${quotedTable};`);
      sql.push(`${createTable};`, '');

      const [rowsResult, fieldsResult] = await connection.query(`SELECT * FROM ${quotedTable}`);
      const rows = rowsResult as Array<Record<string, unknown>>;
      const columns = (fieldsResult as Array<{ name: string }>).map((field) => field.name);

      if (columns.length === 0) continue;

      const quotedColumns = columns.map(quoteIdentifier).join(', ');
      for (let offset = 0; offset < rows.length; offset += 100) {
        const batch = rows.slice(offset, offset + 100);
        const values = batch.map((row) => {
          const escapedValues = columns.map((column) => {
            const value = row[column];
            const escapedValue = value !== null && typeof value === 'object' &&
              !(value instanceof Date) && !Buffer.isBuffer(value)
              ? JSON.stringify(value)
              : value;
            return connection!.escape(escapedValue);
          });
          return `(${escapedValues.join(', ')})`;
        });

        sql.push(
          `INSERT INTO ${quotedTable} (${quotedColumns}) VALUES\n${values.join(',\n')};`,
        );
      }
      sql.push('');
    }

    if (viewDefinitions.length > 0) {
      sql.push('-- Vistas');
      sql.push(...viewDefinitions);
    }
    sql.push('SET FOREIGN_KEY_CHECKS=1;', '');

    const timestamp = new Date();
    const date = timestamp.toISOString().slice(0, 10);
    const fileName = `respaldo_otzo_${date}_${timestamp.getTime()}.sql.gz`;
    const compressed = gzipSync(sql.join('\n'), { level: 9 });
    const binaryBody = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(compressed));
        controller.close();
      },
    });

    return new Response(binaryBody, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error al generar el respaldo de TiDB:', error);
    return jsonError('No fue posible generar el respaldo de la base de datos.', 500);
  } finally {
    if (connection) {
      await connection.end().catch((error) => {
        console.error('Error al cerrar la conexión con TiDB:', error);
      });
    }
  }
}
