import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { users, activityLog } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'
import { updateMemberSchema } from '@/lib/validations/member'
import { getActiveTransactionsByUser } from '@/lib/services/transactions'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = id

    const [member] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        membershipType: users.membershipType,
        membershipStart: users.membershipStart,
        membershipExpiry: users.membershipExpiry,
        phone: users.phone,
        address: users.address,
        dateOfBirth: users.dateOfBirth,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Get active transactions
    const activeTransactions = await getActiveTransactionsByUser(userId)

    // Get transaction history count
    const historyResult = await db.execute(
      `SELECT COUNT(*)::int as count FROM transactions WHERE user_id = '${userId}'`
    )

    // Get pending fines
    const finesResult = await db.execute(
      `SELECT * FROM fines WHERE user_id = '${userId}' AND status = 'pending' ORDER BY issued_at DESC`
    )

    const toArray = <T>(result: any): T[] => {
      if (Array.isArray(result)) return result
      if ('rows' in result) return result.rows
      return []
    }

    return NextResponse.json({
      member,
      activeTransactions,
      historyCount: (toArray(historyResult)[0] as any)?.count || 0,
      pendingFines: toArray(finesResult),
    })
  } catch (error) {
    console.error('Error fetching member:', error)
    return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = id
    const body = await req.json()
    const validatedData = updateMemberSchema.parse(body)

    const [updatedMember] = await db
      .update(users)
      .set({
        ...validatedData,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning()

    if (!updatedMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Log activity
    await db.insert(activityLog).values({
      userId: session.user.id,
      action: 'update_member',
      entityType: 'user',
      metadata: { name: updatedMember.name },
    })

    // Remove password from response
    const { password, ...memberWithoutPassword } = updatedMember

    return NextResponse.json(memberWithoutPassword)
  } catch (error: any) {
    console.error('Error updating member:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = id

    // Check if member has active transactions
    const activeTransactions = await getActiveTransactionsByUser(userId)

    if (activeTransactions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete member with active transactions' },
        { status: 400 }
      )
    }

    const [deletedMember] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning()

    if (!deletedMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Log activity
    await db.insert(activityLog).values({
      userId: session.user.id,
      action: 'delete_member',
      entityType: 'user',
      metadata: { name: deletedMember.name },
    })

    return NextResponse.json({ message: 'Member deleted successfully' })
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
  }
}
