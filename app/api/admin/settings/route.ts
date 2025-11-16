import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { systemSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    let query = db.select().from(systemSettings)

    if (category) {
      query = query.where(eq(systemSettings.category, category)) as any
    }

    const settings = await query

    // Convert to key-value object
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json(settingsObj)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { settings } = body // settings is an object of key-value pairs

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 })
    }

    // Update or insert each setting
    const updates = await Promise.all(
      Object.entries(settings).map(async ([key, value]) => {
        const [existing] = await db
          .select()
          .from(systemSettings)
          .where(eq(systemSettings.key, key))
          .limit(1)

        if (existing) {
          return db
            .update(systemSettings)
            .set({ value: value as string, updatedAt: new Date() })
            .where(eq(systemSettings.key, key))
            .returning()
        } else {
          return db
            .insert(systemSettings)
            .values({
              key,
              value: value as string,
              category: null,
              updatedAt: new Date(),
            })
            .returning()
        }
      })
    )

    return NextResponse.json({ message: 'Settings updated successfully', updates })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
