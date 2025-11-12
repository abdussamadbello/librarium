import { auth } from './config'
import { UserRole, canAccessAdmin, canAccessMember } from './roles'

/**
 * Server-side function to get current session
 * Use this in Server Components and API routes
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

/**
 * Server-side function to require authentication
 * Throws error if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

/**
 * Server-side function to require admin role
 * Throws error if not admin/staff/director
 */
export async function requireAdmin() {
  const user = await requireAuth()

  if (!canAccessAdmin(user.role)) {
    throw new Error('Forbidden: Admin access required')
  }

  return user
}

/**
 * Server-side function to check if current user has specific role
 */
export async function hasRole(role: UserRole) {
  const user = await getCurrentUser()
  return user?.role === role
}

/**
 * Server-side function to check if current user is member
 */
export async function isMember() {
  return await hasRole(UserRole.MEMBER)
}

/**
 * Server-side function to check if current user is staff
 */
export async function isStaff() {
  return await hasRole(UserRole.STAFF)
}

/**
 * Server-side function to check if current user is admin
 */
export async function isAdmin() {
  return await hasRole(UserRole.ADMIN)
}

/**
 * Server-side function to check if current user is director
 */
export async function isDirector() {
  return await hasRole(UserRole.DIRECTOR)
}
