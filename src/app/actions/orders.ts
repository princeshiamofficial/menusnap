
'use server';

import pool from '@/lib/mysql';

/**
 * Direct MySQL implementation for order submission.
 * Replaces the external PHP API for XAMPP Localhost.
 */
export async function submitOrderToMySql(orderPayload: any) {
  try {
    const { id, orderId, customer, items, totalAmount, status, orderDate, template } = orderPayload;

    await pool.execute(
      `INSERT INTO orders (
        id, orderId, customerName, customerEmail, customerPhone, customerAddress, 
        businessName, businessRole, templateName, totalAmount, status, orderDate,
        customerData, templateData, items
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        orderId,
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        customer.restaurant,
        customer.role,
        template.name,
        totalAmount,
        status,
        new Date(orderDate).toISOString().slice(0, 19).replace('T', ' '), 
        JSON.stringify(customer),
        JSON.stringify(template),
        JSON.stringify(items || [])
      ]
    );

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
      `SELECT *, DATE_FORMAT(orderDate, '%Y-%m-%dT%H:%i:%s.000Z') as utcOrderDate FROM orders ORDER BY orderDate DESC`
    );

    const formattedOrders = rows.map((order: any) => ({
      ...order,
      orderDate: order.utcOrderDate || order.orderDate,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []),
      customer: typeof order.customerData === 'string' ? JSON.parse(order.customerData) : (order.customerData || {}),
      template: typeof order.templateData === 'string' ? JSON.parse(order.templateData) : (order.templateData || {})
    }));

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
    const { id, subtotal, discount, total, totalAmount, customerData, status, templateData, items } = order;
    
    // Support both totalAmount and total for backward compatibility or different UI states
    const finalTotal = totalAmount !== undefined ? totalAmount : total;

    await pool.execute(
      `UPDATE orders 
       SET totalAmount = ?, customerData = ?, status = ?, templateData = ?, items = ?
       WHERE id = ?`,
      [
        finalTotal || 0, 
        JSON.stringify(customerData || {}), 
        status || 'pending', 
        JSON.stringify(templateData || {}), 
        JSON.stringify(items || []),
        id
      ]
    );
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
    const [rows] = await pool.execute(`SELECT *, DATE_FORMAT(orderDate, '%Y-%m-%dT%H:%i:%s.000Z') as utcOrderDate FROM orders WHERE id = ?`, [id]);
    const orders = rows as any[];
    if (orders.length === 0) return { success: false, message: 'Order not found' };

    const order = orders[0];
    
    return {
      success: true,
      data: {
        ...order,
        orderDate: order.utcOrderDate || order.orderDate,
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
    let query = 'SELECT * FROM categories';
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
    return { success: true, data: rows };
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
    
    const formatted = rows.map((item: any) => ({
      ...item,
      subItems: typeof item.subItems === 'string' ? JSON.parse(item.subItems) : (item.subItems || [])
    }));
    
    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('MySQL Items Fetch Error:', error);
    return { success: false, message: error.message || 'Failed to fetch menu items.' };
  }
}

/**
 * Fetch all templates from local MySQL.
 */
export async function getTemplatesFromMySql() {
  try {
    const [rows]: any = await pool.execute('SELECT * FROM templates ORDER BY createdAt DESC');
    
    const formatted = rows.map((template: any) => ({
      ...template,
      tags: typeof template.tags === 'string' ? JSON.parse(template.tags) : (template.tags || [])
    }));
    
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
    await pool.execute('DELETE FROM templates WHERE id = ?', [id]);
    return { success: true };
  } catch (error: any) {
    console.error('MySQL Template Delete Error:', error);
    return { success: false, message: error.message };
  }
}

