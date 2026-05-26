"use server";

import pool from '@/lib/mysql';

/**
 * Ensures the bookings table exists in the database.
 */
async function ensureBookingsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        whatsapp VARCHAR(50) NOT NULL,
        booking_date VARCHAR(50) NOT NULL,
        booking_time VARCHAR(50) NOT NULL,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error("Failed to initialize bookings table:", err);
    throw err;
  }
}

/**
 * Creates a new booking slot record in the database.
 */
export async function createBooking(
  name: string,
  email: string,
  whatsapp: string,
  date: string,
  time: string,
  notes?: string
) {
  try {
    await ensureBookingsTable();

    if (!name || !name.trim()) return { success: false, error: "Name is required." };
    if (!email || !email.trim()) return { success: false, error: "Email is required." };
    if (!whatsapp || !whatsapp.trim()) return { success: false, error: "WhatsApp number is required." };
    if (!date) return { success: false, error: "Booking date is required." };
    if (!time) return { success: false, error: "Booking time is required." };

    const [result]: any = await pool.execute(
      `INSERT INTO bookings (name, email, whatsapp, booking_date, booking_time, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), email.trim(), whatsapp.trim(), date, time, notes || null]
    );

    return {
      success: true,
      data: {
        id: Number(result.insertId),
        name,
        email,
        whatsapp,
        date,
        time,
        notes
      }
    };
  } catch (error: any) {
    console.error("Database Error creating booking:", error);
    return { success: false, error: error?.message || "Failed to submit booking due to database error." };
  }
}

/**
 * Fetches all bookings from the database, ordered by most recent first.
 * @returns Standard response with array of bookings.
 */
export async function getBookings() {
  try {
    await ensureBookingsTable();

    const [rows]: any = await pool.execute(
      `SELECT * FROM bookings ORDER BY created_at DESC`
    );

    return { success: true, data: rows as any[] };
  } catch (error: any) {
    console.error("Database Error fetching bookings:", error);
    return { success: false, error: error?.message || "Failed to fetch bookings." };
  }
}

/**
 * Updates the status of a booking.
 * @param id Booking ID.
 * @param status New status value.
 */
export async function updateBookingStatus(id: number, status: string) {
  try {
    await pool.execute(
      `UPDATE bookings SET status = ? WHERE id = ?`,
      [status, id]
    );
    return { success: true };
  } catch (error: any) {
    console.error("Database Error updating booking status:", error);
    return { success: false, error: error?.message || "Failed to update status." };
  }
}

/**
 * Deletes a booking record permanently.
 * @param id Booking ID to delete.
 */
export async function deleteBooking(id: number) {
  try {
    await pool.execute(`DELETE FROM bookings WHERE id = ?`, [id]);
    return { success: true };
  } catch (error: any) {
    console.error("Database Error deleting booking:", error);
    return { success: false, error: error?.message || "Failed to delete booking." };
  }
}

