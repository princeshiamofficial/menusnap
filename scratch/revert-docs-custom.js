
const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/../.env' }); 

async function revertCustomMigration() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'menubldr',
  });

  try {
    console.log('Reverting custom magic_docs timestamps (undoing the last script)...');
    
    const [rows] = await pool.execute(
      "SELECT id, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt, DATE_FORMAT(last_updated, '%Y-%m-%d %H:%i:%s') as lastUpdated FROM magic_docs"
    );

    let updatedCount = 0;

    for (const row of rows) {
      let created = row.createdAt;
      let updated = row.lastUpdated;
      
      let updateCreated = false;
      let updateUpdated = false;

      // 1. Completely ignore this ID
      if (row.id === '1a3940e3-5f01-42c1-b16a-0d4f6c0df69b') {
        continue;
      }

      const processDate = (dateStr) => {
        if (!dateStr) return null;
        
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

        // EXACT INVERSE OF THE PREVIOUS SCRIPT:
        if (currentDateStr >= '2026-04-11 00:00:00') {
          // If it's now 11th or after, we must have added 6 earlier. So we minus 6.
          d.setUTCHours(d.getUTCHours() - 6);
        } else {
          // If it's before 11th, we must have minused 6 earlier. So we add 6.
          d.setUTCHours(d.getUTCHours() + 6);
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
      }
    }
    
    console.log(`Reversal successful. Reverted ${updatedCount} rows back to their original state.`);

  } catch (err) {
    console.error('Reversion Error:', err);
  } finally {
    await pool.end();
  }
}

revertCustomMigration();
