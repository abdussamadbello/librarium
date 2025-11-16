import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { activityLog, users } from '@/lib/db/schema'
import { eq, and, gte, lte, like, desc } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const entityType = searchParams.get('entityType')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build query conditions
    const conditions = []

    if (action) {
      conditions.push(like(activityLog.action, `%${action}%`))
    }

    if (entityType) {
      conditions.push(eq(activityLog.entityType, entityType))
    }

    if (userId) {
      conditions.push(eq(activityLog.userId, userId))
    }

    if (startDate) {
      conditions.push(gte(activityLog.createdAt, new Date(startDate)))
    }

    if (endDate) {
      conditions.push(lte(activityLog.createdAt, new Date(endDate)))
    }

    // Fetch activity logs with user info
    const logs = await db
      .select({
        log: activityLog,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        },
      })
      .from(activityLog)
      .leftJoin(users, eq(activityLog.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
