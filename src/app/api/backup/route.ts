import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import zlib from 'zlib';

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      port: Number(process.env.TIDB_PORT) || 4000,
      ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
    });

    // Ajusta las tablas según la base de datos
    const tablas = ['usuarios', 'productos', 'respaldos_log'];
    let sqlDump = `-- Respaldo TiDB Cloud (Cafeteria Otzo) - ${new Date().toISOString()}\n\n`;

    for (const tabla of tablas) {
      const [showCreate]: any = await connection.query(`SHOW CREATE TABLE \`${tabla}\``);
      if (showCreate && showCreate[0]) {
        sqlDump += `${showCreate[0]['Create Table']};\n\n`;
      }

      const [rows]: any = await connection.query(`SELECT * FROM \`${tabla}\``);
      if (Array.isArray(rows) && rows.length > 0) {
        sqlDump += `INSERT INTO \`${tabla}\` VALUES \n`;
        const insertRows = rows.map((row: any) => {
          const values = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return val;
          });
          return `(${values.join(', ')})`;
        });
        sqlDump += `${insertRows.join(',\n')};\n\n`;
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
    console.error('Error generando respaldo .sql.gz:', error);
    return NextResponse.json({ error: 'Error al generar el archivo de respaldo.' }, { status: 500 });
  }
}
