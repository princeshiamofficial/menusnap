"use server";
import { revalidatePath } from 'next/cache';

import pool from '@/lib/mysql';
import fs from 'fs/promises';
import path from 'path';

/**
 * Helper to delete a file from the public directory if it exists.
 */
async function deleteFileIfExists(relativeUrl: string) {
  if (!relativeUrl || !relativeUrl.startsWith('/uploads')) return;
  
  try {
    const filePath = path.join(process.cwd(), 'public', relativeUrl);
    await fs.unlink(filePath);
  } catch (err) {
    // File might not exist or already deleted, ignore errors but log warning
    console.warn(`File deletion ignored for ${relativeUrl}:`, err);
  }
}

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
        group_name VARCHAR(255) DEFAULT 'General',
        group_image TEXT,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure columns exist for existing tables
    const [columns]: any = await pool.execute("SHOW COLUMNS FROM dashboard_spotlights");
    const columnNames = columns.map((c: any) => c.Field);
    
    if (!columnNames.includes('group_name')) {
      await pool.execute("ALTER TABLE dashboard_spotlights ADD COLUMN group_name VARCHAR(255) DEFAULT 'General'");
    }
    if (!columnNames.includes('group_image')) {
      await pool.execute("ALTER TABLE dashboard_spotlights ADD COLUMN group_image TEXT");
    }

    // Table created successfully. No dummy data added.
  } catch (err) {
    console.error("Database initialization error (spotlights):", err);
    throw err;
  }
}

/**
 * Ensures the dashboard_spotlight_categories table exists.
 */
async function ensureSpotlightCategoriesTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS dashboard_spotlight_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error("Database initialization error (spotlight categories):", err);
    throw err;
  }
}

/**
 * Ensures the exclusive_offers table exists.
 */
async function ensureExclusiveOffersTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS dashboard_exclusive_offers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error("Database initialization error (exclusive offers):", err);
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

    // Invalidate cache so new image appears without PM2 restart
    revalidatePath('/m-admin/quick-manager');

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
    console.log("Attempting to delete slide ID:", slideId);
    await ensureSlidesTable();
    
    // Get image URL before deletion
    const [rows]: any = await pool.execute('SELECT image_url FROM dashboard_slides WHERE id = ?', [slideId]);
    if (rows.length > 0) {
      await deleteFileIfExists(rows[0].image_url);
    }
    
    await pool.execute('DELETE FROM dashboard_slides WHERE id = ?', [slideId]);
    // Invalidate cache so removal reflects without PM2 restart
    revalidatePath('/m-admin/quick-manager');
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
 * Fetches all spotlight categories.
 */
export async function getSpotlightCategories() {
  try {
    await ensureSpotlightCategoriesTable();
    const [rows]: any = await pool.execute('SELECT * FROM dashboard_spotlight_categories ORDER BY name ASC');
    return { success: true, categories: rows };
  } catch (error: any) {
    console.error("Database Error fetching spotlight categories:", error);
    return { success: false, error: error?.message || "Failed to fetch categories", categories: [] };
  }
}

/**
 * Adds a new spotlight category.
 */
export async function addSpotlightCategory(formData: FormData) {
  try {
    await ensureSpotlightCategoriesTable();
    const name = formData.get('name') as string;
    const imageUrl = formData.get('imageUrl') as string;

    let finalImageUrl = imageUrl || '';

    if (imageUrl && imageUrl.startsWith('data:image')) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'spotlights', 'categories');
      
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      const fileExt = imageUrl.split(';')[0].split('/')[1] || 'png';
      const fileName = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      await fs.writeFile(filePath, buffer);
      finalImageUrl = `/uploads/spotlights/categories/${fileName}`;
    }

    const [result]: any = await pool.execute(
      'INSERT INTO dashboard_spotlight_categories (name, image_url) VALUES (?, ?)',
      [name, finalImageUrl]
    );

    revalidatePath('/m-admin/quick-manager');
    return { success: true, categoryId: result.insertId, path: finalImageUrl };
  } catch (error: any) {
    console.error("Database Error adding spotlight category:", error);
    return { success: false, error: error?.message || "Failed to add category" };
  }
}

/**
 * Deletes a spotlight category.
 */
export async function deleteSpotlightCategory(id: number) {
  try {
    await ensureSpotlightCategoriesTable();

    // Get image URL before deletion
    const [rows]: any = await pool.execute('SELECT image_url FROM dashboard_spotlight_categories WHERE id = ?', [id]);
    if (rows.length > 0 && rows[0].image_url) {
      await deleteFileIfExists(rows[0].image_url);
    }

    await pool.execute('DELETE FROM dashboard_spotlight_categories WHERE id = ?', [id]);
    revalidatePath('/m-admin/quick-manager');
    return { success: true };
  } catch (error: any) {
    console.error("Database Error deleting spotlight category:", error);
    return { success: false, error: error?.message || "Failed to delete category" };
  }
}

