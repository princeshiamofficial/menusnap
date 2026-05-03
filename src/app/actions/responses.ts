
"use server";

import pool from '@/lib/mysql';

/**
 * Ensures the response tables exist.
 */
async function ensureResponseTables() {
  try {
    // 1. Hiring Responses
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS responses_hiring (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_name VARCHAR(255) NOT NULL,
        whatsapp_number VARCHAR(20) NOT NULL,
        designation VARCHAR(100),
        requirement TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Migration: Rename department to designation if it exists
    try {
      const [cols]: any = await pool.execute("SHOW COLUMNS FROM responses_hiring LIKE 'department'");
      if (cols.length > 0) {
        await pool.execute("ALTER TABLE responses_hiring CHANGE department designation VARCHAR(100)");
        console.log("Migrated responses_hiring: department -> designation");
      }
    } catch (migErr) {
      console.error("Migration error (Hiring):", migErr);
    }

    // 2. Free Design Responses
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS responses_free_design (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_name VARCHAR(255) NOT NULL,
        whatsapp_number VARCHAR(20) NOT NULL,
        business_type VARCHAR(100),
        required_design VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Team Tracker Responses
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS responses_team_tracker (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_name VARCHAR(255) NOT NULL,
        whatsapp_number VARCHAR(20) NOT NULL,
        business_type VARCHAR(100),
        goal TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error("Database initialization error for responses:", err);
    throw err;
  }
}

/**
 * Saves a hiring request.
 */
export async function saveHiringRequest(data: { 
  businessName: string; 
  whatsappNumber: string; 
  designation?: string; 
  requirement?: string; 
}) {
  try {
    await ensureResponseTables();
    const [result]: any = await pool.execute(
      'INSERT INTO responses_hiring (business_name, whatsapp_number, designation, requirement) VALUES (?, ?, ?, ?)',
      [data.businessName, data.whatsappNumber, data.designation || null, data.requirement || null]
    );
    return { success: true, id: Number(result.insertId) };
  } catch (error) {
    console.error("Error saving hiring request:", error);
    return { success: false, error: "Failed to save request" };
  }
}

/**
 * Saves a free design request.
 */
export async function saveFreeDesignRequest(data: {
  businessName: string;
  whatsappNumber: string;
  businessType?: string;
  requiredDesign?: string;
}) {
  try {
    await ensureResponseTables();
    const [result]: any = await pool.execute(
      'INSERT INTO responses_free_design (business_name, whatsapp_number, business_type, required_design) VALUES (?, ?, ?, ?)',
      [data.businessName, data.whatsappNumber, data.businessType || null, data.requiredDesign || null]
    );
    return { success: true, id: Number(result.insertId) };
  } catch (error) {
    console.error("Error saving free design request:", error);
    return { success: false, error: "Failed to save request" };
  }
}

/**
 * Saves a team tracker request.
 */
export async function saveTeamTrackerRequest(data: {
  businessName: string;
  whatsappNumber: string;
  businessType?: string;
  goal?: string;
}) {
  try {
    await ensureResponseTables();
    const [result]: any = await pool.execute(
      'INSERT INTO responses_team_tracker (business_name, whatsapp_number, business_type, goal) VALUES (?, ?, ?, ?)',
      [data.businessName, data.whatsappNumber, data.businessType || null, data.goal || null]
    );
    return { success: true, id: Number(result.insertId) };
  } catch (error) {
    console.error("Error saving team tracker request:", error);
    return { success: false, error: "Failed to save request" };
  }
}

/**
 * Fetches all responses for admin dashboard.
 */
export async function getAllResponses() {
  try {
    await ensureResponseTables();
    
    const [hiring]: any = await pool.execute('SELECT *, "Hiring" as type FROM responses_hiring ORDER BY created_at DESC');
    const [freeDesign]: any = await pool.execute('SELECT *, "Free Design" as type FROM responses_free_design ORDER BY created_at DESC');
    const [teamTracker]: any = await pool.execute('SELECT *, "Team Tracker" as type FROM responses_team_tracker ORDER BY created_at DESC');
    
    return { 
      success: true, 
      data: {
        hiring,
        freeDesign,
        teamTracker
      }
    };
  } catch (error) {
    console.error("Error fetching all responses:", error);
    return { success: false, error: "Failed to fetch responses" };
  }
}
