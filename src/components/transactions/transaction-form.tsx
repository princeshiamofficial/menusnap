"use client";

import { useState, useEffect } from 'react';
import type { Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Assuming Textarea is available or created
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit } from 'lucide-react';

interface TransactionFormProps {
  onSave: (transaction: Transaction) => void;
  initialData?: Transaction; // For editing
  className?: string;
}

const transactionCategories = {
  revenue: ['Client Project', 'Product Sale', 'Service Fee', 'Consulting', 'Other Income'],
  expense: ['Rent', 'Utilities', 'Software', 'Marketing', 'Supplies', 'Travel', 'Salary', 'Other Expense'],
};

export function TransactionForm({ onSave, initialData, className }: TransactionFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [type, setType] = useState<'revenue' | 'expense'>('expense');
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setDate(new Date(initialData.date));
      setDescription(initialData.description);
      setCategory(initialData.category);
      setAmount(initialData.amount);
      setType(initialData.type);
    } else {
      // Reset form for new transaction
      setDate(new Date());
      setDescription('');
      setCategory('');
      setAmount('');
      setType('expense');
    }
  }, [initialData]);

  const currentCategories = transactionCategories[type];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !description || !category || amount === '' || amount <= 0) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields with valid values.",
        variant: "destructive",
      });
      return;
    }

    const newTransaction: Transaction = {
      id: initialData?.id || crypto.randomUUID(),
      date,
      description,
      category,
      amount: Number(amount),
      type,
    };
    onSave(newTransaction);
    toast({
      title: `Transaction ${initialData ? 'Updated' : 'Added'}`,
      description: `"${description}" for $${Number(amount).toFixed(2)} has been ${initialData ? 'updated' : 'recorded'}.`,
    });
    
    // Reset form if it's not an edit
    if (!initialData) {
        setDate(new Date());
        setDescription('');
        setCategory('');
        setAmount('');
        setType('expense');
    }
  };
  
  const handleTypeChange = (newType: 'revenue' | 'expense') => {
    setType(newType);
    setCategory(''); // Reset category when type changes
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
            {initialData ? <Edit className="mr-2 h-5 w-5" /> : <PlusCircle className="mr-2 h-5 w-5" />}
            {initialData ? 'Edit Transaction' : 'Add New Transaction'}
        </CardTitle>
        <CardDescription>
          Enter the details of the financial transaction.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <DatePicker date={date} setDate={setDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value) => handleTypeChange(value as 'revenue' | 'expense')}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Office supplies, Client payment"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={!type}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {currentCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0.00"
                min="0.01"
                step="0.01"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {initialData ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
