import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { users, activityLog } from '@/lib/db/schema'
import { eq, like, or, and, desc, sql } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'
import { memberSchema } from '@/lib/validations/member'
import * as bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where conditions
    const whereConditions = search
      ? and(
          eq(users.role, 'member'),
          or(
            like(users.name, `%${search}%`),
            like(users.email, `%${search}%`),
            like(users.phone, `%${search}%`)
          )
        )
      : eq(users.role, 'member')

    const members = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        membershipType: users.membershipType,
        membershipStart: users.membershipStart,
        membershipExpiry: users.membershipExpiry,
        phone: users.phone,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(whereConditions)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset)

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, 'member'))

    return NextResponse.json({
      members,
      total: countResult?.count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = memberSchema.parse(body)

    // Check if email already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1)

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Hash password if provided
    const hashedPassword = validatedData.password
      ? await bcrypt.hash(validatedData.password, 10)
      : null

    const [newMember] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        membershipType: validatedData.membershipType,
        membershipStart: new Date(),
        phone: validatedData.phone,
        address: validatedData.address,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        createdAt: new Date(),
      })
      .returning()

    // Log activity
    await db.insert(activityLog).values({
      userId: session.user.id,
      action: 'create_member',
      entityType: 'user',
      metadata: { name: newMember!.name, email: newMember!.email },
    })

    // Remove password from response
    const { password, ...memberWithoutPassword } = newMember!

    return NextResponse.json(memberWithoutPassword, { status: 201 })
  } catch (error: any) {
    console.error('Error creating member:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
  }
}
