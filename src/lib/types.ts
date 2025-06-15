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

// FinancialMetric type removed as it was specific to the dashboard