/**
 * Updates a spotlight category.
 */
export async function updateSpotlightCategory(formData: FormData) {
  try {
    await ensureSpotlightCategoriesTable();
    const id = parseInt(formData.get('id') as string);
    const name = formData.get('name') as string;
    const imageUrl = formData.get('imageUrl') as string;

    let finalImageUrl = imageUrl;

    if (imageUrl && imageUrl.startsWith('data:image')) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'spotlights', 'categories');
      
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      // Delete old image if it exists
      const [oldRows]: any = await pool.execute('SELECT image_url FROM dashboard_spotlight_categories WHERE id = ?', [id]);
      if (oldRows.length > 0 && oldRows[0].image_url) {
        await deleteFileIfExists(oldRows[0].image_url);
      }

      const fileExt = imageUrl.split(';')[0].split('/')[1] || 'png';
      const fileName = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      await fs.writeFile(filePath, buffer);
      finalImageUrl = `/uploads/spotlights/categories/${fileName}`;
    }

    if (finalImageUrl) {
      await pool.execute(
        'UPDATE dashboard_spotlight_categories SET name = ?, image_url = ? WHERE id = ?',
        [name, finalImageUrl, id]
      );
    } else {
      await pool.execute(
        'UPDATE dashboard_spotlight_categories SET name = ? WHERE id = ?',
        [name, id]
      );
    }

    revalidatePath('/m-admin/quick-manager');
    return { success: true };
  } catch (error: any) {
    console.error("Database Error updating spotlight category:", error);
    return { success: false, error: error?.message || "Failed to update category" };
  }
}

/**
 * Adds a new spotlight to the database.
 */
export async function addDashboardSpotlight(formData: FormData) {
  try {
    await ensureSpotlightsTable();
    const title = formData.get('title') as string || '';
    const imageUrl = formData.get('imageUrl') as string;
    const linkUrl = formData.get('linkUrl') as string || '';
    const offer = formData.get('offer') as string || '';
    const ctaText = formData.get('ctaText') as string || 'Swipe up';
    const groupName = formData.get('groupName') as string || 'General';
    const groupImage = formData.get('groupImage') as string;

    let finalImageUrl = imageUrl;

    if (imageUrl.startsWith('data:image')) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'spotlights');
      
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      const fileExt = imageUrl.split(';')[0].split('/')[1] || 'png';
      const fileName = `spotlight-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      await fs.writeFile(filePath, buffer);
      finalImageUrl = `/uploads/spotlights/${fileName}`;
    }

    const [result]: any = await pool.execute(
      'INSERT INTO dashboard_spotlights (title, image_url, link_url, offer, cta_text, group_name, group_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        title, 
        finalImageUrl, 
        linkUrl, 
        offer, 
        ctaText,
        groupName,
        groupImage || finalImageUrl // Default group image to the slide image if not provided
      ]
    );

    // Invalidate cache so new spotlight appears without PM2 restart
    revalidatePath('/m-admin/quick-manager');

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

    // Get image URL before deletion
    const [rows]: any = await pool.execute('SELECT image_url FROM dashboard_spotlights WHERE id = ?', [id]);
    if (rows.length > 0) {
      await deleteFileIfExists(rows[0].image_url);
    }

    await pool.execute('DELETE FROM dashboard_spotlights WHERE id = ?', [id]);
    // Invalidate cache so removal reflects without PM2 restart
    revalidatePath('/m-admin/quick-manager');
    return { success: true };
  } catch (error: any) {
    console.error("Database Error deleting spotlight spotlight:", error);
    return { success: false, error: error?.message || "Failed to delete spotlight" };
  }
}

/**
 * Updates a spotlight in the database.
 */
export async function updateDashboardSpotlight(formData: FormData) {
  try {
    await ensureSpotlightsTable();
    const id = parseInt(formData.get('id') as string);
    const title = formData.get('title') as string || '';
    const imageUrl = formData.get('imageUrl') as string;
    const linkUrl = formData.get('linkUrl') as string || '';
    const ctaText = formData.get('ctaText') as string || 'Swipe up';
    const groupName = formData.get('groupName') as string || 'General';

    let finalImageUrl = imageUrl;

    if (imageUrl && imageUrl.startsWith('data:image')) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'spotlights');
      
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      // Delete old image
      const [oldRows]: any = await pool.execute('SELECT image_url FROM dashboard_spotlights WHERE id = ?', [id]);
      if (oldRows.length > 0) {
        await deleteFileIfExists(oldRows[0].image_url);
      }

      const fileExt = imageUrl.split(';')[0].split('/')[1] || 'png';
      const fileName = `spotlight-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      await fs.writeFile(filePath, buffer);
      finalImageUrl = `/uploads/spotlights/${fileName}`;
    }

    if (finalImageUrl) {
      await pool.execute(
        'UPDATE dashboard_spotlights SET title = ?, image_url = ?, link_url = ?, cta_text = ?, group_name = ? WHERE id = ?',
        [title, finalImageUrl, linkUrl, ctaText, groupName, id]
      );
    } else {
      await pool.execute(
        'UPDATE dashboard_spotlights SET title = ?, link_url = ?, cta_text = ?, group_name = ? WHERE id = ?',
        [title, linkUrl, ctaText, groupName, id]
      );
    }

    revalidatePath('/m-admin/quick-manager');
    return { success: true };
  } catch (error: any) {
    console.error("Database Error updating spotlight:", error);
    return { success: false, error: error?.message || "Failed to update spotlight" };
  }
}

