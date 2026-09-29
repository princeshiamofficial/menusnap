'use server';

import pool from '@/lib/mysql';
import { PricingPackage } from '@/lib/menusnap-types';

/**
 * Default lifetime packages seeded if the table is freshly created or empty.
 */
const DEFAULT_PACKAGES: Omit<PricingPackage, 'id'>[] = [
  {
    package_id: 'starter',
    name: 'Starter',
    tagline: 'For solo entrepreneurs exploring initial restaurant ideas.',
    badge_text: 'Lifetime Access',
    price: 499,
    original_price: 999,
    billing_period_text: 'Lifetime Access • Pay once, use forever',
    discount_tag: '',
    coupon_code: '',
    coupon_discount: 0,
    features: [
      '3,000+ Menu Database Access',
      'Restaurant & Cuisine Browse',
      'Food Item Search',
      'Category-wise Exploration',
      'Standard Price Reference',
      'Basic Menu Builder (1 Project)',
      'Cloud Menu Save',
      'Lifetime Blueprints & Future Updates',
    ],
    feature_highlight_title: 'Features Included:',
    button_text: 'Get Lifetime Starter',
    is_popular: false,
    is_active: true,
    sort_order: 1,
    is_category_unlimited: false,
    category_limit: 5,
    is_item_unlimited: false,
    item_limit: 30,
  },
  {
    package_id: 'pro',
    name: 'Pro',
    tagline: 'Complete menu research, market pricing & unlimited menu exports.',
    badge_text: 'Most Popular • Lifetime Deal',
    price: 1499,
    original_price: 2999,
    billing_period_text: 'Lifetime Access • One-time payment',
    discount_tag: 'LIFETIME DEAL: MENUSNAP500',
    coupon_code: 'MENUSNAP500',
    coupon_discount: 500,
    features: [
      'Everything in Starter',
      'Advanced Item & Competitor Research',
      'Market Price Spread Comparison',
      'Unlimited Menu Building Projects',
      'Item Shortlist & Favorites',
      'Custom Category Organization',
      'Custom Pricing & Portion Weights',
      'Rich Description Editing',
      'Print-Ready PDF & Clean Excel Export',
      'Lifetime Priority Updates',
    ],
    feature_highlight_title: 'Everything in Starter, Plus:',
    button_text: 'Get Lifetime Pro',
    is_popular: true,
    is_active: true,
    sort_order: 2,
    is_category_unlimited: true,
    category_limit: 0,
    is_item_unlimited: true,
    item_limit: 0,
  },
  {
    package_id: 'agency',
    name: 'Agency',
    tagline: 'For consultants and agencies managing multiple restaurant brands.',
    badge_text: 'Full Team • Lifetime',
    price: 4999,
    original_price: 9999,
    billing_period_text: 'Lifetime Team Access • One-time payment',
    discount_tag: '',
    coupon_code: '',
    coupon_discount: 0,
    features: [
      'Everything in Pro',
      'Multiple Restaurant Blueprints',
      'Client-wise Menu Workspaces',
      'Agency Multi-user Access',
      'Higher Export & Query Limits',
      'Direct Onboarding & Priority Support',
      'Lifetime Agency License',
    ],
    feature_highlight_title: 'Everything in Pro, Plus:',
    button_text: 'Get Lifetime Agency',
    is_popular: false,
    is_active: true,
    sort_order: 3,
    is_category_unlimited: true,
    category_limit: 0,
    is_item_unlimited: true,
    item_limit: 0,
  },
];

/**
 * Ensures the pricing_packages table exists in MySQL and handles schema migration to lifetime pricing.
 */
