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

    // Table created successfully. No dummy data added.
  } catch (err) {
    console.error("Database initialization error (slides):", err);
    throw err;
  }
}

/**
 * Ensures the dashboard_spotlights table exists.
 */
async function ensureSpotlightsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS dashboard_spotlights (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url TEXT NOT NULL,
        link_url TEXT,
        offer VARCHAR(100),
        cta_text VARCHAR(100) DEFAULT 'Swipe up',
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Table created successfully. No dummy data added.
  } catch (err) {
    console.error("Database initialization error (spotlights):", err);
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

/**
 * Fetches all spotlights from the database.
 */
export async function getDashboardSpotlights() {
  try {
    await ensureSpotlightsTable();
    const [rows]: any = await pool.execute('SELECT * FROM dashboard_spotlights ORDER BY sort_order ASC, created_at DESC');
    return { success: true, spotlights: rows };
  } catch (error: any) {
    console.error("Database Error fetching spotlights:", error);
    return { success: false, error: error?.message || "Failed to fetch spotlights", spotlights: [] };
  }
}

/**
 * Adds a new spotlight to the database.
 */
export async function addDashboardSpotlight(data: { title: string, imageUrl: string, linkUrl?: string, offer?: string, ctaText?: string }) {
  try {
    await ensureSpotlightsTable();

    let finalImageUrl = data.imageUrl;

    if (data.imageUrl.startsWith('data:image')) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'spotlights');
      
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      const fileExt = data.imageUrl.split(';')[0].split('/')[1] || 'png';
      const fileName = `spotlight-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      
      const base64Data = data.imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      await fs.writeFile(filePath, buffer);
      finalImageUrl = `/uploads/spotlights/${fileName}`;
    }

    const [result]: any = await pool.execute(
      'INSERT INTO dashboard_spotlights (title, image_url, link_url, offer, cta_text) VALUES (?, ?, ?, ?, ?)',
      [data.title, finalImageUrl, data.linkUrl || '', data.offer || '', data.ctaText || 'Swipe up']
    );

    return { success: true, spotlightId: result.insertId, path: finalImageUrl };
  } catch (error: any) {
    console.error("Database Error adding spotlight:", error);
    return { success: false, error: error?.message || "Failed to add spotlight" };
  }
}

/**
 * Deletes a spotlight from the database.
 */
export async function deleteDashboardSpotlight(id: number) {
  try {
    await ensureSpotlightsTable();
    await pool.execute('DELETE FROM dashboard_spotlights WHERE id = ?', [id]);
    return { success: true };
  } catch (error: any) {
    console.error("Database Error deleting spotlight:", error);
    return { success: false, error: error?.message || "Failed to delete spotlight" };
  }
}
