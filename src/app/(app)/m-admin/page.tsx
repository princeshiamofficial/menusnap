
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

const ordersData = [
  { name: 'Jan', orders: 400 },
  { name: 'Feb', orders: 300 },
  { name: 'Mar', orders: 200 },
  { name: 'Apr', orders: 278 },
  { name: 'May', orders: 189 },
  { name: 'Jun', orders: 239 },
  { name: 'Jul', orders: 349 },
  { name: 'Aug', orders: 200 },
  { name: 'Sep', orders: 278 },
  { name: 'Oct', orders: 189 },
  { name: 'Nov', orders: 239 },
  { name: 'Dec', orders: 349 },
];


export default function MAdminDashboardPage() {
  const { isAdminLoggedIn, adminLoading, adminLogout } = useAdminAuth();
  const [statsData, setStatsData] = useState<Record<string, number | string>>({});
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllAdminStats() {
      setIsLoadingStats(true);
      setStatsError(null);
      
      const combinedStatsData: Record<string, number | string> = {};
      adminStatConfigs.forEach(config => {
        combinedStatsData[config.id] = 0; // Initialize all stats to 0
      });

      let errorMessages: string[] = [];

      try {
        const [
            restaurantCategoriesResponseSettled, 
            menuItemsResponseSettled,
            parlourCategoriesResponseSettled,
            parlourItemsResponseSettled,
            templatesResponseSettled, // Added templates fetch
        ] = await Promise.allSettled([
          fetch("https://colorhutbd.xyz/vm/api/categories.php", { headers: { 'Accept': 'application/json' } }),
          fetch("https://colorhutbd.xyz/vm/api/menu-items.php", { headers: { 'Accept': 'application/json' } }),
          fetch("https://colorhutbd.xyz/vm/api/parlour-categories.php", { headers: { 'Accept': 'application/json' } }),
          fetch("https://colorhutbd.xyz/vm/api/parlour-items.php", { headers: { 'Accept': 'application/json' } }),
          fetch("https://colorhutbd.xyz/vm/api/templates.php", { headers: { 'Accept': 'application/json' } }), // Fetch templates
        ]);

        // Process Restaurant Categories
        if (restaurantCategoriesResponseSettled.status === 'fulfilled') {
          const response = restaurantCategoriesResponseSettled.value;
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Restaurant Categories API error! status: ${response.status}, message: ${errorText}`);
            errorMessages.push(`Failed to load restaurant categories (Error ${response.status}).`);
          } else {
            const result = await response.json();
            if (result.success && result.data && Array.isArray(result.data.categories)) {
              combinedStatsData.totalRestaurantCategories = result.data.categories.length;
            } else {
              console.error("Invalid API response structure for restaurant categories:", result);
              errorMessages.push("Invalid data for restaurant categories.");
            }
          }
        } else {
          console.error("Failed to fetch restaurant categories:", restaurantCategoriesResponseSettled.reason);
          errorMessages.push("Network error fetching restaurant categories.");
        }

        // Process Restaurant Menu Items
        if (menuItemsResponseSettled.status === 'fulfilled') {
          const response = menuItemsResponseSettled.value;
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Restaurant Menu Items API error! status: ${response.status}, message: ${errorText}`);
            errorMessages.push(`Failed to load restaurant items (Error ${response.status}).`);
          } else {
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) { 
              combinedStatsData.totalRestaurantItems = result.data.length;
            } else {
              console.error("Invalid API response structure for restaurant menu items:", result);
              errorMessages.push("Invalid data for restaurant items.");
            }
          }
        } else {
          console.error("Failed to fetch restaurant menu items:", menuItemsResponseSettled.reason);
          errorMessages.push("Network error fetching restaurant items.");
        }

        // Process Parlour Categories
        if (parlourCategoriesResponseSettled.status === 'fulfilled') {
          const response = parlourCategoriesResponseSettled.value;
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Parlour Categories API error! status: ${response.status}, message: ${errorText}`);
            errorMessages.push(`Failed to load parlour categories (Error ${response.status}).`);
          } else {
            const result = await response.json();
            if (result.success && result.data && Array.isArray(result.data.categories)) {
              combinedStatsData.totalParlourCategories = result.data.categories.length;
            } else {
              console.error("Invalid API response structure for parlour categories:", result);
              errorMessages.push("Invalid data for parlour categories.");
            }
          }
        } else {
          console.error("Failed to fetch parlour categories:", parlourCategoriesResponseSettled.reason);
          errorMessages.push("Network error fetching parlour categories.");
        }

        // Process Parlour Items
        if (parlourItemsResponseSettled.status === 'fulfilled') {
          const response = parlourItemsResponseSettled.value;
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Parlour Items API error! status: ${response.status}, message: ${errorText}`);
            errorMessages.push(`Failed to load parlour items (Error ${response.status}).`);
          } else {
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
              combinedStatsData.totalParlourItems = result.data.length;
            } else {
              console.error("Invalid API response structure for parlour items:", result);
              errorMessages.push("Invalid data for parlour items.");
            }
          }
        } else {
          console.error("Failed to fetch parlour items:", parlourItemsResponseSettled.reason);
          errorMessages.push("Network error fetching parlour items.");
        }

        // Process Templates
        if (templatesResponseSettled.status === 'fulfilled') {
          const response = templatesResponseSettled.value;
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Templates API error! status: ${response.status}, message: ${errorText}`);
            errorMessages.push(`Failed to load templates (Error ${response.status}).`);
          } else {
            const result = await response.json();
            if (result.success && result.data && Array.isArray(result.data.templates)) {
              combinedStatsData.totalTemplates = result.data.templates.length;
            } else {
              console.error("Invalid API response structure for templates:", result);
              errorMessages.push("Invalid data for templates.");
            }
          }
        } else {
          console.error("Failed to fetch templates:", templatesResponseSettled.reason);
          errorMessages.push("Network error fetching templates.");
        }
        
        if (errorMessages.length > 0) {
          setStatsError(errorMessages.join(' '));
        }

        setStatsData(combinedStatsData);

      } catch (e: any) { 
        console.error("Unexpected error fetching admin stats:", e);
        setStatsError(e.message || "An unexpected error occurred while loading dashboard statistics.");
        const defaultErrorStats: Record<string, number | string> = {};
        adminStatConfigs.forEach(config => {
          defaultErrorStats[config.id] = 0; // Initialize to 0 on major error
        });
        setStatsData(defaultErrorStats);
      } finally {
        setIsLoadingStats(false);
      }
    }

    if (isAdminLoggedIn && !adminLoading) {
      fetchAllAdminStats();
    } else if (!isAdminLoggedIn && !adminLoading) {
      // If not logged in and not loading, ensure loading stats is also false.
      setIsLoadingStats(false); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminLoggedIn, adminLoading]);


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
        <Select defaultValue="all">
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
          <Select defaultValue="30days">
            <SelectTrigger className="w-auto min-w-[150px] text-muted-foreground">
              <SelectValue placeholder="Last 30 Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoadingStats ? (
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
              <CardTitle className="text-xl font-semibold text-foreground">Orders (Last 30 Days)</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={ordersData}
              margin={{
                top: 5,
                right: 20,
                left: -20, 
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
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
        </CardContent>
      </Card>

    </div>
  );
}
    

    

    

    

    

    

    