import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import zlib from 'zlib';

export async function GET() {
  try {
    const host = process.env.TIDB_HOST;
    const user = process.env.TIDB_USER;
    const password = process.env.TIDB_PASSWORD;
    const database = process.env.TIDB_DATABASE || 'otzo_db';
    const port = Number(process.env.TIDB_PORT) || 4000;

    // 1. Verificación previa de variables para evitar crash en Vercel
    if (!host || !user || !password) {
      return NextResponse.json({
        error: 'Error de configuración en Vercel',
        mensaje: 'Faltan variables de entorno (TIDB_HOST, TIDB_USER o TIDB_PASSWORD).'
      }, { status: 500 });
    }

    // 2. Conexión a TiDB con SSL compatible con Serverless / Vercel
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database,
      port,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false // Vital para evitar rechazo de certificados en Vercel
      }
    });

    const tablas = ['usuarios', 'productos', 'respaldos_log'];
    let sqlDump = `-- Respaldo TiDB Cloud (Cafeteria Otzo) - ${new Date().toISOString()}\n\n`;

    for (const tabla of tablas) {
      try {
        const [showCreate]: any = await connection.query(`SHOW CREATE TABLE \`${tabla}\``);
        if (showCreate && showCreate[0]) {
          const createStmt = showCreate[0]['Create Table'] || showCreate[0]['Create View'];
          if (createStmt) {
            sqlDump += `${createStmt};\n\n`;
          }
        }

        const [rows]: any = await connection.query(`SELECT * FROM \`${tabla}\``);
        if (Array.isArray(rows) && rows.length > 0) {
          sqlDump += `INSERT INTO \`${tabla}\` VALUES \n`;
          const insertRows = rows.map((row: any) => {
            const values = Object.values(row).map(val => {
              if (val === null || val === undefined) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
              return val;
            });
            return `(${values.join(', ')})`;
          });
          sqlDump += `${insertRows.join(',\n')};\n\n`;
        }
      } catch (errTabla: any) {
        console.warn(`Aviso en tabla ${tabla}:`, errTabla?.message || errTabla);
      }
    }

    await connection.end();

    const compressedBuffer = zlib.gzipSync(Buffer.from(sqlDump, 'utf-8'));
    const fechaStr = new Date().toISOString().slice(0, 10);

    return new NextResponse(compressedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="respaldo_otzo_${fechaStr}_${Date.now()}.sql.gz"`,
      },
    });

  } catch (error: any) {
    console.error('Error en Serverless Function:', error);
    return NextResponse.json({
      error: 'Error al generar el respaldo en Vercel',
      detalle: error?.message || String(error)
    }, { status: 500 });
  }
}
