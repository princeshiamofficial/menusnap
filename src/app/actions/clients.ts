
"use server";

import pool from '@/lib/mysql';

/**
 * Ensures the clients table exists and has the required columns.
 */
async function ensureClientsTable() {
  try {
    // 1. Create table if it doesn't exist
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_name VARCHAR(255) NOT NULL,
        business_type VARCHAR(50) NOT NULL,
        whatsapp_number VARCHAR(20) NOT NULL,
        note TEXT,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_whatsapp (whatsapp_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Check if the 'note' column exists (for existing tables)
    const [columns]: any = await pool.execute("SHOW COLUMNS FROM clients LIKE 'note'");
    if (columns.length === 0) {
      console.log("Adding 'note' column to clients table...");
      await pool.execute("ALTER TABLE clients ADD COLUMN note TEXT AFTER whatsapp_number");
    }
  } catch (err) {
    console.error("Critical Database initialization error:", err);
    throw err; // Propagate error so calling functions know initialization failed
  }
}

/**
 * Saves or updates a client record in the database upon login.
 */
export async function saveClientLogin(businessName: string, businessType: string, whatsappNumber: string) {
  try {
    await ensureClientsTable();

    // Check if client already exists with this WhatsApp number
    const [rows]: any = await pool.execute(
      'SELECT id FROM clients WHERE whatsapp_number = ? LIMIT 1',
      [whatsappNumber]
    );

    if (rows.length > 0) {
      // Update existing client last login and name/type if changed
      await pool.execute(
        'UPDATE clients SET business_name = ?, business_type = ?, last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [businessName, businessType, rows[0].id]
      );
      return { success: true, clientId: rows[0].id, action: 'updated' };
    } else {
      // Insert new client
      const [result]: any = await pool.execute(
        'INSERT INTO clients (business_name, business_type, whatsapp_number) VALUES (?, ?, ?)',
        [businessName, businessType, whatsappNumber]
      );
      return { success: true, clientId: result.insertId, action: 'created' };
    }
  } catch (error) {
    console.error("Database Error saving client login:", error);
    return { success: false, error: "Database error occurred" };
  }
}

/**
 * Fetches leads (clients) from the database with pagination.
 */
export async function getLeads(page: number = 1, limit: number = 20) {
  try {
    await ensureClientsTable();
    const offset = (page - 1) * limit;
    
    const [rows]: any = await pool.execute(
      'SELECT * FROM clients ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    // Get total count for pagination info
    const [countRows]: any = await pool.execute('SELECT COUNT(*) as total FROM clients');
    const total = countRows[0].total;
    
    return { 
      success: true, 
      leads: rows, 
      total, 
      hasMore: (offset + rows.length) < total 
    };
  } catch (error) {
    console.error("Database Error fetching leads:", error);
    return { success: false, error: "Failed to fetch leads", leads: [], total: 0, hasMore: false };
  }
}

/**
 * Updates the note for a specific client.
 */
export async function updateClientNote(clientId: number, note: string) {
  try {
    // Ensure table structure is correct (e.g. 'note' column exists)
    await ensureClientsTable();

    const [result]: any = await pool.execute(
      'UPDATE clients SET note = ? WHERE id = ?',
      [note, clientId]
    );
    
    return { success: true };
  } catch (error: any) {
    console.error("Database Error updating client note:", error);
    return { 
      success: false, 
      error: error?.message || "Failed to update note" 
    };
  }
}
