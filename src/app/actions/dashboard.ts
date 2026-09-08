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
    totalSlides: number;
    totalSpotlights: number;
    totalOffers: number;
    totalOrderItems: number;
    totalOrderCategories: number;
    totalCombinedItems: number;
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
      ).then(([rows]: any) => (Array.isArray(rows) ? rows : [])).catch(() => []),

      // 8: Order items and categories (from in-memory cache)
      getOrderItemsAndCategories(0).catch(() => ({ success: false, items: [], categories: [] }))
    ]);

    const totalTemplates = results[0].status === "fulfilled" ? results[0].value : 0;
    const catRows = results[1].status === "fulfilled" ? results[1].value : [];
    const itemRows = results[2].status === "fulfilled" ? results[2].value : [];
    const totalSlides = results[3].status === "fulfilled" ? results[3].value : 0;
    const totalSpotlights = results[4].status === "fulfilled" ? results[4].value : 0;
    const totalOffers = results[5].status === "fulfilled" ? results[5].value : 0;
    const orders = results[6].status === "fulfilled" ? results[6].value : [];
    const leads = results[7].status === "fulfilled" ? results[7].value : [];
    const orderData = results[8].status === "fulfilled" ? (results[8].value as any) : { items: [], categories: [] };

    let totalRestaurantCategories = 0;
    let totalParlourCategories = 0;
    for (const r of catRows) {
      if (r.type === "restaurant") totalRestaurantCategories = Number(r.count || 0);
      else if (r.type === "parlour") totalParlourCategories = Number(r.count || 0);
    }

    let totalRestaurantItems = 0;
    let totalParlourItems = 0;
    for (const r of itemRows) {
      if (r.type === "restaurant") totalRestaurantItems = Number(r.count || 0);
      else if (r.type === "parlour") totalParlourItems = Number(r.count || 0);
    }

    const totalOrderItems = orderData?.items?.length || 0;
    const totalOrderCategories = orderData?.categories?.length || 0;
    const totalCombinedItems = totalRestaurantItems + totalParlourItems + totalOrderItems;

    return {
      success: true,
      data: {
        counts: {
          totalTemplates,
          totalRestaurantCategories,
          totalParlourCategories,
          totalRestaurantItems,
          totalParlourItems,
          totalSlides,
          totalSpotlights,
          totalOffers,
          totalOrderItems,
          totalOrderCategories,
          totalCombinedItems,
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
