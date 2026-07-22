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
  {
    id: '1',
    title: "Sultan's Dine Menu Mockup",
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    column: 1,
    size: 'large',
    tags: 'Biryani, Luxury Gold',
  },
  {
    id: '2',
    title: 'North End Specialty Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    column: 2,
    size: 'small',
    tags: 'Cafe, Minimalist, Brown',
  },
  {
    id: '3',
    title: 'Chillox Gourmet Monster Burger',
    imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    column: 3,
    size: 'large',
    tags: 'Fast Food, Neon Red',
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
        image_url TEXT NOT NULL,
        bento_column INT DEFAULT 1,
        card_size VARCHAR(50) DEFAULT 'large',
        tags VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed if empty
    const [rows]: any = await pool.execute('SELECT COUNT(*) as count FROM client_gallery');
    if (rows && rows[0] && Number(rows[0].count) === 0) {
      for (const item of INITIAL_GALLERY) {
        await pool.execute(
          `INSERT INTO client_gallery (id, title, image_url, bento_column, card_size, tags)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [item.id || '', item.title, item.imageUrl, item.column || 1, item.size || 'large', item.tags || '']
        );
      }
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
    return { success: false, error: error?.message || "Failed to fetch gallery", data: INITIAL_GALLERY };
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
