"use server";

import pool from '@/lib/mysql';

/**
 * Ensures the ebook_leads table exists.
 */
async function ensureEbookLeadsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ebook_leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error("Database initialization error (ebook_leads):", err);
  }
}

/**
 * Main action to handle ebook lead capture. 
 * Automated email sending has been removed to simplify deployment.
 */
export async function submitEbookLead(email: string) {
  try {
    await ensureEbookLeadsTable();

    // Save lead to database
    await pool.execute(
      'INSERT INTO ebook_leads (email) VALUES (?)',
      [email]
    );

    return { 
      success: true, 
      message: "Lead captured successfully"
    };
  } catch (error) {
    console.error("Ebook Lead Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}
