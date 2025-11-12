import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { canAccessAdmin } from '@/lib/auth/roles'
import { returnBook } from '@/lib/services/transactions'
import { returnBookSchema } from '@/lib/validations/transaction'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = returnBookSchema.parse(body)

    const result = await returnBook({
      ...validatedData,
      returnedTo: session.user.id,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error returning book:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to return book' },
      { status: 400 }
    )
  }
}
