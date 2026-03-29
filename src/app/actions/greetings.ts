"use server";

import pool from "@/lib/mysql";

export interface GreetingItem {
    id: number;
    title: string;
    content: string;
}

/**
 * Ensures the greetings table exists in the database.
 */
async function ensureGreetingsTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS greetings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } catch (error) {
        console.error("Failed to ensure greetings table:", error);
        throw error;
    }
}

/**
 * Fetches all greeting messages from the database.
 */
export async function getGreetings(): Promise<{ success: boolean; data?: GreetingItem[]; error?: string }> {
    try {
        await ensureGreetingsTable();
        const [rows] = await pool.query("SELECT * FROM greetings ORDER BY created_at DESC");
        return { success: true, data: rows as GreetingItem[] };
    } catch (error) {
        console.error("Error fetching greetings:", error);
        return { success: false, error: "Failed to fetch greeting messages." };
    }
}

/**
 * Adds a new greeting message.
 */
export async function addGreeting(title: string, content: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        await ensureGreetingsTable();
        const [result]: any = await pool.query(
            "INSERT INTO greetings (title, content) VALUES (?, ?)",
            [title, content]
        );
        return { success: true, data: { id: result.insertId, title, content } };
    } catch (error) {
        console.error("Error adding greeting:", error);
        return { success: false, error: "Failed to add greeting message." };
    }
}

/**
 * Updates an existing greeting message.
 */
export async function updateGreeting(id: number, title: string, content: string): Promise<{ success: boolean; error?: string }> {
    try {
        await ensureGreetingsTable();
        await pool.query(
            "UPDATE greetings SET title = ?, content = ? WHERE id = ?",
            [title, content, id]
        );
        return { success: true };
    } catch (error) {
        console.error("Error updating greeting:", error);
        return { success: false, error: "Failed to update greeting message." };
    }
}

/**
 * Deletes a greeting message.
 */
export async function deleteGreeting(id: number): Promise<{ success: boolean; error?: string }> {
    try {
        await pool.query("DELETE FROM greetings WHERE id = ?", [id]);
        return { success: true };
    } catch (error) {
        console.error("Error deleting greeting:", error);
        return { success: false, error: "Failed to delete greeting message." };
    }
}
