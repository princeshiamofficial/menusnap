"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { 
  Shield, 
  UserPlus, 
  User,
  Search, 
  Trash2, 
  Edit3, 
  Key, 
  Mail, 
  Lock, 
  Check, 
  Loader2, 
  ShieldAlert, 
  ChevronRight, 
  Settings, 
  X,
  Plus,
  Info,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/use-admin-auth';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
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
  SelectValue
} from '@/components/ui/select';

import {
  getAdminUsersAction,
  createAdminUserAction,
  updateAdminUserAction,
  deleteAdminUserAction,
  getPredefinedAvatarsAction,
  AdminUserRecord
} from '@/app/actions/admin-users';
import { uploadFileLocally } from '@/app/actions/uploads';
import { compressImageFile } from '@/lib/utils';

// Page configuration for the permissions matrix
const APP_PAGES = [
  { key: 'dashboard',       label: 'Dashboard',     desc: 'Main dashboard analytics & graphs',        actions: ['view'] },
  { key: 'quick-manager',   label: 'Quick Manager', desc: 'Quick overview and action panel',            actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'contacts',        label: 'Contacts',      desc: 'Client CRM & contact directory',             actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'manage-orders',   label: 'Orders',        desc: 'Manage client orders & checkouts',           actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'responses',       label: 'Responses',     desc: 'Track customer responses & feed',            actions: ['view'] },
  { key: 'consultation-events', label: 'Consultations', desc: 'Manage Free Design Strategy Call bookings', actions: ['view', 'edit', 'delete'] },
  { key: 'manage-categories', label: 'Categories',  desc: 'Organize items and categories',              actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'manage-magictab', label: 'MagicTab',      desc: 'Real-time collaborative builder',            actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'manage-templates', label: 'Templates',    desc: 'Layout & menu design templates',             actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'magic-docs',      label: 'Magic Docs',    desc: 'Admin documents & manuals',                  actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'manage-users',    label: 'Manage Users',  desc: 'System users, roles, & access rights',       actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'settings',        label: 'Settings',      desc: 'System configuration & preferences',         actions: ['view', 'edit'] },
];

const ACTIONS = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' }
];

// Implicit permissions for default roles
const DEFAULT_USER_PERMISSIONS: Record<string, string[]> = {
  'dashboard': ['view'],
  'quick-manager': ['view'],
  'contacts': ['view', 'edit'],
  'manage-orders': ['view', 'edit'],
  'responses': ['view', 'edit'],
  'consultation-events': ['view', 'edit', 'delete'],
  'manage-categories': ['view', 'edit'],
  'manage-magictab': ['view', 'edit'],
  'manage-templates': ['view', 'edit'],
  'magic-docs': ['view', 'edit'],
  'settings': [],
  'manage-users': [],
};



