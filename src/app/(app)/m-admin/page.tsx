
"use client";

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from "@/lib/utils";
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
  AlertTriangle,
  Menu,
  Users
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
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
  isWithinInterval,
  format,
  eachDayOfInterval,
  getHours
} from 'date-fns';
import { getOrdersFromMySql, getTemplatesFromMySql, getCategoriesFromMySql, getMenuItemsFromMySql } from '@/app/actions/orders';
import { getLeads, getLeadsTrend } from '@/app/actions/clients';
import { AdminSendNotification } from '@/components/admin/admin-send-notification';

interface StatCardAdminProps {
  title: string;
  value: string;
  icon: React.ElementType;
  iconBgClass: string;
}

function StatCardAdmin({ title, value, icon: Icon, iconBgClass }: StatCardAdminProps): ReactNode {
  // Extract base color from bg-xxx-500
  const parts = iconBgClass.split('-');
  const baseColor = parts[1]; // e.g. "orange" or "emerald"
  const tintClass = `bg-${baseColor}-100`;
  const iconColorClass = `text-${baseColor}-600`;

  return (
    <Card className="rounded-xl border-0 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.04)] transition-all hover:shadow-md duration-300 overflow-hidden">
      <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
        <div className={cn(
          "h-10 w-10 sm:h-12 sm:w-14 rounded-full flex items-center justify-center shrink-0",
          tintClass
        )}>
          <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", iconColorClass)} />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-[10px] sm:text-[12px] font-medium text-slate-400 mb-0.5 truncate leading-tight">
            {title}
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight leading-none truncate">
            {value}
          </h2>
        </div>
      </CardContent>
    </Card>
  );
}

