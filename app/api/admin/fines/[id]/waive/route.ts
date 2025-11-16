import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { fines } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const fineId = parseInt(params.id)

    const [updatedFine] = await db
      .update(fines)
      .set({
        status: 'waived',
      })
      .where(eq(fines.id, fineId))
      .returning()

    if (!updatedFine) {
      return NextResponse.json({ error: 'Fine not found' }, { status: 404 })
    }

    return NextResponse.json(updatedFine)
  } catch (error) {
    console.error('Error waiving fine:', error)
    return NextResponse.json({ error: 'Failed to waive fine' }, { status: 500 })
  }
}
