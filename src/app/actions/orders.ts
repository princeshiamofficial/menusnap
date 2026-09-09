
'use server';

import { revalidatePath } from 'next/cache';
import pool from '@/lib/mysql';
import { formatUtcDateTime } from '@/lib/dateUtils';

let cachedOrderCatalog: Record<string, { categories: any[]; items: any[]; timestamp: number }> = {};
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

/**
 * Direct MySQL implementation for order submission.
 * Replaces the external PHP API for XAMPP Localhost.
 */
export async function submitOrderToMySql(orderPayload: any) {
  try {
    const { id, orderId, customer, items, totalAmount, status, orderDate, template } = orderPayload;

    // Ensure we have objects even if not provided
    const finalCustomer = customer || {};
    const finalTemplate = template || {};

    await pool.execute(
      `INSERT INTO orders (
        id, orderId, customerName, customerEmail, customerPhone, customerAddress, 
        businessName, businessRole, templateName, totalAmount, status, orderDate,
        customerData, templateData, items
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        orderId,
        finalCustomer.name || '',
        finalCustomer.email || '',
        finalCustomer.phone || '',
        finalCustomer.address || '',
        finalCustomer.restaurant || '',
        finalCustomer.role || '',
        finalTemplate.name || '',
        totalAmount || 0,
        status || 'Pending',
        formatUtcDateTime(orderDate), 
        JSON.stringify(finalCustomer),
        JSON.stringify(finalTemplate),
        JSON.stringify(items || [])
      ]
    );

    cachedOrderCatalog = {};
    revalidatePath('/m-admin/manage-orders');
    return { success: true, message: 'Order submitted directly to MySQL.' };
  } catch (error: any) {
    console.error('MySQL Persistence Error:', error);
    return { success: false, message: error.message || 'Direct MySQL persistence failed.' };
  }
}

/**
 * Fetch all orders from local MySQL.
 */
export async function getOrdersFromMySql() {
  try {
    const [rows]: any = await pool.execute(
      `SELECT *, DATE_FORMAT(orderDate, '%Y-%m-%d %H:%i:%s') as orderDate FROM orders ORDER BY orderDate DESC`
    );

    const formattedOrders = (Array.isArray(rows) ? rows : []).map((order: any) => {
      // Parse JSON from database safely
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
      const customerData = typeof order.customerData === 'string' ? JSON.parse(order.customerData) : (order.customerData || {});
      const templateData = typeof order.templateData === 'string' ? JSON.parse(order.templateData) : (order.templateData || {});

      return {
        ...order,
        orderDate: order.orderDate,
        customerData,
        templateData,
        customer: typeof order.customerData === 'string' ? JSON.parse(order.customerData) : (order.customerData || {}),
        template: typeof order.templateData === 'string' ? JSON.parse(order.templateData) : (order.templateData || {}),
        items
      };
    });

    return { success: true, data: formattedOrders };
  } catch (error: any) {
    console.error('MySQL Fetch Error:', error);
    return { success: false, message: error.message || 'Failed to fetch orders from local MySQL.' };
  }
}

/**
 * Delete an order and its items from local MySQL.
 */
export async function deleteOrderFromMySql(orderId: string) {
  try {
    await pool.execute('DELETE FROM orders WHERE id = ?', [orderId]);
    revalidatePath('/m-admin/manage-orders');
    return { success: true, message: 'Order deleted successfully.' };
  } catch (error: any) {
    console.error('MySQL Delete Error:', error);
    return { success: false, message: error.message || 'Failed to delete order.' };
  }
}

/**
 * Update an existing order.
 */
export async function updateOrderInMySql(order: any) {
  try {
    const { id, total, totalAmount, customer, customerData, status, template, templateData, items } = order;
    
    // PRIORITY: Use the "clean" objects if they exist, otherwise fallback to the "Data" variants
    // This solves the issue where getOrdersFromMySql returns both, and we want to update one.
    const finalCustomer = customer || customerData || {};
    const finalTemplate = template || templateData || {};
    const finalTotal = totalAmount !== undefined ? totalAmount : total;

    await pool.execute(
      `UPDATE orders 
       SET totalAmount = ?, 
           customerName = ?, 
           customerEmail = ?, 
           customerPhone = ?, 
           customerAddress = ?, 
           businessName = ?, 
           businessRole = ?, 
           templateName = ?,
           customerData = ?, 
           status = ?, 
           templateData = ?, 
           items = ?
       WHERE id = ?`,
      [
        finalTotal || 0,
        finalCustomer.name || '',
        finalCustomer.email || '',
        finalCustomer.phone || '',
        finalCustomer.address || '',
        finalCustomer.restaurant || '',
        finalCustomer.role || '',
        finalTemplate.name || '',
        JSON.stringify(finalCustomer), 
        status || 'Pending', 
        JSON.stringify(finalTemplate), 
        JSON.stringify(items || []),
        id
      ]
    );
    revalidatePath('/m-admin/manage-orders');
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Order Update Error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Fetch a single order by its ID.
 */
export async function getOrderByIdFromMySql(id: string) {
  try {
    const [rows] = await pool.execute(`SELECT *, DATE_FORMAT(orderDate, '%Y-%m-%d %H:%i:%s') as orderDate FROM orders WHERE id = ?`, [id]);
    const orders = rows as any[];
    if (orders.length === 0) return { success: false, message: 'Order not found' };

    const order = orders[0];
    
    return {
      success: true,
      data: {
        ...order,
        orderDate: order.orderDate,
        customerData: typeof order.customerData === 'string' ? JSON.parse(order.customerData) : order.customerData,
        templateData: typeof order.templateData === 'string' ? JSON.parse(order.templateData) : order.templateData,
        // For compatibility with some UI components that expect 'template' key
        template: typeof order.templateData === 'string' ? JSON.parse(order.templateData) : order.templateData,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])
      }
    };
  } catch (error: any) {
    console.error('MySQL Get Order Error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Fetch all categories from local MySQL.
 * @param type 'restaurant' or 'parlour'
 * @param visibleOnly filter for visible categories
 */
export async function getCategoriesFromMySql(type?: 'restaurant' | 'parlour', visibleOnly = false) {
  try {
    let query = "SELECT *, DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i:%s') as createdAt FROM categories";
    const params: any[] = [];
    const conditions: string[] = [];

    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }
    
    if (visibleOnly) {
      conditions.push('visibleToUsers = 1');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY sortOrder ASC';
    
    const [rows] = await pool.execute(query, params);
    const plainCategories = (rows as any[]).map((cat: any) => ({ ...cat }));
    return { success: true, data: plainCategories };
  } catch (error: any) {
    console.error('MySQL Categories Fetch Error:', error);
    return { success: false, message: error.message || 'Failed to fetch categories.' };
  }
}

/**
 * Fetch all menu items from local MySQL.
 * @param type 'restaurant' or 'parlour'
 * @param visibleOnly filter for visible items
 */
export async function getMenuItemsFromMySql(type?: 'restaurant' | 'parlour', visibleOnly = false) {
  try {
    let query = 'SELECT * FROM menu_items';
    const params: any[] = [];
    const conditions: string[] = [];

    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }
    
    if (visibleOnly) {
      conditions.push('visible = 1');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY sortOrder ASC';
    
    const [rows]: any = await pool.execute(query, params);
    
    const formatted = (Array.isArray(rows) ? rows : []).map((item: any) => ({
      ...item,
      subItems: typeof item.subItems === 'string' ? JSON.parse(item.subItems) : (item.subItems || [])
    }));
    
    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('MySQL Items Fetch Error:', error);
    return { success: false, message: error.message || 'Failed to fetch menu items.' };
  }
}

let templatesTableChecked = false;

/**
 * Ensure templates table exists in MySQL.
 */
async function ensureTemplatesTable() {
  if (templatesTableChecked) return;
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS templates (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        imageUrl LONGTEXT,
        tags LONGTEXT,
        isTopRated BOOLEAN DEFAULT FALSE,
        isPublished BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    templatesTableChecked = true;
  } catch (error) {
    console.error('Failed to ensure templates table:', error);
  }
}

/**
 * Fetch all templates from local MySQL.
 */
export async function getTemplatesFromMySql() {
  try {
    await ensureTemplatesTable();
    const [rows]: any = await pool.execute("SELECT *, DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i:%s') as createdAt FROM templates ORDER BY createdAt DESC");
    
    const formatted = (Array.isArray(rows) ? rows : []).map((template: any) => {
      let tagsData = [];
      try {
        tagsData = typeof template.tags === 'string' ? JSON.parse(template.tags) : (template.tags || []);
      } catch {
        tagsData = [];
      }
      return {
        ...template,
        tags: Array.isArray(tagsData) ? tagsData : []
      };
    });
    
    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('MySQL Templates Fetch Error:', error);
    return { success: false, message: error.message || 'Failed to fetch templates.' };
  }
}

/**
 * Upsert a category (Insert or Update).
 */
export async function upsertCategoryToMySql(category: any) {
  try {
    const { id, name, icon, type, itemCount, visibleToUsers, sortOrder, keywords, description, status } = category;
    await pool.execute(
      `INSERT INTO categories (id, name, icon, type, itemCount, visibleToUsers, sortOrder, keywords, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       name = VALUES(name), icon = VALUES(icon), type = VALUES(type), 
       itemCount = VALUES(itemCount), visibleToUsers = VALUES(visibleToUsers), sortOrder = VALUES(sortOrder),
       keywords = VALUES(keywords), description = VALUES(description), status = VALUES(status)`,
      [id, name, icon || '', type || 'restaurant', itemCount || 0, visibleToUsers !== false, sortOrder || 0, keywords || '', description || null, status || 'active']
    );
    cachedOrderCatalog = {};
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Category Upsert Error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete a category.
 */
export async function deleteCategoryFromMySql(id: string) {
  try {
    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Category Delete Error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Upsert a menu item.
 */
export async function upsertMenuItemToMySql(item: any) {
  try {
    const { id, name, description, price, categoryId, type, imageUrl, visible, subItems, sortOrder } = item;
    await pool.execute(
      `INSERT INTO menu_items (id, name, description, price, categoryId, type, imageUrl, visible, subItems, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       name = VALUES(name), description = VALUES(description), price = VALUES(price),
       categoryId = VALUES(categoryId), type = VALUES(type), imageUrl = VALUES(imageUrl),
       visible = VALUES(visible), subItems = VALUES(subItems), sortOrder = VALUES(sortOrder)`,
      [id, name, description || '', price || 0, categoryId, type || 'restaurant', imageUrl || '', visible !== false, JSON.stringify(subItems || []), sortOrder || 0]
    );
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Item Upsert Error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete a menu item.
 */
export async function deleteMenuItemFromMySql(id: string) {
  try {
    await pool.execute('DELETE FROM menu_items WHERE id = ?', [id]);
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Item Delete Error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Remap a menu item to a different category.
 */
export async function remapMenuItemCategory(itemId: string, newCategoryId: string) {
  try {
    await pool.execute('UPDATE menu_items SET categoryId = ? WHERE id = ?', [newCategoryId, itemId]);
    await pool.execute(`
      UPDATE categories c
      SET c.itemCount = (
        SELECT COUNT(*) FROM menu_items m WHERE m.categoryId = c.id
      )
    `);
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Item Remap Error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Fetch all items mapped to a specific category.
 */
export async function getCategoryMappedItems(categoryId: string) {
  try {
    const [rows]: any = await pool.execute(
      'SELECT *, DATE_FORMAT(createdAt, "%Y-%m-%d %H:%i:%s") as createdAt FROM menu_items WHERE categoryId = ? ORDER BY sortOrder ASC, name ASC',
      [categoryId]
    );
    const formatted = (Array.isArray(rows) ? rows : []).map((item: any) => ({
      ...item,
      subItems: typeof item.subItems === 'string' ? JSON.parse(item.subItems) : (item.subItems || [])
    }));
    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('MySQL Category Mapped Items Error:', error);
    return { success: false, message: error.message, data: [] };
  }
}

/**
 * Update keywords for a category used in auto-matching items from orders.
 */
export async function updateCategoryKeywords(categoryId: string, keywords: string) {
  try {
    await pool.execute(
      'UPDATE categories SET keywords = ? WHERE id = ?',
      [keywords.trim(), categoryId]
    );
    cachedOrderCatalog = {};
    return { success: true, message: 'Category keywords updated successfully.' };
  } catch (error: any) {
    console.error('MySQL Category Keywords Update Error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Fetch items mapped from orders for a specific category.
 */
export async function getCategoryOrderItems(categoryId: string, type: 'restaurant' | 'parlour' = 'restaurant') {
  try {
    const result = await getOrderItemsAndCategories(500, type);
    if (!result.success || !result.items) return { success: true, data: [] };
    const items = result.items.filter((it: any) => it.category === categoryId);
    return { success: true, data: items };
  } catch (error: any) {
    console.error('MySQL Category Order Items Error:', error);
    return { success: false, message: error.message, data: [] };
  }
}

/**
 * Upsert a template.
 */
export async function upsertTemplateToMySql(template: any) {
  try {
    await ensureTemplatesTable();
    const { id, name, description, imageUrl, tags, isTopRated, isPublished } = template;
    await pool.execute(
      `INSERT INTO templates (id, name, description, imageUrl, tags, isTopRated, isPublished)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       name = VALUES(name), description = VALUES(description), imageUrl = VALUES(imageUrl), 
       tags = VALUES(tags), isTopRated = VALUES(isTopRated), isPublished = VALUES(isPublished)`,
      [id, name, description || '', imageUrl || '', JSON.stringify(tags || []), isTopRated || false, isPublished || false]
    );
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Template Upsert Error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete a template.
 */
export async function deleteTemplateFromMySql(id: string) {
  try {
    await ensureTemplatesTable();
    await pool.execute('DELETE FROM templates WHERE id = ?', [id]);
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Template Delete Error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Fetches unique items and categories extracted from past customer orders.
 * Automatically resolves and merges similar category names into standard canonical categories
 * (e.g. "Appetizer & Starter", "Appetizers (1:3)", "Appitizer" all merge into "Appetizers").
 * Strictly filters by business type ('restaurant' | 'parlour') to avoid cross-contamination.
 * Employs in-memory caching for ultra-fast (<5ms) repeated responses.
 */
export async function getOrderItemsAndCategories(limit = 0, type?: 'restaurant' | 'parlour') {
  try {
    const now = Date.now();
    const cacheKey = `${type || 'all'}_${limit}`;
    if (cachedOrderCatalog[cacheKey] && (now - cachedOrderCatalog[cacheKey].timestamp < CACHE_TTL_MS)) {
      return {
        success: true,
        categories: cachedOrderCatalog[cacheKey].categories,
        items: cachedOrderCatalog[cacheKey].items
      };
    }

    // 1. Fetch catalog categories for matching based on requested type
    let catQuery = "SELECT id, name, icon, type, keywords FROM categories";
    const catParams: any[] = [];
    if (type) {
      catQuery += " WHERE type = ?";
      catParams.push(type);
    }
    const [catLookupRows]: any = await pool.execute(catQuery, catParams).catch(() => [[]]);

    // Also fetch opposite type categories and signature words to prevent any cross-type leakage
    const oppositeWords = new Set<string>();
    if (type) {
      const oppositeType = type === 'restaurant' ? 'parlour' : 'restaurant';
      const [oppRows]: any = await pool.execute("SELECT id, name FROM categories WHERE type = ?", [oppositeType]).catch(() => [[]]);
      const cleanOppNoise = (str: string) => String(str || '').toLowerCase().replace(/[()[\]{}&/\\+\-_|,:]+/g, ' ').replace(/\s+/g, ' ').trim();
      for (const r of (Array.isArray(oppRows) ? oppRows : [])) {
        cleanOppNoise(r.name).split(/\s+/).forEach(w => {
          if (w.length > 2) oppositeWords.add(w);
        });
      }
      if (type === 'restaurant') {
        ['facial', 'haircut', 'hair cut', 'makeup', 'parlor', 'parlour', 'waxing', 'bleach', 'manicure', 'pedicure', 'threading', 'mehendi', 'bridal', 'salon', 'spa', 'makeover', 'ফেসিয়াল', 'পিয়ার্সিং', 'ওয়াক্সিং', 'থ্রেডিং', 'বউ সাজ'].forEach(w => oppositeWords.add(w.toLowerCase()));
      } else {
        ['biryani', 'kacchi', 'burger', 'pizza', 'curry', 'kabab', 'kebab', 'soup', 'salad', 'chowmein', 'noodles', 'pasta', 'fried rice', 'platter', 'appetizer', 'beverage', 'dessert', 'বিরিয়ানি', 'কাচ্চি', 'বার্গার', 'পিজ্জা', 'খিচুড়ি'].forEach(w => oppositeWords.add(w.toLowerCase()));
      }
    }

    // Helpers for dynamic string distance, stemming, and noise stripping
    const levenshteinDistance = (s1: string, s2: string): number => {
      const m = s1.length, n = s2.length;
      const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
      for (let i = 0; i <= m; i++) dp[i][0] = i;
      for (let j = 0; j <= n; j++) dp[0][j] = j;
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + cost
          );
        }
      }
      return dp[m][n];
    };

    const stringSimilarity = (s1: string, s2: string): number => {
      if (s1 === s2) return 1;
      if (!s1 || !s2) return 0;
      const maxLen = Math.max(s1.length, s2.length);
      if (maxLen === 0) return 1;
      return (maxLen - levenshteinDistance(s1, s2)) / maxLen;
    };

    const stemWord = (word: string): string => {
      let w = word.toLowerCase().trim();
      if (w.endsWith("'s") || w.endsWith("’s")) w = w.slice(0, -2);
      if (w.endsWith("ies") && w.length > 4) return w.slice(0, -3) + "y";
      if (w.endsWith("es") && w.length > 4) return w.slice(0, -2);
      if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) return w.slice(0, -1);
      if (w.endsWith("ing") && w.length > 5) return w.slice(0, -3);
      return w;
    };

    const RESTAURANT_BENGALI_MAP: Record<string, string> = {
      'বার্গার': 'burger',
      'বার্গার মেনু': 'burger',
      'বার্গার আইটেম': 'burger',
      'বার্গারস': 'burger',
      'বার্গার্স': 'burger',
      'পিজ্জা': 'pizza',
      'পিৎজা': 'pizza',
      'পাস্তা': 'pasta',
      'স্যান্ডউইচ': 'sandwich',
      'স্যান্ডউইচ আইটেম': 'sandwich',
      'সাব স্যান্ডউইচ': 'restaurant-sub-1748935097696',
      'চাওমিন': 'chowmein',
      'চাউমিন': 'chowmein',
      'নুডলস': 'restaurant-noodles-1748939912547',
      'বিরিয়ানি': 'biryani',
      'বিরিয়ানী': 'biryani',
      'বিরিয়ানি': 'biryani',
      'বিরিয়ানী আইটেম': 'biryani',
      'কাচ্চি': 'biryani',
      'কাচ্চি বিরিয়ানি': 'biryani',
      'তেহারি': '1751515311583',
      'তেহারী': '1751515311583',
      'খিচুড়ি': 'biryani',
      'খিচুরি': 'biryani',
      'পোলাও': '1750739924780',
      'পোলাউ': '1750739924780',
      'রাইস': 'rice',
      'ভাত': 'rice',
      'ফ্রাইড রাইস': 'rice',
      'প্লেটার': 'platter',
      'প্ল্যাটার': 'platter',
      'প্লাটার': 'platter',
      'ফ্যামিলি প্লেটার': 'platter',
      'শেয়ারিং প্লেটার': 'platter',
      'সেট মেন্যু': 'setMenu',
      'সেট মেনু': 'setMenu',
      'চাইনিজ সেট মেনু': 'setMenu',
      'স্যুপ': 'soup',
      'সুপ': 'soup',
      'সালাদ': 'salad',
      'কাবাব': '1750656745107',
      'চিকেন ফ্রাই': '1751462075077',
      'ফ্রাই': '1751462075077',
      'উইংস': 'wings',
      'চিকেন উইংস': 'wings',
      'চিকেন': 'chickenItem',
      'চিকেন আইটেম': 'chickenItem',
      'বিফ': 'beefItem',
      'বিফ আইটেম': 'beefItem',
      'মাটন': 'restaurant-mutton-1748939942155',
      'মাছ': 'fishItem',
      'ফিশ': 'fishItem',
      'চিংড়ি': 'prawn',
      'প্রন': 'prawn',
      'ড্রিংকস': 'drinks',
      'ড্রিংস': 'drinks',
      'পানীয়': 'drinks',
      'সফট ড্রিংকস': '1752381964967',
      'জুস': '1752300028513',
      'জুস আইটেম': '1752300028513',
      'কফি': 'coffee',
      'হট কফি': 'coffee',
      'কোল্ড কফি': 'coffee',
      'চা': 'restaurant-tea-1748939239504',
      'মিল্কশেক': 'milkShake',
      'মিল্ক শেক': 'milkShake',
      'শেক': 'milkShake',
      'আইসক্রিম': 'restaurant-ice-cream-1748869674339',
      'আইস ক্রিম': 'restaurant-ice-cream-1748869674339',
      'ফালুদা': '1750658574737',
      'মিষ্টি': 'dessert',
      'ডেজার্ট': 'dessert',
      'কেক': 'restaurant-cake-1748938658165',
      'পেস্ট্রি': 'restaurant-cake-1748938658165',
      'মোমো': 'momo',
      'শর্মা': '1751458964181',
      'মিট বক্স': 'meatBox',
      'নাচোস': 'nachos',
      'নাচোজ': 'nachos',
      'ফুচকা': '1751456637740',
      'চটপটি': '1750739155324',
      'লাচ্ছি': 'lassi',
      'বোরহানি': '1751355559932',
      'বোরহানী': '1751355559932',
      'মোজিতো': '1751355532501',
      'রুটি': '1750828763710',
      'নান': '1750737247234',
      'ভর্তা': 'restaurant-ভর্তা-/ভাজি-1748939523062',
      'ভাজি': 'restaurant-ভর্তা-/ভাজি-1748939523062',
      'অ্যাপেটাইজার': 'appetizers',
      'স্টার্টার': 'appetizers',
      'স্টার্টাস': 'appetizers',
      'স্ন্যাকস': 'appetizers',
      'সিজলিং': '1750830836638',
      'কারি': 'curry',
      'কারী': 'curry',
    };

    const PARLOUR_BENGALI_MAP: Record<string, string> = {
      'ফেসিয়াল': '1751265700816',
      'ফেসিয়াল': '1751265700816',
      'হাইড্রো ফেসিয়াল': '1751266665248',
      'ফেয়ার পলিশ': '1751266644008',
      'মেকআপ': '1751266937197',
      'মেকাপ': '1751266937197',
      'ব্রাইডাল': 'bridal-packages',
      'হেয়ার কাট': '1751266580778',
      'হেয়ার কাটিং': '1751266580778',
      'চুল কাটা': '1751266580778',
      'হেয়ার কালার': '1751266558297',
      'চুল কালার': '1751266558297',
      'হেয়ার ট্রিটমেন্ট': '1751266605058',
      'হেয়ার ওয়াশ': '1751277419705',
      'হেয়ার স্পা': 'hair-spa',
      'হেয়ার স্টাইল': '1751430774199',
      'হেয়ার স্ট্রেইট': '1751266625473',
      'রিবন্ডিং': 'eyelash-extensions',
      'কেরাটিন': 'keratin-treatment',
      'ম্যানিকিউর': '1751266763040',
      'মেনিকিউর': '1751266763040',
      'পেডিকিউর': '1751266763040',
      'মেনিকিউর ও পেডিকিউর': '1751266763040',
      'ওয়াক্সিং': '1751266442194',
      'ওয়াক্সিং': '1751266442194',
      'ওয়াক্স': '1756108223205',
      'ওয়াক্স': '1756108223205',
      'থ্রেডিং': '1751266476497',
      'পিয়ার্সিং': '1751265752015',
      'পিয়ার্সিং': '1751265752015',
      'মেহেদী': '1751266519977',
      'মেহেন্দি': '1751266519977',
      'ম্যাসাজ': '1751266700415',
      'বডি ম্যাসাজ': 'bodyCare',
      'নেইল আর্ট': 'nail-art',
      'নেইল কেয়ার': 'nailCare',
      'স্কিন হোয়াইটনিং': 'skin-whitening',
      'লেজার': 'laser-treatment',
      'প্যাকেজ': '1751349403111',
    };

    const cleanCategoryNoise = (str: string): string => {
      if (!str) return '';
      const cleaned = str
        .replace(/&amp;/gi, '&')
        .replace(/&#039;/gi, "'")
        .replace(/&quot;/gi, '"')
        // Remove portion annotations like (1:2), (1:3), (4 person)
        .replace(/\s*\([0-9\s:personx\-_]+\)/gi, '')
        // Strip standalone ratios e.g. 1:2
        .replace(/\b[0-9]+:[0-9]+\b/g, '')
        // Strip leading numbering e.g. 1. or 01-
        .replace(/^[0-9]+[.\-)]\s*/g, '')
        // Strip generic fluff only (preserve domain categories like platter, menu, starters, snacks, hot)
        .replace(/\b(items?|dishes|dish|gallery|delight|corner|zone|exclusive|delicious)\b/gi, '')
        .replace(/\b(ala\s*carte|master\s*chef)\b/gi, '')
        .replace(/['’]s\b/gi, '')
        .replace(/[()[\]{}&/\\+\-_|,:]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return cleaned || str.trim();
    };

    const catalogList = (Array.isArray(catLookupRows) ? catLookupRows : []).map((c: any) => {
      const rawName = String(c.name || '').trim();
      const englishBase = rawName.replace(/\s*\([\u0980-\u09FF\s,.\-]+\)/g, '').trim();
      const cleanedBase = cleanCategoryNoise(englishBase).toLowerCase();
      const tokens = cleanedBase.split(/\s+/).filter(t => t.length > 1);
      const stems = tokens.map(stemWord);
      const bengaliMatches = rawName.match(/[\u0980-\u09FF]+/g);
      const bengaliAlt = bengaliMatches ? bengaliMatches.join(' ').trim() : '';
      const rawKeywords = String(c.keywords || '').trim();
      const keywords = rawKeywords
        ? rawKeywords.split(/[,;\n]+/).map((k: string) => k.trim().toLowerCase()).filter(Boolean)
        : [];

      return {
        id: String(c.id),
        fullName: rawName,
        englishBase: englishBase,
        icon: c.icon || (type === 'parlour' ? '✨' : '🍽️'),
        cleanLower: cleanedBase,
        tokens: tokens,
        stems: stems,
        bengaliAlt: bengaliAlt,
        keywords: keywords
      };
    });

    // Fully dynamic category resolver with custom keywords, Bengali dictionary & stem matching
    const resolveCategory = (rawCategory: string) => {
      if (!rawCategory) return null;

      const rawTrimmed = rawCategory.trim();
      const rawLower = rawTrimmed.toLowerCase();
      const cleaned = cleanCategoryNoise(rawCategory).toLowerCase();

      // Custom User-Defined Category Keywords (Highest Priority)
      for (const cat of catalogList) {
        if (cat.keywords && cat.keywords.length > 0) {
          for (const kw of cat.keywords) {
            if (rawLower.includes(kw) || cleaned.includes(kw)) {
              return cat;
            }
          }
        }
      }

      // 0. Bengali match via dictionary and substring
      const rawBengaliMatches = rawTrimmed.match(/[\u0980-\u09FF]+/g);
      if (rawBengaliMatches) {
        const fullBengali = rawBengaliMatches.join(' ').trim();
        const bengaliMap = type === 'parlour' ? PARLOUR_BENGALI_MAP : RESTAURANT_BENGALI_MAP;

        if (bengaliMap[fullBengali]) {
          const match = catalogList.find(c => c.id === bengaliMap[fullBengali]);
          if (match) return match;
        }
        for (const word of rawBengaliMatches) {
          if (bengaliMap[word]) {
            const match = catalogList.find(c => c.id === bengaliMap[word]);
            if (match) return match;
          }
        }
        for (const cat of catalogList) {
          if (cat.bengaliAlt && (cat.bengaliAlt === fullBengali || cat.fullName.includes(fullBengali) || fullBengali.includes(cat.bengaliAlt))) {
            return cat;
          }
        }
      }

      if (!cleaned) return null;

      const rawTokens = cleaned.split(/\s+/).filter(t => t.length > 1);
      const rawStems = rawTokens.map(stemWord);
      const rawStemStr = rawStems.join(' ');

      // 1. Direct exact match on full name or cleaned base
      for (const cat of catalogList) {
        if (cat.cleanLower === cleaned || cat.cleanLower === rawLower || cat.fullName.toLowerCase() === rawLower) {
          return cat;
        }
      }

      // 2. Exact stem-string match
      for (const cat of catalogList) {
        const catStemStr = cat.stems.join(' ');
        if (catStemStr && (catStemStr === rawStemStr || catStemStr === stemWord(cleaned))) {
          return cat;
        }
      }

      // 3. Token Stem Inclusion (prioritize longest stem match >= 4 characters)
      let bestStemMatch: typeof catalogList[0] | null = null;
      let maxMatchedStemLen = 0;

      for (const cat of catalogList) {
        if (cat.stems.length === 0) continue;
        for (const catStem of cat.stems) {
          if (catStem.length >= 3 && rawStems.includes(catStem)) {
            if (catStem.length > maxMatchedStemLen) {
              maxMatchedStemLen = catStem.length;
              bestStemMatch = cat;
            }
          }
        }
      }
      if (bestStemMatch && maxMatchedStemLen >= 4) {
        return bestStemMatch;
      }

      // 4. Whole-word substring inclusion for multi-word categories
      for (const cat of catalogList) {
        if (cat.cleanLower.length >= 4) {
          const wordRegex = new RegExp(`\\b${cat.cleanLower}\\b`, 'i');
          if (wordRegex.test(cleaned)) {
            return cat;
          }
        }
      }

      // 5. Dynamic Levenshtein / Fuzzy matching for typos (e.g., "Appitizer", "Apprtizer", "Burgur")
      let bestFuzzyMatch: typeof catalogList[0] | null = null;
      let highestSim = 0;

      for (const cat of catalogList) {
        const wholeSim = stringSimilarity(cleaned, cat.cleanLower);
        if (wholeSim >= 0.82 && wholeSim > highestSim) {
          highestSim = wholeSim;
          bestFuzzyMatch = cat;
        }

        // Token-level fuzzy
        for (const rStem of rawStems) {
          if (rStem.length >= 5) {
            for (const cStem of cat.stems) {
              if (cStem.length >= 5) {
                const tokenSim = stringSimilarity(rStem, cStem);
                if (tokenSim >= 0.82 && tokenSim > highestSim) {
                  highestSim = tokenSim;
                  bestFuzzyMatch = cat;
                }
              }
            }
          }
        }
      }

      if (bestFuzzyMatch && highestSim >= 0.82) {
        return bestFuzzyMatch;
      }

      return null;
    };

    // Filter orders strictly by business type
    const orderConditions: string[] = ["items IS NOT NULL", "items != ''"];
    if (type === 'restaurant') {
      orderConditions.push(`(
        (id LIKE 'RO-%' OR orderId LIKE 'RO-%' OR (id NOT LIKE 'PO-%' AND (orderId IS NULL OR orderId NOT LIKE 'PO-%') AND id NOT LIKE 'PARLOUR-%'))
        AND LOWER(businessName) NOT LIKE '%parlor%'
        AND LOWER(businessName) NOT LIKE '%parlour%'
        AND LOWER(businessName) NOT LIKE '%makeover%'
        AND LOWER(businessName) NOT LIKE '%salon%'
        AND LOWER(businessName) NOT LIKE '%beauty%'
        AND LOWER(businessName) NOT LIKE '%spa%'
        AND LOWER(businessName) NOT LIKE '%pourler%'
      )`);
    } else if (type === 'parlour') {
      orderConditions.push(`(
        id LIKE 'PO-%' 
        OR orderId LIKE 'PO-%' 
        OR id LIKE 'PARLOUR-%'
        OR LOWER(businessName) LIKE '%parlor%'
        OR LOWER(businessName) LIKE '%parlour%'
        OR LOWER(businessName) LIKE '%makeover%'
        OR LOWER(businessName) LIKE '%salon%'
        OR LOWER(businessName) LIKE '%beauty%'
        OR LOWER(businessName) LIKE '%spa%'
        OR LOWER(businessName) LIKE '%pourler%'
      )`);
    }

    let query = `SELECT items FROM orders WHERE ${orderConditions.join(' AND ')} ORDER BY orderDate DESC`;
    if (limit > 0) {
      query += ` LIMIT ${Number(limit)}`;
    }

    const [rows]: any = await pool.execute(query);

    const categoriesMap = new Map<string, { id: string; name: string; icon: string; visibleToUsers: boolean }>();
    const itemsMap = new Map<string, any>();

    const slugify = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/(^-|-$)+/g, '');
    const titleCase = (text: string) => text.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

    (Array.isArray(rows) ? rows : []).forEach((r: any) => {
      let items: any[] = [];
      try {
        items = typeof r.items === 'string' ? JSON.parse(r.items) : r.items;
      } catch {}
      if (Array.isArray(items)) {
        items.forEach((it: any) => {
          if (!it || !it.name || typeof it.name !== 'string') return;
          const cleanName = it.name.trim();
          if (!cleanName || cleanName.length < 2) return;

          const rawCat = (it.categoryName || it.category || '').trim();

          // Reject items that match opposite business type
          if (oppositeWords.size > 0) {
            const checkText = (cleanName + ' ' + rawCat).toLowerCase();
            const words = checkText.replace(/[()[\]{}&/\\+\-_|,:]+/g, ' ').split(/\s+/);
            const hasOppositeWord = words.some(w => oppositeWords.has(w));
            if (hasOppositeWord) {
              return; // Skip cross-type contamination
            }
          }

          const cleanNameLower = cleanName.toLowerCase();

          // Check if item name directly matches any category's custom keywords (Highest Priority)
          let customItemKeywordCat: typeof catalogList[0] | null = null;
          for (const cat of catalogList) {
            if (cat.keywords && cat.keywords.length > 0) {
              for (const kw of cat.keywords) {
                if (kw && cleanNameLower.includes(kw)) {
                  customItemKeywordCat = cat;
                  break;
                }
              }
            }
            if (customItemKeywordCat) break;
          }

          const resolved = customItemKeywordCat || resolveCategory(rawCat);

          let catId = '';
          let catName = '';
          let catIcon = type === 'parlour' ? '✨' : '🍽️';

          if (resolved) {
            catId = resolved.id;
            catName = resolved.fullName;
            catIcon = resolved.icon || (type === 'parlour' ? '✨' : '🍽️');
          } else {
            const cleaned = cleanCategoryNoise(rawCat);
            const fallbackName = cleaned || (type === 'parlour' ? 'Popular Services' : 'Popular Items');
            catId = slugify(fallbackName) || (type === 'parlour' ? 'popular-services' : 'popular-items');
            catName = /[a-zA-Z]/.test(fallbackName) ? titleCase(fallbackName.replace(/-/g, ' ')) : fallbackName;
          }

          if (!categoriesMap.has(catId)) {
            categoriesMap.set(catId, {
              id: catId,
              name: catName,
              icon: catIcon,
              visibleToUsers: true
            });
          }

          const itemKey = (cleanName + '|||' + catId).toLowerCase();
          if (!itemsMap.has(itemKey)) {
            itemsMap.set(itemKey, {
              id: `order-${catId}-${slugify(cleanName)}`,
              name: cleanName,
              price: parseFloat(it.price) || 0,
              category: catId,
              categoryName: catName,
              imageUrl: it.image || it.imageUrl || '',
              description: it.options || it.description || '',
              subItems: Array.isArray(it.subItems) ? it.subItems : [],
              visibleToUsers: true,
              fromOrder: true
            });
          }
        });
      }
    });

    // Count items per category to place categories with the most items at the top
    const categoryItemCounts = new Map<string, number>();
    for (const it of itemsMap.values()) {
      if (it.category) {
        categoryItemCounts.set(it.category, (categoryItemCounts.get(it.category) || 0) + 1);
      }
    }

    const sortedCategories = Array.from(categoriesMap.values())
      .map(cat => ({
        ...cat,
        itemCount: categoryItemCounts.get(cat.id) || 0
      }))
      .sort((a, b) => (b.itemCount || 0) - (a.itemCount || 0));

    const result = {
      success: true,
      categories: sortedCategories,
      items: Array.from(itemsMap.values())
    };

    cachedOrderCatalog[cacheKey] = {
      categories: result.categories,
      items: result.items,
      timestamp: Date.now()
    };

    return result;
  } catch (error: any) {
    console.error('Error fetching order items and categories:', error);
    return { success: false, categories: [], items: [], error: error.message };
  }
}


