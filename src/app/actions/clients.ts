
"use server";

import pool from '@/lib/mysql';

/**
 * Ensures the clients table exists in the MySQL database.
 */
async function ensureClientsTable() {
  try {
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
      )
    `);
  } catch (err) {
    console.error("Failed to ensure clients table:", err);
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
      'SELECT * FROM clients ORDER BY last_login DESC LIMIT ? OFFSET ?',
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
    const [result]: any = await pool.execute(
      'UPDATE clients SET note = ? WHERE id = ?',
      [note, clientId]
    );
    
    if (result.affectedRows > 0) {
      return { success: true };
    } else {
      return { success: false, error: "Client not found or no changes made" };
    }
  } catch (error) {
    console.error("Database Error updating client note:", error);
    return { success: false, error: "Failed to update note" };
  }
}
