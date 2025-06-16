
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
  MapPin,
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

interface StatCardAdminProps {
  title: string;
  value: string;
  icon: React.ElementType;
  iconBgClass: string;
  iconTextClass: string;
}

function StatCardAdmin({ title, value, icon: Icon, iconBgClass, iconTextClass }: StatCardAdminProps): ReactNode {
  return (
    <Card className="shadow-md rounded-lg bg-card hover:shadow-lg transition-shadow">
      <CardContent className="p-4 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${iconBgClass} flex-shrink-0`}>
          <Icon className={`h-7 w-7 ${iconTextClass}`} />
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{value}</p> 
        </div>
      </CardContent>
    </Card>
  );
}

const adminStatConfigs: Omit<StatCardAdminProps, 'value'> & { id: string }[] = [
  { id: "totalOrders", title: "Total Orders", icon: ShoppingCart, iconBgClass: "bg-sky-100 dark:bg-sky-900/50", iconTextClass: "text-sky-600 dark:text-sky-400" },
  { id: "totalTemplates", title: "Total Templates", icon: Layers, iconBgClass: "bg-blue-100 dark:bg-blue-900/50", iconTextClass: "text-blue-600 dark:text-blue-400" },
  { id: "totalRestaurantItems", title: "Total Restaurant Items", icon: UtensilsCrossed, iconBgClass: "bg-green-100 dark:bg-green-900/50", iconTextClass: "text-green-600 dark:text-green-400" },
  { id: "totalParlourItems", title: "Total Parlour Items", icon: Sparkles, iconBgClass: "bg-fuchsia-100 dark:bg-fuchsia-900/50", iconTextClass: "text-fuchsia-600 dark:text-fuchsia-400" },
  { id: "totalRestaurantCategories", title: "Total Restaurant Categories", icon: LayoutList, iconBgClass: "bg-teal-100 dark:bg-teal-900/50", iconTextClass: "text-teal-600 dark:text-teal-400" },
  { id: "totalParlourCategories", title: "Total Parlour Categories", icon: FolderHeart, iconBgClass: "bg-pink-100 dark:bg-pink-900/50", iconTextClass: "text-pink-600 dark:text-pink-400" },
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
  
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('30days');

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
      
      const combinedStatsData: Record<string, number | string> = {};
      adminStatConfigs.forEach(config => {
        combinedStatsData[config.id] = 0; 
      });

      let errorMessages: string[] = [];

      try {
        const [
            restaurantCategoriesResponseSettled, 
            menuItemsResponseSettled,
            parlourCategoriesResponseSettled,
            parlourItemsResponseSettled,
            templatesResponseSettled,
            ordersResponseSettled,
        ] = await Promise.allSettled([
          fetch("https://colorhutbd.xyz/vm/api/categories.php", { headers: { 'Accept': 'application/json' } }),
          fetch("https://colorhutbd.xyz/vm/api/menu-items.php", { headers: { 'Accept': 'application/json' } }),
          fetch("https://colorhutbd.xyz/vm/api/parlour-categories.php", { headers: { 'Accept': 'application/json' } }),
          fetch("https://colorhutbd.xyz/vm/api/parlour-items.php", { headers: { 'Accept': 'application/json' } }),
          fetch("https://colorhutbd.xyz/vm/api/templates.php", { headers: { 'Accept': 'application/json' } }),
          fetch("https://colorhutbd.xyz/vm/api/orders.php", { headers: { 'Accept': 'application/json' } }),
        ]);

        if (restaurantCategoriesResponseSettled.status === 'fulfilled') {
          const response = restaurantCategoriesResponseSettled.value;
          if (!response.ok) {
            errorMessages.push(`Restaurant Categories API error (${response.status}).`);
          } else {
            const result = await response.json();
            if (result.success && result.data && Array.isArray(result.data.categories)) {
              combinedStatsData.totalRestaurantCategories = result.data.categories.length;
            } else { errorMessages.push("Invalid data (Res Categories)."); }
          }
        } else { errorMessages.push("Network error (Res Categories)."); }

        if (menuItemsResponseSettled.status === 'fulfilled') {
          const response = menuItemsResponseSettled.value;
          if (!response.ok) {
            errorMessages.push(`Restaurant Items API error (${response.status}).`);
          } else {
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) { 
              combinedStatsData.totalRestaurantItems = result.data.length;
            } else { errorMessages.push("Invalid data (Res Items)."); }
          }
        } else { errorMessages.push("Network error (Res Items)."); }

        if (parlourCategoriesResponseSettled.status === 'fulfilled') {
          const response = parlourCategoriesResponseSettled.value;
          if (!response.ok) {
            errorMessages.push(`Parlour Categories API error (${response.status}).`);
          } else {
            const result = await response.json();
            if (result.success && result.data && Array.isArray(result.data.categories)) {
              combinedStatsData.totalParlourCategories = result.data.categories.length;
            } else { errorMessages.push("Invalid data (Parlour Cat)."); }
          }
        } else { errorMessages.push("Network error (Parlour Cat)."); }

        if (parlourItemsResponseSettled.status === 'fulfilled') {
          const response = parlourItemsResponseSettled.value;
          if (!response.ok) {
            errorMessages.push(`Parlour Items API error (${response.status}).`);
          } else {
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
              combinedStatsData.totalParlourItems = result.data.length;
            } else { errorMessages.push("Invalid data (Parlour Items)."); }
          }
        } else { errorMessages.push("Network error (Parlour Items)."); }

        if (templatesResponseSettled.status === 'fulfilled') {
          const response = templatesResponseSettled.value;
          if (!response.ok) {
            errorMessages.push(`Templates API error (${response.status}).`);
          } else {
            const result = await response.json();
            if (result.success && result.data && Array.isArray(result.data.templates)) {
              combinedStatsData.totalTemplates = result.data.templates.length;
            } else { errorMessages.push("Invalid data (Templates)."); }
          }
        } else { errorMessages.push("Network error (Templates)."); }

        if (ordersResponseSettled.status === 'fulfilled') {
            const response = ordersResponseSettled.value;
            if (!response.ok) {
              errorMessages.push(`Orders API error (${response.status}).`);
              setAllApiOrders([]); 
            } else {
              const result = await response.json();
              let fetchedApiOrders: ApiOrder[] = [];
              if (result.success) {
                if (result.data && Array.isArray(result.data.orders)) {
                  fetchedApiOrders = result.data.orders;
                } else if (Array.isArray(result.data)) { 
                  fetchedApiOrders = result.data;
                } else { errorMessages.push("Invalid data format for orders."); }
                combinedStatsData.totalOrders = fetchedApiOrders.length;
                setAllApiOrders(fetchedApiOrders);
              } else { 
                errorMessages.push(result.message || "Failed to load orders.");
                setAllApiOrders([]);
              }
            }
          } else { 
            errorMessages.push("Network error (Orders).");
            setAllApiOrders([]);
          }
        
        if (errorMessages.length > 0) {
          setStatsError(errorMessages.join(' '));
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
                const orderDate = parseISO(orderDateField);
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
          const orderDate = parseISO(orderDateField);
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

      <div className="flex flex-wrap items-center gap-4 py-4 px-2 bg-card rounded-lg shadow">
        <Button variant="outline" className="text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4" />
          Select Location
        </Button>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-auto min-w-[150px] text-muted-foreground">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="loc1">Location 1</SelectItem>
            <SelectItem value="loc2">Location 2</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" className="text-muted-foreground">
            <CalendarDays className="mr-2 h-4 w-4" />
            Filter by Date
          </Button>
          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-auto min-w-[150px] text-muted-foreground">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeFilterOptions.map(option => (
                <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoadingStats && !statsData.totalOrders ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {adminStatConfigs.map((statConfig) => (
            <Card key={statConfig.id} className="shadow-md rounded-lg bg-card">
              <CardContent className="p-4 flex items-center space-x-4">
                <Skeleton className={`h-12 w-12 rounded-full ${statConfig.iconBgClass}`} />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
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
                <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}} />
                <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
    

    

    

    

    

    

    

    




    