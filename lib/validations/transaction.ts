import { z } from 'zod'

export const issueBookSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  bookCopyId: z.number().positive('Book copy is required'),
  dueDate: z.string().min(1, 'Due date is required'), // ISO date string
  notes: z.string().max(500).optional().or(z.literal('')),
})

export const returnBookSchema = z.object({
  transactionId: z.number().positive('Transaction is required'),
  notes: z.string().max(500).optional().or(z.literal('')),
})

export const createFineSchema = z.object({
  transactionId: z.number().positive(),
  amount: z.number().positive('Fine amount must be positive'),
  reason: z.string().min(1, 'Reason is required').max(500),
})

export const paymentSchema = z.object({
  fineId: z.number().positive(),
  amount: z.number().positive('Payment amount must be positive'),
  paymentMethod: z.enum(['cash', 'card', 'online']),
  transactionRef: z.string().max(200).optional().or(z.literal('')),
})

export type IssueBookFormData = z.infer<typeof issueBookSchema>
export type ReturnBookFormData = z.infer<typeof returnBookSchema>
export type CreateFineFormData = z.infer<typeof createFineSchema>
export type PaymentFormData = z.infer<typeof paymentSchema>
