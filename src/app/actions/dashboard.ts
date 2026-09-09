"use server";

import pool from "@/lib/mysql";
import { getOrderItemsAndCategories } from "@/app/actions/orders";

export interface AdminDashboardData {
  counts: {
    totalTemplates: number;
    totalRestaurantCategories: number;
    totalParlourCategories: number;
    totalRestaurantItems: number;
    totalParlourItems: number;
    catalogRestaurantItems: number;
    orderRestaurantItems: number;
    catalogParlourItems: number;
    orderParlourItems: number;
    catalogRestaurantCategories: number;
    orderRestaurantCategories: number;
    catalogParlourCategories: number;
    orderParlourCategories: number;
    totalSlides: number;
    totalSpotlights: number;
    totalOffers: number;
    totalDuplicateItems: number;
    duplicateRestaurantItems: number;
    duplicateParlourItems: number;
    duplicateItemsSubtitle: string;
  };
  orders: Array<{
    id: string | number;
    orderDate?: string;
    total?: number;
    totalAmount?: number;
  }>;
  leads: Array<{
    id: string | number;
    created_at?: string;
  }>;
}

/**
 * Optimized single round-trip fetch for admin dashboard statistics.
 * Replaces individual heavy client-side requests with fast index-friendly queries.
 */
export async function getAdminDashboardSummary(): Promise<{
  success: boolean;
  data?: AdminDashboardData;
  error?: string;
}> {
  try {
    const results = await Promise.allSettled([
      // 0: Template count
      pool.execute("SELECT COUNT(*) as count FROM templates").then(([rows]: any) => Number(rows?.[0]?.count || 0)).catch(() => 0),
      
      // 1: Categories by type
      pool.execute("SELECT type, COUNT(*) as count FROM categories GROUP BY type").then(([rows]: any) => (rows || [])).catch(() => []),
      
      // 2: Menu items by type
      pool.execute("SELECT type, COUNT(*) as count FROM menu_items GROUP BY type").then(([rows]: any) => (rows || [])).catch(() => []),
      
      // 3: Dashboard slides count
      pool.execute("SELECT COUNT(*) as count FROM dashboard_slides").then(([rows]: any) => Number(rows?.[0]?.count || 0)).catch(() => 0),
      
      // 4: Dashboard spotlights count
      pool.execute("SELECT COUNT(*) as count FROM dashboard_spotlights").then(([rows]: any) => Number(rows?.[0]?.count || 0)).catch(() => 0),
      
      // 5: Exclusive offers count
      pool.execute("SELECT COUNT(*) as count FROM dashboard_exclusive_offers").then(([rows]: any) => Number(rows?.[0]?.count || 0)).catch(() => 0),
      
      // 6: Orders (only date and amounts needed for metrics & charts, no bulky JSON parsing)
      pool.execute(
        "SELECT id, totalAmount, DATE_FORMAT(orderDate, '%Y-%m-%d %H:%i:%s') as orderDate FROM orders ORDER BY orderDate DESC LIMIT 2000"
      ).then(([rows]: any) => (Array.isArray(rows) ? rows : [])).catch(() => []),

      // 7: Leads (only id and creation date needed for metrics & charts, NO subqueries)
      pool.execute(
        "SELECT id, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at FROM clients ORDER BY created_at DESC LIMIT 5000"
      ).then(([rows]: any) => (Array.isArray(rows) ? rows : [])),

      // 8: Restaurant order items and categories
      getOrderItemsAndCategories(0, 'restaurant').catch(() => ({ success: false, items: [], categories: [] })),

      // 9: Parlour order items and categories
      getOrderItemsAndCategories(0, 'parlour').catch(() => ({ success: false, items: [], categories: [] })),

      // 10: Menu item names and types for duplicate calculation
      pool.execute("SELECT name, type FROM menu_items").then(([rows]: any) => (Array.isArray(rows) ? rows : [])).catch(() => [])
    ]);

    const totalTemplates = results[0].status === "fulfilled" ? results[0].value : 0;
    const catRows = results[1].status === "fulfilled" ? results[1].value : [];
    const itemRows = results[2].status === "fulfilled" ? results[2].value : [];
    const totalSlides = results[3].status === "fulfilled" ? results[3].value : 0;
    const totalSpotlights = results[4].status === "fulfilled" ? results[4].value : 0;
    const totalOffers = results[5].status === "fulfilled" ? results[5].value : 0;
    const orders = results[6].status === "fulfilled" ? results[6].value : [];
    const leads = results[7].status === "fulfilled" ? results[7].value : [];
    const restOrderData = results[8].status === "fulfilled" ? (results[8].value as any) : { items: [], categories: [] };
    const parlOrderData = results[9].status === "fulfilled" ? (results[9].value as any) : { items: [], categories: [] };
    const catalogItemRows = results[10].status === "fulfilled" ? (results[10].value as any[]) : [];

    let catalogRestaurantCategories = 0;
    let catalogParlourCategories = 0;
    for (const r of catRows) {
      if (r.type === "restaurant") catalogRestaurantCategories = Number(r.count || 0);
      else if (r.type === "parlour") catalogParlourCategories = Number(r.count || 0);
    }

    let catalogRestaurantItems = 0;
    let catalogParlourItems = 0;
    for (const r of itemRows) {
      if (r.type === "restaurant") catalogRestaurantItems = Number(r.count || 0);
      else if (r.type === "parlour") catalogParlourItems = Number(r.count || 0);
    }

    const orderRestaurantItems = restOrderData?.items?.length || 0;
    const orderParlourItems = parlOrderData?.items?.length || 0;
    const orderRestaurantCategories = restOrderData?.categories?.length || 0;
    const orderParlourCategories = parlOrderData?.categories?.length || 0;

    const totalRestaurantItems = catalogRestaurantItems + orderRestaurantItems;
    const totalParlourItems = catalogParlourItems + orderParlourItems;
    const totalRestaurantCategories = catalogRestaurantCategories + orderRestaurantCategories;
    const totalParlourCategories = catalogParlourCategories + orderParlourCategories;

    // Calculate duplicate item names
    const countDuplicateNames = (items: Array<{ name?: string }>) => {
      const freq = new Map<string, number>();
      for (const it of items) {
        const name = String(it?.name || '').trim().toLowerCase();
        if (!name) continue;
        freq.set(name, (freq.get(name) || 0) + 1);
      }
      let duplicateCopies = 0;
      let duplicateNamesCount = 0;
      for (const count of freq.values()) {
        if (count > 1) {
          duplicateNamesCount += 1;
          duplicateCopies += (count - 1);
        }
      }
      return { duplicateCopies, duplicateNamesCount };
    };

    const restCatalogItems = catalogItemRows.filter(r => r.type === 'restaurant');
    const parlCatalogItems = catalogItemRows.filter(r => r.type === 'parlour');

    const allRestItems = [...restCatalogItems, ...(restOrderData?.items || [])];
    const allParlItems = [...parlCatalogItems, ...(parlOrderData?.items || [])];
    const allItems = [...catalogItemRows, ...(restOrderData?.items || []), ...(parlOrderData?.items || [])];

    const totalDupes = countDuplicateNames(allItems);
    const restDupes = countDuplicateNames(allRestItems);
    const parlDupes = countDuplicateNames(allParlItems);

    return {
      success: true,
      data: {
        counts: {
          totalTemplates,
          totalRestaurantCategories,
          totalParlourCategories,
          totalRestaurantItems,
          totalParlourItems,
          catalogRestaurantItems,
          orderRestaurantItems,
          catalogParlourItems,
          orderParlourItems,
          catalogRestaurantCategories,
          orderRestaurantCategories,
          catalogParlourCategories,
          orderParlourCategories,
          totalSlides,
          totalSpotlights,
          totalOffers,
          totalDuplicateItems: totalDupes.duplicateCopies,
          duplicateRestaurantItems: restDupes.duplicateCopies,
          duplicateParlourItems: parlDupes.duplicateCopies,
          duplicateItemsSubtitle: `${totalDupes.duplicateNamesCount} names repeated (${restDupes.duplicateCopies} Rest, ${parlDupes.duplicateCopies} Parlour)`,
        },
        orders,
        leads,
      },
    };
  } catch (error: any) {
    console.error("Error fetching admin dashboard summary:", error);
    return {
      success: false,
      error: error?.message || "Failed to load dashboard summary statistics.",
    };
  }
}
