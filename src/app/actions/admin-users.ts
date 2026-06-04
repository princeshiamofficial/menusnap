"use server";

import pool from '@/lib/mysql';
import bcrypt from 'bcryptjs';
import { getAdminSessionAction } from './admin-auth';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

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

    // Non-admins cannot access manage-users page
    if (pageKey === 'manage-users') return false;

    if (role === 'User') {
      // Default permissions for User: view access to most, no settings or manage-users
      const defaultUserPermissions: Record<string, string[]> = {
        'dashboard': ['view'],
        'quick-manager': ['view'],
        'contacts': ['view', 'edit'],
        'manage-orders': ['view', 'edit'],
        'responses': ['view', 'edit'],
        'consultation-events': ['view', 'edit', 'delete'],
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
 * Gets a minimal list of admin users (id, name, email, avatar_url) for display purposes.
 * Accessible to any authenticated admin user.
 */
export async function getAdminUsersMinimalAction(): Promise<{ success: boolean; data?: Pick<AdminUserRecord, 'id' | 'email' | 'name' | 'avatar_url'>[]; error?: string }> {
  try {
    const session = await getAdminSessionAction();
    if (!session) {
      return { success: false, error: 'Unauthorized. Please log in.' };
    }

    await ensureAdminsSchema();
    const [rows]: any = await pool.execute(
      `SELECT id, email, name, avatar_url FROM admins ORDER BY id ASC`
    );

    return { success: true, data: rows };
  } catch (error: any) {
    console.error('Error fetching minimal admin users:', error);
    return { success: false, error: error.message || 'Failed to fetch users.' };
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
    if (session?.id === id) {
      // Prevent self-modification of role or permissions
      const [currentUser]: any = await pool.execute('SELECT role, permissions FROM admins WHERE id = ? LIMIT 1', [id]);
      if (currentUser.length) {
        const dbRole = currentUser[0].role;
        const dbPerms = currentUser[0].permissions;

        if (role && role !== dbRole) {
          return { success: false, error: 'You cannot change your own role.' };
        }

        let dbPermsParsed = null;
        if (dbPerms) {
          try {
            dbPermsParsed = JSON.parse(dbPerms);
          } catch (e) {
            dbPermsParsed = null;
          }
        }
        const dbPermsStr = dbPermsParsed ? JSON.stringify(dbPermsParsed) : null;
        const newPermsStr = permissions ? JSON.stringify(permissions) : null;
        if (permissions !== undefined && newPermsStr !== dbPermsStr) {
          return { success: false, error: 'You cannot change your own permissions.' };
        }
      }
    }

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Invalid email address.' };
    }

    await ensureAdminsSchema();

    // Fetch current user details to check if email is changed
    const [currentRows]: any = await pool.execute('SELECT email FROM admins WHERE id = ? LIMIT 1', [id]);
    if (!currentRows.length) {
      return { success: false, error: 'User not found.' };
    }
    const currentEmail = currentRows[0].email;
    const isEmailChanged = currentEmail !== email;
    const isPasswordChanged = !!(password && password.trim().length >= 6);

    // Check if email is taken by another user
    const [existing]: any = await pool.execute('SELECT id FROM admins WHERE email = ? AND id != ? LIMIT 1', [email, id]);
    if (existing.length > 0) {
      return { success: false, error: 'Another user with this email already exists.' };
    }

    const permissionsStr = permissions ? JSON.stringify(permissions) : null;

    if (isPasswordChanged) {
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

    // Invalidate sessions ONLY if email or password was changed.
    if (isEmailChanged || isPasswordChanged) {
      if (session?.id === id) {
        const cookieStore = await cookies();
        const currentToken = cookieStore.get('admin_session')?.value;
        if (currentToken) {
          await pool.execute('DELETE FROM admin_sessions WHERE admin_id = ? AND token != ?', [id, currentToken]);
        } else {
          await pool.execute('DELETE FROM admin_sessions WHERE admin_id = ?', [id]);
        }
      } else {
        await pool.execute('DELETE FROM admin_sessions WHERE admin_id = ?', [id]);
      }
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
    // Invalidate sessions for the deleted user
    await pool.execute('DELETE FROM admin_sessions WHERE admin_id = ?', [id]);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting admin user:', error);
    return { success: false, error: error.message || 'Failed to delete user.' };
  }
}

/**
 * Reads the public/avatar directory directly and returns the list of available avatars.
 */
export async function getPredefinedAvatarsAction(): Promise<{ success: boolean; data?: { url: string; name: string }[]; error?: string }> {
  try {
    const session = await getAdminSessionAction();
    if (!session) {
      return { success: false, error: 'Unauthorized.' };
    }

    const dirPath = path.join(process.cwd(), 'public', 'avatar');
    if (!fs.existsSync(dirPath)) {
      return { success: true, data: [] };
    }

    const files = await fs.promises.readdir(dirPath);
    const avatars = files
      .filter(file => /\.(png|jpe?g|webp|gif|svg)$/i.test(file))
      .map(file => {
        const nameWithoutExt = file.replace(/\.[^/.]+$/, '');
        const formattedName = nameWithoutExt
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        return {
          url: `/avatar/${file}`,
          name: formattedName
        };
      });

    return { success: true, data: avatars };
  } catch (error: any) {
    console.error('Error reading avatar directory:', error);
    return { success: false, error: error.message || 'Failed to read avatar directory.' };
  }
}
