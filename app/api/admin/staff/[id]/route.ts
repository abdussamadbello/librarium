import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'

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

    const [staff] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        membershipType: users.membershipType,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))

    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json({ error: 'Failed to fetch staff member' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const body = await req.json()
    const { name, email, role } = body

    // Validate role
    if (role && !['staff', 'admin', 'director', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const [updatedStaff] = await db
      .update(users)
      .set({
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
      })
      .where(eq(users.id, id))
      .returning()

    if (!updatedStaff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: updatedStaff.id,
      name: updatedStaff.name,
      email: updatedStaff.email,
      role: updatedStaff.role,
    })
  } catch (error: any) {
    console.error('Error updating staff:', error)
    return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 })
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

    // Prevent deleting yourself
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    const [deletedStaff] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning()

    if (!deletedStaff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Staff member deleted successfully' })
  } catch (error) {
    console.error('Error deleting staff:', error)
    return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 })
  }
}
