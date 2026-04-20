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
        target_time TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_whatsapp (whatsapp_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
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
      // mysql2 returns Date objects for TIMESTAMP/DATETIME columns
      return { success: true, targetTime: rows[0].target_time };
    }
    return { success: true, targetTime: null };
  } catch (error) {
    console.error("Database Error fetching client timer:", error);
    return { success: false, error: "Failed to fetch timer" };
  }
}

export async function saveClientTimer(whatsappNumber: string, targetTime: any) {
  try {
    await ensureTimerTable();
    
    // Ensure targetTime is a Date object if it's a string
    const dateToSave = targetTime instanceof Date ? targetTime : new Date(targetTime);

    await pool.execute(
      'INSERT INTO client_timers (whatsapp_number, target_time) VALUES (?, ?) ON DUPLICATE KEY UPDATE target_time = VALUES(target_time)',
      [whatsappNumber, dateToSave]
    );

    console.log(`Saved timer for ${whatsappNumber}:`, dateToSave);
    return { success: true };
  } catch (error) {
    console.error("Database Error saving client timer:", error);
    return { success: false, error: "Failed to save timer" };
  }
}
