"use client";

import type { Transaction } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, ArrowDownUp, Info } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
  className?: string;
}

export function TransactionList({ transactions, onEdit, onDelete, className }: TransactionListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };
  
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ArrowDownUp className="mr-2 h-5 w-5" />
          Transaction History
        </CardTitle>
        <CardDescription>
          View and manage all your financial transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <Info className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No transactions yet.</p>
            <p>Add your first transaction to see it listed here.</p>
          </div>
        ) : (
          <Table>
            <TableCaption>A list of your recent financial transactions.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-muted/50">
                  <TableCell>{format(new Date(transaction.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === 'revenue' ? 'default' : 'secondary'} 
                           className={cn(transaction.type === 'revenue' ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-800/30 dark:text-green-300 dark:border-green-700' : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-800/30 dark:text-red-300 dark:border-red-700', 'capitalize')}>
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn("text-right font-semibold", transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600')}>
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(transaction)}>
                      <Edit3 className="h-4 w-4" />
                       <span className="sr-only">Edit</span>
                    </Button>
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the transaction: "{transaction.description}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(transaction.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