const adminStatConfigs: (Omit<StatCardAdminProps, 'value'> & { id: string })[] = [
  { id: "totalLeads", title: "Total Leads", icon: Users, iconBgClass: "bg-blue-600" },
  { id: "totalOrders", title: "Total Orders", icon: ShoppingCart, iconBgClass: "bg-orange-500" },
  { id: "totalTemplates", title: "Total Templates", icon: Layers, iconBgClass: "bg-teal-600" },
  { id: "totalRestaurantItems", title: "Total Restaurant Items", icon: UtensilsCrossed, iconBgClass: "bg-amber-600" },
  { id: "totalParlourItems", title: "Total Parlour Items", icon: Sparkles, iconBgClass: "bg-indigo-500" },
  { id: "totalRestaurantCategories", title: "Total Restaurant Categories", icon: LayoutList, iconBgClass: "bg-emerald-500" },
  { id: "totalParlourCategories", title: "Total Parlour Categories", icon: FolderHeart, iconBgClass: "bg-rose-500" },
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
  utcOrderDate?: string;
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
  const { adminLoading } = useAdminAuth();
  const [statsData, setStatsData] = useState<Record<string, number | string>>({});
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [allApiOrders, setAllApiOrders] = useState<ApiOrder[]>([]);
  const [allApiLeads, setAllApiLeads] = useState<any[]>([]);
  const [allApiCategories, setAllApiCategories] = useState<any[]>([]);
  const [allApiItems, setAllApiItems] = useState<any[]>([]);
  const [allApiTemplates, setAllApiTemplates] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [leadsChartData, setLeadsChartData] = useState<any[]>([]);

  const [selectedDateRange, setSelectedDateRange] = useState<string>('all_time');

  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    async function fetchAllAdminStats() {
      if (adminLoading) {
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
          orderResult,
          leadsResult,
          leadsTrendResult
        ] = await Promise.all([
          getCategoriesFromMySql(),
          getMenuItemsFromMySql(),
          getTemplatesFromMySql(),
          getOrdersFromMySql(),
          getLeads(1, 5000),
        ]);

        if (catResult.success) {
            setAllApiCategories(catResult.data as any[]);
        }

        if (itemResult.success) {
            setAllApiItems(itemResult.data as any[]);
        }

        if (templateResult.success) {
            setAllApiTemplates(templateResult.data as any[]);
        }

        if (orderResult.success) {
            const orders = orderResult.data as any[];
            setAllApiOrders(orders);
        }

        if (leadsResult.success) {
            setAllApiLeads(leadsResult.leads);
        }

        // We don't need to put anything else in combinedStatsData here,
        // because setStatsData is now handled in the main processing useEffect.

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
  }, [adminLoading]);


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
          const orderDateField = order.utcOrderDate || order.createdAt || order.orderDate || order.date;
          if (!orderDateField) return false;
          try {
            const orderDate = typeof orderDateField === 'string' ? parseISO(orderDateField) : new Date(orderDateField);
            if (isNaN(orderDate.getTime())) return false; 
            return isWithinInterval(orderDate, dateFilterRange!);
          } catch {
            return false;
          }
        })
      : allApiOrders;

    // --- LEADS PROCESSING ---
    const leadsToProcess = dateFilterRange
      ? allApiLeads.filter(lead => {
          if (!lead.created_at) return false;
          try {
            const leadDate = typeof lead.created_at === 'string' ? parseISO(lead.created_at) : new Date(lead.created_at);
            if (isNaN(leadDate.getTime())) return false; 
            return isWithinInterval(leadDate, dateFilterRange!);
          } catch {
            return false;
          }
        })
      : allApiLeads;

    const useDailyView = ['today', 'yesterday', '7days', '30days', 'this_month'].includes(selectedDateRange) && !!dateFilterRange;

    // --- HOURLY VIEW (Today/Yesterday) ---
    const useHourlyView = ['today', 'yesterday'].includes(selectedDateRange) && !!dateFilterRange;

    if (useHourlyView) {
      const hours = Array.from({ length: 24 }, (_, i) => ({ 
        name: `${i}:00`, 
        orders: 0,
        leads: 0 
      }));

      ordersToProcess.forEach(order => {
        try {
          const dateVal = order.utcOrderDate || order.orderDate || order.createdAt;
          if (!dateVal) return;
          const orderDate = typeof dateVal === 'string' ? parseISO(dateVal) : new Date(dateVal);
          const hour = getHours(orderDate);
          if (hour >= 0 && hour < 24) hours[hour].orders += 1;
        } catch {}
      });

      leadsToProcess.forEach(lead => {
        try {
          const dateVal = lead.created_at;
          if (!dateVal) return;
          const leadDate = typeof dateVal === 'string' ? parseISO(dateVal) : new Date(dateVal);
          const hour = getHours(leadDate);
          if (hour >= 0 && hour < 24) hours[hour].leads += 1;
        } catch {}
      });

      setChartData(hours.map(h => ({ name: h.name, orders: h.orders })));
      setLeadsChartData(hours.map(h => ({ name: h.name, leads: h.leads })));

    } else if (useDailyView) {
      const days = eachDayOfInterval({ start: dateFilterRange!.start, end: dateFilterRange!.end });
      
      // Orders
      const dailyOrders: ChartDataItem[] = days.map((day: Date) => ({ name: format(day, "MMM dd"), orders: 0 }));
      ordersToProcess.forEach(order => {
        try {
          const dateVal = order.utcOrderDate || order.orderDate || order.createdAt;
          if (!dateVal) return;
          const orderDate = typeof dateVal === 'string' ? parseISO(dateVal) : new Date(dateVal);
          const dayStr = format(orderDate, "MMM dd");
          const entry = dailyOrders.find(d => d.name === dayStr);
          if (entry) entry.orders += 1;
        } catch {}
      });
      setChartData(dailyOrders);

      // Leads
      const dailyLeads = days.map((day: Date) => ({ name: format(day, "MMM dd"), leads: 0 }));
      leadsToProcess.forEach(lead => {
        try {
          const dateVal = lead.created_at;
          if (!dateVal) return;
          const leadDate = typeof dateVal === 'string' ? parseISO(dateVal) : new Date(dateVal);
          const dayStr = format(leadDate, "MMM dd");
          const entry = dailyLeads.find(d => d.name === dayStr);
          if (entry) entry.leads += 1;
        } catch {}
      });
      setLeadsChartData(dailyLeads);

    } else {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      // Orders
      const monthlyOrders: ChartDataItem[] = monthNames.map(name => ({ name, orders: 0 }));
      ordersToProcess.forEach(order => {
        try {
          const dateVal = order.utcOrderDate || order.orderDate || order.createdAt;
          if (!dateVal) return;
          const orderDate = typeof dateVal === 'string' ? parseISO(dateVal) : new Date(dateVal);
          const monthIdx = getMonth(orderDate);
          if (monthIdx >= 0 && monthIdx < 12) monthlyOrders[monthIdx].orders += 1;
        } catch {}
      });
      setChartData(monthlyOrders);

      // Leads
      const monthlyLeads = monthNames.map(name => ({ name, leads: 0 }));
      leadsToProcess.forEach(lead => {
        try {
          const dateVal = lead.created_at;
          if (!dateVal) return;
          const leadDate = typeof dateVal === 'string' ? parseISO(dateVal) : new Date(dateVal);
          const monthIdx = getMonth(leadDate);
          if (monthIdx >= 0 && monthIdx < 12) monthlyLeads[monthIdx].leads += 1;
        } catch {}
      });
      setLeadsChartData(monthlyLeads);
    }

    // --- DYNAMIC CARD STATS ---
    const dynamicStats: Record<string, number | string> = {};
    
    // Total Leads (Filtered)
    dynamicStats.totalLeads = leadsToProcess.length;
    
    // Total Orders (Filtered)
    dynamicStats.totalOrders = ordersToProcess.length;

    // Remaining stats (mostly static or computed from the full data, but we can filter if needed)
    // For now, these are the current catalog totals
    dynamicStats.totalTemplates = (allApiTemplates || []).length;
    
    const catData = allApiCategories || [];
    dynamicStats.totalRestaurantCategories = catData.filter((c: any) => c.type === 'restaurant').length;
    dynamicStats.totalParlourCategories = catData.filter((c: any) => c.type === 'parlour').length;

    const itemData = allApiItems || [];
    dynamicStats.totalRestaurantItems = itemData.filter((i: any) => i.type === 'restaurant').length;
    dynamicStats.totalParlourItems = itemData.filter((i: any) => i.type === 'parlour').length;

    setStatsData(dynamicStats);

  }, [allApiOrders, allApiLeads, allApiCategories, allApiItems, allApiTemplates, selectedDateRange, isLoadingStats]);


  // No local auth checks needed anymore, handled by layout


  return (
    <div className="space-y-6 pt-16 p-4 sm:p-6 md:p-8 w-full overflow-x-hidden">
      <div className="rounded-lg bg-gradient-to-r from-slate-900 via-amber-700 to-primary p-6 shadow-lg text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold flex items-center">
            Welcome Admin <Hand className="ml-2 h-8 w-8 text-yellow-400" />
          </h2>
          <p className="text-sm text-slate-200">
            Here's an overview of your business activity.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
          <CalendarDays className="h-4 w-4 ml-2 text-slate-200" />
          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-[180px] h-10 border-none bg-transparent hover:bg-white/10 text-white font-medium text-sm focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1 min-w-[200px]">
              <div className="px-3 py-2 text-sm font-bold text-slate-700 border-b border-slate-100 mb-1">
                Filter by Date
              </div>
              
              {dateRangeFilterOptions.filter(o => o.value !== 'custom' && o.value !== 'all_time').map(option => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  disabled={option.disabled}
                  hideIndicator={true}
                  className="text-sm font-medium rounded-lg py-2.5 px-3 my-0.5 focus:bg-orange-500 focus:text-white data-[state=checked]:bg-orange-500 data-[state=checked]:text-white cursor-pointer transition-colors"
                >
                  {option.label}
                </SelectItem>
              ))}

              <SelectItem 
                value="all_time"
                hideIndicator={true}
                className="text-sm font-medium rounded-lg py-2.5 px-3 my-0.5 focus:bg-orange-500 focus:text-white data-[state=checked]:bg-orange-500 data-[state=checked]:text-white cursor-pointer transition-colors"
              >
                All Time
              </SelectItem>

              <div className="border-t border-slate-100 my-1" />
              
              <SelectItem 
                value="custom"
                disabled={true}
                hideIndicator={true}
                className="text-sm font-medium rounded-lg py-2.5 px-3 my-0.5 focus:bg-orange-500 focus:text-white data-[state=checked]:bg-orange-500 data-[state=checked]:text-white cursor-pointer transition-colors"
              >
                Custom Range
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>



      {isLoadingStats && !statsData.totalOrders ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {adminStatConfigs.map((statConfig) => (
            <Card key={statConfig.id} className="rounded-xl border-0 bg-white shadow-sm overflow-hidden min-h-[70px]">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                <Skeleton className="h-10 w-10 sm:h-14 sm:w-14 rounded-full shrink-0" />
                <div className="flex-1 space-y-1 sm:space-y-2 min-w-0">
                  <Skeleton className="h-2 sm:h-3 w-3/4" />
                  <Skeleton className="h-5 sm:h-6 w-1/2" />
                </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {adminStatConfigs.map((statConfig) => (
            <StatCardAdmin
              key={statConfig.id}
              title={statConfig.title}
              value={String(statsData[statConfig.id] ?? '0')}
              icon={statConfig.icon}
              iconBgClass={statConfig.iconBgClass}
            />
          ))}
        </div>
      )}

      <AdminSendNotification />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="shadow-md rounded-lg">
          <CardHeader className="bg-card border-b">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">Leads Growth</CardTitle>
                <CardDescription>Visualizing client acquisition trend over time.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 h-[350px]">
            {isLoadingStats && !leadsChartData.length ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-3/4 w-full" />
              </div>
            ) : !isLoadingStats && leadsChartData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No leads data available yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={leadsChartData}
                  margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorLeads)" 
                    name="New Leads" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-lg">
          <CardHeader className="bg-card border-b">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">Orders Overview</CardTitle>
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
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorOrders)" 
                    name="Orders" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}



















