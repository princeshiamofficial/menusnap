"use server";

import pool from '@/lib/mysql';
import fs from 'fs/promises';
import path from 'path';

/**
 * Ensures the dashboard_slides table exists.
 */
async function ensureSlidesTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS dashboard_slides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Add dummy slides if the table is empty
    const [rows]: any = await pool.execute('SELECT COUNT(*) as total FROM dashboard_slides');
    if (rows[0].total === 0) {
      const initialSlides = [
        '/dashboard/slider1.png',
        '/dashboard/slider2.png',
        '/dashboard/slider3.png'
      ];
      for (const img of initialSlides) {
        await pool.execute('INSERT INTO dashboard_slides (image_url) VALUES (?)', [img]);
      }
    }
  } catch (err) {
    console.error("Database initialization error (slides):", err);
    throw err;
  }
}

/**
 * Fetches all slides from the database.
 */
export async function getDashboardSlides() {
  try {
    await ensureSlidesTable();
    const [rows]: any = await pool.execute('SELECT * FROM dashboard_slides ORDER BY created_at DESC');
    return { success: true, slides: rows };
  } catch (error: any) {
    console.error("Database Error fetching slides:", error);
    return { success: false, error: error?.message || "Failed to fetch slides", slides: [] };
  }
}

/**
 * Adds a new slide to the database.
 * @param imageUrl The URL or path to the image, or a base64 string.
 */
export async function addDashboardSlide(imageUrl: string) {
  try {
    await ensureSlidesTable();

    let finalImageUrl = imageUrl;

    // Handle base64 image data to keep DB text very short
    if (imageUrl.startsWith('data:image')) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'slides');
      
      // Ensure directory exists
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const fileExt = imageUrl.split(';')[0].split('/')[1] || 'png';
      const fileName = `slide-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      
      // Extract base64 data
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Save to filesystem
      await fs.writeFile(filePath, buffer);
      
      // Store relative path in DB
      finalImageUrl = `/uploads/slides/${fileName}`;
    }

    const [result]: any = await pool.execute(
      'INSERT INTO dashboard_slides (image_url) VALUES (?)',
      [finalImageUrl]
    );

    return { success: true, slideId: result.insertId, path: finalImageUrl };
  } catch (error: any) {
    console.error("Database Error adding slide:", error);
    return { success: false, error: error?.message || "Failed to add slide" };
  }
}

/**
 * Deletes a slide from the database.
 * @param slideId The ID of the slide to delete.
 */
export async function deleteDashboardSlide(slideId: number) {
  try {
    await ensureSlidesTable();
    await pool.execute('DELETE FROM dashboard_slides WHERE id = ?', [slideId]);
    return { success: true };
  } catch (error: any) {
    console.error("Database Error deleting slide:", error);
    return { success: false, error: error?.message || "Failed to delete slide" };
  }
}
