'use server';

import pool from '@/lib/mysql';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { getAdminSessionAction } from '@/app/actions/admin-auth';

export interface MenuSnapUser {
  id: number;
  businessName: string;
  businessType: 'restaurant' | 'parlour';
  whatsappNumber: string;
  email: string | null;
  division: string | null;
  district: string | null;
  address?: string | null;
  stage: string;
  isSubscriber: boolean;
  subscriptionPackage: string; // e.g. 'Pro Lifetime', 'Starter Lifetime', 'Enterprise', 'Free Plan'
  subscriptionPrice?: number | null;
  hasPassword: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface MenuSnapUserStats {
  totalUsers: number;
  totalSubscribers: number;
  totalFreeLeads: number;
  totalRestaurants: number;
  totalParlours: number;
  proSubscribers: number;
  starterSubscribers: number;
}

/**
 * Ensures clients table and required columns exist in MySQL.
 */
async function ensureClientsSchema() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_name VARCHAR(255) NOT NULL,
        business_type VARCHAR(50) NOT NULL,
        whatsapp_number VARCHAR(20) NOT NULL,
        division VARCHAR(100) NULL,
        district VARCHAR(100) NULL,
        address TEXT NULL,
        email VARCHAR(255) NULL,
        password_hash VARCHAR(255) NULL,
        note TEXT NULL,
        stage VARCHAR(50) DEFAULT 'new-lead',
        is_subscriber TINYINT(1) DEFAULT 0,
        subscription_package VARCHAR(100) NULL DEFAULT NULL,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_whatsapp (whatsapp_number),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure columns exist
    const [cols]: any = await pool.execute('SHOW COLUMNS FROM clients');
    const existingCols = new Set((cols as any[]).map((c: any) => c.Field.toLowerCase()));

    if (!existingCols.has('is_subscriber')) {
      await pool.execute('ALTER TABLE clients ADD COLUMN is_subscriber TINYINT(1) DEFAULT 0 AFTER stage');
    }
    if (!existingCols.has('subscription_package')) {
      await pool.execute('ALTER TABLE clients ADD COLUMN subscription_package VARCHAR(100) NULL DEFAULT NULL AFTER is_subscriber');
    }
    if (!existingCols.has('password_hash')) {
      await pool.execute('ALTER TABLE clients ADD COLUMN password_hash VARCHAR(255) NULL AFTER email');
    }
    if (!existingCols.has('division')) {
      await pool.execute('ALTER TABLE clients ADD COLUMN division VARCHAR(100) NULL AFTER business_type');
    }
    if (!existingCols.has('district')) {
      await pool.execute('ALTER TABLE clients ADD COLUMN district VARCHAR(100) NULL AFTER division');
    }
    if (!existingCols.has('address')) {
      await pool.execute('ALTER TABLE clients ADD COLUMN address TEXT NULL AFTER district');
    }
    if (!existingCols.has('email')) {
      await pool.execute('ALTER TABLE clients ADD COLUMN email VARCHAR(255) NULL AFTER district');
    }
  } catch (err) {
    console.error('[MenuSnap Users] Schema verification error:', err);
  }
}

/**
 * Fetch paginated, searchable, filtered list of MenuSnap client users and stats.
 */
