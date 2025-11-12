'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QRScanner } from '@/components/qr/qr-scanner'
import { User, BookOpen, CheckCircle, XCircle, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface ScannedUser {
  id: string
  name: string
  email: string
  membershipExpiry: Date | null
  isExpired: boolean
}

interface ScannedBook {
  copy: {
    id: number
    copyNumber: number
    status: string
  }
  book: {
    id: number
    title: string
  }
  author: {
    name: string
  } | null
}

export default function QRCheckoutPage() {
  const [scannedUser, setScannedUser] = useState<ScannedUser | null>(null)
  const [scannedBook, setScannedBook] = useState<ScannedBook | null>(null)
  const [scanning, setScanning] = useState<'user' | 'book' | null>(null)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleScan = async (qrData: string) => {
    setScanning(null)
    try {
      const res = await fetch('/api/qr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: qrData }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to scan QR code' })
        return
      }

      if (data.type === 'user') {
        if (data.isExpired) {
          setMessage({
            type: 'error',
            text: 'Membership expired! Please renew to borrow books.',
          })
        } else {
          setScannedUser(data.data)
          setMessage({ type: 'success', text: 'Member scanned successfully!' })
        }
      } else if (data.type === 'book') {
        setScannedBook(data.data)
        setMessage({ type: 'success', text: 'Book scanned successfully!' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to process QR code' })
    }
  }

  const handleCheckout = async () => {
    if (!scannedUser || !scannedBook) return

    setProcessing(true)
    try {
      // Calculate due date (14 days from now)
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 14)

      const res = await fetch('/api/admin/transactions/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: scannedUser.id,
          bookCopyId: scannedBook.copy.id,
          dueDate: dueDate.toISOString(),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: 'success',
          text: `Book checked out to ${scannedUser.name}. Due: ${format(dueDate, 'MMM d, yyyy')}`,
        })
        // Reset
        setTimeout(() => {
          setScannedUser(null)
          setScannedBook(null)
        }, 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Checkout failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to process checkout' })
    } finally {
      setProcessing(false)
    }
  }

  const handleReturn = async () => {
    if (!scannedUser || !scannedBook) return

    setProcessing(true)
    try {
      // Find the transaction for this user and book copy
      const res = await fetch('/api/admin/transactions/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: scannedUser.id,
          bookCopyId: scannedBook.copy.id,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        let msg = `Book returned by ${scannedUser.name}.`
        if (data.overdueDays > 0) {
          msg += ` Fine: $${data.fineAmount.toFixed(2)} (${data.overdueDays} days overdue)`
        }
        setMessage({ type: 'success', text: msg })
        // Reset
        setTimeout(() => {
          setScannedUser(null)
          setScannedBook(null)
        }, 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Return failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to process return' })
    } finally {
      setProcessing(false)
    }
  }

  const reset = () => {
    setScannedUser(null)
    setScannedBook(null)
    setMessage(null)
    setScanning(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">QR Checkout</h1>
        <p className="text-slate-600 mt-1">Scan QR codes to issue or return books</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scannedUser ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{scannedUser.name}</p>
                    <p className="text-sm text-slate-600">{scannedUser.email}</p>
                    {scannedUser.membershipExpiry && (
                      <p className="text-xs text-slate-500 mt-1">
                        Expires: {format(new Date(scannedUser.membershipExpiry), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <Button variant="outline" size="sm" onClick={() => setScannedUser(null)}>
                  Clear
                </Button>
              </div>
            ) : scanning === 'user' ? (
              <QRScanner onScan={handleScan} />
            ) : (
              <div className="text-center py-8">
                <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <Button
                  onClick={() => setScanning('user')}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Scan Member QR
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Book Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Book
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scannedBook ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{scannedBook.book.title}</p>
                    <p className="text-sm text-slate-600">
                      by {scannedBook.author?.name || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">Copy #{scannedBook.copy.copyNumber}</Badge>
                      <Badge
                        variant={scannedBook.copy.status === 'available' ? 'default' : 'secondary'}
                        className={scannedBook.copy.status === 'available' ? 'bg-green-600' : ''}
                      >
                        {scannedBook.copy.status}
                      </Badge>
                    </div>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <Button variant="outline" size="sm" onClick={() => setScannedBook(null)}>
                  Clear
                </Button>
              </div>
            ) : scanning === 'book' ? (
              <QRScanner onScan={handleScan} />
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <Button
                  onClick={() => setScanning('book')}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Scan Book QR
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {scannedUser && scannedBook && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handleCheckout}
                disabled={processing || scannedBook.copy.status !== 'available'}
                className="bg-teal-600 hover:bg-teal-700"
                size="lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {processing ? 'Processing...' : 'Issue Book'}
              </Button>
              <Button
                onClick={handleReturn}
                disabled={processing || scannedBook.copy.status === 'available'}
                variant="outline"
                size="lg"
              >
                <Calendar className="w-5 h-5 mr-2" />
                {processing ? 'Processing...' : 'Return Book'}
              </Button>
              <Button onClick={reset} variant="ghost" size="lg">
                <XCircle className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Scan the member&apos;s QR code first</li>
            <li>Then scan the book&apos;s QR code</li>
            <li>Click &quot;Issue Book&quot; to check out or &quot;Return Book&quot; to return</li>
            <li>The system will automatically process the transaction</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
