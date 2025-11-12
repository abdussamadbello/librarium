import { z } from 'zod'
import { UserRole } from '@/lib/auth/roles'

export const memberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z.nativeEnum(UserRole).default(UserRole.MEMBER),
  membershipType: z.enum(['standard', 'premium', 'student']).optional(),
  phone: z
    .string()
    .regex(/^[\d\s\-+()]*$/, 'Invalid phone number')
    .max(20)
    .optional()
    .or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')), // ISO date string
})

export const updateMemberSchema = memberSchema.partial().omit({ password: true })

export const updateMemberStatusSchema = z.object({
  membershipType: z.enum(['standard', 'premium', 'student']).optional(),
  membershipExpiry: z.string().optional(), // ISO date string
})

export type MemberFormData = z.infer<typeof memberSchema>
export type UpdateMemberFormData = z.infer<typeof updateMemberSchema>
export type UpdateMemberStatusFormData = z.infer<typeof updateMemberStatusSchema>
