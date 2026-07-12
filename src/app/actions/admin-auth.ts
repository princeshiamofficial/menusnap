'use server';

import pool from '@/lib/mysql';
import { formatUtcDateTime } from '@/lib/dateUtils';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

import crypto from 'crypto';

const SESSION_COOKIE = 'admin_session';
const SESSION_EXPIRY_DAYS = 30;
const COOKIE_EXPIRY_DAYS = 30;

async function ensureSessionTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token VARCHAR(255) PRIMARY KEY,
      admin_id INT NOT NULL,
      email VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // Ensure expires_at is DATETIME and doesn't have auto-update
  try {
    await pool.execute('ALTER TABLE admin_sessions MODIFY expires_at DATETIME NOT NULL');
  } catch (e) {
    // Column might already be correct or table just created
  }
}

function generateToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export async function adminLoginAction(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureSessionTable();
    
    // Cleanup expired sessions
    await pool.execute('DELETE FROM admin_sessions WHERE expires_at < NOW() AND expires_at < UTC_TIMESTAMP()');

    const [rows]: any = await pool.execute(
      'SELECT id, email, password_hash FROM admins WHERE email = ? LIMIT 1',
      [email]
    );

    if (!rows.length) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);

    if (!valid) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 24 * SESSION_EXPIRY_DAYS * 1000);
    
    await pool.execute(
      'INSERT INTO admin_sessions (token, admin_id, email, expires_at) VALUES (?, ?, ?, ?)',
      [token, admin.id, admin.email, formatUtcDateTime(expiresAt)]
    );

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * COOKIE_EXPIRY_DAYS,
      path: '/',
    });

    return { success: true };
  } catch (e: any) {
    console.error('Admin login error:', e);
    return { success: false, error: e.message || 'Server error. Please try again.' };
  }
}

export async function adminLogoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await pool.execute('DELETE FROM admin_sessions WHERE token = ?', [token]);
    cookieStore.delete(SESSION_COOKIE);
  }
}

export async function getAdminSessionAction(): Promise<{ email: string; id: number; role?: string; permissions?: Record<string, string[]>; avatar_url?: string | null; name?: string | null } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    // Dynamically import to avoid circular dependencies
    const { ensureAdminsSchema } = await import('./admin-users');
    await ensureAdminsSchema();

    const [rows]: any = await pool.execute(
      `SELECT s.admin_id as id, s.email, a.role, a.permissions, a.avatar_url, a.name 
       FROM admin_sessions s 
       JOIN admins a ON s.admin_id = a.id 
       WHERE s.token = ? AND (s.expires_at > NOW() OR s.expires_at > UTC_TIMESTAMP()) LIMIT 1`,
      [token]
    );

    if (!rows.length) return null;

    // Slide/extend session expiration in background so active sessions never expire
    const newExpiresAt = new Date(Date.now() + 60 * 60 * 24 * SESSION_EXPIRY_DAYS * 1000);
    pool.execute(
      'UPDATE admin_sessions SET expires_at = ? WHERE token = ?',
      [formatUtcDateTime(newExpiresAt), token]
    ).catch(() => {});

    // NOTE: We intentionally do NOT include expires_at in the return object
    // to prevent causing different return values each call (which would cause re-renders)

    const admin = rows[0];
    let parsedPermissions = null;
    if (admin.permissions) {
      try {
        parsedPermissions = JSON.parse(admin.permissions);
      } catch {
        parsedPermissions = null;
      }
    }

    return {
      id: admin.id,
      email: admin.email,
      role: admin.role || 'User',
      permissions: parsedPermissions,
      avatar_url: admin.avatar_url,
      name: admin.name
    };
  } catch (e) {
    console.error('Session check error:', e);
    throw e;
  }
}

export async function updateAdminEmailAction(
  newEmail: string,
  currentPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSessionAction();
    if (!session) return { success: false, error: 'Not authenticated.' };

    const [rows]: any = await pool.execute(
      'SELECT password_hash FROM admins WHERE id = ? LIMIT 1',
      [session.id]
    );

    if (!rows.length) return { success: false, error: 'Admin not found.' };

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) return { success: false, error: 'Current password is incorrect.' };

    // Check if email already taken
    const [existing]: any = await pool.execute(
      'SELECT id FROM admins WHERE email = ? AND id != ?',
      [newEmail, session.id]
    );
    if (existing.length) return { success: false, error: 'This email is already in use.' };

    await pool.execute('UPDATE admins SET email = ? WHERE id = ?', [newEmail, session.id]);

    // Update session in DB
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) {
      await pool.execute('UPDATE admin_sessions SET email = ? WHERE token = ?', [newEmail, token]);
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Server error.' };
  }
}

export async function updateAdminPasswordAction(
  newPassword: string,
  currentPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSessionAction();
    if (!session) return { success: false, error: 'Not authenticated.' };

    const [rows]: any = await pool.execute(
      'SELECT password_hash FROM admins WHERE id = ? LIMIT 1',
      [session.id]
    );

    if (!rows.length) return { success: false, error: 'Admin not found.' };

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) return { success: false, error: 'Current password is incorrect.' };

    if (newPassword.length < 6) return { success: false, error: 'New password must be at least 6 characters.' };

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, session.id]);

    // Invalidate other session tokens for security
    const cookieStore = await cookies();
    const currentToken = cookieStore.get(SESSION_COOKIE)?.value;
    if (currentToken) {
      await pool.execute('DELETE FROM admin_sessions WHERE admin_id = ? AND token != ?', [session.id, currentToken]);
    } else {
      await pool.execute('DELETE FROM admin_sessions WHERE admin_id = ?', [session.id]);
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Server error.' };
  }
}
