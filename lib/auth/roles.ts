/**
 * User Roles and Permissions
 * Role-Based Access Control (RBAC) System
 */

export enum UserRole {
  MEMBER = 'member',
  STAFF = 'staff',
  ADMIN = 'admin',
  DIRECTOR = 'director',
}

export const PERMISSIONS = {
  // Member permissions
  [UserRole.MEMBER]: [
    'read:books',
    'read:own_data',
    'read:own_transactions',
    'create:favorite',
    'create:shelf',
    'update:own_profile',
  ],

  // Staff permissions (includes all member permissions)
  [UserRole.STAFF]: [
    'read:books',
    'read:own_data',
    'read:own_transactions',
    'create:favorite',
    'create:shelf',
    'update:own_profile',
    // Additional staff permissions
    'read:members',
    'read:transactions',
    'create:transaction',
    'update:transaction',
    'create:book',
    'update:book',
    'create:member',
    'update:member',
  ],

  // Admin permissions (includes all staff permissions + more)
  [UserRole.ADMIN]: [
    '*', // All permissions
    'delete:book',
    'delete:member',
    'manage:staff',
    'manage:categories',
    'manage:authors',
    'manage:fines',
    'process:payment',
    'waive:fine',
  ],

  // Director permissions (full access + analytics)
  [UserRole.DIRECTOR]: [
    '*', // All permissions
    'read:analytics',
    'read:reports',
    'export:data',
    'manage:settings',
  ],
} as const

export type Permission = string

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const rolePermissions = PERMISSIONS[role] || []

  // If role has wildcard permission, grant all
  if ((rolePermissions as readonly string[]).includes('*')) {
    return true
  }

  return (rolePermissions as readonly string[]).includes(permission)
}

/**
 * Check if user role can access admin routes
 */
export function canAccessAdmin(role?: string): boolean {
  if (!role) return false

  return [
    UserRole.STAFF,
    UserRole.ADMIN,
    UserRole.DIRECTOR,
  ].includes(role as UserRole)
}

/**
 * Check if user role can access member routes
 */
export function canAccessMember(role?: string): boolean {
  if (!role) return false

  return Object.values(UserRole).includes(role as UserRole)
}

/**
 * Get display name for role
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    [UserRole.MEMBER]: 'Member',
    [UserRole.STAFF]: 'Staff',
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.DIRECTOR]: 'Director',
  }

  return displayNames[role] || role
}
