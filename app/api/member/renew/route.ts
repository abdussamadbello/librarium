import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { transactions, members } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'

// Business rules
const RENEWAL_LIMITS = {
  standard: 2,    // Standard members can renew 2 times
  premium: 5,     // Premium members can renew 5 times
  student: 3,     // Student members can renew 3 times
}

const RENEWAL_PERIOD_DAYS = 14 // Extend by 14 days each renewal

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { transactionId } = await req.json()

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })
    }

    // Fetch the transaction
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.memberId, session.user.id),
          isNull(transactions.returnDate) // Only active borrows
        )
      )

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found or already returned' },
        { status: 404 }
      )
    }

    // Check renewal count
    const renewalCount = transaction.renewalCount || 0
    const membershipType = (session.user.membershipType || 'standard') as keyof typeof RENEWAL_LIMITS
    const maxRenewals = RENEWAL_LIMITS[membershipType]

    if (renewalCount >= maxRenewals) {
      return NextResponse.json(
        { 
          error: `Renewal limit reached. ${membershipType} members can renew up to ${maxRenewals} times.`,
          renewalCount,
          maxRenewals
        },
        { status: 400 }
      )
    }

    // Check if overdue
    const now = new Date()
    const dueDate = new Date(transaction.dueDate)
    if (now > dueDate) {
      return NextResponse.json(
        { error: 'Cannot renew overdue books. Please return to library or pay fines.' },
        { status: 400 }
      )
    }

    // Calculate new due date
    const newDueDate = new Date(dueDate)
    newDueDate.setDate(newDueDate.getDate() + RENEWAL_PERIOD_DAYS)

    // Update transaction
    const [updated] = await db
      .update(transactions)
      .set({
        dueDate: newDueDate,
        renewalCount: renewalCount + 1,
      })
      .where(eq(transactions.id, transactionId))
      .returning()

    return NextResponse.json({
      success: true,
      transaction: updated,
      newDueDate,
      renewalCount: renewalCount + 1,
      renewalsRemaining: maxRenewals - (renewalCount + 1),
      message: `Book renewed successfully! New due date: ${newDueDate.toLocaleDateString()}`
    })
  } catch (error) {
    console.error('Renew book error:', error)
    return NextResponse.json(
      { error: 'Failed to renew book' },
      { status: 500 }
    )
  }
}
