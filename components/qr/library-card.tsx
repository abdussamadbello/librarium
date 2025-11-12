'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, CreditCard, Calendar, User, Mail, Phone, QrCode as QrCodeIcon } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'

interface LibraryCardProps {
  user: {
    id: number
    name: string
    email: string
    phone: string | null
    membershipType: string | null
    membershipStart: Date | null
    membershipExpiry: Date | null
  }
}

export function LibraryCard({ user }: LibraryCardProps) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateQRCode()
  }, [user.id])

  const generateQRCode = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/qr/generate-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!res.ok) throw new Error('Failed to generate QR code')

      const data = await res.json()
      setQrCode(data.qrCodeImage)
    } catch (err) {
      console.error('Failed to generate QR code:', err)
    } finally {
      setLoading(false)
    }
  }

  const downloadCard = () => {
    if (!qrCode) return

    // Create a canvas to render the full card
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Card dimensions
    canvas.width = 800
    canvas.height = 500

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#0d9488')
    gradient.addColorStop(1, '#0f766e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add decorative pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 2
    for (let i = 0; i < 10; i++) {
      ctx.beginPath()
      ctx.arc(canvas.width - 100, 100 + i * 40, 150, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px Arial'
    ctx.fillText('LIBRARY MEMBERSHIP CARD', 40, 60)

    // Member info
    ctx.font = '24px Arial'
    ctx.fillText(user.name, 40, 140)

    ctx.font = '18px Arial'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillText(`ID: ${user.id}`, 40, 180)
    ctx.fillText(`Type: ${user.membershipType || 'Standard'}`.toUpperCase(), 40, 210)

    if (user.membershipExpiry) {
      ctx.fillText(`Valid Until: ${format(new Date(user.membershipExpiry), 'MMM dd, yyyy')}`, 40, 240)
    }

    ctx.fillText(user.email, 40, 280)
    if (user.phone) {
      ctx.fillText(user.phone, 40, 310)
    }

    // QR Code
    const qrImg = new window.Image()
    qrImg.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(canvas.width - 240, canvas.height - 240, 200, 200)
      ctx.drawImage(qrImg, canvas.width - 230, canvas.height - 230, 180, 180)

      ctx.fillStyle = '#ffffff'
      ctx.font = '14px Arial'
      ctx.fillText('SCAN TO CHECKOUT', canvas.width - 230, canvas.height - 20)

      // Download
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `library-card-${user.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    qrImg.src = qrCode
  }

  const isExpired = user.membershipExpiry
    ? new Date(user.membershipExpiry) < new Date()
    : false

  const daysUntilExpiry = user.membershipExpiry
    ? Math.ceil((new Date(user.membershipExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="space-y-4">
      {/* Digital Library Card */}
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          </div>

          {/* Card Content */}
          <div className="relative p-8 md:p-10">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Left Section - Member Info */}
              <div className="md:col-span-2 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-8 h-8 text-white" />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Library Membership</h2>
                    <p className="text-teal-100 text-sm">Digital Member Card</p>
                  </div>
                </div>

                {/* Member Details */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-teal-200 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-teal-200 text-sm">Member Name</p>
                      <p className="text-white text-xl font-semibold">{user.name}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-teal-200 mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-teal-200 text-sm">Email</p>
                        <p className="text-white text-sm font-medium truncate">{user.email}</p>
                      </div>
                    </div>

                    {user.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-teal-200 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-teal-200 text-sm">Phone</p>
                          <p className="text-white text-sm font-medium">{user.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-teal-500/30">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-teal-200 text-sm mb-1">Member ID</p>
                        <p className="text-white font-mono text-lg font-bold">#{user.id.toString().padStart(6, '0')}</p>
                      </div>

                      <div>
                        <p className="text-teal-200 text-sm mb-1">Membership Type</p>
                        <p className="text-white font-semibold capitalize">{user.membershipType || 'Standard'}</p>
                      </div>

                      <div>
                        <p className="text-teal-200 text-sm mb-1">Status</p>
                        {isExpired ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
                            Expired
                          </span>
                        ) : daysUntilExpiry !== null && daysUntilExpiry < 30 ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white">
                            Expiring Soon
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {user.membershipExpiry && (
                    <div className="flex items-center gap-3 pt-2">
                      <Calendar className="w-5 h-5 text-teal-200" />
                      <div>
                        <p className="text-teal-200 text-sm">Valid Until</p>
                        <p className="text-white font-semibold">
                          {format(new Date(user.membershipExpiry), 'MMMM dd, yyyy')}
                          {daysUntilExpiry !== null && !isExpired && (
                            <span className="text-teal-200 text-sm ml-2">
                              ({daysUntilExpiry} days remaining)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Section - QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  {loading ? (
                    <div className="w-48 h-48 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                    </div>
                  ) : qrCode ? (
                    <div className="space-y-3">
                      <Image
                        src={qrCode}
                        alt="Member QR Code"
                        width={192}
                        height={192}
                        className="w-48 h-48"
                      />
                      <div className="text-center">
                        <p className="text-teal-800 font-semibold text-sm">SCAN TO CHECKOUT</p>
                        <p className="text-teal-600 text-xs">Show this to library staff</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-slate-500">
                      <QrCodeIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={downloadCard}
          disabled={!qrCode}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Card
        </Button>
        <Button
          onClick={() => window.print()}
          variant="outline"
          disabled={!qrCode}
        >
          Print Card
        </Button>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .relative.w-full.max-w-4xl,
          .relative.w-full.max-w-4xl * {
            visibility: visible;
          }
          .relative.w-full.max-w-4xl {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
