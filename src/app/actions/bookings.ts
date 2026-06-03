"use server";

import pool from '@/lib/mysql';
import { headers } from 'next/headers';
import { checkAdminPermission } from './admin-users';

/**
 * Gets the client IP address from request headers.
 */
export async function getClientIP() {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : headerList.get('x-real-ip') || '127.0.0.1';
    return { success: true, ip };
  } catch (error) {
    console.error("Failed to retrieve client IP:", error);
    return { success: true, ip: '127.0.0.1' };
  }
}


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
    const hasAccess = await checkAdminPermission('consultation-events', 'view');
    if (!hasAccess) {
      return { success: false, error: "Unauthorized. You do not have permission to view bookings." };
    }

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
    const hasAccess = await checkAdminPermission('consultation-events', 'edit');
    if (!hasAccess) {
      return { success: false, error: "Unauthorized. You do not have permission to update bookings." };
    }

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
    const hasAccess = await checkAdminPermission('consultation-events', 'delete');
    if (!hasAccess) {
      return { success: false, error: "Unauthorized. You do not have permission to delete bookings." };
    }

    await pool.execute(`DELETE FROM bookings WHERE id = ?`, [id]);
    return { success: true };
  } catch (error: any) {
    console.error("Database Error deleting booking:", error);
    return { success: false, error: error?.message || "Failed to delete booking." };
  }
}

/**
 * Normalizes a time slot input to 'HH:MM AM/PM' format with leading zero.
 */
function normalizeTimeSlot(input: string): string | null {
  const clean = input.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  const hour = parseInt(match[1]);
  const minute = parseInt(match[2]);
  const ampm = match[3].toUpperCase();

  if (hour < 1 || hour > 12) return null;
  if (minute < 0 || minute > 59) return null;

  const paddedHour = hour.toString().padStart(2, "0");
  const paddedMinute = minute.toString().padStart(2, "0");
  return `${paddedHour}:${paddedMinute} ${ampm}`;
}

/**
 * Converts a normalized time slot to minutes since midnight for sorting.
 */
function slotToMinutes(slot: string): number {
  const match = slot.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hour = parseInt(match[1]);
  const minute = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return hour * 60 + minute;
}

/**
 * Ensures the booking slots table exists and is populated with default values if empty.
 */
async function ensureBookingSlotsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS booking_slots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        time_slot VARCHAR(50) NOT NULL UNIQUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Check if table is empty, if so, seed it with default slots
    const [rows]: any = await pool.execute('SELECT COUNT(*) as count FROM booking_slots');
    if (rows[0].count === 0) {
      const DEFAULT_SLOTS = [
        "09:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "02:00 PM",
        "02:30 PM",
        "03:00 PM",
        "03:30 PM",
        "04:00 PM",
      ];
      for (const slot of DEFAULT_SLOTS) {
        await pool.execute('INSERT IGNORE INTO booking_slots (time_slot) VALUES (?)', [slot]);
      }
    }
  } catch (err) {
    console.error("Failed to initialize booking slots table:", err);
    throw err;
  }
}

/**
 * Fetches all booking slots, sorted chronologically.
 */
export async function getBookingSlotsAction() {
  try {
    await ensureBookingSlotsTable();
    const [rows]: any = await pool.execute('SELECT * FROM booking_slots');
    
    // Sort chronologically
    const sorted = (rows as any[]).sort((a, b) => {
      return slotToMinutes(a.time_slot) - slotToMinutes(b.time_slot);
    });

    return { success: true, data: sorted };
  } catch (error: any) {
    console.error("Error fetching booking slots:", error);
    return { success: false, error: error?.message || "Failed to fetch slots." };
  }
}

/**
 * Adds a new custom time slot.
 */
