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

  try {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.execute(
      'INSERT INTO admins (email, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)',
      ['admin@colorhut.com', hash]
    );
    console.log('Default admin created or password reset: admin@colorhut.com / admin123');
    console.log('IMPORTANT: Change the password after first login!');
  } catch (err) {
    console.log('Error creating/updating admin:', err.message);
  }

  process.exit(0);
}

run().catch(console.error);
