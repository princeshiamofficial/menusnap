"use server";

import pool from '@/lib/mysql';

/**
 * Ensures the client_timers table exists.
 */
async function ensureTimerTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS client_timers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        whatsapp_number VARCHAR(20) NOT NULL UNIQUE,
        target_time BIGINT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_whatsapp (whatsapp_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Migration check: If target_time is not BIGINT (old TIMESTAMP), drop and recreate or alter
    // For simplicity in this dev environment and to ensure no errors, we'll check the type
    const [cols]: any = await pool.execute("SHOW COLUMNS FROM client_timers LIKE 'target_time'");
    if (cols.length > 0 && cols[0].Type.toLowerCase().includes('timestamp')) {
       await pool.execute("ALTER TABLE client_timers MODIFY target_time BIGINT NOT NULL");
    }
  } catch (err) {
    console.error("Database initialization error (client_timers):", err);
  }
}

/**
 * Fetches the target time for a specific WhatsApp number.
 */
export async function getClientTimer(whatsappNumber: string) {
  try {
    await ensureTimerTable();
    const [rows]: any = await pool.execute(
      'SELECT target_time FROM client_timers WHERE whatsapp_number = ? LIMIT 1',
      [whatsappNumber]
    );

    if (rows.length > 0) {
      return { success: true, targetTime: Number(rows[0].target_time) };
    }
    return { success: true, targetTime: null };
  } catch (error) {
    console.error("Database Error fetching client timer:", error);
    return { success: false, error: "Failed to fetch timer" };
  }
}

/**
 * Saves or updates the target time for a WhatsApp number.
 */
export async function saveClientTimer(whatsappNumber: string, targetTime: number) {
  try {
    await ensureTimerTable();
    
    await pool.execute(
      'INSERT INTO client_timers (whatsapp_number, target_time) VALUES (?, ?) ON DUPLICATE KEY UPDATE target_time = VALUES(target_time)',
      [whatsappNumber, targetTime]
    );

    return { success: true };
  } catch (error) {
    console.error("Database Error saving client timer:", error);
    return { success: false, error: "Failed to save timer" };
  }
}
