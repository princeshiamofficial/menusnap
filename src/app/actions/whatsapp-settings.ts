'use server';

import pool from '@/lib/mysql';

export interface WhatsAppSettings {
  isEnabled: boolean;
  isGreetingEnabled: boolean;
  greetingMessages: string[];
}

const DEFAULT_SETTINGS: WhatsAppSettings = {
  isEnabled: false,
  isGreetingEnabled: false,
  greetingMessages: [],
};

async function ensureSettingsTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS whatsapp_settings (
      id INT PRIMARY KEY DEFAULT 1,
      is_enabled TINYINT(1) DEFAULT 0,
      is_greeting_enabled TINYINT(1) DEFAULT 0,
      greeting_messages JSON DEFAULT ('[]'),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  // Insert default row if not exists
  await pool.execute(`
    INSERT IGNORE INTO whatsapp_settings (id, is_enabled, is_greeting_enabled, greeting_messages)
    VALUES (1, 0, 0, '[]')
  `);
}

/**
 * Retrieves WhatsApp connection settings from the database.
 */
export async function getWhatsAppSettings(): Promise<WhatsAppSettings> {
  try {
    await ensureSettingsTable();
    const [rows]: any = await pool.execute('SELECT * FROM whatsapp_settings WHERE id = 1 LIMIT 1');
    if (!rows || rows.length === 0) return DEFAULT_SETTINGS;

    const row = rows[0];
    let greetingMessages: string[] = [];
    try {
      greetingMessages = typeof row.greeting_messages === 'string'
        ? JSON.parse(row.greeting_messages)
        : row.greeting_messages || [];
    } catch { greetingMessages = []; }

    return {
      isEnabled: !!row.is_enabled,
      isGreetingEnabled: !!row.is_greeting_enabled,
      greetingMessages,
    };
  } catch (error) {
    console.error('Error reading WhatsApp settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Saves WhatsApp connection settings to the database.
 */
export async function saveWhatsAppSettings(settings: WhatsAppSettings): Promise<void> {
  try {
    await ensureSettingsTable();
    await pool.execute(`
      INSERT INTO whatsapp_settings (id, is_enabled, is_greeting_enabled, greeting_messages)
      VALUES (1, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        is_enabled = VALUES(is_enabled),
        is_greeting_enabled = VALUES(is_greeting_enabled),
        greeting_messages = VALUES(greeting_messages)
    `, [
      settings.isEnabled ? 1 : 0,
      settings.isGreetingEnabled ? 1 : 0,
      JSON.stringify(settings.greetingMessages || []),
    ]);
  } catch (error: any) {
    console.error('Error saving WhatsApp settings:', error);
    throw new Error('Could not save WhatsApp settings.');
  }
}
