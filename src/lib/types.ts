export interface Transaction {
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
  type: 'revenue' | 'expense';
}

export interface Appointment {
  id: string;
  date: Date;
  time: string;
  title: string;
  description?: string;
}

export type FinancialMetric = {
  label: string;
  value: number;
  previousValue?: number; // For percentage change calculation
  icon?: React.ElementType;
};
