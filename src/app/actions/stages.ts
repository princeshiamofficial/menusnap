
"use server";

import pool from '@/lib/mysql';

/**
 * Ensures the client_stages table exists and has default values.
 */
async function ensureStagesTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS client_stages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        value VARCHAR(50) NOT NULL UNIQUE,
        label VARCHAR(100) NOT NULL,
        icon VARCHAR(50) DEFAULT 'UserPlus',
        color VARCHAR(255) DEFAULT 'bg-slate-50 text-slate-600 border-slate-100',
        dotColor VARCHAR(255) DEFAULT 'bg-slate-400',
        hint TEXT,
        placeholder TEXT,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Set AUTO_INCREMENT to 1,000,000 to ensure 7-digit IDs for new entries
    const [status]: any = await pool.execute("SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'client_stages'");
    if (status.length > 0 && status[0].AUTO_INCREMENT < 1000000) {
      await pool.execute('ALTER TABLE client_stages AUTO_INCREMENT = 1000000');
    }

    // Check if table is empty, if so, insert defaults
    const [rows]: any = await pool.execute('SELECT COUNT(*) as count FROM client_stages');
    if (rows[0].count === 0) {
      console.log("Seeding default client stages...");
      const defaults = [
        ['new-lead', 'New Lead', 'UserPlus', 'bg-slate-50 text-slate-600 border-slate-100', 'bg-slate-400', 'Initial contact received. What is the plan?', 'e.g., "Assigned to sales team", "Waiting for reply"', 1],
        ['contacted', 'Contacted', 'MessageCircle', 'bg-blue-50 text-blue-600 border-blue-100', 'bg-blue-500', 'How did the first conversation go via WhatsApp or call?', 'e.g., "Expressed interest in MenuBook template", "Asked for pricing details"', 2],
        ['interested', 'Interested', 'Star', 'bg-amber-50 text-amber-600 border-amber-100', 'bg-amber-500', 'Client is ready to pay or finalize the order.', 'e.g., "Invoice sent", "Contract being reviewed"', 3],
        ['donated', 'Donated', 'Heart', 'bg-rose-50 text-rose-600 border-rose-100', 'bg-rose-500', 'The client has completed a transaction or contribution.', 'e.g., "Payment received", "Success story"', 4],
        ['not-interested', 'Not Interested', 'XCircle', 'bg-gray-50 text-gray-500 border-gray-100', 'bg-gray-400', 'The client moved on or found another solution.', 'e.g., "Too expensive", "Using competitor"', 5],
        ['exiting', 'Exiting', 'DoorOpen', 'bg-indigo-50 text-indigo-600 border-indigo-100', 'bg-indigo-500', 'Why is the client leaving or terminating their service?', 'e.g., "Season ended", "Switching to different provider"', 6],
        ['fake', 'Fake', 'ShieldAlert', 'bg-slate-100 text-slate-500 border-slate-200', 'bg-slate-600', 'Mark as bot, spam, or invalid contact.', 'e.g., "Test entry", "Bot spam", "Invalid number"', 7]
      ];
      
      for (const d of defaults) {
        await pool.execute(
          'INSERT INTO client_stages (value, label, icon, color, dotColor, hint, placeholder, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          d
        );
      }
    }
  } catch (err) {
    console.error("Error ensuring client_stages table:", err);
  }
}

export async function getStages() {
  try {
    await ensureStagesTable();
    const [rows]: any = await pool.execute('SELECT * FROM client_stages ORDER BY sort_order ASC, created_at ASC');
    return { success: true, data: rows };
  } catch (error: any) {
    console.error("Database Error fetching stages:", error);
    return { success: false, error: error?.message || "Failed to fetch stages" };
  }
}

export async function addStage(stage: any) {
  try {
    await ensureStagesTable();
    const { value, label, icon, color, dotColor, hint, placeholder, sort_order } = stage;
    const [result]: any = await pool.execute(
      'INSERT INTO client_stages (value, label, icon, color, dotColor, hint, placeholder, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [value, label, icon, color, dotColor, hint, placeholder, sort_order || 0]
    );
    return { success: true, id: Number(result.insertId) };
  } catch (error: any) {
    console.error("Database Error adding stage:", error);
    return { success: false, error: error?.message || "Failed to add stage" };
  }
}

export async function updateStage(id: number, stage: any) {
  try {
    const { value, label, icon, color, dotColor, hint, placeholder, sort_order } = stage;
    await pool.execute(
      'UPDATE client_stages SET value = ?, label = ?, icon = ?, color = ?, dotColor = ?, hint = ?, placeholder = ?, sort_order = ? WHERE id = ?',
      [value, label, icon, color, dotColor, hint, placeholder, sort_order || 0, id]
    );
    return { success: true };
  } catch (error: any) {
    console.error("Database Error updating stage:", error);
    return { success: false, error: error?.message || "Failed to update stage" };
  }
}

export async function deleteStage(id: number) {
  try {
    await ensureStagesTable();

    // 1. Get the value (slug) of the stage before deleting it
    const [rows]: any = await pool.execute('SELECT value FROM client_stages WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return { success: false, error: "Stage not found" };
    }
    const stageValue = rows[0].value;

    // 2. Prevent deleting 'new-lead' if it's the default
    if (stageValue === 'new-lead') {
      return { success: false, error: "Cannot delete the default 'new-lead' stage." };
    }

    // 3. Delete the stage from client_stages
    await pool.execute('DELETE FROM client_stages WHERE id = ?', [id]);

    // 4. Update any clients who were in this stage to 'new-lead'
    await pool.execute('UPDATE clients SET stage = "new-lead" WHERE stage = ?', [stageValue]);
    
    return { success: true };
  } catch (error: any) {
    console.error("Database Error deleting stage:", error);
    return { success: false, error: error?.message || "Failed to delete stage" };
  }
}
