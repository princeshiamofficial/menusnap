
import pool from '../src/lib/mysql.js';

async function check() {
  try {
    const [rows]: any = await pool.execute('SELECT * FROM client_timers');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
