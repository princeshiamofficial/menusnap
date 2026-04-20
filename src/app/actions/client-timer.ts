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
        has_seen TINYINT(1) DEFAULT 0,
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
      'SELECT DATE_FORMAT(target_time, "%Y-%m-%dT%H:%i:%sZ") as target_time, has_seen FROM client_timers WHERE whatsapp_number = ? LIMIT 1',
      [whatsappNumber]
    );

    if (rows.length > 0) {
      return { success: true, targetTime: rows[0].target_time, hasSeen: Boolean(rows[0].has_seen) };
    }
    return { success: true, targetTime: null, hasSeen: false };
  } catch (error) {
    console.error("Database Error fetching client timer:", error);
    return { success: false, error: "Failed to fetch timer" };
  }
}

/**
 * Saves or updates the target time for a WhatsApp number.
 */
export async function saveClientTimer(whatsappNumber: string, targetTime: string) {
  try {
    await ensureTimerTable();
    
    // Using INSERT ... ON DUPLICATE KEY UPDATE for efficiency
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

/**
 * Marks the timer as seen so the popup doesn't show again.
 */
export async function markTimerAsSeen(whatsappNumber: string) {
  try {
    await pool.execute(
      'UPDATE client_timers SET has_seen = 1 WHERE whatsapp_number = ?',
      [whatsappNumber]
    );
    return { success: true };
  } catch (error) {
    console.error("Database Error marking timer as seen:", error);
    return { success: false, error: "Failed to mark timer as seen" };
  }
}
