export interface Transaction {
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
  type: 'revenue' | 'expense';
}

// Appointment interface removed
