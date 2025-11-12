'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export function QuickActions() {
  const [activeTab, setActiveTab] = useState<'issue' | 'return'>('issue')
  const [issueForm, setIssueForm] = useState({
    userId: '',
    bookCopyId: '',
    dueDate: '',
    notes: '',
  })
  const [returnForm, setReturnForm] = useState({
    transactionId: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/transactions/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...issueForm,
          bookCopyId: parseInt(issueForm.bookCopyId),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to issue book')
      }

      setMessage({ type: 'success', text: 'Book issued successfully!' })
      setIssueForm({ userId: '', bookCopyId: '', dueDate: '', notes: '' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleReturnBook = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/transactions/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...returnForm,
          transactionId: parseInt(returnForm.transactionId),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to return book')
      }

      const overdueInfo =
        data.overdueDays > 0
          ? ` (${data.overdueDays} days late, fine: $${data.fineAmount.toFixed(2)})`
          : ''

      setMessage({
        type: 'success',
        text: `Book returned successfully!${overdueInfo}`,
      })
      setReturnForm({ transactionId: '', notes: '' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('issue')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'issue'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 inline mr-2" />
            Issue Book
          </button>
          <button
            onClick={() => setActiveTab('return')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'return'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 inline mr-2" />
            Return Book
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Issue Book Form */}
        {activeTab === 'issue' && (
          <form onSubmit={handleIssueBook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Member ID
              </label>
              <Input
                type="text"
                required
                placeholder="Enter member ID"
                value={issueForm.userId}
                onChange={(e) => setIssueForm({ ...issueForm, userId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Book Copy ID
              </label>
              <Input
                type="number"
                required
                placeholder="Enter book copy ID"
                value={issueForm.bookCopyId}
                onChange={(e) => setIssueForm({ ...issueForm, bookCopyId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Due Date
              </label>
              <Input
                type="date"
                required
                value={issueForm.dueDate}
                onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes (Optional)
              </label>
              <Textarea
                placeholder="Add any notes..."
                value={issueForm.notes}
                onChange={(e) => setIssueForm({ ...issueForm, notes: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : 'Issue Book'}
            </Button>
          </form>
        )}

        {/* Return Book Form */}
        {activeTab === 'return' && (
          <form onSubmit={handleReturnBook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Transaction ID
              </label>
              <Input
                type="number"
                required
                placeholder="Enter transaction ID"
                value={returnForm.transactionId}
                onChange={(e) => setReturnForm({ ...returnForm, transactionId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes (Optional)
              </label>
              <Textarea
                placeholder="Add any notes about book condition..."
                value={returnForm.notes}
                onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : 'Return Book'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
