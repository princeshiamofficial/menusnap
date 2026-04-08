
"use server";

import pool from '@/lib/mysql';
import { sendWhatsAppMessage } from './whatsapp';
import { getWhatsAppSettings } from './whatsapp-settings';
import { getGreetings } from './greetings';

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
        stage VARCHAR(50) DEFAULT 'new-lead',
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

    // 3. Check if the 'stage' column exists
    const [stageColumns]: any = await pool.execute("SHOW COLUMNS FROM clients LIKE 'stage'");
    if (stageColumns.length === 0) {
      console.log("Adding 'stage' column to clients table...");
      await pool.execute("ALTER TABLE clients ADD COLUMN stage VARCHAR(50) DEFAULT 'new-lead' AFTER note");
    }

    // 4. Check for division and district columns
    const [divisionCol]: any = await pool.execute("SHOW COLUMNS FROM clients LIKE 'division'");
    if (divisionCol.length === 0) {
      await pool.execute("ALTER TABLE clients ADD COLUMN division VARCHAR(100) AFTER business_type");
    }
    const [districtCol]: any = await pool.execute("SHOW COLUMNS FROM clients LIKE 'district'");
    if (districtCol.length === 0) {
      await pool.execute("ALTER TABLE clients ADD COLUMN district VARCHAR(100) AFTER division");
    }

    // 4. Create client_notes table for history
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS client_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        stage VARCHAR(50) NOT NULL,
        note TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_client (client_id),
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error("Critical Database initialization error:", err);
    throw err; // Propagate error so calling functions know initialization failed
  }
}

/**
 * Saves or updates a client record in the database upon login.
 */
export async function saveClientLogin(businessName: string, businessType: string, whatsappNumber: string, division?: string, district?: string) {
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
        'UPDATE clients SET business_name = ?, business_type = ?, division = ?, district = ?, last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [businessName, businessType, division || null, district || null, rows[0].id]
      );
      return { success: true, clientId: rows[0].id, action: 'updated' };
    } else {
      // Insert new client
      const [result]: any = await pool.execute(
        'INSERT INTO clients (business_name, business_type, whatsapp_number, division, district) VALUES (?, ?, ?, ?, ?)',
        [businessName, businessType, whatsappNumber, division || null, district || null]
      );

      // --- SEND GREETING MESSAGE ---
      try {
        const settings = await getWhatsAppSettings();
        if (settings.isEnabled && settings.isGreetingEnabled) {
          const res = await getGreetings();
          if (res.success && res.data && res.data.length > 0) {
            const randomIndex = Math.floor(Math.random() * res.data.length);
            let message = res.data[randomIndex].content;
            message = message.replace(/\[Business Name\]/g, businessName);
            await sendWhatsAppMessage(whatsappNumber, message);
          }
        }
      } catch (greetingError) {
        console.error("Failed to send automatic greeting:", greetingError);
      }
      // -----------------------------

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
      `SELECT c.id, c.business_name, c.business_type, c.whatsapp_number, c.stage, c.division, c.district,
       (SELECT note FROM client_notes WHERE client_id = c.id ORDER BY created_at DESC LIMIT 1) as latest_note,
       UNIX_TIMESTAMP(c.last_login) as last_login_ts,
       UNIX_TIMESTAMP(c.created_at) as created_at_ts
       FROM clients c ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    // Get total count for pagination info
    const [countRows]: any = await pool.execute('SELECT COUNT(*) as total FROM clients');
    const total = countRows[0].total;
    
    const leads = rows.map((lead: any) => {
      let stage = (lead.stage || '').trim();
      if (!stage || stage === '' || stage === 'null' || stage === 'undefined') {
        stage = 'new-lead';
      }
      // Update legacy names to slugs
      if (stage === 'New Lead' || stage === 'Lead') stage = 'new-lead';
      if (stage === 'Contacted') stage = 'contacted';
      if (stage === 'Interested') stage = 'interested';
      if (stage === 'Following Up') stage = 'following-up';
      if (stage === 'Converting') stage = 'converting';
      if (stage === 'Donated') stage = 'donated';
      if (stage === 'Not Interested') stage = 'not-interested';
      if (stage === 'Exiting') stage = 'exiting';
      if (stage === 'Fake') stage = 'fake';
      
      return { 
        ...lead, 
        stage,
        last_login: lead.last_login_ts ? new Date(lead.last_login_ts * 1000).toISOString().replace('Z', '') : null,
        created_at: lead.created_at_ts ? new Date(lead.created_at_ts * 1000).toISOString().replace('Z', '') : null
      };
    });
    
    return { 
      success: true, 
      leads, 
      total, 
      hasMore: (offset + rows.length) < total 
    };
  } catch (error) {
    console.error("Database Error fetching leads:", error);
    return { success: false, error: "Failed to fetch leads", leads: [], total: 0, hasMore: false };
  }
}

/**
 * Updates the stage for a specific client.
 */
export async function updateClientStage(clientId: number, stage: string, note?: string) {
  try {
    await ensureClientsTable();
    
    // 1. Update the client's current stage
    await pool.execute('UPDATE clients SET stage = ? WHERE id = ?', [stage, clientId]);
    
    // 2. If a note is provided, insert it into the history table
    if (note && note.trim()) {
      await pool.execute(
        'INSERT INTO client_notes (client_id, stage, note) VALUES (?, ?, ?)',
        [clientId, stage, note]
      );
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Database Error updating client stage:", error);
    return { success: false, error: error?.message || "Failed to update stage" };
  }
}

/**
 * Fetches the note history for a specific client.
 */
export async function getClientHistory(clientId: number) {
  try {
    const [rows]: any = await pool.execute(
      `SELECT id, stage, note, 
       UNIX_TIMESTAMP(created_at) as created_at_ts 
       FROM client_notes WHERE client_id = ? ORDER BY created_at DESC`,
      [clientId]
    );
    const history = rows.map((item: any) => ({
      ...item,
      created_at: item.created_at_ts ? new Date(item.created_at_ts * 1000).toISOString().replace('Z', '') : null
    }));
    return { success: true, history };
  } catch (error: any) {
    console.error("Database Error fetching client history:", error);
    return { success: false, history: [], error: error?.message || "Failed to fetch history" };
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

/**
 * Deletes a client and their associated history from the database.
 */
export async function deleteClient(clientId: number) {
  try {
    await ensureClientsTable();
    
    // Note: client_notes has ON DELETE CASCADE, so they will be deleted automatically.
    await pool.execute('DELETE FROM clients WHERE id = ?', [clientId]);
    
    return { success: true };
  } catch (error: any) {
    console.error("Database Error deleting client:", error);
    return { success: false, error: error?.message || "Failed to delete client" };
  }
}

/**
 * Fetches leads growth trend grouped by month.
 */
export async function getLeadsTrend() {
  try {
    await ensureClientsTable();
    const [rows]: any = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%b') as name,
        COUNT(*) as leads
      FROM clients 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%m'), DATE_FORMAT(created_at, '%b')
      ORDER BY MIN(created_at) ASC
    `);
    
    // Ensure all 12 months are represented if necessary, or just return what we have
    return { success: true, data: rows };
  } catch (error) {
    console.error("Database Error fetching leads trend:", error);
    return { success: false, data: [] };
  }
}

