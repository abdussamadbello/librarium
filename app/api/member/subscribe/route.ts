import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { users, activityLog } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { planId, duration, price } = body

    if (!planId || !duration || price === undefined) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    const userId = session.user.id

    // Get current user
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate new expiry date
    let startDate = new Date()
    const currentExpiry = currentUser.membershipExpiry

    // If current membership is still active, extend from expiry date
    if (currentExpiry && new Date(currentExpiry) > new Date()) {
      startDate = new Date(currentExpiry)
    }

    const expiryDate = new Date(startDate)
    expiryDate.setMonth(expiryDate.getMonth() + duration)

    // Determine membership type based on plan
    let membershipType = 'standard'
    if (planId === 'monthly') {
      membershipType = 'monthly'
    } else if (planId === 'quarterly') {
      membershipType = 'quarterly'
    } else if (planId === 'annual') {
      membershipType = 'annual'
    }

    // Update user membership
    const [updatedUser] = await db
      .update(users)
      .set({
        membershipType,
        membershipStart: currentUser.membershipStart || new Date(),
        membershipExpiry: expiryDate,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning()

    // TODO: Log activity
    // Note: Temporarily disabled due to type issues
    // await db.insert(activityLog).values({
    //   userId: session.user.id,
    //   action: 'subscribe_membership',
    //   entityType: 'membership',
    //   entityId: userId,
    //   metadata: {
    //     planId,
    //     duration,
    //     price,
    //     expiryDate: expiryDate.toISOString(),
    //   },
    // })

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update membership' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      membership: {
        type: updatedUser.membershipType,
        start: updatedUser.membershipStart,
        expiry: updatedUser.membershipExpiry,
      },
    })
  } catch (error) {
    console.error('Error processing subscription:', error)
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    )
  }
}
