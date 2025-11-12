'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface QRCodeDisplayProps {
  userId?: string
  title?: string
  description?: string
}

export function QRCodeDisplay({ userId, title, description }: QRCodeDisplayProps) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateQRCode()
  }, [userId])

  const generateQRCode = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/qr/generate-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await res.json()

      if (res.ok) {
        setQrCode(data.qrCodeImage)
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrCode) return

    const link = document.createElement('a')
    link.href = qrCode
    link.download = 'library-qr-code.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'My QR Code'}</CardTitle>
        {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        ) : qrCode ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border-2 border-teal-600 inline-block mx-auto">
              <Image
                src={qrCode}
                alt="QR Code"
                width={300}
                height={300}
                className="w-full h-auto"
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-3">
                Show this QR code to library staff for quick checkout
              </p>
              <Button onClick={downloadQRCode} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <p>Failed to generate QR code</p>
            <Button onClick={generateQRCode} variant="outline" size="sm" className="mt-3">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
