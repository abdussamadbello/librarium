import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  parentId: z.number().positive().optional().nullable(),
})

export const updateCategorySchema = categorySchema.partial()

export const authorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  bio: z.string().max(2000).optional().or(z.literal('')),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export const updateAuthorSchema = authorSchema.partial()

export type CategoryFormData = z.infer<typeof categorySchema>
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>
export type AuthorFormData = z.infer<typeof authorSchema>
export type UpdateAuthorFormData = z.infer<typeof updateAuthorSchema>
