import { db } from '@/lib/db'
import { notifications, users } from '@/lib/db/schema'
import { eq, and, desc, isNull } from 'drizzle-orm'

interface CreateNotificationParams {
  userId: string
  type: 'due_soon' | 'overdue' | 'fine_added' | 'reservation_ready' | 'general'
  title: string
  message: string
  link?: string
  metadata?: any
}

interface MarkAsReadParams {
  notificationId: number
  userId: string
}

interface DeleteNotificationParams {
  notificationId: number
  userId: string
}

/**
 * Create a new notification
 */
export async function createNotification(params: CreateNotificationParams) {
  const { userId, type, title, message, link, metadata } = params

  try {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        title,
        message,
        link,
        metadata,
        isRead: false,
      })
      .returning()

    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw new Error('Failed to create notification')
  }
}

/**
 * Get user's notifications
 */
export async function getUserNotifications(userId: string, unreadOnly = false) {
  try {
    const conditions = unreadOnly
      ? and(eq(notifications.userId, userId), eq(notifications.isRead, false))
      : eq(notifications.userId, userId)

    return await db
      .select()
      .from(notifications)
      .where(conditions)
      .orderBy(desc(notifications.createdAt))
      .limit(50)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const unreadNotifications = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      )

    return unreadNotifications.length
  } catch (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(params: MarkAsReadParams) {
  const { notificationId, userId } = params

  try {
    // Verify ownership
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notificationId))
      .limit(1)

    if (!notification) {
      throw new Error('Notification not found')
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized')
    }

    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId))
      .returning()

    return updated
  } catch (error) {
    console.error('Error marking notification as read:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to mark notification as read')
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string) {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      )

    return { success: true }
  } catch (error) {
    console.error('Error marking all as read:', error)
    throw new Error('Failed to mark all notifications as read')
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(params: DeleteNotificationParams) {
  const { notificationId, userId } = params

  try {
    // Verify ownership
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notificationId))
      .limit(1)

    if (!notification) {
      throw new Error('Notification not found')
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized')
    }

    await db
      .delete(notifications)
      .where(eq(notifications.id, notificationId))

    return { success: true }
  } catch (error) {
    console.error('Error deleting notification:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to delete notification')
  }
}

/**
 * Create a reservation ready notification
 */
export async function createReservationReadyNotification(
  userId: string,
  bookTitle: string,
  expiresAt: Date,
  reservationId: number
) {
  return createNotification({
    userId,
    type: 'reservation_ready',
    title: 'Your Reserved Book is Ready!',
    message: `"${bookTitle}" is now available for pickup. Please collect it within 48 hours.`,
    link: '/member/reservations',
    metadata: { reservationId, expiresAt: expiresAt.toISOString() },
  })
}

/**
 * Create an overdue notification
 */
export async function createOverdueNotification(
  userId: string,
  bookTitle: string,
  daysOverdue: number
) {
  return createNotification({
    userId,
    type: 'overdue',
    title: 'Overdue Book Reminder',
    message: `"${bookTitle}" is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue. Please return it to avoid additional fines.`,
    link: '/member/borrowed',
    metadata: { daysOverdue },
  })
}

/**
 * Create a due soon notification
 */
export async function createDueSoonNotification(
  userId: string,
  bookTitle: string,
  dueDate: Date
) {
  return createNotification({
    userId,
    type: 'due_soon',
    title: 'Book Due Soon',
    message: `"${bookTitle}" is due on ${dueDate.toLocaleDateString()}. Please return or renew it soon.`,
    link: '/member/borrowed',
    metadata: { dueDate: dueDate.toISOString() },
  })
}

/**
 * Create a fine added notification
 */
export async function createFineAddedNotification(
  userId: string,
  amount: string,
  reason: string
) {
  return createNotification({
    userId,
    type: 'fine_added',
    title: 'Fine Added to Your Account',
    message: `A fine of $${amount} has been added to your account. Reason: ${reason}`,
    link: '/member/fines',
    metadata: { amount, reason },
  })
}
