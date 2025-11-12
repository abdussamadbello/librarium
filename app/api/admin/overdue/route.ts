import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { canAccessAdmin } from '@/lib/auth/roles'
import { getOverdueTransactions } from '@/lib/services/transactions'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const overdueTransactions = await getOverdueTransactions()

    return NextResponse.json(overdueTransactions)
  } catch (error) {
    console.error('Error fetching overdue books:', error)
    return NextResponse.json({ error: 'Failed to fetch overdue books' }, { status: 500 })
  }
}
