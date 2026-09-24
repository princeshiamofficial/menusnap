
"use server";

import pool from '@/lib/mysql';
import bcrypt from 'bcryptjs';
import { sendWhatsAppMessage } from './whatsapp';
import { getWhatsAppSettings } from './whatsapp-settings';
import { getGreetings } from './greetings';
import { getAdminSessionAction } from './admin-auth';

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
    const [emailCol]: any = await pool.execute("SHOW COLUMNS FROM clients LIKE 'email'");
    if (emailCol.length === 0) {
      await pool.execute("ALTER TABLE clients ADD COLUMN email VARCHAR(255) AFTER district");
    }
    const [passwordCol]: any = await pool.execute("SHOW COLUMNS FROM clients LIKE 'password_hash'");
    if (passwordCol.length === 0) {
      console.log("Adding 'password_hash' column to clients table...");
      await pool.execute("ALTER TABLE clients ADD COLUMN password_hash VARCHAR(255) NULL AFTER email");
    }
    const [subscriberCol]: any = await pool.execute("SHOW COLUMNS FROM clients LIKE 'is_subscriber'");
    if (subscriberCol.length === 0) {
      console.log("Adding 'is_subscriber' column to clients table...");
      await pool.execute("ALTER TABLE clients ADD COLUMN is_subscriber TINYINT(1) DEFAULT 0 AFTER stage");
    }

    // 5. Create client_notes table for history
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

    // 6. Check if the 'updated_by' column exists in client_notes
    const [updatedByCol]: any = await pool.execute("SHOW COLUMNS FROM client_notes LIKE 'updated_by'");
    if (updatedByCol.length === 0) {
      console.log("Adding 'updated_by' column to client_notes table...");
      await pool.execute("ALTER TABLE client_notes ADD COLUMN updated_by INT NULL");
    }
  } catch (err) {
    console.error("Critical Database initialization error:", err);
    throw err; // Propagate error so calling functions know initialization failed
  }
}

/**
 * Checks if a client already exists by WhatsApp number and if they have a password configured.
 */
export async function checkClientStatus(whatsappNumber: string): Promise<{
  success: boolean;
  exists: boolean;
  hasPassword: boolean;
  isSubscriber?: boolean;
  client?: {
    businessName: string;
    businessType: 'restaurant' | 'parlour';
    division?: string;
    district?: string;
    email?: string;
    isSubscriber?: boolean;
  };
  error?: string;
}> {
  try {
    await ensureClientsTable();
    const cleanNumber = (whatsappNumber || '').trim();
    if (!cleanNumber) {
      return { success: false, exists: false, hasPassword: false, isSubscriber: false, error: 'WhatsApp number is required.' };
    }

    const [rows]: any = await pool.execute(
      'SELECT id, business_name, business_type, division, district, email, stage, is_subscriber, password_hash FROM clients WHERE whatsapp_number = ? LIMIT 1',
      [cleanNumber]
    );

    if (rows.length > 0) {
      const row = rows[0];
      const stageLower = (row.stage || '').toLowerCase().trim();
      const isSub = Boolean(
        row.is_subscriber === 1 ||
        stageLower === 'customer' ||
        stageLower === 'subscriber' ||
        stageLower === 'subscribed' ||
        stageLower === 'donated'
      );
      return {
        success: true,
        exists: true,
        hasPassword: Boolean(row.password_hash),
        isSubscriber: isSub,
        client: {
          businessName: row.business_name,
          businessType: row.business_type,
          division: row.division || undefined,
          district: row.district || undefined,
          email: row.email || undefined,
          isSubscriber: isSub,
        },
      };
    }

    return { success: true, exists: false, hasPassword: false, isSubscriber: false };
  } catch (error: any) {
    console.error('Error checking client status:', error);
    return { success: false, exists: false, hasPassword: false, isSubscriber: false, error: error.message };
  }
}

/**
 * Saves, registers, or authenticates a client record in the database upon login.
 */
