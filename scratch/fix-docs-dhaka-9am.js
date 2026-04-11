
const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/../.env' }); 

async function fixDocsDhaka9AM() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'menubldr',
  });

  try {
    console.log('Fetching magic_docs. Forcing dates to be > 9 AM (Dhaka Time)...');
    
    const [rows] = await pool.execute(
      "SELECT id, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt, DATE_FORMAT(last_updated, '%Y-%m-%d %H:%i:%s') as lastUpdated FROM magic_docs"
    );

    let updatedCount = 0;

    for (const row of rows) {
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

        // Assume DB stores true UTC
        let d = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));

        // Get Dhaka Time (UTC + 6)
        let dhakaTime = new Date(d.getTime() + (6 * 60 * 60 * 1000));
        let dhakaHour = dhakaTime.getUTCHours(); // getUTCHours() of this shifted date represents the local Dhaka hour

        // Force to be > 9 AM Dhaka time
        if (dhakaHour < 9) {
          // Change the Dhaka hour to 9. We leave minutes and seconds alone so they look natural.
          dhakaTime.setUTCHours(9);
          
          // Convert back to UTC (Dhaka - 6)
          d = new Date(dhakaTime.getTime() - (6 * 60 * 60 * 1000));
        }

        const pad = n => String(n).padStart(2, '0');
        return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
      };

      let newCreated = processDate(created);
      let newUpdated = processDate(updated);

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
    
    console.log(`Fix successful. Applied >9am Dhaka Time correction to ${updatedCount} rows.`);

  } catch (err) {
    console.error('Migration Error:', err);
  } finally {
    await pool.end();
  }
}

fixDocsDhaka9AM();