/**
 * Fetches all exclusive offers from the database.
 */
export async function getExclusiveOffers() {
  try {
    await ensureExclusiveOffersTable();
    const [rows]: any = await pool.execute('SELECT * FROM dashboard_exclusive_offers ORDER BY created_at DESC');
    return { success: true, offers: rows };
  } catch (error: any) {
    console.error("Database Error fetching exclusive offers:", error);
    return { success: false, error: error?.message || "Failed to fetch exclusive offers", offers: [] };
  }
}

/**
 * Adds a new exclusive offer to the database.
 */
export async function addExclusiveOffer(data: { category: string, imageUrl: string }) {
  try {
    await ensureExclusiveOffersTable();

    let finalImageUrl = data.imageUrl;

    if (data.imageUrl.startsWith('data:image')) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'offers');
      
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      const fileExt = data.imageUrl.split(';')[0].split('/')[1] || 'png';
      const fileName = `offer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      
      const base64Data = data.imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      await fs.writeFile(filePath, buffer);
      finalImageUrl = `/uploads/offers/${fileName}`;
    }

    const [result]: any = await pool.execute(
      'INSERT INTO dashboard_exclusive_offers (category, image_url) VALUES (?, ?)',
      [data.category, finalImageUrl]
    );

    revalidatePath('/m-admin/quick-manager');
    revalidatePath('/dashboard');

    return { success: true, offerId: result.insertId, path: finalImageUrl };
  } catch (error: any) {
    console.error("Database Error adding exclusive offer:", error);
    return { success: false, error: error?.message || "Failed to add exclusive offer" };
  }
}

/**
 * Deletes an exclusive offer from the database.
 */
export async function deleteExclusiveOffer(id: number) {
  try {
    await ensureExclusiveOffersTable();

    // Get image URL before deletion
    const [rows]: any = await pool.execute('SELECT image_url FROM dashboard_exclusive_offers WHERE id = ?', [id]);
    if (rows.length > 0) {
      await deleteFileIfExists(rows[0].image_url);
    }

    await pool.execute('DELETE FROM dashboard_exclusive_offers WHERE id = ?', [id]);
    revalidatePath('/m-admin/quick-manager');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error("Database Error deleting exclusive offer:", error);
    return { success: false, error: error?.message || "Failed to delete exclusive offer" };
  }
}

/**
 * Updates an exclusive offer in the database.
 */
export async function updateExclusiveOffer(id: number, data: { category: string, imageUrl?: string }) {
  try {
    await ensureExclusiveOffersTable();

    let finalImageUrl = data.imageUrl;

    if (data.imageUrl && data.imageUrl.startsWith('data:image')) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'offers');
      
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      // Delete old image
      const [oldRows]: any = await pool.execute('SELECT image_url FROM dashboard_exclusive_offers WHERE id = ?', [id]);
      if (oldRows.length > 0) {
        await deleteFileIfExists(oldRows[0].image_url);
      }

      const fileExt = data.imageUrl.split(';')[0].split('/')[1] || 'png';
      const fileName = `offer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      
      const base64Data = data.imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      await fs.writeFile(filePath, buffer);
      finalImageUrl = `/uploads/offers/${fileName}`;
    }

    if (finalImageUrl) {
      await pool.execute(
        'UPDATE dashboard_exclusive_offers SET category = ?, image_url = ? WHERE id = ?',
        [data.category, finalImageUrl, id]
      );
    } else {
      await pool.execute(
        'UPDATE dashboard_exclusive_offers SET category = ? WHERE id = ?',
        [data.category, id]
      );
    }

    revalidatePath('/m-admin/quick-manager');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error("Database Error updating exclusive offer:", error);
    return { success: false, error: error?.message || "Failed to update exclusive offer" };
  }
}