export async function addBookingSlotAction(timeSlot: string) {
  try {
    const hasAccess = await checkAdminPermission('settings', 'edit');
    if (!hasAccess) {
      return { success: false, error: "Unauthorized. You do not have permission to edit settings." };
    }

    const normalized = normalizeTimeSlot(timeSlot);
    if (!normalized) {
      return { success: false, error: "Invalid slot format. Use e.g. 09:30 AM" };
    }

    await ensureBookingSlotsTable();

    // Check if slot already exists
    const [existing]: any = await pool.execute('SELECT id FROM booking_slots WHERE time_slot = ? LIMIT 1', [normalized]);
    if (existing.length > 0) {
      return { success: false, error: "This time slot already exists." };
    }

    await pool.execute('INSERT INTO booking_slots (time_slot) VALUES (?)', [normalized]);
    return { success: true };
  } catch (error: any) {
    console.error("Error adding booking slot:", error);
    return { success: false, error: error?.message || "Failed to add slot." };
  }
}

/**
 * Deletes a time slot.
 */
export async function deleteBookingSlotAction(id: number) {
  try {
    const hasAccess = await checkAdminPermission('settings', 'edit');
    if (!hasAccess) {
      return { success: false, error: "Unauthorized. You do not have permission to edit settings." };
    }

    await ensureBookingSlotsTable();

    await pool.execute('DELETE FROM booking_slots WHERE id = ?', [id]);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting booking slot:", error);
    return { success: false, error: error?.message || "Failed to delete slot." };
  }
}

/**
 * Clears all time slots.
 */
export async function clearAllBookingSlotsAction() {
  try {
    const hasAccess = await checkAdminPermission('settings', 'edit');
    if (!hasAccess) {
      return { success: false, error: "Unauthorized. You do not have permission to edit settings." };
    }

    await ensureBookingSlotsTable();
    await pool.execute('DELETE FROM booking_slots');
    return { success: true };
  } catch (error: any) {
    console.error("Error clearing booking slots:", error);
    return { success: false, error: error?.message || "Failed to clear slots." };
  }
}

/**
 * Generates a range of booking slots chronologically.
 */
export async function generateBookingSlotsAction(
  startTimeStr: string,
  endTimeStr: string,
  intervalMinutes: number
) {
  try {
    const hasAccess = await checkAdminPermission('settings', 'edit');
    if (!hasAccess) {
      return { success: false, error: "Unauthorized. You do not have permission to edit settings." };
    }

    if (intervalMinutes < 5 || intervalMinutes > 720) {
      return { success: false, error: "Interval must be between 5 and 720 minutes." };
    }

    const startNormalized = normalizeTimeSlot(startTimeStr);
    const endNormalized = normalizeTimeSlot(endTimeStr);

    if (!startNormalized || !endNormalized) {
      return { success: false, error: "Invalid start or end time format. Use e.g. 09:00 AM" };
    }

    const startMin = slotToMinutes(startNormalized);
    const endMin = slotToMinutes(endNormalized);

    if (startMin >= endMin) {
      return { success: false, error: "Start time must be before end time." };
    }

    await ensureBookingSlotsTable();

    const generatedSlots: string[] = [];
    for (let current = startMin; current <= endMin; current += intervalMinutes) {
      let hour = Math.floor(current / 60);
      const minute = current % 60;
      let ampm = "AM";
      if (hour >= 12) {
        ampm = "PM";
        if (hour > 12) hour -= 12;
      }
      if (hour === 0) hour = 12;

      const hourStr = hour.toString().padStart(2, "0");
      const minStr = minute.toString().padStart(2, "0");
      generatedSlots.push(`${hourStr}:${minStr} ${ampm}`);
    }

    for (const slot of generatedSlots) {
      await pool.execute('INSERT IGNORE INTO booking_slots (time_slot) VALUES (?)', [slot]);
    }

    return { success: true, count: generatedSlots.length };
  } catch (error: any) {
    console.error("Error generating booking slots:", error);
    return { success: false, error: error?.message || "Failed to generate slots." };
  }
}

