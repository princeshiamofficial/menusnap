
"use client";

import { useState, useEffect } from 'react';
import type { FinancialMetric, Transaction } from '@/lib/types';
import { FinancialSummaryCard } from '@/components/dashboard/financial-summary-card';
import { SummaryChart } from '@/components/dashboard/summary-chart';
import { TrendingUp, TrendingDown, Sigma, Coins, CalendarClock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock data - in a real app, this would come from an API/DB
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: new Date('2024-07-01'), description: 'Client A Project', category: 'Revenue', amount: 2500, type: 'revenue' },
  { id: '2', date: new Date('2024-07-05'), description: 'Software Subscription', category: 'Expense', amount: 150, type: 'expense' },
  { id: '3', date: new Date('2024-07-10'), description: 'Office Rent', category: 'Expense', amount: 800, type: 'expense' },
  { id: '4', date: new Date('2024-06-15'), description: 'Client B Retainer', category: 'Revenue', amount: 1800, type: 'revenue' },
  { id: '5', date: new Date('2024-06-20'), description: 'Utilities', category: 'Expense', amount: 200, type: 'expense' },
];

const MOCK_APPOINTMENTS_COUNT = 5; // Upcoming appointments this week

export default function DashboardPage() {
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetric[]>([]);
  const [chartData, setChartData] = useState<Array<{ name: string; revenue: number; expenses: number }>>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState(0);

  useEffect(() => {
    // Process transactions for the current month (July 2024 for mock data)
    const currentMonthTransactions = MOCK_TRANSACTIONS.filter(t => t.date.getMonth() === 6 && t.date.getFullYear() === 2024); // July is month 6
    const revenueCurrentMonth = currentMonthTransactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
    const expensesCurrentMonth = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const profitCurrentMonth = revenueCurrentMonth - expensesCurrentMonth;

    // Process transactions for the previous month (June 2024 for mock data)
    const previousMonthTransactions = MOCK_TRANSACTIONS.filter(t => t.date.getMonth() === 5 && t.date.getFullYear() === 2024); // June is month 5
    const revenuePreviousMonth = previousMonthTransactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
    const expensesPreviousMonth = previousMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    setFinancialMetrics([
      { label: 'Total Revenue', value: revenueCurrentMonth, previousValue: revenuePreviousMonth || undefined, icon: TrendingUp },
      { label: 'Total Expenses', value: expensesCurrentMonth, previousValue: expensesPreviousMonth || undefined, icon: TrendingDown },
      { label: 'Net Profit', value: profitCurrentMonth, icon: Sigma },
    ]);

    setChartData([
      { name: 'May', revenue: 1500, expenses: 900 },
      { name: 'Jun', revenue: revenuePreviousMonth, expenses: expensesPreviousMonth },
      { name: 'Jul', revenue: revenueCurrentMonth, expenses: expensesCurrentMonth },
      { name: 'Aug', revenue: 0, expenses: 0 }, // Future placeholder
    ]);
    
    setUpcomingAppointments(MOCK_APPOINTMENTS_COUNT);

  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
        </div>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/transactions/new">
            <Coins className="mr-2 h-4 w-4" /> Add Transaction
          </Link>
        </Button>
      </div>

      {upcomingAppointments > 0 && (
        <Alert className="bg-accent/10 border-accent/30 text-accent-foreground">
          <CalendarClock className="h-5 w-5 !text-accent" />
          <AlertTitle className="font-semibold !text-accent">Upcoming Appointments</AlertTitle>
          <AlertDescription>
            You have {upcomingAppointments} appointments scheduled for this week. 
            <Button variant="link" asChild className="p-0 h-auto ml-1 !text-accent hover:!text-accent/80">
              <Link href="/calendar">View Calendar</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {financialMetrics.map((metric) => (
          <FinancialSummaryCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-1"> {/* Changed to 1 column for larger chart */}
        <SummaryChart data={chartData} />
      </div>
      
      {/* Placeholder for recent activity or other widgets */}
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest transactions and updates.</CardDescription>
        </CardHeader>
        <CardContent>
          {MOCK_TRANSACTIONS.slice(0,3).map(tx => (
            <div key={tx.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <div>
                <p className="font-medium">{tx.description}</p>
                <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString()} - {tx.category}</p>
              </div>
              <p className={cn("font-semibold", tx.type === 'revenue' ? 'text-green-600' : 'text-red-600')}>
                {tx.type === 'revenue' ? '+' : '-'}${tx.amount.toFixed(2)}
              </p>
            </div>
          ))}
          {MOCK_TRANSACTIONS.length === 0 && <p className="text-muted-foreground">No recent transactions.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
