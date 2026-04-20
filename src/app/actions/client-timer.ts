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
        target_timestamp_ms BIGINT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_whatsapp (whatsapp_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Migration: If old target_time exists, we'll try to rename it or just add the new one
    const [oldCols]: any = await pool.execute("SHOW COLUMNS FROM client_timers LIKE 'target_time'");
    if (oldCols.length > 0) {
       // Since the data was corrupted YYYYMMDD format, we truncate to be safe
       await pool.execute("TRUNCATE TABLE client_timers");
       await pool.execute("ALTER TABLE client_timers DROP COLUMN target_time");
    }
    
    // Ensure the new column exists if it didn't for some reason
    const [newCols]: any = await pool.execute("SHOW COLUMNS FROM client_timers LIKE 'target_timestamp_ms'");
    if (newCols.length === 0) {
       await pool.execute("ALTER TABLE client_timers ADD COLUMN target_timestamp_ms BIGINT NOT NULL AFTER whatsapp_number");
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
      'SELECT target_timestamp_ms FROM client_timers WHERE whatsapp_number = ? LIMIT 1',
      [whatsappNumber]
    );

    if (rows.length > 0) {
      return { success: true, targetTime: Number(rows[0].target_timestamp_ms) };
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
export async function saveClientTimer(whatsappNumber: string, targetTimestampMs: number) {
  try {
    await ensureTimerTable();
    
    await pool.execute(
      'INSERT INTO client_timers (whatsapp_number, target_timestamp_ms) VALUES (?, ?) ON DUPLICATE KEY UPDATE target_timestamp_ms = VALUES(target_timestamp_ms)',
      [whatsappNumber, targetTimestampMs]
    );

    return { success: true };
  } catch (error) {
    console.error("Database Error saving client timer:", error);
    return { success: false, error: "Failed to save timer" };
  }
}
