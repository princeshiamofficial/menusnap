
"use server";

import pool from '@/lib/mysql';

export interface GreetingItem {
    id: number;
    title: string;
    content: string;
}

/**
 * Ensures the greetings table exists.
 */
async function ensureGreetingsTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS greetings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Force convert the table to utf8mb4 if it already exists
        await pool.execute(`ALTER TABLE greetings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    } catch (error) {
        console.error("Failed to ensure greetings table:", error);
        throw error;
    }
}

/**
 * Fetches all greetings from the database.
 */
export async function getGreetings() {
    try {
        await ensureGreetingsTable();
        const [rows]: any = await pool.query('SELECT * FROM greetings ORDER BY created_at DESC');
        const plainGreetings = (rows as any[]).map((row: any) => ({ ...row }));
        return { success: true, data: plainGreetings };
    } catch (error) {
        console.error("Error fetching greetings:", error);
        return { success: false, error: "Failed to fetch greetings." };
    }
}

/**
 * Adds a new greeting to the database.
 */
export async function addGreeting(title: string, content: string) {
    try {
        await ensureGreetingsTable();
        const [result]: any = await pool.query(
            'INSERT INTO greetings (title, content) VALUES (?, ?)',
            [title, content]
        );
        return { success: true, data: { id: result.insertId, title, content } };
    } catch (error: any) {
        console.error("Failed to add greeting:", error);
        return { success: false, error: error.message || "Database error" };
    }
}

/**
 * Updates an existing greeting in the database.
 */
export async function updateGreeting(id: number, title: string, content: string) {
    try {
        await ensureGreetingsTable();
        await pool.query(
            'UPDATE greetings SET title = ?, content = ? WHERE id = ?',
            [title, content, id]
        );
        return { success: true, data: { id, title, content } };
    } catch (error) {
        console.error("Error updating greeting:", error);
        return { success: false, error: "Failed to update greeting." };
    }
}

/**
 * Deletes a greeting from the database.
 */
export async function deleteGreeting(id: number) {
    try {
        await ensureGreetingsTable();
        await pool.query('DELETE FROM greetings WHERE id = ?', [id]);
        return { success: true };
    } catch (error) {
        console.error("Error deleting greeting:", error);
        return { success: false, error: "Failed to delete greeting." };
    }
}
