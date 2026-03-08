import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'menubldr',
});

async function run() {
  // Create admins table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('admins table created (or already exists)');

  // Insert default admin
  const hash = await bcrypt.hash('admin123', 10);
  try {
    await pool.execute(
      'INSERT IGNORE INTO admins (email, password_hash) VALUES (?, ?)',
      ['admin@colorhut.com', hash]
    );
    console.log('Default admin created: admin@colorhut.com / admin123');
    console.log('IMPORTANT: Change the password after first login!');
  } catch (err) {
    console.log('Admin already exists or error:', err.message);
  }

  process.exit(0);
}

run().catch(console.error);
