
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDb() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'menubldr',
  });

  try {
    console.log('Checking admins table...');
    const [admins] = await pool.execute('SELECT id, email FROM admins');
    console.log('Admins found:', admins);

    console.log('Checking admin_sessions table...');
    const [columns] = await pool.execute('SHOW COLUMNS FROM admin_sessions');
    console.log('admin_sessions columns:', columns);

    const [sessions] = await pool.execute('SELECT COUNT(*) as count FROM admin_sessions');
    console.log('Active sessions:', sessions[0].count);

  } catch (err) {
    console.error('Database Check Error:', err);
  } finally {
    await pool.end();
  }
}

checkDb();