export async function saveClientLogin(
  businessName: string,
  businessType: string,
  whatsappNumber: string,
  division?: string,
  district?: string,
  email?: string,
  password?: string
): Promise<{
  success: boolean;
  clientId?: number;
  action?: 'created' | 'updated';
  isSubscriber?: boolean;
  error?: string;
}> {
  try {
    await ensureClientsTable();
    const cleanPhone = (whatsappNumber || '').trim();
    const cleanPassword = (password || '').trim();

    // Check if client already exists with this WhatsApp number
    const [rows]: any = await pool.execute(
      'SELECT id, stage, is_subscriber, password_hash FROM clients WHERE whatsapp_number = ? LIMIT 1',
      [cleanPhone]
    );

    if (rows.length > 0) {
      const existingClient = rows[0];

      // Password Verification
      if (existingClient.password_hash) {
        if (!cleanPassword) {
          return {
            success: false,
            error: 'This account has a password. Please enter your password to log in.',
          };
        }
        const isMatch = await bcrypt.compare(cleanPassword, existingClient.password_hash);
        if (!isMatch) {
          return {
            success: false,
            error: 'Incorrect password. Please verify your password and try again.',
          };
        }
      } else if (cleanPassword) {
        // Legacy account without password: set their password now
        if (cleanPassword.length < 6) {
          return {
            success: false,
            error: 'Password must be at least 6 characters long.',
          };
        }
        const newHash = await bcrypt.hash(cleanPassword, 10);
        await pool.execute(
          'UPDATE clients SET password_hash = ? WHERE id = ?',
          [newHash, existingClient.id]
        );
      }

      // Update existing client last login and name/type if changed
      await pool.execute(
        'UPDATE clients SET business_name = ?, business_type = ?, division = ?, district = ?, email = ?, last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [businessName.trim(), businessType, division || null, district || null, email?.trim() || null, existingClient.id]
      );

      const stageLower = (existingClient.stage || '').toLowerCase().trim();
      let isSubscriber = Boolean(
        existingClient.is_subscriber === 1 ||
        stageLower === 'customer' ||
        stageLower === 'subscriber' ||
        stageLower === 'subscribed' ||
        stageLower === 'donated'
      );

      // Check PayStation transactions in case client paid via PayStation
      if (!isSubscriber) {
        try {
          const [txRows]: any = await pool.execute(
            `SELECT id FROM paystation_transactions 
             WHERE status = 'Successful' AND ((customer_phone = ? AND ? != '') OR (customer_email = ? AND ? != '')) 
             LIMIT 1`,
            [cleanPhone, cleanPhone, email?.trim() || '', email?.trim() || '']
          );
          if (txRows && txRows.length > 0) {
            isSubscriber = true;
            await pool.execute(
              `UPDATE clients SET is_subscriber = 1, stage = 'customer' WHERE id = ?`,
              [existingClient.id]
            );
          }
        } catch (txErr) {
          console.error("Paystation check error in saveClientLogin:", txErr);
        }
      }

      return { success: true, clientId: existingClient.id, action: 'updated', isSubscriber };
    } else {
      // New Client Registration: password is required
      if (!cleanPassword) {
        return {
          success: false,
          error: 'Please choose a password with at least 6 characters for your account.',
        };
      }

      if (cleanPassword.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters long.',
        };
      }

      const passwordHash = await bcrypt.hash(cleanPassword, 10);

      // Check if new registration has past PayStation transaction
      let isSubscriber = false;
      try {
        const [txRows]: any = await pool.execute(
          `SELECT id FROM paystation_transactions 
           WHERE status = 'Successful' AND ((customer_phone = ? AND ? != '') OR (customer_email = ? AND ? != '')) 
           LIMIT 1`,
          [cleanPhone, cleanPhone, email?.trim() || '', email?.trim() || '']
        );
        if (txRows && txRows.length > 0) {
          isSubscriber = true;
        }
      } catch {}

      const [result]: any = await pool.execute(
        'INSERT INTO clients (business_name, business_type, whatsapp_number, division, district, email, password_hash, is_subscriber, stage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [businessName.trim(), businessType, cleanPhone, division || null, district || null, email?.trim() || null, passwordHash, isSubscriber ? 1 : 0, isSubscriber ? 'customer' : 'new-lead']
      );

      // --- SEND GREETING MESSAGE ---
      try {
        const settings = await getWhatsAppSettings();
        if (settings.isEnabled && settings.isGreetingEnabled) {
          const res = await getGreetings();
          if (res.success && res.data && res.data.length > 0) {
            const randomIndex = Math.floor(Math.random() * res.data.length);
            let message = res.data[randomIndex].content;
            message = message.replace(/\[Business Name\]/g, businessName.trim());
            await sendWhatsAppMessage(cleanPhone, message);
          }
        }
      } catch (greetingError) {
        console.error("Failed to send automatic greeting:", greetingError);
      }
      // -----------------------------

      return { success: true, clientId: Number(result.insertId), action: 'created', isSubscriber };
    }
  } catch (error: any) {
    console.error("Database Error saving client login:", error);
    return { success: false, error: error.message || "Database error occurred" };
  }
}

