'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { Download, FileJson, FileText } from 'lucide-react'

interface HistoryItem {
  transaction: {
    id: number
    checkoutDate: Date
    dueDate: Date
    returnDate: Date
    notes: string | null
  }
  book: {
    id: number
    title: string
    isbn: string | null
    publicationYear: number | null
  }
  author: {
    id: number
    name: string
  } | null
  copy: {
    id: number
    copyNumber: number | null
  }
  wasLate: boolean
  daysLate: number
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/member/history')
      const data = await res.json()
      setHistory(data.history || [])
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setExporting(true)
      const res = await fetch(`/api/member/history/export?format=${format}`)
      
      if (format === 'json') {
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `librarium-reading-history-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `librarium-reading-history-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export history. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Borrowing History</h1>
          <p className="text-slate-600 mt-1">Your complete borrowing history</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleExport('csv')}
            disabled={exporting || history.length === 0}
            variant="outline"
            className="font-sans"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => handleExport('json')}
            disabled={exporting || history.length === 0}
            variant="outline"
            className="font-sans"
          >
            <FileJson className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Past Transactions ({history.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No borrowing history found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Borrowed</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Returned</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.transaction.id}>
                      <TableCell className="font-medium">{item.book.title}</TableCell>
                      <TableCell className="text-slate-600">
                        {item.author?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {format(new Date(item.transaction.checkoutDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {format(new Date(item.transaction.dueDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {format(new Date(item.transaction.returnDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {item.wasLate ? (
                          <Badge variant="destructive">
                            Late by {item.daysLate} day{item.daysLate > 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600">
                            On Time
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
