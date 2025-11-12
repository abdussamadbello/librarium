import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { canAccessAdmin } from '@/lib/auth/roles'
import { db } from '@/lib/db'
import { bookCopies, books } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import QRCode from 'qrcode'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { copyId } = body

    if (!copyId) {
      return NextResponse.json({ error: 'Copy ID is required' }, { status: 400 })
    }

    // Get book copy with book details
    const [bookCopy] = await db
      .select({
        copy: bookCopies,
        book: books,
      })
      .from(bookCopies)
      .leftJoin(books, eq(bookCopies.bookId, books.id))
      .where(eq(bookCopies.id, copyId))
      .limit(1)

    if (!bookCopy) {
      return NextResponse.json({ error: 'Book copy not found' }, { status: 404 })
    }

    // Generate QR code string if not exists
    let qrCodeData = bookCopy.copy.qrCode
    if (!qrCodeData) {
      qrCodeData = `BOOK_${bookCopy.copy.id}`

      // Update book copy with QR code
      await db
        .update(bookCopies)
        .set({ qrCode: qrCodeData })
        .where(eq(bookCopies.id, copyId))
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
      copy: {
        id: bookCopy.copy.id,
        copyNumber: bookCopy.copy.copyNumber,
        status: bookCopy.copy.status,
      },
      book: {
        id: bookCopy.book?.id,
        title: bookCopy.book?.title,
      },
    })
  } catch (error) {
    console.error('Error generating book QR code:', error)
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 })
  }
}