export default function ManageUsersPage() {
  const { adminUser } = useAdminAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();
  const [predefinedAvatars, setPredefinedAvatars] = useState<{ url: string; name: string }[]>([]);

  // Dialog & Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);

  // Form Fields State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'User' | 'Custom'>('User');
  const [customPermissions, setCustomPermissions] = useState<Record<string, string[]>>({});
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedFile = await compressImageFile(file, 600, 0.85);
      const formData = new FormData();
      formData.append('file', compressedFile);

      const res = await uploadFileLocally(formData, 'avatars');
      if (res.success && res.data?.url) {
        setAvatarUrl(res.data.url);
        toast({ title: 'Success', description: 'Avatar uploaded successfully.' });
      } else {
        toast({ title: 'Upload Failed', description: res.message || 'Could not upload avatar.', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'An error occurred during upload.', variant: 'destructive' });
    }
  };

  const fetchPredefinedAvatars = async () => {
    try {
      const res = await getPredefinedAvatarsAction();
      if (res.success && res.data) {
        setPredefinedAvatars(res.data);
      }
    } catch (err) {
      console.error('Failed to load predefined avatars:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPredefinedAvatars();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await getAdminUsersAction();
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        toast({
          title: 'Error loading users',
          description: result.error || 'Failed to fetch admin users.',
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEmail('');
    setName('');
    setPassword('');
    setRole('User');
    setCustomPermissions({});
    setAvatarUrl('');
    setShowPassword(false);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (user: AdminUserRecord) => {
    setSelectedUser(user);
    setEmail(user.email);
    setName(user.name || '');
    setPassword('');
    setRole(user.role);
    setCustomPermissions(user.permissions || {});
    setAvatarUrl(user.avatar_url || '');
    setShowPassword(false);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (user: AdminUserRecord) => {
    if (adminUser?.id === user.id) {
      toast({
        title: 'Unauthorized',
        description: 'You cannot delete your own user account.',
        variant: 'destructive'
      });
      return;
    }
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  // Toggle permission helper
  const handleTogglePermission = (pageKey: string, actionKey: string, checked: boolean) => {
    let currentPermissions = { ...customPermissions };

    if (role !== 'Custom') {
      // If changing from Admin or User, copy their defaults
      if (role === 'Admin') {
        APP_PAGES.forEach(p => {
          currentPermissions[p.key] = ACTIONS.map(a => a.key);
        });
      } else if (role === 'User') {
        APP_PAGES.forEach(p => {
          currentPermissions[p.key] = [...(DEFAULT_USER_PERMISSIONS[p.key] || [])];
        });
      }
      setRole('Custom');
    }

    const currentList = currentPermissions[pageKey] || [];
    let updated: string[];
    if (checked) {
      updated = [...currentList, actionKey];
    } else {
      updated = currentList.filter(act => act !== actionKey);
    }

    setCustomPermissions({
      ...currentPermissions,
      [pageKey]: updated
    });
  };

  // Check if a permission checkbox should be checked
  const isPermissionChecked = (pageKey: string, actionKey: string): boolean => {
    if (role === 'Admin') return true;
    if (role === 'User') {
      return DEFAULT_USER_PERMISSIONS[pageKey]?.includes(actionKey) || false;
    }
    return customPermissions[pageKey]?.includes(actionKey) || false;
  };

  // Check if a permission checkbox should be disabled
  const isPermissionDisabled = (): boolean => {
    if (isEditOpen && selectedUser && adminUser?.id === selectedUser.id) {
      return true;
    }
    return false;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast({ title: 'Validation Error', description: 'Please enter a valid email.', variant: 'destructive' });
      return;
    }
    if (!password.trim() || password.length < 6) {
      toast({ title: 'Validation Error', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }

    startTransition(async () => {
      const perms = role === 'Custom' ? customPermissions : null;
      const res = await createAdminUserAction(email, password, role, perms, avatarUrl || null, name || null);
      if (res.success) {
        toast({ title: 'Success', description: 'User created successfully.' });
        setIsCreateOpen(false);
        fetchUsers();
      } else {
        toast({ title: 'Error', description: res.error || 'Failed to create user.', variant: 'destructive' });
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!email.trim() || !email.includes('@')) {
      toast({ title: 'Validation Error', description: 'Please enter a valid email.', variant: 'destructive' });
      return;
    }
    if (password && password.length < 6) {
      toast({ title: 'Validation Error', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }

    // Safety checks
    if (adminUser?.id === selectedUser.id) {
      if (role !== selectedUser.role || JSON.stringify(customPermissions) !== JSON.stringify(selectedUser.permissions || {})) {
        toast({
          title: 'Safety Check',
          description: 'You cannot change your own role or access permissions.',
          variant: 'destructive'
        });
        return;
      }
    }

    startTransition(async () => {
      const perms = role === 'Custom' ? customPermissions : null;
      const res = await updateAdminUserAction(selectedUser.id, email, password || undefined, role, perms, avatarUrl || null, name || null);
      if (res.success) {
        toast({ title: 'Success', description: 'User updated successfully.' });
        setIsEditOpen(false);
        fetchUsers();
      } else {
        toast({ title: 'Error', description: res.error || 'Failed to update user.', variant: 'destructive' });
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!selectedUser) return;
    startTransition(async () => {
      const res = await deleteAdminUserAction(selectedUser.id);
      if (res.success) {
        toast({ title: 'Deleted', description: 'User has been removed.' });
        setIsDeleteOpen(false);
        fetchUsers();
      } else {
        toast({ title: 'Error', description: res.error || 'Failed to delete user.', variant: 'destructive' });
      }
    });
  };

  // Filtered users for search input
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 min-w-0 w-full max-w-full overflow-x-hidden">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 w-full max-w-full">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-row items-center justify-between gap-2 flex-nowrap">
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2 shrink-0">
                <div className="p-1.5 sm:p-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200 shrink-0">
                  <Shield className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
                <span className="truncate">Manage Users</span>
              </h1>

              <Button 
                onClick={handleOpenCreate}
                className="rounded-full shadow-lg h-9 sm:h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all flex items-center gap-1.5 text-xs sm:text-sm shrink-0"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add User</span>
              </Button>
            </div>
            <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed">
              Create system users, set roles, and customize granular page-level actions.
            </p>
          </div>
        </div>

        {/* Directory table */}
        <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white w-full">
          <CardHeader className="px-5 sm:px-6 py-6 border-b border-slate-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
              <div className="flex flex-col gap-0.5">
                <CardTitle className="text-xl font-bold text-slate-800">System Administrators</CardTitle>
                <CardDescription className="text-slate-400 font-medium text-sm sm:text-base">
                  Authorized accounts with access control policies.
                </CardDescription>
              </div>

              {/* Search input */}
              <div className="relative group w-full sm:w-72 shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                <Input 
                  placeholder="Search by email or role..." 
                  className="pl-10 h-11 w-full bg-slate-50/50 border-slate-200 rounded-2xl focus-visible:ring-slate-900 focus-visible:ring-offset-0 transition-all placeholder:text-slate-400 font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <Table className="w-full min-w-[700px]">
                <TableHeader className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-10 shadow-sm border-b border-slate-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400 py-4 pl-6 w-[25%]">Name</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400 w-[25%]">Email</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400 w-[15%]">Role</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400 w-[20%]">Last Updated</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400 text-right pr-6 w-[15%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i} className="border-slate-50">
                        <TableCell className="pl-6"><div className="h-5 w-32 bg-slate-100 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-5 w-40 bg-slate-100 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" /></TableCell>
                        <TableCell><div className="h-5 w-32 bg-slate-100 rounded animate-pulse" /></TableCell>
                        <TableCell className="text-right pr-6"><div className="h-9 w-20 ml-auto bg-slate-100 rounded-full animate-pulse" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 py-10">
                          <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                            <Search className="h-8 w-8" />
                          </div>
                          <p className="text-slate-400 font-medium">No users found.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50/50 border-slate-100/80 transition-colors">
                        <TableCell className="py-4 pl-6 font-semibold text-slate-800">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img 
                                src={user.avatar_url} 
                                alt={user.email} 
                                className="h-9 w-9 rounded-full object-cover border border-slate-200/50 shrink-0" 
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-600 font-bold shrink-0 text-sm">
                                {(user.name || user.email).substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col truncate">
                              <span className="font-bold text-slate-900 text-sm truncate">
                                {user.name || user.email.split('@')[0]}
                              </span>
                              {adminUser?.id === user.id && (
                                <span className="text-[9px] text-indigo-500 font-bold tracking-wider uppercase mt-0.5">Logged In</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-slate-600 font-semibold text-sm">
                          {user.email}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge 
                            variant="outline" 
                            className={
                              user.role === 'Admin'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold px-3 py-1 rounded-full'
                                : user.role === 'User'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold px-3 py-1 rounded-full'
                                : 'bg-amber-50 border-amber-200 text-amber-700 font-bold px-3 py-1 rounded-full'
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-slate-500 font-medium text-sm">
                          {user.updated_at || user.created_at || '-'}
                        </TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleOpenEdit(user)}
                              className="h-8 w-8 p-0 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              disabled={adminUser?.id === user.id}
                              onClick={() => handleOpenDelete(user)}
                              className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-destructive hover:bg-destructive/5 disabled:opacity-40"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CREATE USER DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-3xl bg-white border-0 shadow-2xl">
          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-600" />
              <span>Add System User</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-semibold text-sm sm:text-base">
              Add a new administrator to the dashboard and configure access privileges.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              
              {/* Avatar Section */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative group shrink-0">
                  <div className="h-16 w-16 rounded-full bg-slate-100 border-2 border-slate-200/80 shadow-md flex items-center justify-center text-slate-500 font-black text-xl overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                    ) : (
                      email ? email.substring(0, 2).toUpperCase() : 'U'
                    )}
                  </div>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="absolute -top-1 -right-1 p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full shadow transition-all"
                      title="Remove Avatar"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-2.5 w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-500">Choose Profile Picture</span>
                    <label className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1">
                      <Upload className="h-3 w-3" />
                      <span>Upload Custom</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-12 overflow-y-auto pr-1">
                    {predefinedAvatars.map((av) => (
                      <button
                        key={av.url}
                        type="button"
                        onClick={() => setAvatarUrl(av.url)}
                        className={`h-8 w-8 rounded-full border transition-all overflow-hidden shrink-0 ${
                          avatarUrl === av.url 
                            ? 'border-indigo-600 ring-2 ring-indigo-100 scale-105 shadow-sm' 
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                        title={av.name}
                      >
                        <img src={av.url} alt={av.name} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Core info row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-bold text-xs uppercase tracking-wider text-slate-500">User Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      id="name"
                      type="text"
                      placeholder="e.g. Sadia Rahman"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-slate-900"
                      autoComplete="new-username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold text-xs uppercase tracking-wider text-slate-500">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      id="email"
                      type="email"
                      placeholder="user@colorhut.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-slate-900"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pass" className="font-bold text-xs uppercase tracking-wider text-slate-500">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      id="pass"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10 h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-slate-900"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="font-bold text-xs uppercase tracking-wider text-slate-500">Access Level / Role</Label>
                  <Select value={role} onValueChange={(val: any) => setRole(val)}>
                    <SelectTrigger id="role" className="h-11 rounded-xl bg-slate-50/50 border-slate-200">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                      <SelectItem value="Admin" className="py-2 px-3 focus:bg-slate-50 font-semibold rounded-lg text-sm">Admin (Full Access)</SelectItem>
                      <SelectItem value="User" className="py-2 px-3 focus:bg-slate-50 font-semibold rounded-lg text-sm">User (Standard View/Edit)</SelectItem>
                      <SelectItem value="Custom" className="py-2 px-3 focus:bg-slate-50 font-semibold rounded-lg text-sm">Custom Permissions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Information Alert */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 flex gap-3 text-slate-600 text-xs sm:text-sm font-medium">
                <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed">
                  {role === 'Admin' && (
                    <p><strong>Admin role:</strong> Grants full query execution rights, creating, editing, and deleting across all panel pages.</p>
                  )}
                  {role === 'User' && (
                    <p><strong>User role:</strong> Grants view privileges for general analytics, edit access to contacts, orders, responses, categories, and docs. Cannot delete entries or access Settings & User Management.</p>
                  )}
                  {role === 'Custom' && (
                    <p><strong>Custom role:</strong> Grant specific page access and action options (View, Create, Edit, Delete). Use the matrix below to configure.</p>
                  )}
                </div>
              </div>

              {/* Permissions matrix */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Access Control Matrix</h3>
                <div className="rounded-2xl border border-slate-150 overflow-hidden bg-slate-50/30">
                  <Table className="w-full border-collapse">
                    <TableHeader className="bg-slate-50 border-b border-slate-200/60">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-500 py-3 pl-4 w-[40%]">Page Feature</TableHead>
                        {ACTIONS.map(act => (
                          <TableHead key={act.key} className="font-bold text-[10px] uppercase tracking-wider text-slate-500 py-3 text-center w-[15%]">
                            {act.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {APP_PAGES.map(page => (
                        <TableRow key={page.key} className="hover:bg-slate-50/20 border-b border-slate-100">
                          <TableCell className="py-3 pl-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-sm">{page.label}</span>
                              <span className="text-[11px] text-slate-400 font-medium leading-relaxed">{page.desc}</span>
                            </div>
                          </TableCell>
                          {ACTIONS.map(act => {
                            const supportsAction = page.actions.includes(act.key);
                            const isChecked = isPermissionChecked(page.key, act.key);
                            const isDisabled = isPermissionDisabled();
                            return (
                              <TableCell key={act.key} className="py-3 text-center">
                                {supportsAction ? (
                                  <Checkbox 
                                    checked={isChecked}
                                    disabled={isDisabled}
                                    onCheckedChange={(checked) => handleTogglePermission(page.key, act.key, !!checked)}
                                    className="mx-auto h-5 w-5 border-slate-300 rounded focus-visible:ring-slate-900"
                                  />
                                ) : (
                                  <span className="text-slate-200 text-base font-bold select-none">—</span>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

            </div>

            {/* Footer */}
            <DialogFooter className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 shrink-0 flex items-center justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl border-slate-200 h-10 px-4 font-bold text-slate-500 text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="rounded-xl h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT USER DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-3xl bg-white border-0 shadow-2xl">
          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-indigo-600" />
              <span>Modify System User</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-semibold text-sm sm:text-base">
              Update email, change password, or adjust permissions for this administrator.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              
              {/* Avatar Section */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative group shrink-0">
                  <div className="h-16 w-16 rounded-full bg-slate-100 border-2 border-slate-200/80 shadow-md flex items-center justify-center text-slate-500 font-black text-xl overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                    ) : (
                      email ? email.substring(0, 2).toUpperCase() : 'U'
                    )}
                  </div>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="absolute -top-1 -right-1 p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full shadow transition-all"
                      title="Remove Avatar"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-2.5 w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-500">Choose Profile Picture</span>
                    <label className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1">
                      <Upload className="h-3 w-3" />
                      <span>Upload Custom</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-12 overflow-y-auto pr-1">
                    {predefinedAvatars.map((av) => (
                      <button
                        key={av.url}
                        type="button"
                        onClick={() => setAvatarUrl(av.url)}
                        className={`h-8 w-8 rounded-full border transition-all overflow-hidden shrink-0 ${
                          avatarUrl === av.url 
                            ? 'border-indigo-600 ring-2 ring-indigo-100 scale-105 shadow-sm' 
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                        title={av.name}
                      >
                        <img src={av.url} alt={av.name} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Core info row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="font-bold text-xs uppercase tracking-wider text-slate-500">User Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      id="edit-name"
                      type="text"
                      placeholder="e.g. Sadia Rahman"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-slate-900"
                      autoComplete="new-username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="font-bold text-xs uppercase tracking-wider text-slate-500">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      id="edit-email"
                      type="email"
                      placeholder="user@colorhut.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-slate-900"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-pass" className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      id="edit-pass"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10 h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-slate-900"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                    Leave blank to keep current password
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-role" className="font-bold text-xs uppercase tracking-wider text-slate-500">Access Level / Role</Label>
                  <Select disabled={selectedUser ? adminUser?.id === selectedUser.id : false} value={role} onValueChange={(val: any) => setRole(val)}>
                    <SelectTrigger id="edit-role" className="h-11 rounded-xl bg-slate-50/50 border-slate-200">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                      <SelectItem value="Admin" className="py-2 px-3 focus:bg-slate-50 font-semibold rounded-lg text-sm">Admin (Full Access)</SelectItem>
                      <SelectItem value="User" className="py-2 px-3 focus:bg-slate-50 font-semibold rounded-lg text-sm">User (Standard View/Edit)</SelectItem>
                      <SelectItem value="Custom" className="py-2 px-3 focus:bg-slate-50 font-semibold rounded-lg text-sm">Custom Permissions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Information Alert */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 flex gap-3 text-slate-600 text-xs sm:text-sm font-medium">
                <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed">
                  {role === 'Admin' && (
                    <p><strong>Admin role:</strong> Grants full query execution rights, creating, editing, and deleting across all panel pages.</p>
                  )}
                  {role === 'User' && (
                    <p><strong>User role:</strong> Grants view privileges for general analytics, edit access to contacts, orders, responses, categories, and docs. Cannot delete entries or access Settings & User Management.</p>
                  )}
                  {role === 'Custom' && (
                    <p><strong>Custom role:</strong> Grant specific page access and action options (View, Create, Edit, Delete). Use the matrix below to configure.</p>
                  )}
                </div>
              </div>

              {/* Permissions matrix */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Access Control Matrix</h3>
                <div className="rounded-2xl border border-slate-150 overflow-hidden bg-slate-50/30">
                  <Table className="w-full border-collapse">
                    <TableHeader className="bg-slate-50 border-b border-slate-200/60">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-500 py-3 pl-4 w-[40%]">Page Feature</TableHead>
                        {ACTIONS.map(act => (
                          <TableHead key={act.key} className="font-bold text-[10px] uppercase tracking-wider text-slate-500 py-3 text-center w-[15%]">
                            {act.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {APP_PAGES.map(page => (
                        <TableRow key={page.key} className="hover:bg-slate-50/20 border-b border-slate-100">
                          <TableCell className="py-3 pl-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-sm">{page.label}</span>
                              <span className="text-[11px] text-slate-400 font-medium leading-relaxed">{page.desc}</span>
                            </div>
                          </TableCell>
                          {ACTIONS.map(act => {
                            const supportsAction = page.actions.includes(act.key);
                            const isChecked = isPermissionChecked(page.key, act.key);
                            const isDisabled = isPermissionDisabled();
                            return (
                              <TableCell key={act.key} className="py-3 text-center">
                                {supportsAction ? (
                                  <Checkbox 
                                    checked={isChecked}
                                    disabled={isDisabled}
                                    onCheckedChange={(checked) => handleTogglePermission(page.key, act.key, !!checked)}
                                    className="mx-auto h-5 w-5 border-slate-300 rounded focus-visible:ring-slate-900"
                                  />
                                ) : (
                                  <span className="text-slate-200 text-base font-bold select-none">—</span>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

            </div>

            {/* Footer */}
            <DialogFooter className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 shrink-0 flex items-center justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditOpen(false)}
                className="rounded-xl border-slate-200 h-10 px-4 font-bold text-slate-500 text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="rounded-xl h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM ALERT DIALOG */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-3xl p-6 bg-white border-0 shadow-2xl max-w-md">
          <AlertDialogHeader className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-xl font-extrabold text-slate-900 text-center">Delete User Account?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 font-semibold text-center text-sm">
              Are you sure you want to delete admin account <strong>{selectedUser?.email}</strong>? This action cannot be undone and they will immediately lose dashboard access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-xl border-slate-200 font-bold text-slate-500 text-xs sm:text-sm flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isPending}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold text-xs sm:text-sm flex-1"
            >
              {isPending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
