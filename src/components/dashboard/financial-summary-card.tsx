import type { FinancialMetric } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface FinancialSummaryCardProps {
  metric: FinancialMetric;
  className?: string;
}

export function FinancialSummaryCard({ metric, className }: FinancialSummaryCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const percentageChange = metric.previousValue
    ? ((metric.value - metric.previousValue) / metric.previousValue) * 100
    : null;

  return (
    <Card className={cn("shadow-lg hover:shadow-xl transition-shadow duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.label}
        </CardTitle>
        {metric.icon && <metric.icon className="h-5 w-5 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">
          {formatCurrency(metric.value)}
        </div>
        {percentageChange !== null && (
          <p className={cn(
            "text-xs mt-1 flex items-center",
            percentageChange >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {percentageChange >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
            {percentageChange.toFixed(1)}% from last month
          </p>
        )}
        {percentageChange === null && (
           <p className="text-xs text-muted-foreground mt-1 invisible">No prior data</p> /* Placeholder for consistent height */
        )}
      </CardContent>
    </Card>
  );
}
