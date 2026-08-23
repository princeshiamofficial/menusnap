"use server";

import pool from '@/lib/mysql';

export interface GalleryItemData {
  id?: string;
  title: string;
  imageUrl: string;
  column?: number;
  size?: 'small' | 'large';
  tags?: string;
}

const INITIAL_GALLERY: GalleryItemData[] = [
  // Column 1
  {
    id: '1',
    title: 'Book of Esther Cover Design',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    column: 1,
    size: 'large',
    tags: 'Esther, Green Roll',
  },
  {
    id: '2',
    title: 'Open Menu Book Showcase',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    column: 1,
    size: 'small',
    tags: 'Open Book',
  },
  {
    id: '3',
    title: 'Green Book Cover Mockup',
    imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
    column: 1,
    size: 'small',
    tags: 'Green Cover',
  },

  // Column 2
  {
    id: '4',
    title: 'Colorful Artwork Book Cover',
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
    column: 2,
    size: 'small',
    tags: 'Artwork',
  },
  {
    id: '5',
    title: 'Stacked Manuscript Pages',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    column: 2,
    size: 'small',
    tags: 'Manuscript',
  },
  {
    id: '6',
    title: 'Book of Psalms Soft Focus',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    column: 2,
    size: 'large',
    tags: 'Psalms, Blur',
  },

  // Column 3
  {
    id: '7',
    title: 'Psalms Book with Flower Twig',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
    column: 3,
    size: 'large',
    tags: 'Psalms, Floral',
  },
  {
    id: '8',
    title: 'Esther Mini Green Card',
    imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
    column: 3,
    size: 'small',
    tags: 'Esther Mini',
  },
  {
    id: '9',
    title: 'Abstract Art Cover',
    imageUrl: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=600&q=80',
    column: 3,
    size: 'small',
    tags: 'Abstract',
  },
];

/**
 * Ensures client_gallery table exists in MySQL database.
 */
async function ensureClientGalleryTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS client_gallery (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url LONGTEXT NOT NULL,
        bento_column INT DEFAULT 1,
        card_size VARCHAR(50) DEFAULT 'large',
        tags VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    try {
      await pool.execute(`ALTER TABLE client_gallery MODIFY COLUMN image_url LONGTEXT NOT NULL`);
    } catch {
      // Column already LONGTEXT
    }
  } catch (err) {
    console.error("Failed to initialize client_gallery table:", err);
  }
}

/**
 * Gets all client gallery items from MySQL database.
 */
export async function getClientGallery() {
  try {
    await ensureClientGalleryTable();
    const [rows]: any = await pool.execute('SELECT * FROM client_gallery ORDER BY created_at DESC');

    const items: GalleryItemData[] = (rows || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      imageUrl: row.image_url,
      column: Number(row.bento_column || 1),
      size: row.card_size || 'large',
      tags: row.tags || '',
    }));

    return { success: true, data: items };
  } catch (error: any) {
    console.error("Database Error fetching client gallery:", error);
    return { success: false, error: error?.message || "Failed to fetch gallery", data: [] };
  }
}

/**
 * Creates a new client gallery item in MySQL database.
 */
export async function createGalleryItem(item: GalleryItemData) {
  try {
    await ensureClientGalleryTable();
    const id = item.id || Date.now().toString();

    await pool.execute(
      `INSERT INTO client_gallery (id, title, image_url, bento_column, card_size, tags)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, item.title.trim(), item.imageUrl.trim(), item.column || 1, item.size || 'large', (item.tags || '').trim()]
    );

    return { success: true, data: { ...item, id } };
  } catch (error: any) {
    console.error("Database Error creating gallery item:", error);
    return { success: false, error: error?.message || "Failed to create gallery item" };
  }
}

/**
 * Updates an existing client gallery item in MySQL database.
 */
export async function updateGalleryItem(id: string, item: Partial<GalleryItemData>) {
  try {
    await ensureClientGalleryTable();

    await pool.execute(
      `UPDATE client_gallery 
       SET title = ?, image_url = ?, bento_column = ?, card_size = ?, tags = ?
       WHERE id = ?`,
      [
        (item.title || '').trim(),
        (item.imageUrl || '').trim(),
        item.column || 1,
        item.size || 'large',
        (item.tags || '').trim(),
        id,
      ]
    );

    return { success: true, data: { ...item, id } };
  } catch (error: any) {
    console.error("Database Error updating gallery item:", error);
    return { success: false, error: error?.message || "Failed to update gallery item" };
  }
}

/**
 * Deletes a client gallery item from MySQL database.
 */
export async function deleteGalleryItem(id: string) {
  try {
    await ensureClientGalleryTable();
    await pool.execute('DELETE FROM client_gallery WHERE id = ?', [id]);
    return { success: true };
  } catch (error: any) {
    console.error("Database Error deleting gallery item:", error);
    return { success: false, error: error?.message || "Failed to delete gallery item" };
  }
}

/**
 * Clears/Truncates all gallery items in MySQL database and re-seeds with the 9-item exact Bento layout.
 */
export async function clearClientGallery() {
  try {
    await ensureClientGalleryTable();
    await pool.execute('TRUNCATE TABLE client_gallery');
    return { success: true, data: [] };
  } catch (error: any) {
    console.error("Database Error clearing gallery table:", error);
    return { success: false, error: error?.message || "Failed to clear gallery DB" };
  }
}
