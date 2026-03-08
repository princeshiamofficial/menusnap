
"use client";

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Hand,
  CalendarDays,
  BarChart3,
  ShoppingCart,
  Layers,
  UtensilsCrossed,
  Sparkles,
  LayoutList,
  FolderHeart,
  AlertTriangle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getMonth,
  parseISO,
  subDays,
  isAfter,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
  isWithinInterval
} from 'date-fns';
import { getOrdersFromMySql, getTemplatesFromMySql, getCategoriesFromMySql, getMenuItemsFromMySql } from '@/app/actions/orders';

interface StatCardAdminProps {
  title: string;
  value: string;
  icon: React.ElementType;
  iconBgClass: string;
  iconTextClass: string;
}

function StatCardAdmin({ title, value, icon: Icon, iconBgClass, iconTextClass }: StatCardAdminProps): ReactNode {
  return (
    <Card className={`rounded-md border-0 text-white ${iconBgClass}`}>
      <CardContent className="p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
        <div className="flex justify-between items-start w-full relative z-10">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-90">{title}</h3>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 opacity-80" />
        </div>
        <div className="mt-4 relative z-10 flex flex-col">
          <h2 className="text-3xl sm:text-4xl font-bold mb-1">{value}</h2>
          <p className="text-xs sm:text-sm opacity-90">{title === 'Total Templates' ? 'Available layouts' : 'Overall count'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const adminStatConfigs: (Omit<StatCardAdminProps, 'value'> & { id: string })[] = [
  { id: "totalOrders", title: "Total Orders", icon: ShoppingCart, iconBgClass: "bg-orange-500", iconTextClass: "text-white" },
  { id: "totalTemplates", title: "Total Templates", icon: Layers, iconBgClass: "bg-teal-600", iconTextClass: "text-white" },
  { id: "totalRestaurantItems", title: "Total Restaurant Items", icon: UtensilsCrossed, iconBgClass: "bg-amber-600", iconTextClass: "text-white" },
  { id: "totalParlourItems", title: "Total Parlour Items", icon: Sparkles, iconBgClass: "bg-indigo-500", iconTextClass: "text-white" },
  { id: "totalRestaurantCategories", title: "Total Restaurant Categories", icon: LayoutList, iconBgClass: "bg-emerald-500", iconTextClass: "text-white" },
  { id: "totalParlourCategories", title: "Total Parlour Categories", icon: FolderHeart, iconBgClass: "bg-rose-500", iconTextClass: "text-white" },
];

interface ChartDataItem {
  name: string;
  orders: number;
}

interface ApiOrder {
  id: string;
  createdAt?: string;
  orderDate?: string;
  date?: string;
}

const dateRangeFilterOptions = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
  { value: "all_time", label: "All Time" },
  { value: "custom", label: "Custom Range", disabled: true },
];

const dateRangeLabels: Record<string, string> = dateRangeFilterOptions.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {} as Record<string, string>);


export default function MAdminDashboardPage() {
  const { isAdminLoggedIn, adminLoading, adminLogout } = useAdminAuth();
  const [statsData, setStatsData] = useState<Record<string, number | string>>({});
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [allApiOrders, setAllApiOrders] = useState<ApiOrder[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  const [selectedDateRange] = useState<string>('30days');

  useEffect(() => {
    async function fetchAllAdminStats() {
      if (!isAdminLoggedIn || adminLoading) {
        setIsLoadingStats(false);
        setChartData([]);
        setAllApiOrders([]);
        const initialStats: Record<string, number | string> = {};
        adminStatConfigs.forEach(config => {
          initialStats[config.id] = 0;
        });
        setStatsData(initialStats);
        return;
      }

      setIsLoadingStats(true);
      setStatsError(null);

      try {
        const [
          catResult,
          itemResult,
          templateResult,
          orderResult
        ] = await Promise.all([
          getCategoriesFromMySql(),
          getMenuItemsFromMySql(),
          getTemplatesFromMySql(),
          getOrdersFromMySql(),
        ]);

        const combinedStatsData: Record<string, number | string> = {};
        
        if (catResult.success) {
            const categories = catResult.data as any[];
            combinedStatsData.totalRestaurantCategories = categories.filter(c => c.type === 'restaurant').length;
            combinedStatsData.totalParlourCategories = categories.filter(c => c.type === 'parlour').length;
        }

        if (itemResult.success) {
            const items = itemResult.data as any[];
            combinedStatsData.totalRestaurantItems = items.filter(i => i.type === 'restaurant').length;
            combinedStatsData.totalParlourItems = items.filter(i => i.type === 'parlour').length;
        }

        if (templateResult.success) {
            combinedStatsData.totalTemplates = (templateResult.data as any[]).length;
        }

        if (orderResult.success) {
            const orders = orderResult.data as any[];
            combinedStatsData.totalOrders = orders.length;
            setAllApiOrders(orders);
        }

        setStatsData(combinedStatsData);

      } catch (e: any) {
        setStatsError(e.message || "An unexpected error occurred.");
        const defaultErrorStats: Record<string, number | string> = {};
        adminStatConfigs.forEach(config => defaultErrorStats[config.id] = 0);
        setStatsData(defaultErrorStats);
        setAllApiOrders([]);
      } finally {
        setIsLoadingStats(false);
      }
    }
    fetchAllAdminStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminLoggedIn, adminLoading]);


  useEffect(() => {
    if (!allApiOrders.length && !isLoadingStats) {
      setChartData([]);
      return;
    }
    if (isLoadingStats) return;

    let dateFilterRange: { start: Date; end: Date } | null = null;
    const now = new Date();

    switch (selectedDateRange) {
      case 'today':
        dateFilterRange = { start: startOfDay(now), end: endOfDay(now) };
        break;
      case 'yesterday':
        const yesterday = subDays(now, 1);
        dateFilterRange = { start: startOfDay(yesterday), end: endOfDay(yesterday) };
        break;
      case '7days':
        dateFilterRange = { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
        break;
      case '30days':
        dateFilterRange = { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
        break;
      case 'this_month':
        dateFilterRange = { start: startOfMonth(now), end: endOfMonth(now) };
        break;
      case 'last_month':
        const prevMonthStart = startOfMonth(subMonths(now, 1));
        dateFilterRange = { start: prevMonthStart, end: endOfMonth(prevMonthStart) };
        break;
      case 'this_year':
        dateFilterRange = { start: startOfYear(now), end: endOfYear(now) };
        break;
      case 'last_year':
        const prevYearStart = startOfYear(subYears(now, 1));
        dateFilterRange = { start: prevYearStart, end: endOfYear(prevYearStart) };
        break;
      case 'all_time':
      case 'custom':
      default:
        dateFilterRange = null;
        break;
    }

    const ordersToProcess = dateFilterRange
      ? allApiOrders.filter(order => {
        const orderDateField = order.createdAt || order.orderDate || order.date;
        if (!orderDateField) return false;
        try {
          const orderDate = typeof orderDateField === 'string' ? parseISO(orderDateField) : new Date(orderDateField);
          if (isNaN(orderDate.getTime())) return false; // Check for invalid date
          return isWithinInterval(orderDate, dateFilterRange!);
        } catch {
          return false;
        }
      })
      : allApiOrders;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyOrders: ChartDataItem[] = monthNames.map(name => ({ name, orders: 0 }));

    ordersToProcess.forEach(order => {
      try {
        const orderDateField = order.createdAt || order.orderDate || order.date;
        if (orderDateField) {
          const orderDate = typeof orderDateField === 'string' ? parseISO(orderDateField) : new Date(orderDateField);
          if (isNaN(orderDate.getTime())) return;
          const monthIndex = getMonth(orderDate);
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyOrders[monthIndex].orders += 1;
          }
        }
      } catch (e) {
        console.warn("Could not parse order date for chart aggregation:", order, e);
      }
    });
    setChartData(monthlyOrders);

  }, [allApiOrders, selectedDateRange, isLoadingStats]);


  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted dark:bg-neutral-900 p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto bg-card" />
          <Skeleton className="h-8 w-48 mx-auto bg-card" />
          <Skeleton className="h-6 w-64 mx-auto bg-card" />
          <Skeleton className="h-10 w-full mt-4 bg-card" />
          <Skeleton className="h-10 w-full bg-card" />
        </div>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
        <AdminLoginForm />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="rounded-lg bg-gradient-to-r from-slate-900 via-amber-700 to-primary p-6 shadow-lg text-white">
        <h2 className="text-3xl font-bold flex items-center">
          Welcome Admin <Hand className="ml-2 h-8 w-8 text-yellow-400" />
        </h2>
        <p className="mt-1 text-sm text-slate-200">
          Here's an overview of your business activity.
        </p>
      </div>



      {isLoadingStats && !statsData.totalOrders ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {adminStatConfigs.map((statConfig) => (
            <Card key={statConfig.id} className={`rounded-md border-0 ${statConfig.iconBgClass}`}>
              <CardContent className="p-4 sm:p-5 h-[120px] flex flex-col justify-between">
                <div className="flex justify-between items-start w-full">
                  <Skeleton className="h-4 w-1/2 bg-white/30" />
                  <Skeleton className="h-6 w-6 rounded-full bg-white/30" />
                </div>
                <Skeleton className="h-8 w-1/4 mt-4 bg-white/40" />
                <Skeleton className="h-3 w-1/3 mt-2 bg-white/20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : statsError ? (
        <div className="flex flex-col items-center justify-center text-center py-10 bg-card border border-destructive/50 rounded-lg shadow-md">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Statistics</h2>
          <p className="text-muted-foreground max-w-md">{statsError}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {adminStatConfigs.map((statConfig) => (
            <StatCardAdmin
              key={statConfig.id}
              title={statConfig.title}
              value={String(statsData[statConfig.id] ?? '0')}
              icon={statConfig.icon}
              iconBgClass={statConfig.iconBgClass}
              iconTextClass={statConfig.iconTextClass}
            />
          ))}
        </div>
      )}


      <Card className="shadow-md rounded-lg mt-8">
        <CardHeader className="bg-card border-b">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">Orders Overview (Monthly)</CardTitle>
              <CardDescription>Based on selected date range: {dateRangeLabels[selectedDateRange] || 'All Time'}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 h-[350px]">
          {isLoadingStats && !chartData.length ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-3/4 w-full" />
            </div>
          ) : !isLoadingStats && chartData.reduce((acc, curr) => acc + curr.orders, 0) === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No order data available for the selected period.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 20,
                  left: -20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

    </div>
  );
}



















