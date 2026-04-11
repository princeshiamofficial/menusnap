
import pool from './src/lib/mysql.js';

async function check() {
  try {
    const [orders] = await pool.execute('DESCRIBE orders');
    console.log('Orders Table:', orders);
    const [magic_docs] = await pool.execute('DESCRIBE magic_docs');
    console.log('Magic Docs Table:', magic_docs);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
