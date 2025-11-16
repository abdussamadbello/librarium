import { z } from 'zod'

export const createReservationSchema = z.object({
  bookId: z.number().positive('Book is required'),
})

export const cancelReservationSchema = z.object({
  reservationId: z.number().positive('Reservation is required'),
})

export const fulfillReservationSchema = z.object({
  reservationId: z.number().positive('Reservation is required'),
})

export const getReservationSchema = z.object({
  reservationId: z.number().positive('Reservation is required'),
})

export const listReservationsSchema = z.object({
  status: z.enum(['active', 'fulfilled', 'cancelled', 'expired']).optional(),
  page: z.number().positive().optional().default(1),
  limit: z.number().positive().max(100).optional().default(20),
})

export type CreateReservationData = z.infer<typeof createReservationSchema>
export type CancelReservationData = z.infer<typeof cancelReservationSchema>
export type FulfillReservationData = z.infer<typeof fulfillReservationSchema>
export type GetReservationData = z.infer<typeof getReservationSchema>
export type ListReservationsData = z.infer<typeof listReservationsSchema>
