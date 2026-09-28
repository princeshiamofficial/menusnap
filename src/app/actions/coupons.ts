"use server";

import pool from "@/lib/mysql";
import { Coupon } from "@/lib/menusnap-types";

/**
 * Ensures the MySQL coupons table exists and seeds defaults if table is newly created.
 */
export async function ensureCouponsTable(): Promise<void> {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(100) NOT NULL UNIQUE,
        discount_type ENUM('fixed', 'percentage') NOT NULL DEFAULT 'fixed',
        discount_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        applicable_package VARCHAR(100) NOT NULL DEFAULT 'all',
        min_amount DECIMAL(10,2) DEFAULT 0.00,
        max_discount DECIMAL(10,2) DEFAULT NULL,
        usage_limit INT DEFAULT NULL,
        used_count INT NOT NULL DEFAULT 0,
        expires_at DATETIME DEFAULT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        description VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_coupon_code (code),
        INDEX idx_coupon_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed default starter coupon if table is empty
    const [existing]: any = await pool.execute('SELECT COUNT(*) as count FROM coupons');
    if (existing && existing[0] && Number(existing[0].count) === 0) {
      await pool.execute(`
        INSERT INTO coupons (code, discount_type, discount_value, applicable_package, min_amount, is_active, description)
        VALUES 
        ('MENUSNAP500', 'fixed', 500.00, 'all', 1000.00, 1, 'Standard ৳500 Welcome Discount'),
        ('SAVE20', 'percentage', 20.00, 'all', 1000.00, 1, '20% Off Launch Promotion')
      `);
    }
  } catch (error) {
    console.error("Error ensuring coupons table:", error);
  }
}

/**
 * Normalize database row to typed Coupon object.
 */
