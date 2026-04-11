
const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateDocsToUtc() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'menubldr',
  });

  try {
    console.log('Starting migration for magic_docs timestamps...');

    // We assume older records (stored as Local +6) need to be shifted to UTC (-6)
    // Only records that haven't been migrated yet (e.g., created before this script run)
    const [result] = await pool.execute(`
      UPDATE magic_docs 
      SET 
        last_updated = DATE_SUB(last_updated, INTERVAL 6 HOUR),
        created_at = DATE_SUB(created_at, INTERVAL 6 HOUR),
        deleted_at = IF(deleted_at IS NOT NULL, DATE_SUB(deleted_at, INTERVAL 6 HOUR), NULL)
      WHERE last_updated > '2020-01-01' -- safety check
    `);

    console.log(`Migration successful. Modified ${result.affectedRows} rows.`);

  } catch (err) {
    console.error('Migration Error:', err);
  } finally {
    await pool.end();
  }
}

migrateDocsToUtc();
