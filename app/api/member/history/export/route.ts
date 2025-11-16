import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { transactions, books, authors, members } from '@/lib/db/schema'
import { eq, and, or, isNull } from 'drizzle-orm'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'csv' // csv or json

    // Fetch complete borrowing history
    const history = await db
      .select({
        transaction: transactions,
        book: books,
        author: authors,
      })
      .from(transactions)
      .leftJoin(books, eq(transactions.bookId, books.id))
      .leftJoin(authors, eq(books.authorId, authors.id))
      .where(eq(transactions.memberId, session.user.id))
      .orderBy(transactions.checkoutDate)

    const formattedHistory = history.map((item) => ({
      title: item.book?.title || 'Unknown',
      author: item.author?.name || 'Unknown',
      isbn: item.book?.isbn || 'N/A',
      checkoutDate: item.transaction.checkoutDate,
      dueDate: item.transaction.dueDate,
      returnDate: item.transaction.returnDate,
      status: item.transaction.returnDate ? 'Returned' : 'Borrowed',
      notes: item.transaction.notes || '',
    }))

    if (format === 'json') {
      return NextResponse.json({
        exportDate: new Date().toISOString(),
        totalRecords: formattedHistory.length,
        history: formattedHistory,
      })
    }

    // Generate CSV
    const headers = [
      'Title',
      'Author',
      'ISBN',
      'Checkout Date',
      'Due Date',
      'Return Date',
      'Status',
      'Notes',
    ]

    const csvRows = [
      headers.join(','),
      ...formattedHistory.map((row) =>
        [
          `"${row.title.replace(/"/g, '""')}"`,
          `"${row.author.replace(/"/g, '""')}"`,
          row.isbn,
          new Date(row.checkoutDate).toLocaleDateString(),
          new Date(row.dueDate).toLocaleDateString(),
          row.returnDate ? new Date(row.returnDate).toLocaleDateString() : '',
          row.status,
          `"${row.notes.replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ]

    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="librarium-reading-history-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export history error:', error)
    return NextResponse.json(
      { error: 'Failed to export history' },
      { status: 500 }
    )
  }
}