function normalizeCouponRow(row: any): Coupon {
  return {
    id: row.id,
    code: String(row.code || '').toUpperCase().trim(),
    discount_type: row.discount_type === 'percentage' ? 'percentage' : 'fixed',
    discount_value: Number(row.discount_value) || 0,
    applicable_package: row.applicable_package || 'all',
    min_amount: row.min_amount != null ? Number(row.min_amount) : 0,
    max_discount: row.max_discount != null ? Number(row.max_discount) : null,
    usage_limit: row.usage_limit != null ? Number(row.usage_limit) : null,
    used_count: Number(row.used_count) || 0,
    expires_at: row.expires_at ? new Date(row.expires_at).toISOString() : null,
    is_active: Boolean(row.is_active),
    description: row.description || '',
    created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

/**
 * Retrieves all coupons for admin panel.
 */
export async function getCouponsAction(): Promise<{
  success: boolean;
  data?: Coupon[];
  error?: string;
}> {
  try {
    await ensureCouponsTable();
    const [rows]: any = await pool.execute('SELECT * FROM coupons ORDER BY id DESC');
    const coupons: Coupon[] = (rows || []).map(normalizeCouponRow);
    return { success: true, data: coupons };
  } catch (error: any) {
    console.error("getCouponsAction error:", error);
    return { success: false, error: error.message || 'Failed to fetch coupons' };
  }
}

/**
 * Retrieves a single coupon by ID.
 */
export async function getCouponByIdAction(id: number): Promise<{
  success: boolean;
  data?: Coupon;
  error?: string;
}> {
  try {
    await ensureCouponsTable();
    const [rows]: any = await pool.execute('SELECT * FROM coupons WHERE id = ? LIMIT 1', [id]);
    if (!rows || rows.length === 0) {
      return { success: false, error: 'Coupon not found' };
    }
    return { success: true, data: normalizeCouponRow(rows[0]) };
  } catch (error: any) {
    console.error("getCouponByIdAction error:", error);
    return { success: false, error: error.message || 'Failed to fetch coupon' };
  }
}

export interface CreateCouponPayload {
  code: string;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  applicable_package?: string;
  min_amount?: number;
  max_discount?: number | null;
  usage_limit?: number | null;
  expires_at?: string | null;
  is_active?: boolean;
  description?: string;
}

/**
 * Creates a new coupon in database.
 */
export async function createCouponAction(payload: CreateCouponPayload): Promise<{
  success: boolean;
  data?: Coupon;
  error?: string;
}> {
  try {
    await ensureCouponsTable();

    const cleanCode = String(payload.code || '').trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, error: 'Coupon code is required' };
    }

    if (payload.discount_value <= 0) {
      return { success: false, error: 'Discount value must be greater than 0' };
    }

    if (payload.discount_type === 'percentage' && payload.discount_value > 100) {
      return { success: false, error: 'Percentage discount cannot exceed 100%' };
    }

    // Check if code already exists
    const [existing]: any = await pool.execute('SELECT id FROM coupons WHERE UPPER(code) = ? LIMIT 1', [cleanCode]);
    if (existing && existing.length > 0) {
      return { success: false, error: `Coupon code '${cleanCode}' already exists` };
    }

    const [result]: any = await pool.execute(
      `INSERT INTO coupons (
        code, discount_type, discount_value, applicable_package, 
        min_amount, max_discount, usage_limit, expires_at, is_active, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanCode,
        payload.discount_type === 'percentage' ? 'percentage' : 'fixed',
        Number(payload.discount_value) || 0,
        payload.applicable_package || 'all',
        payload.min_amount != null ? Number(payload.min_amount) : 0,
        payload.max_discount != null && payload.max_discount > 0 ? Number(payload.max_discount) : null,
        payload.usage_limit != null && payload.usage_limit > 0 ? Number(payload.usage_limit) : null,
        payload.expires_at ? new Date(payload.expires_at) : null,
        payload.is_active ?? true ? 1 : 0,
        payload.description?.trim() || null,
      ]
    );

    const insertId = result.insertId;
    return getCouponByIdAction(insertId);
  } catch (error: any) {
    console.error("createCouponAction error:", error);
    return { success: false, error: error.message || 'Failed to create coupon' };
  }
}

/**
 * Updates an existing coupon.
 */
export async function updateCouponAction(
  id: number,
  payload: Partial<CreateCouponPayload>
): Promise<{
  success: boolean;
  data?: Coupon;
  error?: string;
}> {
  try {
    await ensureCouponsTable();

    const [existing]: any = await pool.execute('SELECT * FROM coupons WHERE id = ? LIMIT 1', [id]);
    if (!existing || existing.length === 0) {
      return { success: false, error: 'Coupon not found' };
    }

    const current = existing[0];
    let newCode = current.code;

    if (payload.code) {
      newCode = String(payload.code).trim().toUpperCase();
      // Ensure unique code if changed
      if (newCode !== current.code) {
        const [dup]: any = await pool.execute('SELECT id FROM coupons WHERE UPPER(code) = ? AND id != ? LIMIT 1', [newCode, id]);
        if (dup && dup.length > 0) {
          return { success: false, error: `Coupon code '${newCode}' already exists` };
        }
      }
    }

    const discountType = payload.discount_type !== undefined ? payload.discount_type : current.discount_type;
    const discountValue = payload.discount_value !== undefined ? Number(payload.discount_value) : Number(current.discount_value);
    const applicablePackage = payload.applicable_package !== undefined ? payload.applicable_package : current.applicable_package;
    const minAmount = payload.min_amount !== undefined ? Number(payload.min_amount) : Number(current.min_amount);
    const maxDiscount = payload.max_discount !== undefined ? (payload.max_discount ? Number(payload.max_discount) : null) : current.max_discount;
    const usageLimit = payload.usage_limit !== undefined ? (payload.usage_limit ? Number(payload.usage_limit) : null) : current.usage_limit;
    const expiresAt = payload.expires_at !== undefined ? (payload.expires_at ? new Date(payload.expires_at) : null) : current.expires_at;
    const isActive = payload.is_active !== undefined ? (payload.is_active ? 1 : 0) : current.is_active;
    const description = payload.description !== undefined ? payload.description : current.description;

    await pool.execute(
      `UPDATE coupons SET
        code = ?,
        discount_type = ?,
        discount_value = ?,
        applicable_package = ?,
        min_amount = ?,
        max_discount = ?,
        usage_limit = ?,
        expires_at = ?,
        is_active = ?,
        description = ?
      WHERE id = ?`,
      [
        newCode,
        discountType,
        discountValue,
        applicablePackage,
        minAmount,
        maxDiscount,
        usageLimit,
        expiresAt,
        isActive,
        description,
        id,
      ]
    );

    return getCouponByIdAction(id);
  } catch (error: any) {
    console.error("updateCouponAction error:", error);
    return { success: false, error: error.message || 'Failed to update coupon' };
  }
}

/**
 * Deletes a coupon by ID.
 */
export async function deleteCouponAction(id: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await ensureCouponsTable();
    await pool.execute('DELETE FROM coupons WHERE id = ?', [id]);
    return { success: true };
  } catch (error: any) {
    console.error("deleteCouponAction error:", error);
    return { success: false, error: error.message || 'Failed to delete coupon' };
  }
}

/**
 * Toggles a coupon's active status.
 */
export async function toggleCouponStatusAction(
  id: number,
  isActive: boolean
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await ensureCouponsTable();
    await pool.execute('UPDATE coupons SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
    return { success: true };
  } catch (error: any) {
    console.error("toggleCouponStatusAction error:", error);
    return { success: false, error: error.message || 'Failed to update status' };
  }
}

/**
 * Validates a coupon code during checkout and calculates exact discount.
 */
export async function validateCouponAction(
  code: string,
  packageId?: string,
  orderAmount: number = 0
): Promise<{
  valid: boolean;
  discount: number;
  finalAmount: number;
  message?: string;
  coupon?: Coupon;
}> {
  try {
    await ensureCouponsTable();

    const cleanCode = String(code || '').trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, discount: 0, finalAmount: orderAmount, message: 'Please enter a coupon code' };
    }

    const [rows]: any = await pool.execute(
      'SELECT * FROM coupons WHERE UPPER(code) = ? LIMIT 1',
      [cleanCode]
    );

    if (!rows || rows.length === 0) {
      return { valid: false, discount: 0, finalAmount: orderAmount, message: 'Invalid coupon code' };
    }

    const coupon = normalizeCouponRow(rows[0]);

    if (!coupon.is_active) {
      return { valid: false, discount: 0, finalAmount: orderAmount, message: 'This coupon is currently inactive' };
    }

    // Check expiration date
    if (coupon.expires_at) {
      const expDate = new Date(coupon.expires_at);
      if (new Date() > expDate) {
        return { valid: false, discount: 0, finalAmount: orderAmount, message: 'This coupon has expired' };
      }
    }

    // Check usage limit
    if (coupon.usage_limit != null && coupon.usage_limit > 0) {
      if (coupon.used_count >= coupon.usage_limit) {
        return { valid: false, discount: 0, finalAmount: orderAmount, message: 'Coupon usage limit reached' };
      }
    }

    // Check applicable package
    if (coupon.applicable_package && coupon.applicable_package !== 'all' && packageId) {
      if (coupon.applicable_package.toLowerCase() !== packageId.toLowerCase()) {
        return { valid: false, discount: 0, finalAmount: orderAmount, message: `Coupon is only valid for ${coupon.applicable_package} plan` };
      }
    }

    // Check minimum spend amount
    if (coupon.min_amount && orderAmount < coupon.min_amount) {
      return { 
        valid: false, 
        discount: 0, 
        finalAmount: orderAmount, 
        message: `Minimum order amount of ৳${coupon.min_amount} required for this coupon` 
      };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round((orderAmount * coupon.discount_value) / 100);
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.discount_value;
    }

    // Discount cannot exceed order amount
    if (discount > orderAmount) {
      discount = orderAmount;
    }

    const finalAmount = Math.max(0, orderAmount - discount);

    return {
      valid: true,
      discount,
      finalAmount,
      message: `Coupon applied: ৳${discount.toLocaleString()} discount`,
      coupon,
    };
  } catch (error: any) {
    console.error("validateCouponAction error:", error);
    return { valid: false, discount: 0, finalAmount: orderAmount, message: error.message || 'Validation error' };
  }
}

/**
 * Increments coupon used_count on successful checkout transaction.
 */
export async function recordCouponUsageAction(code: string): Promise<void> {
  try {
    const cleanCode = String(code || '').trim().toUpperCase();
    if (!cleanCode) return;
    await pool.execute(
      'UPDATE coupons SET used_count = used_count + 1 WHERE UPPER(code) = ?',
      [cleanCode]
    );
  } catch (error) {
    console.error("Error recording coupon usage:", error);
  }
}
