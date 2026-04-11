
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
    const [rows] = await pool.execute('SELECT id, title, last_updated, created_at FROM magic_docs LIMIT 5');
    console.log('Magic Docs Rows:', rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkDocs();
