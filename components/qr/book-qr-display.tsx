'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, QrCode } from 'lucide-react'
import Image from 'next/image'

interface BookQRDisplayProps {
  copyId: number
  bookTitle: string
  copyNumber: string
}

export function BookQRDisplay({ copyId, bookTitle, copyNumber }: BookQRDisplayProps) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    generateQRCode()
  }, [copyId])

  const generateQRCode = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/qr/generate-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ copyId }),
      })

      if (!res.ok) {
        throw new Error('Failed to generate QR code')
      }

      const data = await res.json()
      setQrCode(data.qrCodeImage)
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrCode) return

    const link = document.createElement('a')
    link.href = qrCode
    link.download = `book-${copyId}-qr-code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const printQRCode = () => {
    if (!qrCode) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${bookTitle}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 40px;
            }
            .qr-container {
              text-align: center;
              border: 2px solid #0d9488;
              padding: 30px;
              border-radius: 8px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
              color: #1e293b;
            }
            p {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 20px;
            }
            img {
              max-width: 300px;
              height: auto;
            }
            @media print {
              body { padding: 0; }
              .qr-container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>${bookTitle}</h1>
            <p>Copy #${copyNumber}</p>
            <img src="${qrCode}" alt="QR Code" />
            <p style="margin-top: 20px; font-size: 12px;">Scan this code to checkout or return this book</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Book QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-slate-600">Generating QR code...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Book QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={generateQRCode} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Book QR Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {qrCode && (
            <div className="relative w-64 h-64 border-2 border-teal-600 rounded-lg p-4 bg-white">
              <Image
                src={qrCode}
                alt="Book QR Code"
                width={240}
                height={240}
                className="w-full h-full"
              />
            </div>
          )}
          <p className="text-sm text-slate-600 text-center">
            Copy #{copyNumber} - {bookTitle}
          </p>
          <div className="flex gap-2 w-full">
            <Button
              onClick={downloadQRCode}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={printQRCode}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
              size="sm"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
