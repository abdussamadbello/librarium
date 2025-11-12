import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import QRCode from 'qrcode'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { userId } = body

    // If no userId provided, generate for current user
    const targetUserId = userId || session.user.id

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate QR code string if not exists
    let qrCodeData = user.qrCode
    if (!qrCodeData) {
      qrCodeData = `USER_${user.id}`

      // Update user with QR code
      await db
        .update(users)
        .set({ qrCode: qrCodeData })
        .where(eq(users.id, targetUserId))
    }

    // Generate QR code image as data URL
    const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#0d9488', // teal-600
        light: '#ffffff',
      },
    })

    return NextResponse.json({
      qrCode: qrCodeData,
      qrCodeImage,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Error generating user QR code:', error)
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 })
  }
}