export async function ensurePricingPackagesTable(): Promise<void> {
  try {
    await (pool as any).execute(`
      CREATE TABLE IF NOT EXISTS pricing_packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        package_id VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        tagline VARCHAR(255) DEFAULT '',
        badge_text VARCHAR(100) DEFAULT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        original_price DECIMAL(10,2) DEFAULT NULL,
        billing_period_text VARCHAR(100) DEFAULT 'Lifetime Access • One-time payment',
        discount_tag VARCHAR(100) DEFAULT NULL,
        coupon_code VARCHAR(100) DEFAULT NULL,
        coupon_discount DECIMAL(10,2) DEFAULT 0.00,
        features LONGTEXT NOT NULL,
        feature_highlight_title VARCHAR(255) DEFAULT '',
        button_text VARCHAR(100) NOT NULL DEFAULT 'Choose Plan',
        is_popular TINYINT(1) NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0,
        is_category_unlimited TINYINT(1) NOT NULL DEFAULT 1,
        category_limit INT NOT NULL DEFAULT 0,
        is_item_unlimited TINYINT(1) NOT NULL DEFAULT 1,
        item_limit INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_active_sort (is_active, sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Migration Check: Check if `price` column exists
    const [priceCols]: any = await (pool as any).execute("SHOW COLUMNS FROM pricing_packages LIKE 'price'");
    if (!priceCols || priceCols.length === 0) {
      // Add price and original_price columns
      try {
        await (pool as any).execute("ALTER TABLE pricing_packages ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER badge_text");
        await (pool as any).execute("ALTER TABLE pricing_packages ADD COLUMN original_price DECIMAL(10,2) DEFAULT NULL AFTER price");
        await (pool as any).execute("ALTER TABLE pricing_packages ADD COLUMN billing_period_text VARCHAR(100) DEFAULT 'Lifetime Access • One-time payment' AFTER original_price");
        
        // Migrate data from price_3_months if present
        const [oldCols]: any = await (pool as any).execute("SHOW COLUMNS FROM pricing_packages LIKE 'price_3_months'");
        if (oldCols && oldCols.length > 0) {
          await (pool as any).execute("UPDATE pricing_packages SET price = price_3_months WHERE price = 0");
        }
      } catch (e) {
        console.error('Migration error adding price column:', e);
      }
    }

    // Migration Check: Check if limit columns exist
    const [limitCols]: any = await (pool as any).execute("SHOW COLUMNS FROM pricing_packages LIKE 'is_category_unlimited'");
    if (!limitCols || limitCols.length === 0) {
      try {
        await (pool as any).execute("ALTER TABLE pricing_packages ADD COLUMN is_category_unlimited TINYINT(1) NOT NULL DEFAULT 1 AFTER sort_order");
        await (pool as any).execute("ALTER TABLE pricing_packages ADD COLUMN category_limit INT NOT NULL DEFAULT 0 AFTER is_category_unlimited");
        await (pool as any).execute("ALTER TABLE pricing_packages ADD COLUMN is_item_unlimited TINYINT(1) NOT NULL DEFAULT 1 AFTER category_limit");
        await (pool as any).execute("ALTER TABLE pricing_packages ADD COLUMN item_limit INT NOT NULL DEFAULT 0 AFTER is_item_unlimited");
      } catch (e) {
        console.error('Migration error adding limit columns:', e);
      }
    }

    // Check if table is empty and seed
    const [countRows]: any = await (pool as any).execute('SELECT COUNT(*) as count FROM pricing_packages');
    if (countRows[0]?.count === 0) {
      for (const pkg of DEFAULT_PACKAGES) {
        await (pool as any).execute(
          `INSERT INTO pricing_packages (
            package_id, name, tagline, badge_text, price, original_price, billing_period_text,
            discount_tag, coupon_code, coupon_discount,
            features, feature_highlight_title, button_text, is_popular, is_active, sort_order,
            is_category_unlimited, category_limit, is_item_unlimited, item_limit
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            pkg.package_id,
            pkg.name,
            pkg.tagline || '',
            pkg.badge_text || null,
            pkg.price,
            pkg.original_price || null,
            pkg.billing_period_text || 'Lifetime Access • One-time payment',
            pkg.discount_tag || null,
            pkg.coupon_code || null,
            pkg.coupon_discount || 0,
            JSON.stringify(pkg.features || []),
            pkg.feature_highlight_title || '',
            pkg.button_text || 'Choose Plan',
            pkg.is_popular ? 1 : 0,
            pkg.is_active ? 1 : 0,
            pkg.sort_order || 0,
            pkg.is_category_unlimited ? 1 : 0,
            pkg.category_limit || 0,
            pkg.is_item_unlimited ? 1 : 0,
            pkg.item_limit || 0,
          ]
        );
      }
    }
  } catch (error) {
    console.error('Error ensuring pricing_packages table:', error);
    throw error;
  }
}