/**
 * Authenticates an existing client using their WhatsApp number or Email and Password.
 */
export async function clientLoginAction(
  identifier: string,
  password: string
): Promise<{
  success: boolean;
  client?: {
    id: number;
    businessName: string;
    businessType: 'restaurant' | 'parlour';
    whatsappNumber: string;
    division?: string;
    district?: string;
    email?: string;
    isSubscriber?: boolean;
  };
  error?: string;
}> {
  try {
    await ensureClientsTable();
    const cleanId = (identifier || '').trim();
    const cleanPassword = (password || '').trim();

    if (!cleanId) {
      return { success: false, error: 'Please enter your WhatsApp number or email address.' };
    }
    if (!cleanPassword) {
      return { success: false, error: 'Please enter your password.' };
    }

    // Search by WhatsApp number or Email
    const [rows]: any = await pool.execute(
      `SELECT id, business_name, business_type, whatsapp_number, division, district, email, stage, is_subscriber, password_hash 
       FROM clients 
       WHERE whatsapp_number = ? OR email = ? 
       ORDER BY last_login DESC LIMIT 1`,
      [cleanId, cleanId]
    );

    if (!rows || rows.length === 0) {
      return {
        success: false,
        error: 'No account found with this WhatsApp number or email. Please register first.'
      };
    }

    const client = rows[0];

    // Password verification
    if (client.password_hash) {
      const isMatch = await bcrypt.compare(cleanPassword, client.password_hash);
      if (!isMatch) {
        return { success: false, error: 'Incorrect password. Please verify your credentials and try again.' };
      }
    } else {
      // Legacy account without password - set password on first login
      if (cleanPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }
      const hash = await bcrypt.hash(cleanPassword, 10);
      await pool.execute('UPDATE clients SET password_hash = ? WHERE id = ?', [hash, client.id]);
    }

    // Update last_login
    await pool.execute('UPDATE clients SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [client.id]);

    const stageLower = (client.stage || '').toLowerCase().trim();
    let isSubscriber = Boolean(
      client.is_subscriber === 1 ||
      stageLower === 'customer' ||
      stageLower === 'subscriber' ||
      stageLower === 'subscribed' ||
      stageLower === 'donated'
    );

    if (!isSubscriber) {
      try {
        const [txRows]: any = await pool.execute(
          `SELECT id FROM paystation_transactions 
           WHERE status = 'Successful' AND ((customer_phone = ? AND ? != '') OR (customer_email = ? AND ? != '')) 
           LIMIT 1`,
          [client.whatsapp_number, client.whatsapp_number, client.email || '', client.email || '']
        );
        if (txRows && txRows.length > 0) {
          isSubscriber = true;
          await pool.execute('UPDATE clients SET is_subscriber = 1, stage = \'customer\' WHERE id = ?', [client.id]);
        }
      } catch {}
    }

    return {
      success: true,
      client: {
        id: client.id,
        businessName: client.business_name,
        businessType: client.business_type === 'parlour' ? 'parlour' : 'restaurant',
        whatsappNumber: client.whatsapp_number,
        division: client.division || undefined,
        district: client.district || undefined,
        email: client.email || undefined,
        isSubscriber,
      }
    };
  } catch (error: any) {
    console.error('Error during client login:', error);
    return { success: false, error: error.message || 'An error occurred during authentication.' };
  }
}

/**
 * Fetches leads (clients) from the database with pagination and filtering.
 */
export async function getLeads(
  page: number = 1, 
  limit: number = 20, 
  filters?: { 
    search?: string; 
    stage?: string; 
    dateFrom?: string; 
    dateTo?: string; 
  }
) {
  try {
    await ensureClientsTable();
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params: any[] = [];

    if (filters) {
      const conditions: string[] = [];
      
      if (filters.search) {
        conditions.push('(c.business_name LIKE ? OR c.whatsapp_number LIKE ?)');
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      if (filters.stage && filters.stage !== 'All') {
        conditions.push('c.stage = ?');
        params.push(filters.stage);
      }
      
      if (filters.dateFrom) {
        conditions.push('c.created_at >= ?');
        params.push(`${filters.dateFrom} 00:00:00`);
      }
      
      if (filters.dateTo) {
        conditions.push('c.created_at <= ?');
        params.push(`${filters.dateTo} 23:59:59`);
      }

      if (conditions.length > 0) {
        whereClause = ' WHERE ' + conditions.join(' AND ');
      }
    }

    const query = `
      SELECT c.id, c.business_name, c.business_type, c.whatsapp_number, c.email, c.stage, c.is_subscriber, c.division, c.district,
      (SELECT note FROM client_notes WHERE client_id = c.id ORDER BY created_at DESC LIMIT 1) as latest_note,
      (SELECT a.id FROM client_notes cn JOIN admins a ON cn.updated_by = a.id WHERE cn.client_id = c.id ORDER BY cn.created_at DESC LIMIT 1) as updated_by_id,
      DATE_FORMAT(c.last_login, '%Y-%m-%d %H:%i:%s') as last_login,
      DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i:%s') as created_at
      FROM clients c 
      ${whereClause}
      ORDER BY c.created_at DESC LIMIT ? OFFSET ?
    `;
    
    const [rows]: any = await pool.execute(query, [...params, limit, offset]);

    // Get total count for pagination info with same filters
    const countQuery = `SELECT COUNT(*) as total FROM clients c ${whereClause}`;
    const [countRows]: any = await pool.execute(countQuery, params);
    const total = Number(countRows[0].total);

    const leads = (Array.isArray(rows) ? rows : []).map((lead: any) => {
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

      const stageLower = stage.toLowerCase();
      const isSubscriber = Boolean(
        lead.is_subscriber === 1 ||
        stageLower === 'customer' ||
        stageLower === 'subscriber' ||
        stageLower === 'subscribed' ||
        stageLower === 'donated'
      );

      return { ...lead, stage, is_subscriber: isSubscriber };
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
export async function updateClientStage(clientId: number, stage: string, note?: string, adminId?: number) {
  try {
    await ensureClientsTable();

    // 1. Update the client's current stage
    await pool.execute('UPDATE clients SET stage = ? WHERE id = ?', [stage, clientId]);

    // 2. If a note is provided, insert it into the history table
    if (note && note.trim()) {
      await pool.execute(
        'INSERT INTO client_notes (client_id, stage, note, updated_by) VALUES (?, ?, ?, ?)',
        [clientId, stage, note, adminId || null]
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
      `SELECT cn.id, cn.stage, cn.note, cn.updated_by as updated_by_id,
       DATE_FORMAT(cn.created_at, '%Y-%m-%d %H:%i:%s') as created_at 
       FROM client_notes cn
       WHERE cn.client_id = ? ORDER BY cn.created_at ASC`,
      [clientId]
    );
    const plainHistory = (rows as any[]).map((row: any) => ({ ...row }));
    return { success: true, history: plainHistory };
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
    const plainTrend = (rows as any[]).map((row: any) => ({ ...row }));
    return { success: true, data: plainTrend };
  } catch (error) {
    console.error("Database Error fetching leads trend:", error);
    return { success: false, data: [] };
  }
}

/**
 * Checks whether a client is an active subscriber.
 * Checks active admin session, clients table (is_subscriber, stage), and paystation_transactions.
 */
export async function checkClientSubscription(
  whatsappNumber?: string,
  email?: string
): Promise<{
  success: boolean;
  isSubscriber: boolean;
  isAdmin?: boolean;
  plan?: string;
  error?: string;
}> {
  try {
    // 0. Active Admin Check
    try {
      const adminSession = await getAdminSessionAction();
      if (adminSession) {
        return { success: true, isSubscriber: true, isAdmin: true };
      }
    } catch {
      // Ignore admin check errors
    }

    await ensureClientsTable();
    const cleanPhone = (whatsappNumber || '').trim();
    const cleanEmail = (email || '').trim();

    if (!cleanPhone && !cleanEmail) {
      return { success: true, isSubscriber: false };
    }

    // 1. Check clients table
    const [clientRows]: any = await pool.execute(
      `SELECT id, stage, is_subscriber FROM clients 
       WHERE (whatsapp_number = ? AND ? != '') OR (email = ? AND ? != '') 
       LIMIT 1`,
      [cleanPhone, cleanPhone, cleanEmail, cleanEmail]
    );

    let clientSubscriber = false;
    if (clientRows && clientRows.length > 0) {
      const c = clientRows[0];
      const stageLower = (c.stage || '').toLowerCase().trim();
      if (
        c.is_subscriber === 1 ||
        stageLower === 'customer' ||
        stageLower === 'subscriber' ||
        stageLower === 'subscribed' ||
        stageLower === 'donated'
      ) {
        clientSubscriber = true;
      }
    }

    if (clientSubscriber) {
      return { success: true, isSubscriber: true };
    }

    // 2. Check paystation_transactions table for successful payment
    try {
      const [txRows]: any = await pool.execute(
        `SELECT id, plan FROM paystation_transactions 
         WHERE status = 'Successful' AND ((customer_phone = ? AND ? != '') OR (customer_email = ? AND ? != ''))
         LIMIT 1`,
        [cleanPhone, cleanPhone, cleanEmail, cleanEmail]
      );

      if (txRows && txRows.length > 0) {
        if (clientRows && clientRows.length > 0) {
          await pool.execute(
            `UPDATE clients SET is_subscriber = 1, stage = 'customer' WHERE id = ?`,
            [clientRows[0].id]
          );
        }
        return { success: true, isSubscriber: true, plan: txRows[0].plan };
      }
    } catch (txErr) {
      console.error('Error querying paystation_transactions for subscription:', txErr);
    }

    return { success: true, isSubscriber: false };
  } catch (error: any) {
    console.error('Error checking client subscription:', error);
    return { success: false, isSubscriber: false, error: error.message };
  }
}

/**
 * Toggles a client's subscription status in the database (admin action).
 */
export async function toggleClientSubscription(
  clientId: number,
  isSubscriber: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureClientsTable();
    await pool.execute(
      `UPDATE clients SET is_subscriber = ?, stage = ? WHERE id = ?`,
      [isSubscriber ? 1 : 0, isSubscriber ? 'customer' : 'new-lead', clientId]
    );
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling client subscription:', error);
    return { success: false, error: error.message };
  }
}


