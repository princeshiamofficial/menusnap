"use server";

import pool from '@/lib/mysql';
import bcrypt from 'bcryptjs';
import { getAdminSessionAction } from './admin-auth';

/**
 * Interface representing a user record in the admins table.
 */
export interface AdminUserRecord {
  id: number;
  email: string;
  name?: string | null;
  role: 'Admin' | 'User' | 'Custom';
  permissions: Record<string, string[]> | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Ensures the admins table has the role and permissions columns.
 * Also sets default values for existing users.
 */
export async function ensureAdminsSchema() {
  try {
    // 1. Create table if it doesn't exist (failsafe, though it should exist)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Check if 'role' column exists
    const [roleColumns]: any = await pool.execute("SHOW COLUMNS FROM admins LIKE 'role'");
    if (roleColumns.length === 0) {
      console.log("Adding 'role' column to admins table...");
      await pool.execute("ALTER TABLE admins ADD COLUMN role VARCHAR(50) DEFAULT 'User'");
      // Set existing users (especially the default admin) to Admin
      await pool.execute("UPDATE admins SET role = 'Admin' WHERE email = 'admin@colorhut.com'");
    }

    // 3. Check if 'permissions' column exists
    const [permColumns]: any = await pool.execute("SHOW COLUMNS FROM admins LIKE 'permissions'");
    if (permColumns.length === 0) {
      console.log("Adding 'permissions' column to admins table...");
      await pool.execute("ALTER TABLE admins ADD COLUMN permissions TEXT DEFAULT NULL");
    }

    // Check if 'avatar_url' column exists
    const [avatarColumns]: any = await pool.execute("SHOW COLUMNS FROM admins LIKE 'avatar_url'");
    if (avatarColumns.length === 0) {
      console.log("Adding 'avatar_url' column to admins table...");
      await pool.execute("ALTER TABLE admins ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL");
    }

    // Check if 'name' column exists
    const [nameColumns]: any = await pool.execute("SHOW COLUMNS FROM admins LIKE 'name'");
    if (nameColumns.length === 0) {
      console.log("Adding 'name' column to admins table...");
      await pool.execute("ALTER TABLE admins ADD COLUMN name VARCHAR(255) DEFAULT NULL");
    }

    // 4. Ensure default admin is always Admin
    await pool.execute("UPDATE admins SET role = 'Admin' WHERE email = 'admin@colorhut.com'");
  } catch (err) {
    console.error("Error migrating admins table:", err);
    throw err;
  }
}

/**
 * Checks if the currently logged in admin has a given permission.
 */
export async function checkAdminPermission(pageKey: string, action: string): Promise<boolean> {
  const session = await getAdminSessionAction();
  if (!session) return false;

  try {
    await ensureAdminsSchema();
    const [rows]: any = await pool.execute(
      'SELECT role, permissions FROM admins WHERE id = ? LIMIT 1',
      [session.id]
    );

    if (!rows.length) return false;
    const { role, permissions: permissionsStr } = rows[0];

    if (role === 'Admin') return true;

    if (role === 'User') {
      // Default permissions for User: view access to most, no settings or manage-users
      const defaultUserPermissions: Record<string, string[]> = {
        'dashboard': ['view'],
        'quick-manager': ['view'],
        'contacts': ['view', 'edit'],
        'manage-orders': ['view', 'edit'],
        'responses': ['view', 'edit'],
        'manage-categories': ['view', 'edit'],
        'manage-magictab': ['view', 'edit'],
        'manage-templates': ['view', 'edit'],
        'magic-docs': ['view', 'edit'],
        'settings': [],
        'manage-users': [],
      };
      return defaultUserPermissions[pageKey]?.includes(action) || false;
    }

    if (role === 'Custom' && permissionsStr) {
      const permissions = JSON.parse(permissionsStr);
      return permissions[pageKey]?.includes(action) || false;
    }

    return false;
  } catch (e) {
    console.error('Error checking permission:', e);
    return false;
  }
}

/**
 * Gets all admin users.
 */
export async function getAdminUsersAction(): Promise<{ success: boolean; data?: AdminUserRecord[]; error?: string }> {
  try {
    const hasAccess = await checkAdminPermission('manage-users', 'view');
    if (!hasAccess) {
      return { success: false, error: 'Unauthorized. You do not have permission to view users.' };
    }

    await ensureAdminsSchema();
    const [rows]: any = await pool.execute(
      `SELECT id, email, name, role, permissions, avatar_url,
       DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
       DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
       FROM admins ORDER BY id ASC`
    );

    const users = rows.map((row: any) => {
      let permissions = null;
      if (row.permissions) {
        try {
          permissions = JSON.parse(row.permissions);
        } catch {
          permissions = null;
        }
      }
      return {
        ...row,
        permissions
      };
    });

    return { success: true, data: users };
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return { success: false, error: error.message || 'Failed to fetch users.' };
  }
}

/**
 * Creates a new admin user.
 */
export async function createAdminUserAction(
  email: string,
  password: string,
  role: 'Admin' | 'User' | 'Custom',
  permissions: Record<string, string[]> | null,
  avatarUrl: string | null = null,
  name: string | null = null
): Promise<{ success: boolean; error?: string }> {
  try {
    const hasAccess = await checkAdminPermission('manage-users', 'create');
    if (!hasAccess) {
      return { success: false, error: 'Unauthorized. You do not have permission to create users.' };
    }

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Invalid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    await ensureAdminsSchema();

    // Check if email already exists
    const [existing]: any = await pool.execute('SELECT id FROM admins WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      return { success: false, error: 'User with this email already exists.' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const permissionsStr = permissions ? JSON.stringify(permissions) : null;

    await pool.execute(
      'INSERT INTO admins (email, password_hash, role, permissions, avatar_url, name) VALUES (?, ?, ?, ?, ?, ?)',
      [email, passwordHash, role, permissionsStr, avatarUrl, name]
    );

    return { success: true };
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return { success: false, error: error.message || 'Failed to create user.' };
  }
}

/**
 * Updates an admin user.
 */
export async function updateAdminUserAction(
  id: number,
  email: string,
  password?: string,
  role?: 'Admin' | 'User' | 'Custom',
  permissions?: Record<string, string[]> | null,
  avatarUrl?: string | null,
  name?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const hasAccess = await checkAdminPermission('manage-users', 'edit');
    if (!hasAccess) {
      return { success: false, error: 'Unauthorized. You do not have permission to edit users.' };
    }

    const session = await getAdminSessionAction();
    if (session?.id === id && role && role !== 'Admin') {
      // Prevent self-demotion from Admin
      const [currentUser]: any = await pool.execute('SELECT role FROM admins WHERE id = ? LIMIT 1', [id]);
      if (currentUser.length && currentUser[0].role === 'Admin') {
        return { success: false, error: 'You cannot change your own role from Admin to prevent lockout.' };
      }
    }

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Invalid email address.' };
    }

    await ensureAdminsSchema();

    // Check if email is taken by another user
    const [existing]: any = await pool.execute('SELECT id FROM admins WHERE email = ? AND id != ? LIMIT 1', [email, id]);
    if (existing.length > 0) {
      return { success: false, error: 'Another user with this email already exists.' };
    }

    const permissionsStr = permissions ? JSON.stringify(permissions) : null;

    if (password && password.trim().length >= 6) {
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.execute(
        'UPDATE admins SET email = ?, password_hash = ?, role = ?, permissions = ?, avatar_url = ?, name = ? WHERE id = ?',
        [email, passwordHash, role ?? null, permissionsStr, avatarUrl ?? null, name ?? null, id]
      );
    } else {
      await pool.execute(
        'UPDATE admins SET email = ?, role = ?, permissions = ?, avatar_url = ?, name = ? WHERE id = ?',
        [email, role ?? null, permissionsStr, avatarUrl ?? null, name ?? null, id]
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error updating admin user:', error);
    return { success: false, error: error.message || 'Failed to update user.' };
  }
}

/**
 * Deletes an admin user.
 */
export async function deleteAdminUserAction(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const hasAccess = await checkAdminPermission('manage-users', 'delete');
    if (!hasAccess) {
      return { success: false, error: 'Unauthorized. You do not have permission to delete users.' };
    }

    const session = await getAdminSessionAction();
    if (session && session.id === id) {
      return { success: false, error: 'You cannot delete your own account.' };
    }

    await pool.execute('DELETE FROM admins WHERE id = ?', [id]);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting admin user:', error);
    return { success: false, error: error.message || 'Failed to delete user.' };
  }
}
