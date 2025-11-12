import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { canAccessAdmin } from '@/lib/auth/roles'
import { issueBook } from '@/lib/services/transactions'
import { issueBookSchema } from '@/lib/validations/transaction'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = issueBookSchema.parse(body)

    const transaction = await issueBook({
      ...validatedData,
      issuedBy: session.user.id,
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error: any) {
    console.error('Error issuing book:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to issue book' },
      { status: 400 }
    )
  }
}
