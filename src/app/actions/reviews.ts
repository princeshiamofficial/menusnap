"use server";

import pool from '@/lib/mysql';

/**
 * Ensures the client_reviews table exists in the database.
 */
async function ensureReviewsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS client_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_name VARCHAR(255) NOT NULL,
        review_text TEXT NOT NULL,
        image_url VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error("Failed to initialize reviews table:", err);
    throw err;
  }
}

/**
 * Submits a new client review to the database.
 * @param businessName The name of the restaurant or salon.
 * @param reviewText The testimonial or feedback content.
 * @param imageUrl The URL of the client's uploaded profile/logo image.
 * @returns Standard response object indicating success or failure.
 */
export async function submitReview(businessName: string, reviewText: string, imageUrl?: string) {
  try {
    await ensureReviewsTable();

    if (!businessName || !businessName.trim()) {
      return { success: false, error: "Business name is required." };
    }
    if (!reviewText || !reviewText.trim()) {
      return { success: false, error: "Review text is required." };
    }

    const [result]: any = await pool.execute(
      'INSERT INTO client_reviews (business_name, review_text, image_url) VALUES (?, ?, ?)',
      [businessName.trim(), reviewText.trim(), imageUrl || null]
    );

    return { 
      success: true, 
      data: { 
        id: Number(result.insertId),
        businessName,
        reviewText,
        imageUrl
      } 
    };
  } catch (error: any) {
    console.error("Database Error submitting client review:", error);
    return { success: false, error: error?.message || "Failed to submit review due to database error." };
  }
}
