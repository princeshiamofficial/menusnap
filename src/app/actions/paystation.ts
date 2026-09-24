'use server';

import pool from '@/lib/mysql';

export interface PayStationSettings {
  isEnabled: boolean;
  isSandbox: boolean;
  merchantId: string;
  password: string;
}

export interface PayStationTransaction {
  id?: number;
  invoiceNumber: string;
  trxId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  plan: string;
  duration: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Successful' | 'Failed' | 'Cancelled';
  paymentCategory?: string | null;
  reference?: string | null;
  rawResponse?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_SETTINGS: PayStationSettings = {
  isEnabled: false,
  isSandbox: true,
  merchantId: '',
  password: '',
};

/**
 * Ensures PayStation settings and transaction tables exist in MySQL.
 */
export async function ensurePayStationTables(): Promise<void> {
  try {
    // 1. Settings Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS paystation_settings (
        id INT PRIMARY KEY DEFAULT 1,
        is_enabled TINYINT(1) DEFAULT 0,
        is_sandbox TINYINT(1) DEFAULT 1,
        merchant_id VARCHAR(255) DEFAULT '',
        password VARCHAR(255) DEFAULT '',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Insert default settings row if not present
    await pool.execute(`
      INSERT IGNORE INTO paystation_settings (id, is_enabled, is_sandbox, merchant_id, password)
      VALUES (1, 0, 1, '', '')
    `);

    // 2. Transactions Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS paystation_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_number VARCHAR(100) NOT NULL UNIQUE,
        trx_id VARCHAR(100) DEFAULT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        plan VARCHAR(50) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'BDT',
        status VARCHAR(50) DEFAULT 'Pending',
        payment_category VARCHAR(50) DEFAULT NULL,
        reference VARCHAR(255) DEFAULT NULL,
        raw_response LONGTEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_invoice (invoice_number),
        INDEX idx_trx (trx_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (error) {
    console.error('Error ensuring PayStation tables:', error);
    throw error;
  }
}

/**
 * Retrieves current PayStation credentials and configuration for admin.
 */
export async function getPayStationSettings(): Promise<PayStationSettings> {
  try {
    await ensurePayStationTables();
    const [rows]: any = await pool.execute('SELECT * FROM paystation_settings WHERE id = 1 LIMIT 1');
    if (!rows || rows.length === 0) return DEFAULT_SETTINGS;

    const row = rows[0];
    return {
      isEnabled: !!row.is_enabled,
      isSandbox: !!row.is_sandbox,
      merchantId: row.merchant_id || '',
      password: row.password || '',
    };
  } catch (error) {
    console.error('Error retrieving PayStation settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Public status for front-end checkout (does not leak credentials).
 */
export async function getPayStationPublicStatus(): Promise<{
  isEnabled: boolean;
  isSandbox: boolean;
}> {
  try {
    const settings = await getPayStationSettings();
    return {
      isEnabled: settings.isEnabled && Boolean(settings.merchantId && settings.password),
      isSandbox: settings.isSandbox,
    };
  } catch {
    return { isEnabled: false, isSandbox: true };
  }
}

/**
 * Updates PayStation settings from the admin panel.
 */
export async function savePayStationSettings(settings: PayStationSettings): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    await ensurePayStationTables();

    await pool.execute(
      `
      INSERT INTO paystation_settings (id, is_enabled, is_sandbox, merchant_id, password)
      VALUES (1, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        is_enabled = VALUES(is_enabled),
        is_sandbox = VALUES(is_sandbox),
        merchant_id = VALUES(merchant_id),
        password = VALUES(password)
    `,
      [
        settings.isEnabled ? 1 : 0,
        settings.isSandbox ? 1 : 0,
        (settings.merchantId || '').trim(),
        (settings.password || '').trim(),
      ]
    );

    return { success: true, message: 'PayStation settings updated successfully.' };
  } catch (error: any) {
    console.error('Error saving PayStation settings:', error);
    return { success: false, error: error.message || 'Failed to save PayStation settings.' };
  }
}

/**
 * Initiates a payment session with PayStation Bangladesh.
 */
export async function initiatePayStationPaymentAction(payload: {
  plan: string;
  duration: string;
  amount: number;
  fullName: string;
  email: string;
  phone: string;
  coupon?: string;
  origin?: string;
}): Promise<{
  success: boolean;
  paymentUrl?: string;
  invoiceNumber?: string;
  error?: string;
}> {
  try {
    await ensurePayStationTables();
    const settings = await getPayStationSettings();

    if (!settings.isEnabled) {
      return {
        success: false,
        error: 'PayStation payment gateway is currently disabled. Please contact support.',
      };
    }

    if (!settings.merchantId || !settings.password) {
      return {
        success: false,
        error: 'PayStation merchant credentials are not configured. Please contact the administrator.',
      };
    }

    // Determine Base URL
    const baseUrl = settings.isSandbox
      ? 'https://sandbox.paystation.com.bd'
      : 'https://api.paystation.com.bd';

    // Generate unique invoice number: MS-INV-{timestamp}-{4-digit-random}
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `MS-INV-${timestamp}-${randomSuffix}`;

    // Record pending transaction in MySQL
    await pool.execute(
      `
      INSERT INTO paystation_transactions (
        invoice_number, customer_name, customer_email, customer_phone,
        plan, duration, amount, currency, status, reference
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'BDT', 'Pending', ?)
    `,
      [
        invoiceNumber,
        payload.fullName.trim(),
        payload.email.trim(),
        payload.phone.trim(),
        payload.plan,
        payload.duration,
        payload.amount,
        `Coupon: ${payload.coupon || 'None'}`,
      ]
    );

    // Compute callback URL
    let siteUrl = payload.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    // Remove trailing slash if present
    siteUrl = siteUrl.replace(/\/$/, '');
    const callbackUrl = `${siteUrl}/api/payment/paystation/callback`;

    const requestBody = {
      merchantId: settings.merchantId.trim(),
      password: settings.password.trim(),
      invoice_number: invoiceNumber,
      currency: 'BDT',
      payment_amount: Number(payload.amount),
      reference: `MenuSnap_${payload.plan.toUpperCase()}_${payload.duration}`,
      cust_name: payload.fullName.trim(),
      cust_phone: payload.phone.trim(),
      cust_email: payload.email.trim(),
      cust_address: 'Bangladesh',
      callback_url: callbackUrl,
      checkout_items: `MenuSnap ${payload.plan.toUpperCase()} Plan (${payload.duration})`,
    };

    console.log('[PayStation] Initiating payment request to:', `${baseUrl}/initiate-payment`);

    const response = await fetch(`${baseUrl}/initiate-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        merchantId: settings.merchantId.trim(),
        password: settings.password.trim(),
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });

    const data = await response.json();
    console.log('[PayStation] Response:', data);

    // PayStation returns { status_code: "200" | 200, status: "success", payment_url: "..." }
    const isSuccess =
      (data.status_code === '200' || data.status_code === 200) &&
      (data.status === 'success' || Boolean(data.payment_url));

    if (isSuccess && data.payment_url) {
      return {
        success: true,
        paymentUrl: data.payment_url,
        invoiceNumber,
      };
    } else {
      const errorMessage =
        data.message || data.status_message || data.error || 'Failed to initiate PayStation payment session.';

      // Update transaction status to Failed
      await pool.execute(
        `UPDATE paystation_transactions SET status = 'Failed', raw_response = ? WHERE invoice_number = ?`,
        [JSON.stringify(data), invoiceNumber]
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  } catch (error: any) {
    console.error('[PayStation] Error initiating payment:', error);
    return {
      success: false,
      error: error.message || 'Network error occurred while connecting to PayStation gateway.',
    };
  }
}

/**
 * Verifies transaction status with PayStation API and updates local records.
 */
export async function verifyPayStationTransaction(
  invoiceNumber: string,
  trxId?: string | null
): Promise<{
  success: boolean;
  status: 'Successful' | 'Failed' | 'Cancelled' | 'Pending';
  trxId?: string;
  amount?: number;
  transaction?: PayStationTransaction;
  message?: string;
}> {
  try {
    await ensurePayStationTables();
    const settings = await getPayStationSettings();

    // 1. Fetch local transaction
    const [rows]: any = await pool.execute(
      `SELECT * FROM paystation_transactions WHERE invoice_number = ? LIMIT 1`,
      [invoiceNumber]
    );

    if (!rows || rows.length === 0) {
      return {
        success: false,
        status: 'Failed',
        message: `Transaction record with invoice ${invoiceNumber} was not found.`,
      };
    }

    const currentTx = rows[0];

    // If already marked successful, return cached success
    if (currentTx.status === 'Successful') {
      return {
        success: true,
        status: 'Successful',
        trxId: currentTx.trx_id,
        amount: Number(currentTx.amount),
        transaction: {
          invoiceNumber: currentTx.invoice_number,
          trxId: currentTx.trx_id,
          customerName: currentTx.customer_name,
          customerEmail: currentTx.customer_email,
          customerPhone: currentTx.customer_phone,
          plan: currentTx.plan,
          duration: currentTx.duration,
          amount: Number(currentTx.amount),
          currency: currentTx.currency,
          status: currentTx.status,
          paymentCategory: currentTx.payment_category,
        },
      };
    }

    // Determine Base URL
    const baseUrl = settings.isSandbox
      ? 'https://sandbox.paystation.com.bd'
      : 'https://api.paystation.com.bd';

    // 2. Call PayStation Status API
    // PayStation supports POST /transaction-status or /v2/transaction-status
    let statusResponse: any = null;
    try {
      const verifyRes = await fetch(`${baseUrl}/transaction-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          merchantId: settings.merchantId.trim(),
          password: settings.password.trim(),
        },
        body: JSON.stringify({
          invoice_number: invoiceNumber,
          trx_id: trxId || '',
        }),
        cache: 'no-store',
      });
      statusResponse = await verifyRes.json();
      console.log('[PayStation] Status verification response:', statusResponse);
    } catch (e: any) {
      console.error('[PayStation] Status request failed:', e);
    }

    // Inspect verification response
    const dataObj = statusResponse?.data || statusResponse || {};
    const trxStatus = (
      dataObj.trx_status ||
      statusResponse?.trx_status ||
      statusResponse?.status ||
      ''
    ).toLowerCase();

    const resolvedTrxId =
      trxId || dataObj.trx_id || statusResponse?.trx_id || null;
    const paymentCategory =
      dataObj.payment_category || dataObj.method || statusResponse?.payment_category || null;

    let finalStatus: 'Successful' | 'Failed' | 'Cancelled' | 'Pending' = 'Failed';

    if (
      trxStatus === 'successful' ||
      trxStatus === 'success' ||
      statusResponse?.status_code === '200' ||
      statusResponse?.status_code === 200
    ) {
      // In some PayStation responses, status_code is 200 and trx_status is Success/Successful
      if (
        trxStatus.includes('success') ||
        dataObj.status === 'success' ||
        statusResponse?.status === 'success'
      ) {
        finalStatus = 'Successful';
      } else if (trxStatus.includes('cancel')) {
        finalStatus = 'Cancelled';
      } else {
        finalStatus = 'Failed';
      }
    } else if (trxStatus.includes('cancel')) {
      finalStatus = 'Cancelled';
    } else {
      finalStatus = 'Failed';
    }

    // 3. Update database record
    await pool.execute(
      `
      UPDATE paystation_transactions
      SET status = ?, trx_id = ?, payment_category = ?, raw_response = ?
      WHERE invoice_number = ?
    `,
      [
        finalStatus,
        resolvedTrxId,
        paymentCategory,
        JSON.stringify(statusResponse || {}),
        invoiceNumber,
      ]
    );

    // 4. If Successful, register or upgrade client in `clients` CRM table
    if (finalStatus === 'Successful') {
      try {
        await linkSubscriberToClientCRM({
          fullName: currentTx.customer_name,
          email: currentTx.customer_email,
          phone: currentTx.customer_phone,
          plan: currentTx.plan,
          duration: currentTx.duration,
          amount: currentTx.amount,
          invoiceNumber,
          trxId: resolvedTrxId || 'N/A',
        });
      } catch (crmErr) {
        console.error('Error linking subscriber to clients CRM:', crmErr);
      }
    }

    return {
      success: finalStatus === 'Successful',
      status: finalStatus,
      trxId: resolvedTrxId,
      amount: Number(currentTx.amount),
      transaction: {
        invoiceNumber: currentTx.invoice_number,
        trxId: resolvedTrxId,
        customerName: currentTx.customer_name,
        customerEmail: currentTx.customer_email,
        customerPhone: currentTx.customer_phone,
        plan: currentTx.plan,
        duration: currentTx.duration,
        amount: Number(currentTx.amount),
        currency: currentTx.currency,
        status: finalStatus,
        paymentCategory,
      },
    };
  } catch (error: any) {
    console.error('[PayStation] Error in verifyPayStationTransaction:', error);
    return {
      success: false,
      status: 'Failed',
      message: error.message || 'Error occurred during transaction verification.',
    };
  }
}

/**
 * Links new subscriber to clients CRM table.
 */
async function linkSubscriberToClientCRM(info: {
  fullName: string;
  email: string;
  phone: string;
  plan: string;
  duration: string;
  amount: number;
  invoiceNumber: string;
  trxId: string;
}): Promise<void> {
  try {
    // Check if client with this phone number already exists
    const [existing]: any = await pool.execute(
      `SELECT id FROM clients WHERE whatsapp_number = ? OR email = ? LIMIT 1`,
      [info.phone, info.email]
    );

    let clientId: number;
    const noteText = `Subscribed to MenuSnap ${info.plan.toUpperCase()} (${info.duration}) via PayStation BDT ${info.amount}. Invoice: ${info.invoiceNumber}, TrxID: ${info.trxId}`;

    if (existing && existing.length > 0) {
      clientId = existing[0].id;
      await pool.execute(
        `UPDATE clients SET stage = 'customer', is_subscriber = 1, note = CONCAT(IFNULL(note, ''), '\n', ?) WHERE id = ?`,
        [noteText, clientId]
      );
    } else {
      const [insertRes]: any = await pool.execute(
        `INSERT INTO clients (business_name, business_type, whatsapp_number, email, stage, is_subscriber, note)
         VALUES (?, 'Restaurant', ?, ?, 'customer', 1, ?)`,
        [info.fullName, info.phone, info.email, noteText]
      );
      clientId = insertRes.insertId;
    }

    // Insert into client_notes table if it exists
    try {
      await pool.execute(
        `INSERT INTO client_notes (client_id, note) VALUES (?, ?)`,
        [clientId, noteText]
      );
    } catch {
      // client_notes table optional
    }
  } catch (err) {
    console.error('Error linking subscriber to CRM table:', err);
  }
}

/**
 * Fetches PayStation transactions for Admin dashboard with optional filtering and pagination.
 */
export async function getPayStationTransactionsAction(
  limitOrOptions: number | { limit?: number; offset?: number; search?: string; status?: string } = 25,
  offsetArg: number = 0,
  searchArg?: string,
  statusArg?: string
): Promise<{
  success: boolean;
  transactions?: PayStationTransaction[];
  total?: number;
  error?: string;
}> {
  try {
    await ensurePayStationTables();

    let limit = 25;
    let offset = 0;
    let search = '';
    let status = '';

    if (typeof limitOrOptions === 'object' && limitOrOptions !== null) {
      limit = limitOrOptions.limit ?? 25;
      offset = limitOrOptions.offset ?? 0;
      search = limitOrOptions.search?.trim() || '';
      status = limitOrOptions.status?.trim() || '';
    } else {
      limit = Number(limitOrOptions) || 25;
      offset = Number(offsetArg) || 0;
      search = searchArg?.trim() || '';
      status = statusArg?.trim() || '';
    }

    const conditions: string[] = [];
    const params: any[] = [];

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push(
        '(invoice_number LIKE ? OR trx_id LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ? OR plan LIKE ?)'
      );
      const wildcard = `%${search}%`;
      params.push(wildcard, wildcard, wildcard, wildcard, wildcard, wildcard);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM paystation_transactions ${whereClause}`;
    const [countRows]: any = await pool.execute(countSql, params);
    const total = countRows[0]?.total || 0;

    const querySql = `
      SELECT 
        id, invoice_number, trx_id, customer_name, customer_email, customer_phone,
        plan, duration, amount, currency, status, payment_category, reference, raw_response,
        created_at, updated_at
      FROM paystation_transactions
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows]: any = await pool.execute(querySql, [...params, Number(limit), Number(offset)]);

    const transactions: PayStationTransaction[] = rows.map((r: any) => ({
      id: r.id,
      invoiceNumber: r.invoice_number,
      trxId: r.trx_id,
      customerName: r.customer_name,
      customerEmail: r.customer_email,
      customerPhone: r.customer_phone,
      plan: r.plan,
      duration: r.duration,
      amount: Number(r.amount),
      currency: r.currency,
      status: r.status,
      paymentCategory: r.payment_category,
      reference: r.reference,
      rawResponse: r.raw_response,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    return {
      success: true,
      transactions,
      total,
    };
  } catch (error: any) {
    console.error('Error fetching PayStation transactions:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch PayStation transactions.',
    };
  }
}

/**
 * Calculates aggregate payment metrics for the PayStation admin overview.
 */
export async function getPayStationMetricsAction(): Promise<{
  success: boolean;
  metrics?: {
    totalRevenue: number;
    successfulCount: number;
    pendingCount: number;
    failedCount: number;
    totalCount: number;
  };
  error?: string;
}> {
  try {
    await ensurePayStationTables();

    const [rows]: any = await pool.execute(`
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN status = 'Successful' THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN status = 'Successful' THEN 1 ELSE 0 END) as successful_count,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status IN ('Failed', 'Cancelled') THEN 1 ELSE 0 END) as failed_count
      FROM paystation_transactions
    `);

    const row = rows[0] || {};
    return {
      success: true,
      metrics: {
        totalRevenue: Number(row.total_revenue || 0),
        successfulCount: Number(row.successful_count || 0),
        pendingCount: Number(row.pending_count || 0),
        failedCount: Number(row.failed_count || 0),
        totalCount: Number(row.total_count || 0),
      },
    };
  } catch (error: any) {
    console.error('Error fetching PayStation metrics:', error);
    return {
      success: false,
      error: error.message || 'Failed to calculate payment metrics.',
    };
  }
}

/**
 * Deletes a transaction record from admin dashboard.
 */
export async function deletePayStationTransactionAction(id: number): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    await ensurePayStationTables();
    await pool.execute('DELETE FROM paystation_transactions WHERE id = ?', [id]);
    return { success: true, message: 'Transaction record deleted successfully.' };
  } catch (error: any) {
    console.error('Error deleting PayStation transaction:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete transaction.',
    };
  }
}

