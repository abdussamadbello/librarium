import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { or, eq, inArray } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all staff members (staff, admin, director - not regular members)
    const staffMembers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        membershipType: users.membershipType,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(
        or(
          eq(users.role, 'staff'),
          eq(users.role, 'admin'),
          eq(users.role, 'director')
        )
      )

    return NextResponse.json(staffMembers)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, password, role } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['staff', 'admin', 'director'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be staff, admin, or director' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create staff member
    const [newStaff] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name,
        email,
        password: hashedPassword,
        role,
        membershipType: null, // Staff don't have membership types
        createdAt: new Date(),
      })
      .returning()

    if (!newStaff) {
      return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 })
    }

    return NextResponse.json(
      {
        id: newStaff.id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating staff:', error)
    return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 })
  }
}
