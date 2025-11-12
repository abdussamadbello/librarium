import { z } from 'zod'

export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title is too long'),
  isbn: z
    .string()
    .regex(/^(?:\d{10}|\d{13}|[\d-]{10,17})$/, 'Invalid ISBN format')
    .optional()
    .or(z.literal('')),
  authorId: z.number().positive('Author is required'),
  categoryId: z.number().positive('Category is required'),
  publisher: z.string().min(1, 'Publisher is required').max(200),
  publicationYear: z
    .number()
    .min(1000, 'Invalid year')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  language: z.string().min(1, 'Language is required').max(50),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  coverImageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  totalCopies: z.number().positive('Total copies must be at least 1').default(1),
  shelfLocation: z.string().max(100).optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
})

export const updateBookSchema = bookSchema.partial()

export const addBookCopySchema = z.object({
  bookId: z.number().positive(),
  copyNumber: z.number().positive(),
  condition: z.enum(['new', 'good', 'fair', 'poor']).default('good'),
  notes: z.string().max(500).optional(),
})

export const updateBookCopySchema = z.object({
  status: z.enum(['available', 'borrowed', 'in_repair', 'lost']).optional(),
  condition: z.enum(['new', 'good', 'fair', 'poor']).optional(),
  notes: z.string().max(500).optional(),
})

export type BookFormData = z.infer<typeof bookSchema>
export type UpdateBookFormData = z.infer<typeof updateBookSchema>
export type AddBookCopyFormData = z.infer<typeof addBookCopySchema>
export type UpdateBookCopyFormData = z.infer<typeof updateBookCopySchema>
