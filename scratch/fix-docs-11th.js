
const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/../.env' }); 

async function fix11thDates() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'menubldr',
  });

  try {
    console.log('Fixing April 11th dates (-6 hours) and ensuring > 9 AM...');
    
    const [rows] = await pool.execute(
      "SELECT id, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt, DATE_FORMAT(last_updated, '%Y-%m-%d %H:%i:%s') as lastUpdated FROM magic_docs"
    );

    let updatedCount = 0;

    for (const row of rows) {
      // 1. Ignore `1a39...` (Untitled Document)
      if (row.id === '1a3940e3-5f01-42c1-b16a-0d4f6c0df69b') continue;

      let created = row.createdAt;
      let updated = row.lastUpdated;
      
      let updateCreated = false;
      let updateUpdated = false;

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

        // ONLY TOUCH APR 11TH DATES
        if (currentDateStr >= '2026-04-11 00:00:00' && currentDateStr < '2026-04-12 00:00:00') {
           
           // The date is currently UTC in DB. 
           let d = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
           
           // Subtract 6 hours (undoing the faulty +6 from earlier that pushed them into the future)
           d.setUTCHours(d.getUTCHours() - 6);

           // Now check if the newly fixed Dhaka Time falls before 9 AM
           let dhakaTime = new Date(d.getTime() + (6 * 60 * 60 * 1000));
           if (dhakaTime.getUTCHours() < 9) {
               // Enforce the 9 AM rule
               dhakaTime.setUTCHours(9);
               // Re-convert to UTC
               d = new Date(dhakaTime.getTime() - (6 * 60 * 60 * 1000));
           }

           return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
        }
        return dateStr;
      };

      let newCreated = processDate(created);
      let newUpdated = processDate(updated);

      // 2. Ignore updated_at for `5206...` (Farm2City)
      if (row.id === '52069953-ab2b-4177-82a4-a0656f91add9') {
          newUpdated = updated;
      }

      if (newCreated && newCreated !== created) updateCreated = true;
      if (newUpdated && newUpdated !== updated) updateUpdated = true;

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
    
    console.log(`Fix successful. Subtracted 6 hours and applied 9 AM rules to ${updatedCount} rows on April 11th.`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

fix11thDates();
