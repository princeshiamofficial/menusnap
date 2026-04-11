
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixTodayDocs() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'menubldr',
  });

  try {
    console.log('Fixing April 11th timestamps (Adding 6 hours back)...');
    
    // Target: All docs except the specific one, and only for those on April 11th
    // We add 6 hours back to reverse the accidental subtraction for today's docs.
    const [result] = await pool.execute(`
      UPDATE magic_docs 
      SET 
        last_updated = DATE_ADD(last_updated, INTERVAL 6 HOUR),
        created_at = DATE_ADD(created_at, INTERVAL 6 HOUR),
        deleted_at = IF(deleted_at IS NOT NULL, DATE_ADD(deleted_at, INTERVAL 6 HOUR), NULL)
      WHERE id != '52069953-ab2b-4177-82a4-a0656f91add9'
      AND (DATE(last_updated) = '2026-04-11' OR DATE(created_at) = '2026-04-11')
    `);

    console.log(`Success! Fixed ${result.affectedRows} documents.`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

fixTodayDocs();
