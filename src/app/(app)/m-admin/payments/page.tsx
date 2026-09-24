'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  Globe,
  Settings2,
  Eye,
  EyeOff,
  Trash2,
  User,
  Phone,
  Mail,
  Receipt,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  getPayStationSettings,
  savePayStationSettings,
  getPayStationTransactionsAction,
  getPayStationMetricsAction,
  verifyPayStationTransaction,
  deletePayStationTransactionAction,
  type PayStationSettings,
  type PayStationTransaction,
} from '@/app/actions/paystation';

export default function AdminPaymentsPage() {
  const { toast } = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'transactions' | 'integration'>('transactions');

  // Transactions State
  const [transactions, setTransactions] = useState<PayStationTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Summary Metrics
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    successfulCount: 0,
    pendingCount: 0,
    failedCount: 0,
    totalCount: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Settings State
  const [settings, setSettings] = useState<PayStationSettings>({
    isEnabled: false,
    isSandbox: true,
    merchantId: '',
    password: '',
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [callbackOrigin, setCallbackOrigin] = useState('');
  const [copiedCallback, setCopiedCallback] = useState(false);

  // Selected Transaction for details modal
  const [selectedTx, setSelectedTx] = useState<PayStationTransaction | null>(null);
  const [isVerifyingTx, setIsVerifyingTx] = useState(false);

  // Delete Transaction state
  const [txToDelete, setTxToDelete] = useState<PayStationTransaction | null>(null);
  const [isDeletingTx, setIsDeletingTx] = useState(false);

  // Origin for callback URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCallbackOrigin(window.location.origin);
    }
  }, []);

  const callbackUrl = `${callbackOrigin || 'https://yourdomain.com'}/api/payment/paystation/callback`;

  // Fetch metrics
  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      const res = await getPayStationMetricsAction();
      if (res.success && res.metrics) {
        setMetrics(res.metrics);
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const data = await getPayStationSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  // Fetch transactions with pagination and filters
  const fetchTransactions = useCallback(async () => {
    setLoadingTransactions(true);
    try {
      const offset = (currentPage - 1) * pageSize;
      const res = await getPayStationTransactionsAction({
        limit: pageSize,
        offset,
        search: searchQuery,
        status: statusFilter,
      });

      if (res.success && res.transactions) {
        setTransactions(res.transactions);
        setTotalCount(res.total || 0);
      } else {
        toast({
          title: 'Error loading transactions',
          description: res.error || 'Failed to fetch transaction logs.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch transactions.',
        variant: 'destructive',
      });
    } finally {
      setLoadingTransactions(false);
    }
  }, [currentPage, pageSize, searchQuery, statusFilter, toast]);

  // Initial load
  useEffect(() => {
    fetchMetrics();
    fetchSettings();
  }, [fetchMetrics, fetchSettings]);

  // Trigger transactions fetch when dependencies change
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Manual refresh all data
  const handleRefreshAll = async () => {
    await Promise.all([fetchMetrics(), fetchSettings(), fetchTransactions()]);
    toast({
      title: 'Refreshed',
      description: 'Payment data and settings updated.',
      variant: 'default',
    });
  };

  // Copy Callback URL
  const handleCopyCallbackUrl = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopiedCallback(true);
    toast({
      title: 'Copied to Clipboard!',
      description: 'PayStation callback & webhook URL copied successfully.',
    });
    setTimeout(() => setCopiedCallback(false), 2500);
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.isEnabled && (!settings.merchantId?.trim() || !settings.password?.trim())) {
      toast({
        title: 'Credentials Required',
        description: 'Please enter both Merchant ID and Password before activating PayStation.',
        variant: 'destructive',
      });
      return;
    }

    setSavingSettings(true);
    try {
      const res = await savePayStationSettings({
        isEnabled: settings.isEnabled,
        isSandbox: settings.isSandbox,
        merchantId: settings.merchantId.trim(),
        password: settings.password.trim(),
      });

      if (res.success) {
        toast({
          title: 'Settings Saved',
          description: 'PayStation configuration has been updated successfully.',
        });
        fetchSettings();
      } else {
        toast({
          title: 'Failed to Save',
          description: res.error || 'Could not update settings.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // Re-verify single transaction with PayStation API
  const handleReVerify = async (tx: PayStationTransaction) => {
    setIsVerifyingTx(true);
    try {
      const result = await verifyPayStationTransaction(tx.invoiceNumber, tx.trxId || undefined);
      if (result.success || result.status === 'Successful') {
        toast({
          title: 'Verification Successful!',
          description: `Transaction confirmed as Successful (TrxID: ${result.trxId || 'N/A'}).`,
        });
      } else {
        toast({
          title: `Status: ${result.status}`,
          description: result.message || 'Verification completed.',
          variant: result.status === 'Failed' ? 'destructive' : 'default',
        });
      }
      // Refresh list and metrics
      await Promise.all([fetchTransactions(), fetchMetrics()]);
      if (selectedTx && selectedTx.invoiceNumber === tx.invoiceNumber) {
        setSelectedTx(prev => prev ? {
          ...prev,
          status: result.status as any,
          trxId: result.trxId || prev.trxId,
          paymentCategory: result.transaction?.paymentCategory || prev.paymentCategory,
        } : null);
      }
    } catch (err: any) {
      toast({
        title: 'Verification Error',
        description: err.message || 'Failed to verify transaction with PayStation.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifyingTx(false);
    }
  };

  // Delete transaction record
  const handleDeleteTransaction = async () => {
    if (!txToDelete?.id) return;
    setIsDeletingTx(true);
    try {
      const res = await deletePayStationTransactionAction(txToDelete.id);
      if (res.success) {
        toast({
          title: 'Deleted',
          description: 'Transaction record removed.',
        });
        setTxToDelete(null);
        if (selectedTx?.id === txToDelete.id) {
          setSelectedTx(null);
        }
        await Promise.all([fetchTransactions(), fetchMetrics()]);
      } else {
        toast({
          title: 'Error',
          description: res.error || 'Failed to delete transaction.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete transaction.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingTx(false);
    }
  };

  // Export filtered transactions to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast({
        title: 'No Data',
        description: 'No transactions to export.',
        variant: 'destructive',
      });
      return;
    }

    const headers = [
      'Invoice Number',
      'TrxID',
      'Customer Name',
      'Phone',
      'Email',
      'Plan',
      'Duration',
      'Amount (BDT)',
      'Status',
      'Payment Method',
      'Date Created',
    ];

    const rows = transactions.map(t => [
      `"${t.invoiceNumber || ''}"`,
      `"${t.trxId || ''}"`,
      `"${(t.customerName || '').replace(/"/g, '""')}"`,
      `"${t.customerPhone || ''}"`,
      `"${t.customerEmail || ''}"`,
      `"${t.plan || ''}"`,
      `"${t.duration || ''}"`,
      t.amount,
      `"${t.status}"`,
      `"${t.paymentCategory || ''}"`,
      `"${t.createdAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MenuSnap_Payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'CSV Exported',
      description: `Downloaded ${transactions.length} transaction records.`,
    });
  };

  // Status Badge Component
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Successful':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/20 font-medium gap-1 px-2.5 py-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Successful
          </Badge>
        );
      case 'Pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/30 hover:bg-amber-500/20 font-medium gap-1 px-2.5 py-0.5">
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Pending
          </Badge>
        );
      case 'Cancelled':
        return (
          <Badge className="bg-slate-500/10 text-slate-600 border border-slate-400/30 hover:bg-slate-500/20 font-medium gap-1 px-2.5 py-0.5">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
            Cancelled
          </Badge>
        );
      case 'Failed':
      default:
        return (
          <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/30 hover:bg-rose-500/20 font-medium gap-1 px-2.5 py-0.5">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Failed
          </Badge>
        );
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="flex-1 w-full min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5A36] to-orange-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Payments & PayStation
              </h1>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  settings.isEnabled
                    ? settings.isSandbox
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {settings.isEnabled
                  ? settings.isSandbox
                    ? '● Sandbox Test'
                    : '● Live Gateway'
                  : '○ Disabled'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage PayStation integration credentials and view all incoming subscription payments across MenuSnap.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 h-9 gap-1.5 rounded-xl shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingTransactions || loadingMetrics ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 h-9 gap-1.5 rounded-xl shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl overflow-hidden relative group hover:border-[#FF5A36]/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ৳ {metrics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              From {metrics.successfulCount} successful subscriptions
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Successful Payments */}
        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl overflow-hidden relative group hover:border-emerald-300 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Successful</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
              {metrics.successfulCount}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active confirmed client payments
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Pending Payments */}
        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl overflow-hidden relative group hover:border-amber-300 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
              {metrics.pendingCount}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              In checkout / waiting verification
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Failed / Cancelled */}
        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl overflow-hidden relative group hover:border-rose-300 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Failed / Cancelled</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-700 tracking-tight">
              {metrics.failedCount}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Out of {metrics.totalCount} total checkout attempts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <Tabs
        value={activeTab}
        onValueChange={(val: any) => setActiveTab(val)}
        className="w-full space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <TabsList className="bg-slate-200/70 p-1 rounded-xl h-11">
            <TabsTrigger
              value="transactions"
              className="rounded-lg text-xs sm:text-sm font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-2xs gap-2"
            >
              <Receipt className="w-4 h-4 text-[#FF5A36]" />
              All Payments & Transactions ({totalCount})
            </TabsTrigger>
            <TabsTrigger
              value="integration"
              className="rounded-lg text-xs sm:text-sm font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-2xs gap-2"
            >
              <Settings2 className="w-4 h-4 text-[#FF5A36]" />
              PayStation Integration Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: ALL PAYMENTS & TRANSACTIONS */}
        <TabsContent value="transactions" className="space-y-4 m-0 focus-visible:outline-none">
          {/* Filters & Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search invoice, TrxID, client name, phone..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-4 h-10 rounded-xl bg-slate-50/70 border-slate-200 text-sm focus-visible:ring-[#FF5A36]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter by Status & Page Size */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Status:</span>
                <Select
                  value={statusFilter}
                  onValueChange={val => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[140px] h-10 rounded-xl bg-slate-50/70 border-slate-200 text-xs font-medium">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Successful">Successful</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Show:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={val => {
                    setPageSize(Number(val));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[80px] h-10 rounded-xl bg-slate-50/70 border-slate-200 text-xs font-medium">
                    <SelectValue placeholder="25" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Transactions Table Card */}
          <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="font-semibold text-xs text-slate-600 py-3.5">Date / Time</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Invoice #</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">PayStation TrxID</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Customer Details</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Plan & Billing</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600 text-right">Amount</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600 text-center">Status</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTransactions ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={8} className="py-6 text-center">
                          <div className="h-5 bg-slate-100 rounded-md animate-pulse max-w-2xl mx-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-16 text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <Receipt className="w-6 h-6" />
                          </div>
                          <p className="font-medium text-slate-600">No payment transactions found</p>
                          <p className="text-xs text-slate-400 max-w-sm">
                            {searchQuery || statusFilter !== 'all'
                              ? 'Try adjusting your search criteria or filter options.'
                              : 'When clients subscribe and pay via PayStation, all payment logs will appear here automatically.'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => (
                      <TableRow
                        key={tx.id || tx.invoiceNumber}
                        className="hover:bg-slate-50/70 transition-colors border-b border-slate-100"
                      >
                        {/* Date */}
                        <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                          {tx.createdAt
                            ? new Date(tx.createdAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </TableCell>

                        {/* Invoice Number */}
                        <TableCell className="font-mono text-xs font-semibold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <span>{tx.invoiceNumber}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(tx.invoiceNumber);
                                toast({ title: 'Copied Invoice #', description: tx.invoiceNumber });
                              }}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy Invoice"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </TableCell>

                        {/* TrxID */}
                        <TableCell className="font-mono text-xs">
                          {tx.trxId ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                {tx.trxId}
                              </span>
                              <button
                                onClick={() => {
                                  if (tx.trxId) {
                                    navigator.clipboard.writeText(tx.trxId);
                                    toast({ title: 'Copied TrxID', description: tx.trxId });
                                  }
                                }}
                                className="text-slate-400 hover:text-slate-700"
                                title="Copy TrxID"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </TableCell>

                        {/* Customer */}
                        <TableCell className="text-xs">
                          <div className="font-medium text-slate-900">{tx.customerName || 'N/A'}</div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                            <span>{tx.customerPhone}</span>
                            {tx.customerEmail && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[130px]">{tx.customerEmail}</span>
                              </>
                            )}
                          </div>
                        </TableCell>

                        {/* Plan & Duration */}
                        <TableCell className="text-xs whitespace-nowrap">
                          <Badge variant="outline" className="font-semibold uppercase tracking-wider text-[10px] bg-slate-50 border-slate-200">
                            {tx.plan}
                          </Badge>
                          <span className="text-[11px] text-slate-500 ml-1.5 capitalize">
                            {tx.duration}
                          </span>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="text-xs font-bold text-slate-900 text-right whitespace-nowrap">
                          ৳ {tx.amount.toLocaleString()}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center whitespace-nowrap">
                          {renderStatusBadge(tx.status)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right pr-6 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTx(tx)}
                              className="h-8 text-xs text-slate-700 hover:bg-slate-100 rounded-lg px-2.5 font-medium"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              Details
                            </Button>
                            {tx.status === 'Pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReVerify(tx)}
                                className="h-8 text-xs text-amber-700 border-amber-200 hover:bg-amber-50 rounded-lg px-2.5 font-medium"
                                title="Check status with PayStation"
                              >
                                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                                Verify
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setTxToDelete(tx)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Delete transaction record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-200 text-xs text-slate-500 gap-3">
              <div>
                Showing {transactions.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                {Math.min(currentPage * pageSize, totalCount)} of {totalCount} transactions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1 || loadingTransactions}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-700"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="font-semibold text-slate-700 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages || loadingTransactions}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: PAYSTATION INTEGRATION & SETTINGS */}
        <TabsContent value="integration" className="space-y-6 m-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column (2 Cols) */}
            <Card className="lg:col-span-2 bg-white border-slate-200/80 shadow-xs rounded-2xl p-6">
              <CardHeader className="p-0 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5A36] flex items-center justify-center border border-orange-100">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">
                        PayStation Gateway Credentials
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Enter your official PayStation Merchant ID and API Password.
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSettings(s => ({
                        ...s,
                        isEnabled: true,
                        isSandbox: true,
                        merchantId: '104-1653730183',
                        password: 'gamecoderstorepass',
                      }));
                      toast({
                        title: 'Sandbox Credentials Loaded',
                        description: 'Official PayStation test credentials filled in. Click Save Settings to apply.',
                      });
                    }}
                    className="h-8 text-xs border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 gap-1.5 rounded-lg font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Fill Official Sandbox Demo
                  </Button>
                </div>
              </CardHeader>

              <form onSubmit={handleSaveSettings} className="space-y-5">
                {/* Gateway Enable / Disable Switch */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <Label htmlFor="paystation-enabled" className="text-sm font-semibold text-slate-900 cursor-pointer">
                      Enable PayStation Gateway
                    </Label>
                    <p className="text-xs text-slate-500">
                      When enabled, users will see the PayStation payment option at checkout for bKash, Nagad, Rocket & Cards.
                    </p>
                  </div>
                  <Switch
                    id="paystation-enabled"
                    checked={settings.isEnabled}
                    onCheckedChange={checked => setSettings(s => ({ ...s, isEnabled: checked }))}
                    className="data-[state=checked]:bg-[#FF5A36]"
                  />
                </div>

                {/* Sandbox / Production Mode Switch */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="paystation-sandbox" className="text-sm font-semibold text-slate-900 cursor-pointer">
                        Sandbox (Test Mode)
                      </Label>
                      <Badge
                        className={
                          settings.isSandbox
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }
                      >
                        {settings.isSandbox ? 'Testing Environment' : 'Live Production'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Keep enabled while testing with sandbox credentials. Turn OFF when using your official live merchant account.
                    </p>
                  </div>
                  <Switch
                    id="paystation-sandbox"
                    checked={settings.isSandbox}
                    onCheckedChange={checked => setSettings(s => ({ ...s, isSandbox: checked }))}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>

                {/* Merchant ID */}
                <div className="space-y-1.5">
                  <Label htmlFor="merchant-id" className="text-xs font-semibold text-slate-700">
                    Merchant ID <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="merchant-id"
                    type="text"
                    placeholder="e.g. paystation_merchant_123"
                    value={settings.merchantId}
                    onChange={e => setSettings(s => ({ ...s, merchantId: e.target.value }))}
                    className="h-10 rounded-xl bg-slate-50/50 border-slate-200 text-sm focus-visible:ring-[#FF5A36]"
                  />
                  <p className="text-[11px] text-slate-400">
                    Issued by PayStation Bangladesh for your merchant account.
                  </p>
                </div>

                {/* Password / API Secret */}
                <div className="space-y-1.5">
                  <Label htmlFor="merchant-password" className="text-xs font-semibold text-slate-700">
                    Password / Secret Key <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="merchant-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••••••"
                      value={settings.password}
                      onChange={e => setSettings(s => ({ ...s, password: e.target.value }))}
                      className="h-10 pr-10 rounded-xl bg-slate-50/50 border-slate-200 text-sm focus-visible:ring-[#FF5A36]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Used to authenticate payment initiation and verify webhook signatures.
                  </p>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={savingSettings}
                    className="w-full sm:w-auto bg-[#FF5A36] hover:bg-[#e04a28] text-white font-semibold px-6 h-10 rounded-xl shadow-xs gap-2"
                  >
                    {savingSettings ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Saving Settings...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save PayStation Settings
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Instructions & Callback URL Column (1 Col) */}
            <div className="space-y-4">
              {/* Webhook & Callback URL Card */}
              <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Callback / IPN URL</h3>
                    <p className="text-[11px] text-slate-500">Provide this to PayStation</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="font-mono text-xs text-slate-800 break-all select-all">
                    {callbackUrl}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCallbackUrl}
                    className="w-full h-8 text-xs border-slate-300 font-medium rounded-lg gap-1.5"
                  >
                    {copiedCallback ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Callback URL
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-xs text-slate-500 space-y-2 pt-1 border-t border-slate-100">
                  <p className="font-semibold text-slate-700">Where to set this up?</p>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                    <li>Log in to your <strong>PayStation Merchant Portal</strong>.</li>
                    <li>Go to <strong>Settings</strong> &gt; <strong>Webhook / Callback Configuration</strong>.</li>
                    <li>Paste the above URL into both <strong>Callback URL</strong> and <strong>IPN URL</strong> fields.</li>
                    <li>Save changes. PayStation will now automatically verify customer payments and update subscriptions.</li>
                  </ol>
                </div>
              </Card>

              {/* Supported Payment Channels */}
              <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Supported Payment Channels
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-700">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-pink-50/60 border border-pink-100 text-pink-700">
                    <span className="font-bold">bKash</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50/60 border border-orange-100 text-orange-700">
                    <span className="font-bold">Nagad</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50/60 border border-purple-100 text-purple-700">
                    <span className="font-bold">Rocket</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-blue-700">
                    <span className="font-bold">Visa / Master</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Details Modal */}
      <Dialog open={!!selectedTx} onOpenChange={open => !open && setSelectedTx(null)}>
        <DialogContent className="max-w-xl p-6 rounded-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#FF5A36]" />
                Transaction Details
              </DialogTitle>
              {selectedTx && renderStatusBadge(selectedTx.status)}
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Invoice #{selectedTx?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-4 py-2 text-xs">
              {/* Customer & Subscription info */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Customer</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedTx.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Amount Paid</span>
                  <span className="font-extrabold text-emerald-600 text-sm">৳ {selectedTx.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phone</span>
                  <span className="font-medium text-slate-700">{selectedTx.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Email</span>
                  <span className="font-medium text-slate-700 truncate block">{selectedTx.customerEmail || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Plan</span>
                  <span className="font-bold text-slate-800 uppercase">{selectedTx.plan} ({selectedTx.duration})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">PayStation TrxID</span>
                  <span className="font-mono font-bold text-slate-800">{selectedTx.trxId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payment Method</span>
                  <span className="font-medium text-slate-700">{selectedTx.paymentCategory || 'Online Gateway'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Created Date</span>
                  <span className="font-medium text-slate-700">
                    {selectedTx.createdAt ? new Date(selectedTx.createdAt).toLocaleString() : '-'}
                  </span>
                </div>
              </div>

              {/* Raw Response if available */}
              {selectedTx.rawResponse && (
                <div className="space-y-1.5">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                    Gateway Raw Response Log
                  </span>
                  <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] overflow-x-auto max-h-48 font-mono">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedTx.rawResponse), null, 2);
                      } catch {
                        return selectedTx.rawResponse;
                      }
                    })()}
                  </pre>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-slate-100 pt-4">
            {selectedTx && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReVerify(selectedTx)}
                disabled={isVerifyingTx}
                className="text-amber-700 border-amber-300 hover:bg-amber-50 h-9 rounded-xl font-medium gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingTx ? 'animate-spin' : ''}`} />
                {isVerifyingTx ? 'Verifying with PayStation...' : 'Re-verify with Gateway'}
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={() => setSelectedTx(null)}
              className="bg-slate-900 text-white hover:bg-slate-800 h-9 rounded-xl px-5"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!txToDelete} onOpenChange={open => !open && setTxToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">Delete Payment Record?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Are you sure you want to delete the transaction record for invoice{' '}
              <strong>{txToDelete?.invoiceNumber}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingTx} className="rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              disabled={isDeletingTx}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
            >
              {isDeletingTx ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
