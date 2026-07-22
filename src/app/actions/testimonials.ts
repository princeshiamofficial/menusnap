"use server";

import pool from '@/lib/mysql';

export interface TestimonialData {
  id?: string;
  name: string;
  categoryLabel?: string;
  location?: string;
  ownerName: string;
  review: string;
  image?: string;
  isSpotlight?: boolean;
  sortOrder?: number;
}

const INITIAL_TESTIMONIALS: TestimonialData[] = [
  {
    id: '1',
    name: "Sultan's Dine",
    categoryLabel: 'Traditional Kacchi & Biryani',
    location: 'Dhaka',
    review: 'Serving over 50,000+ happy diners monthly with instant digital table menus and zero order bottlenecks.',
    ownerName: 'Tanvir Hossain (Operations Head)',
    isSpotlight: true,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    sortOrder: 1,
  },
  {
    id: '2',
    name: 'North End Coffee',
    categoryLabel: 'Specialty Roastery & Cafe',
    location: 'Gulshan',
    review: 'Dynamic seasonal menu updates published in real-time across 12 outlets in Bangladesh.',
    ownerName: 'Rick Hubbard (CEO)',
    isSpotlight: true,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    sortOrder: 2,
  },
  {
    id: '3',
    name: 'Chillox Gourmet Burgers',
    categoryLabel: 'Fast Casual Dining',
    location: 'Banani',
    review: 'Processing over 80,000+ digital orders with lightning-fast QR code table scans and customizable toppings.',
    ownerName: 'Jubair Ahmed (Co-founder)',
    isSpotlight: true,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    sortOrder: 3,
  },
  {
    id: '4',
    name: 'Secret Recipe',
    categoryLabel: 'Fine Cakes & Western Cuisine',
    location: 'Uttara',
    review: 'Streamlined WhatsApp order dispatch and table reservation sync for seamless peak-hour turnover.',
    ownerName: 'Sharmin Akter (Branch Manager)',
    isSpotlight: true,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    sortOrder: 4,
  },
  {
    id: '5',
    name: 'The Garden Bistro',
    categoryLabel: 'Continental Fine Dining',
    location: 'Sylhet',
    review: 'Delighting guests with glassmorphism digital menus that perfectly complement the luxury dining vibe.',
    ownerName: 'Dr. Faisal Rahman (Owner)',
    isSpotlight: true,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    sortOrder: 5,
  },
];

/**
 * Ensures the testimonials table exists in MySQL database.
 */
async function ensureTestimonialsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category_label VARCHAR(255) NULL,
        location VARCHAR(255) NULL,
        owner_name VARCHAR(255) NOT NULL,
        review TEXT NOT NULL,
        image TEXT NULL,
        is_spotlight TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Check if table is empty; if empty, seed initial data
    const [rows]: any = await pool.execute('SELECT COUNT(*) as count FROM testimonials');
    if (rows && rows[0] && Number(rows[0].count) === 0) {
      for (const item of INITIAL_TESTIMONIALS) {
        await pool.execute(
          `INSERT INTO testimonials (id, name, category_label, location, owner_name, review, image, is_spotlight, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id || '',
            item.name,
            item.categoryLabel || '',
            item.location || '',
            item.ownerName,
            item.review,
            item.image || '',
            item.isSpotlight ? 1 : 0,
            item.sortOrder || 0,
          ]
        );
      }
    }
  } catch (err) {
    console.error("Failed to initialize testimonials table:", err);
  }
}

/**
 * Gets all testimonials from MySQL database.
 */
export async function getTestimonials() {
  try {
    await ensureTestimonialsTable();
    const [rows]: any = await pool.execute('SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC');

    const testimonials: TestimonialData[] = (rows || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      categoryLabel: row.category_label || '',
      location: row.location || '',
      ownerName: row.owner_name,
      review: row.review,
      image: row.image || '',
      isSpotlight: Boolean(row.is_spotlight),
      sortOrder: Number(row.sort_order || 0),
    }));

    return { success: true, data: testimonials };
  } catch (error: any) {
    console.error("Database Error fetching testimonials:", error);
    return { success: false, error: error?.message || "Failed to fetch testimonials", data: INITIAL_TESTIMONIALS };
  }
}

/**
 * Creates a new testimonial in MySQL database.
 */
export async function createTestimonial(item: TestimonialData) {
  try {
    await ensureTestimonialsTable();
    const id = item.id || Date.now().toString();

    await pool.execute(
      `INSERT INTO testimonials (id, name, category_label, location, owner_name, review, image, is_spotlight, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        item.name.trim(),
        (item.categoryLabel || '').trim(),
        (item.location || '').trim(),
        item.ownerName.trim(),
        item.review.trim(),
        item.image || '',
        item.isSpotlight ?? true ? 1 : 0,
        item.sortOrder || 0,
      ]
    );

    return { success: true, data: { ...item, id } };
  } catch (error: any) {
    console.error("Database Error creating testimonial:", error);
    return { success: false, error: error?.message || "Failed to create testimonial" };
  }
}

/**
 * Updates an existing testimonial in MySQL database.
 */
export async function updateTestimonial(id: string, item: Partial<TestimonialData>) {
  try {
    await ensureTestimonialsTable();

    await pool.execute(
      `UPDATE testimonials 
       SET name = ?, category_label = ?, location = ?, owner_name = ?, review = ?, image = ?, is_spotlight = ?
       WHERE id = ?`,
      [
        (item.name || '').trim(),
        (item.categoryLabel || '').trim(),
        (item.location || '').trim(),
        (item.ownerName || '').trim(),
        (item.review || '').trim(),
        item.image || '',
        item.isSpotlight ?? true ? 1 : 0,
        id,
      ]
    );

    return { success: true, data: { ...item, id } };
  } catch (error: any) {
    console.error("Database Error updating testimonial:", error);
    return { success: false, error: error?.message || "Failed to update testimonial" };
  }
}

/**
 * Deletes a testimonial from MySQL database by ID.
 */
export async function deleteTestimonial(id: string) {
  try {
    await ensureTestimonialsTable();
    await pool.execute('DELETE FROM testimonials WHERE id = ?', [id]);
    return { success: true };
  } catch (error: any) {
    console.error("Database Error deleting testimonial:", error);
    return { success: false, error: error?.message || "Failed to delete testimonial" };
  }
}
