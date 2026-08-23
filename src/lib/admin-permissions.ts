/**
 * Mapping of pathnames to permission keys.
 */
export function getPermissionKey(pathname: string): string {
  const cleanPath = pathname.replace(/^\/panel/, '/m-admin'); // normalization if needed
  
  if (cleanPath === '/m-admin' || cleanPath === '/m-admin/') return 'dashboard';
  if (cleanPath.startsWith('/m-admin/quick-manager')) return 'quick-manager';
  if (cleanPath.startsWith('/m-admin/contacts')) return 'contacts';
  if (cleanPath.startsWith('/m-admin/manage-orders')) return 'manage-orders';
  if (cleanPath.startsWith('/m-admin/responses')) return 'responses';
  if (cleanPath.startsWith('/m-admin/manage-categories')) return 'manage-categories';
  if (cleanPath.startsWith('/m-admin/manage-magictab')) return 'manage-magictab';
  if (cleanPath.startsWith('/m-admin/manage-templates')) return 'manage-templates';
  if (cleanPath.startsWith('/m-admin/magic-docs')) return 'magic-docs';
  if (cleanPath.startsWith('/m-admin/summernote-docs')) return 'summernote-docs';
  if (cleanPath.startsWith('/m-admin/testimonials')) return 'testimonials';
  if (cleanPath.startsWith('/m-admin/client-gallery')) return 'client-gallery';
  if (cleanPath.startsWith('/m-admin/settings')) return 'settings';
  if (cleanPath.startsWith('/m-admin/manage-users')) return 'manage-users';
  if (cleanPath.startsWith('/m-admin/consultation-events')) return 'consultation-events';
  return '';
}

/**
 * Checks if a user has permission on the client side.
 */
export function checkClientPermission(
  adminUser: { role?: string; permissions?: Record<string, string[]> } | null | undefined,
  pageKey: string,
  action: string = 'view'
): boolean {
  if (!adminUser) return false;
  
  // Admin has all permissions
  if (adminUser.role === 'Admin') return true;

  // Non-admins cannot access manage-users
  if (pageKey === 'manage-users') return false;

  // Default permissions for normal User role
  if (adminUser.role === 'User') {
    const defaultUserPermissions: Record<string, string[]> = {
      'dashboard': ['view'],
      'quick-manager': ['view', 'create', 'edit', 'delete'],
      'contacts': ['view', 'create', 'edit', 'delete'],
      'manage-orders': ['view', 'create', 'edit', 'delete'],
      'responses': ['view', 'edit'],
      'manage-categories': ['view', 'create', 'edit', 'delete'],
      'manage-magictab': ['view', 'create', 'edit', 'delete'],
      'manage-templates': ['view', 'create', 'edit', 'delete'],
      'magic-docs': ['view', 'create', 'edit', 'delete'],
      'summernote-docs': ['view', 'create', 'edit', 'delete'],
      'testimonials': ['view', 'create', 'edit', 'delete'],
      'client-gallery': ['view', 'create', 'edit', 'delete'],
      'settings': [],
      'manage-users': [],
      'consultation-events': ['view', 'edit', 'delete'],
    };
    return defaultUserPermissions[pageKey]?.includes(action) || false;
  }

  // Custom permissions check
  if (adminUser.role === 'Custom' && adminUser.permissions) {
    return adminUser.permissions[pageKey]?.includes(action) || false;
  }

  return false;
}
