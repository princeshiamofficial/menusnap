
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDocs() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'menubldr',
  });

  try {
    console.log('Checking magic_docs timing...');
    const [docs] = await pool.execute('SELECT title, last_updated, created_at FROM magic_docs LIMIT 10');
    console.log('Docs data:', JSON.stringify(docs, null, 2));

    const [now] = await pool.execute('SELECT NOW() as db_now, UTC_TIMESTAMP() as db_utc');
    console.log('DB Time:', now[0]);

  } catch (err) {
    console.error('Database Check Error:', err);
  } finally {
    await pool.end();
  }
}

checkDocs();
