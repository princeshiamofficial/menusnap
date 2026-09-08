
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

    // 1. Fetch catalog categories to match and merge against dynamically
    const [catLookupRows]: any = await pool.execute("SELECT id, name, icon FROM categories").catch(() => [[]]);

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

    const cleanCategoryNoise = (str: string): string => {
      if (!str) return '';
      return str
        .replace(/&amp;/gi, '&')
        .replace(/&#039;/gi, "'")
        .replace(/&quot;/gi, '"')
        // Remove Bengali script inside parentheses e.g. (অ্যাপেটাইজার)
        .replace(/\s*\([\u0980-\u09FF\s,.\-]+\)/g, '')
        // Remove portion annotations like (1:2), (1:3), (4 person)
        .replace(/\s*\([0-9\s:personx\-_]+\)/gi, '')
        // Strip standalone ratios e.g. 1:2
        .replace(/\b[0-9]+:[0-9]+\b/g, '')
        // Strip leading numbering e.g. 1. or 01-
        .replace(/^[0-9]+[.\-)]\s*/g, '')
        // Strip generic filler words at word boundaries
        .replace(/\b(items?|dishes|dish|gallery|delight|corner|zone|platter|menu|exclusive|special|hot|delicious)\b/gi, '')
        .replace(/\b(ala\s*carte|master\s*chef)\b/gi, '')
        .replace(/&?\s*(starters?|snacks?)\b/gi, '')
        .replace(/['’]s\b/gi, '')
        .replace(/[()\[\]{}&/\\+\-_|,:]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const catalogList = (Array.isArray(catLookupRows) ? catLookupRows : []).map((c: any) => {
      const rawName = String(c.name || '').trim();
      const englishBase = rawName.replace(/\s*\([\u0980-\u09FF\s,.\-]+\)/g, '').trim();
      const cleanedBase = cleanCategoryNoise(englishBase).toLowerCase();
      const tokens = cleanedBase.split(/\s+/).filter(t => t.length > 1);
      const stems = tokens.map(stemWord);
      const bengaliMatches = rawName.match(/[\u0980-\u09FF]+/g);
      const bengaliAlt = bengaliMatches ? bengaliMatches.join(' ').trim() : '';

      return {
        id: String(c.id),
        fullName: rawName,
        englishBase: englishBase,
        icon: c.icon || '🍽️',
        cleanLower: cleanedBase,
        tokens: tokens,
        stems: stems,
        bengaliAlt: bengaliAlt
      };
    });

    // Fully dynamic category resolver with zero hardcoded category names
    const resolveCategory = (rawCategory: string) => {
      if (!rawCategory) return null;

      const rawLower = rawCategory.toLowerCase().trim();
      const cleaned = cleanCategoryNoise(rawCategory).toLowerCase();

      // 0. Bengali match if present
      const rawBengaliMatches = rawCategory.match(/[\u0980-\u09FF]+/g);
      if (rawBengaliMatches) {
        const rawBengaliStr = rawBengaliMatches.join(' ').trim();
        for (const cat of catalogList) {
          if (cat.bengaliAlt && (cat.bengaliAlt === rawBengaliStr || cat.fullName.includes(rawBengaliStr) || rawBengaliStr.includes(cat.bengaliAlt))) {
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
            const cleaned = cleanCategoryNoise(rawCat) || 'Popular Items';
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


