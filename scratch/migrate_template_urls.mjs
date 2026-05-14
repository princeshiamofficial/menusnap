import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local or .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = [
  path.resolve(__dirname, '../.env.local'),
  path.resolve(__dirname, '../.env'),
].find(p => {
  try { return !!path.resolve(p); } catch (e) { return false; }
});

if (envPath) {
  dotenv.config({ path: envPath });
  console.log(`Loaded environment variables from: ${envPath}`);
} else {
  console.warn('No .env.local or .env file found. Using default/environment credentials.');
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'menubldr',
});

async function migrate() {
  console.log('Starting migration of template URLs...');
  
  try {
    // 1. Update templates table
    const [templateResult] = await pool.execute(
      `UPDATE templates 
       SET imageUrl = REPLACE(imageUrl, 'https://colorhutbd.xyz/vm/api/uploads/', '/uploads/templates/') 
       WHERE imageUrl LIKE 'https://colorhutbd.xyz/vm/api/uploads/%'`
    );
    console.log(`Updated templates table: ${templateResult.affectedRows} rows affected.`);

    // 2. Update orders table (templateData JSON column)
    // This is more complex because it's JSON. We'll fetch, update, and save.
    const [orders] = await pool.execute('SELECT id, templateData FROM orders WHERE templateData LIKE "%https://colorhutbd.xyz/vm/api/uploads/%"');
    
    if (Array.isArray(orders) && orders.length > 0) {
      console.log(`Found ${orders.length} orders with external template URLs. Updating...`);
      for (const order of orders) {
        let templateData = typeof order.templateData === 'string' ? JSON.parse(order.templateData) : order.templateData;
        
        if (templateData && templateData.imageUrl) {
          templateData.imageUrl = templateData.imageUrl.replace('https://colorhutbd.xyz/vm/api/uploads/', '/uploads/templates/');
          
          await pool.execute(
            'UPDATE orders SET templateData = ? WHERE id = ?',
            [JSON.stringify(templateData), order.id]
          );
        }
      }
      console.log('Orders table updated.');
    } else {
      console.log('No orders found requiring update.');
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
