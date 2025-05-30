"use client";

import { useState, useEffect } from 'react';
import type { Transaction } from '@/lib/types';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { TransactionList } from '@/components/transactions/transaction-list';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Mock data - in a real app, this would come from an API/DB
const MOCK_INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tx1', date: new Date('2024-07-10'), description: 'Software Subscription', category: 'Software', amount: 49.99, type: 'expense' },
  { id: 'tx2', date: new Date('2024-07-05'), description: 'Client Project Payment', category: 'Client Project', amount: 1200, type: 'revenue' },
  { id: 'tx3', date: new Date('2024-06-28'), description: 'Office Supplies', category: 'Supplies', amount: 75.50, type: 'expense' },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);

  useEffect(() => {
    // Simulate fetching transactions
    setTransactions(MOCK_INITIAL_TRANSACTIONS);
  }, []);

  const handleSaveTransaction = (transaction: Transaction) => {
    setTransactions(prev => {
      const existingIndex = prev.findIndex(t => t.id === transaction.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = transaction;
        return updated;
      }
      return [transaction, ...prev]; // Add new transactions to the top
    });
    setIsFormModalOpen(false); // Close modal after save
    setEditingTransaction(undefined); // Clear editing state
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormModalOpen(true);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };

  const openNewTransactionForm = () => {
    setEditingTransaction(undefined);
    setIsFormModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your income and expenses.
          </p>
        </div>
        <Button onClick={openNewTransactionForm} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Transaction
        </Button>
      </div>
      
      <Dialog open={isFormModalOpen} onOpenChange={(isOpen) => {
          setIsFormModalOpen(isOpen);
          if (!isOpen) setEditingTransaction(undefined); // Reset editing state when dialog closes
        }}>
        <DialogContent className="sm:max-w-lg"> {/* Adjust width as needed */}
          <TransactionForm 
            onSave={handleSaveTransaction} 
            initialData={editingTransaction} 
            className="shadow-none border-0 p-0" // Remove card styling when in dialog
          />
        </DialogContent>
      </Dialog>

      <TransactionList 
        transactions={transactions} 
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        className="shadow-lg"
      />
    </div>
  );
}
