
'use server';

import { revalidatePath } from 'next/cache';
import pool from '@/lib/mysql';
import { formatUtcDateTime } from '@/lib/dateUtils';

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

    cachedOrderCatalog = null;
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
    const { id, name, icon, type, itemCount, visibleToUsers, sortOrder } = category;
    await pool.execute(
      `INSERT INTO categories (id, name, icon, type, itemCount, visibleToUsers, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       name = VALUES(name), icon = VALUES(icon), type = VALUES(type), 
       itemCount = VALUES(itemCount), visibleToUsers = VALUES(visibleToUsers), sortOrder = VALUES(sortOrder)`,
      [id, name, icon || '', type || 'restaurant', itemCount || 0, visibleToUsers !== false, sortOrder || 0]
    );
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

let cachedOrderCatalog: { categories: any[]; items: any[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

/**
 * Fetches unique items and categories extracted from past customer orders.
 * Automatically resolves and merges similar category names into standard canonical categories
 * (e.g. "Appetizer & Starter", "Appetizers (1:3)", "Appitizer" all merge into "Appetizers").
 * Employs in-memory caching for ultra-fast (<5ms) repeated responses.
 */
export async function getOrderItemsAndCategories(limit = 0) {
  try {
    const now = Date.now();
    if (limit === 0 && cachedOrderCatalog && (now - cachedOrderCatalog.timestamp < CACHE_TTL_MS)) {
      return {
        success: true,
        categories: cachedOrderCatalog.categories,
        items: cachedOrderCatalog.items
      };
    }

    // 1. Fetch catalog categories to match and merge against
    const [catLookupRows]: any = await pool.execute("SELECT id, name, icon FROM categories").catch(() => [[]]);
    const catalogList = (Array.isArray(catLookupRows) ? catLookupRows : []).map((c: any) => {
      const englishBase = c.name.replace(/\s*\([^)]*\)/g, '').trim();
      return {
        id: String(c.id),
        fullName: c.name.trim(),
        englishBase: englishBase,
        icon: c.icon || 'UtensilsCrossed',
        cleanLower: englishBase.toLowerCase()
      };
    });

    const cleanString = (str: string) => {
      return (str || '')
        .replace(/&amp;/g, '&')
        .replace(/&#039;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\s*\([^)]*\)/g, '')
        .replace(/^[0-9]+[.\-)]\s*/g, '')
        .replace(/\s*item(s)?$/i, '')
        .replace(/\s*dish(es)?$/i, '')
        .replace(/\s*&?\s*starter(s)?$/i, '')
        .replace(/\s*&?\s*snack(s)?$/i, '')
        .replace(/\s*gallery$/i, '')
        .replace(/'s$/i, '')
        .trim();
    };

    const canonicalRules: { target: string; targetId?: string; regex: RegExp }[] = [
      { target: 'Appetizers', targetId: 'appetizers', regex: /\b(?:app[eir]{1,3}ti[sz]er|starter)s?\b/i },
      { target: 'Burger', targetId: 'burger', regex: /\b(?:burg[eu]r)s?\b/i },
      { target: 'Pizza', targetId: 'pizza', regex: /\b(?:pizz?a)s?\b/i },
      { target: 'Chow Mein (চাউমিন)', targetId: 'chowmein', regex: /\b(?:chow\s*mein|chao\s*mein|chowmin|চাউমিন)\b/i },
      { target: 'Noodles', targetId: 'restaurant-noodles-1748939912547', regex: /\b(?:noodle|noodles|নুডলস)\b/i },
      { target: 'Pasta (পাস্তা)', targetId: 'pasta', regex: /\b(?:pasta|পাস্তা)\b/i },
      { target: 'Biriyani (বিরিয়ানি)', targetId: 'biryani', regex: /\b(?:bir[iy]ani|briyani|বিরিয়ানি)\b/i },
      { target: 'Tehari (তেহারি)', targetId: '1751515311583', regex: /\b(?:tehari|tehori|তেহারি)\b/i },
      { target: 'Kabab', targetId: '1750656745107', regex: /\b(?:k[ea]bab)s?\b/i },
      { target: 'Soup (স্যুপ)', targetId: 'soup', regex: /\b(?:soup|স্যুপ)\b/i },
      { target: 'Salad (সালাদ)', targetId: 'salad', regex: /\b(?:salad|সালাদ)\b/i },
      { target: 'Sandwich (স্যান্ডউইচ)', targetId: 'sandwich', regex: /\b(?:sandwich|স্যান্ডউইচ)\b/i },
      { target: 'Sub', targetId: 'restaurant-sub-1748935097696', regex: /\b(?:sub\s*sandwich|সাব\s*স্যান্ডউইচ)\b/i },
      { target: 'Shawarma (শর্মা)', targetId: '1751458964181', regex: /\b(?:sha?wa?r?ma|shorma|শর্মা)\b/i },
      { target: 'Beverage', targetId: '1752315376103', regex: /\b(?:beverage|soft\s*drink|cold\s*drink)s?\b/i },
      { target: 'Juice (জুস)', targetId: '1752300028513', regex: /\b(?:juice|জুস)s?\b/i },
      { target: 'Coffee', targetId: 'coffee', regex: /\b(?:coffee|espresso|cappuccino|latte|কফি)s?\b/i },
      { target: 'Dessert', targetId: 'dessert', regex: /\b(?:dessert|sweet|sweets)s?\b/i },
      { target: 'Falooda (ফালুদা)', targetId: '1750658574737', regex: /\b(?:fal[ou]{2}da|ফালুদা)\b/i },
      { target: 'Fuchka (ফুচকা)', targetId: '1751456637740', regex: /\b(?:fuch?ka|fuska|phuchka|ফুচকা)\b/i },
      { target: 'Chotpoti', targetId: '1750739155324', regex: /\b(?:chotpoti|চটপটি)\b/i },
      { target: 'Waffle (ওয়াফেল)', targetId: 'restaurant-waffle-1748943651359', regex: /\b(?:waffle|ওয়াফেল)\b/i },
      { target: 'Momo (মোমো)', targetId: 'momo', regex: /\b(?:momo|মোমো)\b/i },
      { target: 'Nachos (নাচোস)', targetId: 'nachos', regex: /\b(?:nacho|nachos|নাচো|নাচোস)\b/i },
      { target: 'Wings', targetId: 'wings', regex: /\b(?:wings|উইংস)\b/i },
      { target: 'Fry (ফ্রাই)', targetId: '1751462075077', regex: /\b(?:french\s*fr[iy]|fries|ফ্রাই)\b/i },
      { target: 'Platter', targetId: 'platter', regex: /\b(?:platter|প্ল্যাটার)\b/i },
      { target: 'Set Menu', targetId: 'setMenu', regex: /\b(?:set\s*menu|সেট\s*মেনু)\b/i },
      { target: 'Chicken Item', targetId: 'chickenItem', regex: /\b(?:chicken)\b/i },
      { target: 'Beef Item', targetId: 'beefItem', regex: /\b(?:beef)\b/i },
      { target: 'Fish Item', targetId: 'fishItem', regex: /\b(?:fish)\b/i },
      { target: 'Prawn', targetId: 'prawn', regex: /\b(?:prawn|shrimp|চিংড়ি)\b/i },
      { target: 'Rice', targetId: 'rice', regex: /\b(?:fried\s*rice|plain\s*rice)\b/i },
      // Parlour canonical targets
      { target: 'Facial', targetId: 'facial-basic', regex: /\b(?:facial|hydra\s*facial|ফেসিয়াল)\b/i },
      { target: 'Hair Cut', targetId: 'hair-cutting', regex: /\b(?:hair\s*cut|haircut|হেয়ার\s*কাটিং)\b/i },
      { target: 'Hair Color', targetId: 'hair-coloring', regex: /\b(?:hair\s*col[ou]{1,2}r|হেয়ার\s*কালার)\b/i },
      { target: 'Hair Treatment', targetId: 'hair-treatment', regex: /\b(?:hair\s*treatment|hair\s*spa|হেয়ার\s*ট্রিটমেন্ট)\b/i },
      { target: 'Hair Rebonding', targetId: 'eyelash-extensions', regex: /\b(?:rebonding|hair\s*straight|হেয়ার\s*স্ট্রেইট)\b/i },
      { target: 'Pedicure & Manicure', targetId: '1752391035133', regex: /\b(?:pedicure|manicure|পেডিকিউর|মেনিকিউর)\b/i },
      { target: 'Makeup', targetId: 'makeup', regex: /\b(?:makeup|make\s*up|makeover|মেকআপ)\b/i },
      { target: 'Mehendi & Henna', targetId: 'mehendi-henna', regex: /\b(?:mehendi|mehndi|mehedi|মেহেদী)\b/i },
      { target: 'Wax', targetId: 'body-waxing', regex: /\b(?:waxing|wax|ওয়াক্সিং|ওয়াক্স)\b/i },
      { target: 'Threading', targetId: 'eyebrow-threading', regex: /\b(?:threading|থ্রেডিং)\b/i },
    ];

    const canonicalMap = new Map<string, typeof catalogList[0]>();
    canonicalRules.forEach(rule => {
      const match = catalogList.find(c => 
        (rule.targetId && c.id === rule.targetId) ||
        c.fullName.toLowerCase() === rule.target.toLowerCase() ||
        c.englishBase.toLowerCase() === rule.target.toLowerCase()
      );
      if (match) canonicalMap.set(rule.target, match);
    });

    const resolveCategory = (rawCategory: string) => {
      if (!rawCategory) return null;
      const clean = cleanString(rawCategory);

      // Direct exact match
      const exact = catalogList.find(c => 
        c.fullName.toLowerCase() === clean.toLowerCase() ||
        c.englishBase.toLowerCase() === clean.toLowerCase()
      );
      if (exact) return exact;

      // Regex canonical rules
      for (const rule of canonicalRules) {
        if (rule.regex.test(clean) || rule.regex.test(rawCategory)) {
          if (canonicalMap.has(rule.target)) {
            return canonicalMap.get(rule.target)!;
          }
        }
      }

      // Substring matching
      const lowerClean = clean.toLowerCase();
      for (const cat of catalogList) {
        const catLower = cat.englishBase.toLowerCase();
        if (catLower.length >= 4 && (lowerClean.includes(catLower) || catLower.includes(lowerClean))) {
          return cat;
        }
      }
      return null;
    };

    const query = limit > 0
      ? `SELECT items FROM orders WHERE items IS NOT NULL AND items != '' ORDER BY orderDate DESC LIMIT ${Number(limit)}`
      : `SELECT items FROM orders WHERE items IS NOT NULL AND items != '' ORDER BY orderDate DESC`;

    const [rows]: any = await pool.execute(query);

    const categoriesMap = new Map<string, { id: string; name: string; icon: string; visibleToUsers: boolean }>();
    const itemsMap = new Map<string, any>();

    const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
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
          const resolved = resolveCategory(rawCat);

          let catId = '';
          let catName = '';
          let catIcon = '🍽️';

          if (resolved) {
            catId = resolved.id;
            catName = resolved.fullName;
            catIcon = resolved.icon || '🍽️';
          } else {
            const cleaned = cleanString(rawCat) || 'Popular Items';
            catId = slugify(cleaned) || 'popular-items';
            catName = titleCase(cleaned.replace(/-/g, ' '));
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

    const result = {
      success: true,
      categories: Array.from(categoriesMap.values()),
      items: Array.from(itemsMap.values())
    };

    if (limit === 0) {
      cachedOrderCatalog = {
        categories: result.categories,
        items: result.items,
        timestamp: Date.now()
      };
    }

    return result;
  } catch (error: any) {
    console.error('Error fetching order items and categories:', error);
    return { success: false, categories: [], items: [], error: error.message };
  }
}


