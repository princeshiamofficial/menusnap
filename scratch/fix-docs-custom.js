
const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/../.env' }); // Adjust if .env is elsewhere

async function runCustomMigration() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'menubldr',
  });

  try {
    console.log('Fetching magic_docs...');
    const [rows] = await pool.execute(
      "SELECT id, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt, DATE_FORMAT(last_updated, '%Y-%m-%d %H:%i:%s') as lastUpdated FROM magic_docs"
    );

    let updatedCount = 0;

    for (const row of rows) {
      let created = row.createdAt;
      let updated = row.lastUpdated;
      
      let updateCreated = false;
      let updateUpdated = false;

      // 1. Ignore entirely for this ID
      if (row.id === '1a3940e3-5f01-42c1-b16a-0d4f6c0df69b') {
        continue;
      }

      const processDate = (dateStr) => {
        if (!dateStr) return null;
        
        // Parse UTC-style to avoid JS timezone magic
        const parts = dateStr.split(/[- :]/);
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        const hours = parseInt(parts[3], 10);
        const minutes = parseInt(parts[4], 10);
        const seconds = parseInt(parts[5], 10);

        const pad = n => String(n).padStart(2, '0');
        const currentDateStr = `${year}-${pad(month)}-${pad(day)} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

        let d = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));

        // Logic check:
        if (currentDateStr >= '2026-04-11 00:00:00' && currentDateStr < '2026-04-12 00:00:00') {
          // 11 tarikh er date gulo 6 ghonta bariye daw (+6 hours)
          d.setUTCHours(d.getUTCHours() + 6);
        } else if (currentDateStr < '2026-04-11 00:00:00') {
          // 11 tarikh er ager gula localtime theke utc koro (-6 hours)
          d.setUTCHours(d.getUTCHours() - 6);
        }

        return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
      };

      let newCreated = processDate(created);
      let newUpdated = processDate(updated);

      if (newCreated && newCreated !== created) updateCreated = true;
      if (newUpdated && newUpdated !== updated) updateUpdated = true;

      // 2. Ignore last_updated for this specific ID
      if (row.id === '52069953-ab2b-4177-82a4-a0656f91add9') {
        updateUpdated = false;
      }

      if (updateCreated || updateUpdated) {
        let setClauses = [];
        let queryParams = [];
        
        if (updateCreated) {
          setClauses.push("created_at = ?");
          queryParams.push(newCreated);
        }
        if (updateUpdated) {
          setClauses.push("last_updated = ?");
          queryParams.push(newUpdated);
        }
        
        const sql = `UPDATE magic_docs SET ${setClauses.join(', ')} WHERE id = ?`;
        queryParams.push(row.id);
        
        await pool.execute(sql, queryParams);
        updatedCount++;
        console.log(`Updated ID: ${row.id}`);
      }
    }
    
    console.log(`Custom migration successful. Updated ${updatedCount} rows.`);

  } catch (err) {
    console.error('Migration Error:', err);
  } finally {
    await pool.end();
  }
}

runCustomMigration();