/**
 * Normalizes raw MySQL row into PricingPackage object.
 */
function normalizePackageRow(row: any): PricingPackage {
  let features: string[] = [];
  try {
    if (typeof row.features === 'string') {
      features = JSON.parse(row.features);
    } else if (Array.isArray(row.features)) {
      features = row.features;
    }
  } catch (e) {
    features = [];
  }

  const rawPrice = row.price !== undefined && row.price !== null ? Number(row.price) : Number(row.price_3_months || row.price_1_month || 0);
  const rawOriginal = row.original_price !== undefined && row.original_price !== null ? Number(row.original_price) : (row.original_price_3_months ? Number(row.original_price_3_months) : null);

  return {
    id: Number(row.id),
    package_id: row.package_id,
    name: row.name,
    tagline: row.tagline || '',
    badge_text: row.badge_text || '',
    price: rawPrice,
    original_price: rawOriginal,
    billing_period_text: row.billing_period_text || 'Lifetime Access • One-time payment',
    discount_tag: row.discount_tag || '',
    coupon_code: row.coupon_code || '',
    coupon_discount: Number(row.coupon_discount) || 0,
    features,
    feature_highlight_title: row.feature_highlight_title || '',
    button_text: row.button_text || 'Choose Plan',
    is_popular: Boolean(row.is_popular),
    is_active: Boolean(row.is_active),
    sort_order: Number(row.sort_order) || 0,
    is_category_unlimited: row.is_category_unlimited !== undefined && row.is_category_unlimited !== null ? Boolean(row.is_category_unlimited) : true,
    category_limit: Number(row.category_limit) || 0,
    is_item_unlimited: row.is_item_unlimited !== undefined && row.is_item_unlimited !== null ? Boolean(row.is_item_unlimited) : true,
    item_limit: Number(row.item_limit) || 0,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

/**
 * Retrieves all pricing packages for admin management (both active and inactive).
 */
export async function getPricingPackagesAction(options?: { includeInactive?: boolean }): Promise<{
  success: boolean;
  data?: PricingPackage[];
  error?: string;
}> {
  try {
    await ensurePricingPackagesTable();
    const includeInactive = options?.includeInactive ?? true;

    let query = 'SELECT * FROM pricing_packages';
    if (!includeInactive) {
      query += ' WHERE is_active = 1';
    }
    query += ' ORDER BY sort_order ASC, id ASC';

    const [rows]: any = await (pool as any).execute(query);
    const packages: PricingPackage[] = (rows || []).map(normalizePackageRow);

    return { success: true, data: packages };
  } catch (error: any) {
    console.error('getPricingPackagesAction error:', error);
    return { success: false, error: error.message || 'Failed to fetch packages' };
  }
}

/**
 * Public action to retrieve only active lifetime pricing packages for the landing page.
 */
export async function getPublicPricingPackagesAction(): Promise<{
  success: boolean;
  data?: PricingPackage[];
  error?: string;
}> {
  return getPricingPackagesAction({ includeInactive: false });
}

/**
 * Retrieves a single package by its numeric ID.
 */
export async function getPricingPackageByIdAction(id: number): Promise<{
  success: boolean;
  data?: PricingPackage;
  error?: string;
}> {
  try {
    await ensurePricingPackagesTable();
    const [rows]: any = await (pool as any).execute('SELECT * FROM pricing_packages WHERE id = ? LIMIT 1', [id]);
    if (!rows || rows.length === 0) {
      return { success: false, error: 'Package not found' };
    }
    return { success: true, data: normalizePackageRow(rows[0]) };
  } catch (error: any) {
    console.error('getPricingPackageByIdAction error:', error);
    return { success: false, error: error.message || 'Failed to fetch package' };
  }
}

/**
 * Creates a new lifetime pricing package.
 */
export async function createPricingPackageAction(payload: {
  package_id: string;
  name: string;
  tagline?: string;
  badge_text?: string;
  price: number;
  original_price?: number | null;
  billing_period_text?: string;
  discount_tag?: string;
  coupon_code?: string;
  coupon_discount?: number;
  features: string[];
  feature_highlight_title?: string;
  button_text?: string;
  is_popular?: boolean;
  is_active?: boolean;
  sort_order?: number;
  is_category_unlimited?: boolean;
  category_limit?: number;
  is_item_unlimited?: boolean;
  item_limit?: number;
}): Promise<{
  success: boolean;
  data?: PricingPackage;
  error?: string;
}> {
  try {
    await ensurePricingPackagesTable();

    const cleanPackageId = (payload.package_id || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');

    if (!cleanPackageId) {
      return { success: false, error: 'Package Identifier (Slug) is required' };
    }

    if (!payload.name?.trim()) {
      return { success: false, error: 'Package name is required' };
    }

    // Check duplicate slug
    const [existing]: any = await (pool as any).execute(
      'SELECT id FROM pricing_packages WHERE package_id = ? LIMIT 1',
      [cleanPackageId]
    );
    if (existing && existing.length > 0) {
      return { success: false, error: `A package with ID "${cleanPackageId}" already exists.` };
    }

    if (payload.is_popular) {
      await (pool as any).execute('UPDATE pricing_packages SET is_popular = 0');
    }

    const [result]: any = await (pool as any).execute(
      `INSERT INTO pricing_packages (
        package_id, name, tagline, badge_text, price, original_price, billing_period_text,
        discount_tag, coupon_code, coupon_discount,
        features, feature_highlight_title, button_text, is_popular, is_active, sort_order,
        is_category_unlimited, category_limit, is_item_unlimited, item_limit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanPackageId,
        payload.name.trim(),
        payload.tagline?.trim() || '',
        payload.badge_text?.trim() || null,
        Number(payload.price) || 0,
        payload.original_price ? Number(payload.original_price) : null,
        payload.billing_period_text?.trim() || 'Lifetime Access • One-time payment',
        payload.discount_tag?.trim() || null,
        payload.coupon_code?.trim() || null,
        Number(payload.coupon_discount) || 0,
        JSON.stringify(payload.features || []),
        payload.feature_highlight_title?.trim() || '',
        payload.button_text?.trim() || 'Choose Plan',
        payload.is_popular ? 1 : 0,
        payload.is_active !== false ? 1 : 0,
        Number(payload.sort_order) || 0,
        payload.is_category_unlimited !== false ? 1 : 0,
        Number(payload.category_limit) || 0,
        payload.is_item_unlimited !== false ? 1 : 0,
        Number(payload.item_limit) || 0,
      ]
    );

    const insertedId = result.insertId;
    const fetchRes = await getPricingPackageByIdAction(insertedId);
    return { success: true, data: fetchRes.data };
  } catch (error: any) {
    console.error('createPricingPackageAction error:', error);
    return { success: false, error: error.message || 'Failed to create package' };
  }
}

/**
 * Updates an existing lifetime pricing package by ID.
 */
export async function updatePricingPackageAction(
  id: number,
  payload: {
    package_id?: string;
    name?: string;
    tagline?: string;
    badge_text?: string;
    price?: number;
    original_price?: number | null;
    billing_period_text?: string;
    discount_tag?: string;
    coupon_code?: string;
    coupon_discount?: number;
    features?: string[];
    feature_highlight_title?: string;
    button_text?: string;
    is_popular?: boolean;
    is_active?: boolean;
    sort_order?: number;
    is_category_unlimited?: boolean;
    category_limit?: number;
    is_item_unlimited?: boolean;
    item_limit?: number;
  }
): Promise<{
  success: boolean;
  data?: PricingPackage;
  error?: string;
}> {
  try {
    await ensurePricingPackagesTable();

    const [existingRows]: any = await (pool as any).execute('SELECT * FROM pricing_packages WHERE id = ? LIMIT 1', [id]);
    if (!existingRows || existingRows.length === 0) {
      return { success: false, error: 'Package not found' };
    }
    const current = normalizePackageRow(existingRows[0]);

    let cleanPackageId = current.package_id;
    if (payload.package_id !== undefined) {
      cleanPackageId = (payload.package_id || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-');
      if (!cleanPackageId) {
        return { success: false, error: 'Package Identifier (Slug) cannot be empty' };
      }

      const [duplicate]: any = await (pool as any).execute(
        'SELECT id FROM pricing_packages WHERE package_id = ? AND id != ? LIMIT 1',
        [cleanPackageId, id]
      );
      if (duplicate && duplicate.length > 0) {
        return { success: false, error: `A package with ID "${cleanPackageId}" already exists.` };
      }
    }

    if (payload.is_popular) {
      await (pool as any).execute('UPDATE pricing_packages SET is_popular = 0 WHERE id != ?', [id]);
    }

    await (pool as any).execute(
      `UPDATE pricing_packages SET
        package_id = ?,
        name = ?,
        tagline = ?,
        badge_text = ?,
        price = ?,
        original_price = ?,
        billing_period_text = ?,
        discount_tag = ?,
        coupon_code = ?,
        coupon_discount = ?,
        features = ?,
        feature_highlight_title = ?,
        button_text = ?,
        is_popular = ?,
        is_active = ?,
        sort_order = ?,
        is_category_unlimited = ?,
        category_limit = ?,
        is_item_unlimited = ?,
        item_limit = ?
      WHERE id = ?`,
      [
        cleanPackageId,
        payload.name !== undefined ? payload.name.trim() : current.name,
        payload.tagline !== undefined ? payload.tagline.trim() : current.tagline,
        payload.badge_text !== undefined ? (payload.badge_text.trim() || null) : (current.badge_text || null),
        payload.price !== undefined ? Number(payload.price) : current.price,
        payload.original_price !== undefined ? (payload.original_price ? Number(payload.original_price) : null) : current.original_price,
        payload.billing_period_text !== undefined ? payload.billing_period_text.trim() : current.billing_period_text,
        payload.discount_tag !== undefined ? (payload.discount_tag.trim() || null) : (current.discount_tag || null),
        payload.coupon_code !== undefined ? (payload.coupon_code.trim() || null) : (current.coupon_code || null),
        payload.coupon_discount !== undefined ? Number(payload.coupon_discount) : current.coupon_discount,
        payload.features !== undefined ? JSON.stringify(payload.features) : JSON.stringify(current.features),
        payload.feature_highlight_title !== undefined ? payload.feature_highlight_title.trim() : current.feature_highlight_title,
        payload.button_text !== undefined ? payload.button_text.trim() : current.button_text,
        payload.is_popular !== undefined ? (payload.is_popular ? 1 : 0) : (current.is_popular ? 1 : 0),
        payload.is_active !== undefined ? (payload.is_active ? 1 : 0) : (current.is_active ? 1 : 0),
        payload.sort_order !== undefined ? Number(payload.sort_order) : current.sort_order,
        payload.is_category_unlimited !== undefined ? (payload.is_category_unlimited ? 1 : 0) : (current.is_category_unlimited ? 1 : 0),
        payload.category_limit !== undefined ? Number(payload.category_limit) : (current.category_limit || 0),
        payload.is_item_unlimited !== undefined ? (payload.is_item_unlimited ? 1 : 0) : (current.is_item_unlimited ? 1 : 0),
        payload.item_limit !== undefined ? Number(payload.item_limit) : (current.item_limit || 0),
        id,
      ]
    );

    const updatedRes = await getPricingPackageByIdAction(id);
    return { success: true, data: updatedRes.data };
  } catch (error: any) {
    console.error('updatePricingPackageAction error:', error);
    return { success: false, error: error.message || 'Failed to update package' };
  }
}

/**
 * Retrieves limits (category and item quotas) for a specific package ID or slug.
 */
export async function getPackageLimitsAction(packageIdOrSlug: string): Promise<{
  success: boolean;
  data?: {
    packageId: string;
    packageName: string;
    isCategoryUnlimited: boolean;
    categoryLimit: number;
    isItemUnlimited: boolean;
    itemLimit: number;
  };
  error?: string;
}> {
  try {
    await ensurePricingPackagesTable();
    const cleanId = (packageIdOrSlug || '').trim().toLowerCase();
    const [rows]: any = await (pool as any).execute(
      'SELECT package_id, name, is_category_unlimited, category_limit, is_item_unlimited, item_limit FROM pricing_packages WHERE package_id = ? OR LOWER(name) = ? LIMIT 1',
      [cleanId, cleanId]
    );

    if (!rows || rows.length === 0) {
      // Default to unlimited if not found
      return {
        success: true,
        data: {
          packageId: cleanId,
          packageName: cleanId,
          isCategoryUnlimited: true,
          categoryLimit: 0,
          isItemUnlimited: true,
          itemLimit: 0,
        },
      };
    }

    const row = rows[0];
    return {
      success: true,
      data: {
        packageId: row.package_id,
        packageName: row.name,
        isCategoryUnlimited: row.is_category_unlimited !== undefined && row.is_category_unlimited !== null ? Boolean(row.is_category_unlimited) : true,
        categoryLimit: Number(row.category_limit) || 0,
        isItemUnlimited: row.is_item_unlimited !== undefined && row.is_item_unlimited !== null ? Boolean(row.is_item_unlimited) : true,
        itemLimit: Number(row.item_limit) || 0,
      },
    };
  } catch (error: any) {
    console.error('getPackageLimitsAction error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get package limits',
    };
  }
}

/**
 * Deletes a pricing package by ID.
 */
export async function deletePricingPackageAction(id: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await ensurePricingPackagesTable();
    const [result]: any = await (pool as any).execute('DELETE FROM pricing_packages WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return { success: false, error: 'Package not found or already deleted' };
    }
    return { success: true };
  } catch (error: any) {
    console.error('deletePricingPackageAction error:', error);
    return { success: false, error: error.message || 'Failed to delete package' };
  }
}

/**
 * Quickly toggles a package's active status.
 */
export async function togglePricingPackageActiveAction(
  id: number,
  isActive: boolean
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await ensurePricingPackagesTable();
    await (pool as any).execute('UPDATE pricing_packages SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
    return { success: true };
  } catch (error: any) {
    console.error('togglePricingPackageActiveAction error:', error);
    return { success: false, error: error.message || 'Failed to toggle package status' };
  }
}

/**
 * Reorders pricing packages based on an array of IDs in order.
 */
export async function reorderPricingPackagesAction(orderedIds: number[]): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await ensurePricingPackagesTable();
    for (let index = 0; index < orderedIds.length; index++) {
      const id = orderedIds[index];
      await (pool as any).execute('UPDATE pricing_packages SET sort_order = ? WHERE id = ?', [index + 1, id]);
    }
    return { success: true };
  } catch (error: any) {
    console.error('reorderPricingPackagesAction error:', error);
    return { success: false, error: error.message || 'Failed to reorder packages' };
  }
}