export async function getMenuSnapUsersAction(params?: {
  search?: string;
  type?: 'all' | 'restaurant' | 'parlour';
  subscriberFilter?: 'all' | 'subscribers' | 'free';
  packageFilter?: string;
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  users: MenuSnapUser[];
  total: number;
  stats: MenuSnapUserStats;
  availablePackages: { id: string; name: string; price: number }[];
  error?: string;
}> {
  try {
    const session = await getAdminSessionAction();
    if (!session) {
      return {
        success: false,
        users: [],
        total: 0,
        stats: { totalUsers: 0, totalSubscribers: 0, totalFreeLeads: 0, totalRestaurants: 0, totalParlours: 0, proSubscribers: 0, starterSubscribers: 0 },
        availablePackages: [],
        error: 'Unauthorized admin access',
      };
    }

    await ensureClientsSchema();

    const search = (params?.search || '').trim();
    const typeFilter = params?.type || 'all';
    const subFilter = params?.subscriberFilter || 'all';
    const pkgFilter = params?.packageFilter || 'all';
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, Math.min(100, params?.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const queryParams: any[] = [];

    if (search) {
      conditions.push('(business_name LIKE ? OR whatsapp_number LIKE ? OR email LIKE ? OR district LIKE ? OR division LIKE ? OR address LIKE ?)');
      const term = `%${search}%`;
      queryParams.push(term, term, term, term, term, term);
    }

    if (typeFilter !== 'all') {
      conditions.push('business_type = ?');
      queryParams.push(typeFilter);
    }

    if (subFilter === 'subscribers') {
      conditions.push("(is_subscriber = 1 OR stage IN ('customer', 'subscriber', 'subscribed', 'donated'))");
    } else if (subFilter === 'free') {
      conditions.push("(is_subscriber = 0 AND (stage IS NULL OR stage NOT IN ('customer', 'subscriber', 'subscribed', 'donated')))");
    }

    if (pkgFilter !== 'all') {
      if (pkgFilter === 'free') {
        conditions.push("(subscription_package = 'Free Plan' OR (subscription_package IS NULL AND is_subscriber = 0 AND (stage IS NULL OR stage NOT IN ('customer', 'subscriber', 'subscribed', 'donated'))))");
      } else {
        conditions.push('subscription_package LIKE ?');
        queryParams.push(`%${pkgFilter}%`);
      }
    }

    const whereClause = conditions.join(' AND ');

    // 1. Get filtered total count
    const [countRows]: any = await pool.execute(
      `SELECT COUNT(*) as total FROM clients WHERE ${whereClause}`,
      queryParams
    );
    const total = Number(countRows[0]?.total) || 0;

    // 2. Get paginated users
    const [rows]: any = await pool.execute(
      `SELECT 
        id, business_name, business_type, whatsapp_number, email, division, district, address,
        stage, is_subscriber, subscription_package, password_hash,
        DATE_FORMAT(last_login, '%Y-%m-%d %H:%i:%s') as last_login,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
      FROM clients
      WHERE ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, String(limit), String(offset)]
    );

    const users: MenuSnapUser[] = (Array.isArray(rows) ? rows : []).map((row: any) => {
      const stageLower = (row.stage || '').toLowerCase().trim();
      const isSub = Boolean(
        row.is_subscriber === 1 ||
        stageLower === 'customer' ||
        stageLower === 'subscriber' ||
        stageLower === 'subscribed' ||
        stageLower === 'donated'
      );

      // Determine package name
      let pkgName = row.subscription_package;
      if (!pkgName) {
        pkgName = isSub ? 'Pro Lifetime' : 'Free Plan';
      }

      const computedAddress = row.address || [row.district, row.division].filter(Boolean).join(', ') || null;

      return {
        id: row.id,
        businessName: row.business_name,
        businessType: row.business_type === 'parlour' ? 'parlour' : 'restaurant',
        whatsappNumber: row.whatsapp_number,
        email: row.email || null,
        division: row.division || null,
        district: row.district || null,
        address: computedAddress,
        stage: row.stage || 'new-lead',
        isSubscriber: isSub,
        subscriptionPackage: pkgName,
        hasPassword: Boolean(row.password_hash),
        lastLogin: row.last_login || null,
        createdAt: row.created_at,
      };
    });

    // 3. Compute overall stats
    const [statsRows]: any = await pool.execute(`
      SELECT 
        COUNT(*) as totalUsers,
        SUM(CASE WHEN is_subscriber = 1 OR stage IN ('customer', 'subscriber', 'subscribed', 'donated') THEN 1 ELSE 0 END) as totalSubscribers,
        SUM(CASE WHEN is_subscriber = 0 AND (stage IS NULL OR stage NOT IN ('customer', 'subscriber', 'subscribed', 'donated')) THEN 1 ELSE 0 END) as totalFreeLeads,
        SUM(CASE WHEN business_type = 'restaurant' THEN 1 ELSE 0 END) as totalRestaurants,
        SUM(CASE WHEN business_type = 'parlour' THEN 1 ELSE 0 END) as totalParlours,
        SUM(CASE WHEN subscription_package LIKE '%Pro%' OR (subscription_package IS NULL AND (is_subscriber = 1 OR stage IN ('customer', 'subscriber', 'subscribed', 'donated'))) THEN 1 ELSE 0 END) as proSubscribers,
        SUM(CASE WHEN subscription_package LIKE '%Starter%' THEN 1 ELSE 0 END) as starterSubscribers
      FROM clients
    `);

    const stat = statsRows[0] || {};
    const stats: MenuSnapUserStats = {
      totalUsers: Number(stat.totalUsers) || 0,
      totalSubscribers: Number(stat.totalSubscribers) || 0,
      totalFreeLeads: Number(stat.totalFreeLeads) || 0,
      totalRestaurants: Number(stat.totalRestaurants) || 0,
      totalParlours: Number(stat.totalParlours) || 0,
      proSubscribers: Number(stat.proSubscribers) || 0,
      starterSubscribers: Number(stat.starterSubscribers) || 0,
    };

    // 4. Fetch available packages from pricing_packages table
    let availablePackages = [
      { id: 'free', name: 'Free Plan', price: 0 },
      { id: 'starter', name: 'Starter Lifetime', price: 499 },
      { id: 'pro', name: 'Pro Lifetime', price: 1499 },
      { id: 'enterprise', name: 'Enterprise Lifetime', price: 4999 },
    ];

    try {
      const [pkgRows]: any = await pool.execute(
        'SELECT package_id, name, price FROM pricing_packages WHERE is_active = 1 ORDER BY sort_order ASC'
      );
      if (Array.isArray(pkgRows) && pkgRows.length > 0) {
        availablePackages = [
          { id: 'free', name: 'Free Plan', price: 0 },
          ...pkgRows.map((r: any) => ({
            id: r.package_id,
            name: `${r.name} Lifetime`,
            price: Number(r.price) || 0,
          })),
        ];
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      users,
      total,
      stats,
      availablePackages,
    };
  } catch (error: any) {
    console.error('[MenuSnap Users] getMenuSnapUsersAction error:', error);
    return {
      success: false,
      users: [],
      total: 0,
      stats: { totalUsers: 0, totalSubscribers: 0, totalFreeLeads: 0, totalRestaurants: 0, totalParlours: 0, proSubscribers: 0, starterSubscribers: 0 },
      availablePackages: [],
      error: error.message || 'Failed to fetch MenuSnap users.',
    };
  }
}

/**
 * 1-Click Toggle for Subscriber Access on/off.
 */
export async function toggleSubscriberStatusAction(
  userId: number,
  targetStatus: boolean,
  targetPackage?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await getAdminSessionAction();
    if (!session) {
      return { success: false, error: 'Unauthorized access.' };
    }

    await ensureClientsSchema();

    const pkg = targetStatus ? (targetPackage || 'Pro Lifetime') : 'Free Plan';

    await pool.execute(
      `UPDATE clients 
       SET is_subscriber = ?, stage = ?, subscription_package = ? 
       WHERE id = ?`,
      [targetStatus ? 1 : 0, targetStatus ? 'customer' : 'new-lead', pkg, userId]
    );

    revalidatePath('/m-admin/menusnap-users');
    revalidatePath('/m-admin/contacts');

    return {
      success: true,
      message: targetStatus
        ? `VIP Subscriber Access granted (${pkg}).`
        : 'User set to Free Lead status.',
    };
  } catch (error: any) {
    console.error('[MenuSnap Users] toggleSubscriberStatusAction error:', error);
    return { success: false, error: error.message || 'Failed to update subscriber status.' };
  }
}

/**
 * 1-Click Update of Package Assignment for client.
 */
export async function updateUserPackageAction(
  userId: number,
  packageName: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await getAdminSessionAction();
    if (!session) {
      return { success: false, error: 'Unauthorized access.' };
    }

    await ensureClientsSchema();

    const isFree = packageName.toLowerCase().includes('free');
    const isSub = !isFree;

    await pool.execute(
      `UPDATE clients 
       SET subscription_package = ?, is_subscriber = ?, stage = ? 
       WHERE id = ?`,
      [packageName, isSub ? 1 : 0, isSub ? 'customer' : 'new-lead', userId]
    );

    revalidatePath('/m-admin/menusnap-users');
    revalidatePath('/m-admin/contacts');

    return {
      success: true,
      message: `Subscription package updated to "${packageName}".`,
    };
  } catch (error: any) {
    console.error('[MenuSnap Users] updateUserPackageAction error:', error);
    return { success: false, error: error.message || 'Failed to update package.' };
  }
}

/**
 * Admin Create new MenuSnap Client User.
 */
export async function adminCreateMenuSnapUserAction(payload: {
  businessName: string;
  businessType: 'restaurant' | 'parlour';
  whatsappNumber: string;
  email?: string;
  division?: string;
  district?: string;
  password?: string;
  isSubscriber?: boolean;
  subscriptionPackage?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await getAdminSessionAction();
    if (!session) {
      return { success: false, error: 'Unauthorized access.' };
    }

    await ensureClientsSchema();

    const cleanPhone = (payload.whatsappNumber || '').trim();
    if (!cleanPhone) {
      return { success: false, error: 'WhatsApp number is required.' };
    }

    // Check for duplicate phone
    const [existing]: any = await pool.execute(
      'SELECT id FROM clients WHERE whatsapp_number = ? LIMIT 1',
      [cleanPhone]
    );
    if (existing && existing.length > 0) {
      return { success: false, error: 'A user with this WhatsApp number already exists.' };
    }

    let passwordHash: string | null = null;
    if (payload.password && payload.password.trim()) {
      if (payload.password.trim().length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }
      passwordHash = await bcrypt.hash(payload.password.trim(), 10);
    }

    const isSub = Boolean(payload.isSubscriber);
    let pkg = payload.subscriptionPackage;
    if (!pkg) {
      pkg = isSub ? 'Pro Lifetime' : 'Free Plan';
    }

    const cleanDivision = payload.division?.trim() || null;
    const cleanDistrict = payload.district?.trim() || null;
    const computedAddress = [cleanDistrict, cleanDivision].filter(Boolean).join(', ') || null;

    await pool.execute(
      `INSERT INTO clients (
        business_name, business_type, whatsapp_number, email, division, district, address,
        password_hash, is_subscriber, subscription_package, stage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.businessName.trim(),
        payload.businessType,
        cleanPhone,
        payload.email?.trim() || null,
        cleanDivision,
        cleanDistrict,
        computedAddress,
        passwordHash,
        isSub ? 1 : 0,
        pkg,
        isSub ? 'customer' : 'new-lead',
      ]
    );

    revalidatePath('/m-admin/menusnap-users');
    revalidatePath('/m-admin/contacts');

    return { success: true, message: 'MenuSnap user created successfully.' };
  } catch (error: any) {
    console.error('[MenuSnap Users] adminCreateMenuSnapUserAction error:', error);
    return { success: false, error: error.message || 'Failed to create user.' };
  }
}

/**
 * Admin Update MenuSnap Client User details.
 */
export async function adminUpdateMenuSnapUserAction(
  userId: number,
  payload: {
    businessName: string;
    businessType: 'restaurant' | 'parlour';
    whatsappNumber: string;
    email?: string;
    division?: string;
    district?: string;
    password?: string;
    isSubscriber?: boolean;
    subscriptionPackage?: string;
  }
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await getAdminSessionAction();
    if (!session) {
      return { success: false, error: 'Unauthorized access.' };
    }

    await ensureClientsSchema();

    const cleanPhone = (payload.whatsappNumber || '').trim();
    if (!cleanPhone) {
      return { success: false, error: 'WhatsApp number is required.' };
    }

    // Check duplicate phone for other users
    const [dup]: any = await pool.execute(
      'SELECT id FROM clients WHERE whatsapp_number = ? AND id != ? LIMIT 1',
      [cleanPhone, userId]
    );
    if (dup && dup.length > 0) {
      return { success: false, error: 'Another user already uses this WhatsApp number.' };
    }

    const isSub = Boolean(payload.isSubscriber);
    let pkg = payload.subscriptionPackage;
    if (!pkg) {
      pkg = isSub ? 'Pro Lifetime' : 'Free Plan';
    }

    const cleanDivision = payload.division?.trim() || null;
    const cleanDistrict = payload.district?.trim() || null;
    const computedAddress = [cleanDistrict, cleanDivision].filter(Boolean).join(', ') || null;

    if (payload.password && payload.password.trim()) {
      if (payload.password.trim().length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }
      const newHash = await bcrypt.hash(payload.password.trim(), 10);
      await pool.execute(
        `UPDATE clients SET 
          business_name = ?, business_type = ?, whatsapp_number = ?, email = ?,
          division = ?, district = ?, address = ?, password_hash = ?, is_subscriber = ?, subscription_package = ?, stage = ?
        WHERE id = ?`,
        [
          payload.businessName.trim(),
          payload.businessType,
          cleanPhone,
          payload.email?.trim() || null,
          cleanDivision,
          cleanDistrict,
          computedAddress,
          newHash,
          isSub ? 1 : 0,
          pkg,
          isSub ? 'customer' : 'new-lead',
          userId,
        ]
      );
    } else {
      await pool.execute(
        `UPDATE clients SET 
          business_name = ?, business_type = ?, whatsapp_number = ?, email = ?,
          division = ?, district = ?, address = ?, is_subscriber = ?, subscription_package = ?, stage = ?
        WHERE id = ?`,
        [
          payload.businessName.trim(),
          payload.businessType,
          cleanPhone,
          payload.email?.trim() || null,
          cleanDivision,
          cleanDistrict,
          computedAddress,
          isSub ? 1 : 0,
          pkg,
          isSub ? 'customer' : 'new-lead',
          userId,
        ]
      );
    }

    revalidatePath('/m-admin/menusnap-users');
    revalidatePath('/m-admin/contacts');

    return { success: true, message: 'User updated successfully.' };
  } catch (error: any) {
    console.error('[MenuSnap Users] adminUpdateMenuSnapUserAction error:', error);
    return { success: false, error: error.message || 'Failed to update user.' };
  }
}

/**
 * Admin Delete MenuSnap Client User.
 */
export async function adminDeleteMenuSnapUserAction(
  userId: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await getAdminSessionAction();
    if (!session) {
      return { success: false, error: 'Unauthorized access.' };
    }

    await pool.execute('DELETE FROM clients WHERE id = ?', [userId]);

    revalidatePath('/m-admin/menusnap-users');
    revalidatePath('/m-admin/contacts');

    return { success: true, message: 'User deleted successfully.' };
  } catch (error: any) {
    console.error('[MenuSnap Users] adminDeleteMenuSnapUserAction error:', error);
    return { success: false, error: error.message || 'Failed to delete user.' };
  }
}

/**
 * Admin Reset / Set Password for MenuSnap Client User.
 */
export async function adminResetClientPasswordAction(
  userId: number,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await getAdminSessionAction();
    if (!session) {
      return { success: false, error: 'Unauthorized access.' };
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const newHash = await bcrypt.hash(newPassword.trim(), 10);
    await pool.execute('UPDATE clients SET password_hash = ? WHERE id = ?', [newHash, userId]);

    revalidatePath('/m-admin/menusnap-users');

    return { success: true, message: 'Password updated successfully.' };
  } catch (error: any) {
    console.error('[MenuSnap Users] adminResetClientPasswordAction error:', error);
    return { success: false, error: error.message || 'Failed to reset password.' };
  }
}
