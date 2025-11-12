'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LibraryCard } from '@/components/qr/library-card'
import { User, Mail, Phone, MapPin, Calendar, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session } = useSession()
  const user = session?.user as any // Type cast to access extended user properties

  const getMembershipStatus = () => {
    if (!user?.membershipExpiry) return { label: 'No Membership', variant: 'secondary' as const }

    const expiryDate = new Date(user.membershipExpiry)
    const now = new Date()

    if (expiryDate < now) return { label: 'Expired', variant: 'destructive' as const }

    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 30) return { label: `Expires in ${daysLeft} days`, variant: 'outline' as const }

    return { label: 'Active', variant: 'default' as const }
  }

  const status = user ? getMembershipStatus() : { label: 'Loading...', variant: 'secondary' as const }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-600 mt-1">Manage your account information</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-teal-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{user?.name || 'Loading...'}</h2>
              <p className="text-slate-600">{user?.email || ''}</p>
              <div className="mt-2">
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-slate-700">
            <User className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Full Name</p>
              <p className="font-medium">{user?.name || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-700">
            <Mail className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Email Address</p>
              <p className="font-medium">{user?.email || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-700">
            <Phone className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Phone Number</p>
              <p className="font-medium">{user?.phone || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-700">
            <MapPin className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Address</p>
              <p className="font-medium">{user?.address || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-700">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Date of Birth</p>
              <p className="font-medium">
                {user?.dateOfBirth
                  ? format(new Date(user.dateOfBirth), 'MMMM d, yyyy')
                  : 'Not provided'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Membership Card */}
      {user && <LibraryCard user={user} />}

      {/* Membership Management */}
      {user && (!user.membershipExpiry || new Date(user.membershipExpiry) < new Date()) && (
        <Card className="border-teal-200 bg-teal-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {user.membershipExpiry ? 'Membership Expired' : 'No Active Membership'}
                </h3>
                <p className="text-slate-600 mt-1">
                  Subscribe to a membership plan to start borrowing books
                </p>
              </div>
              <Link href="/member/membership">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  Subscribe Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Renew Membership */}
      {user && user.membershipExpiry && (() => {
        const expiryDate = new Date(user.membershipExpiry)
        const now = new Date()
        const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return daysLeft <= 30 && daysLeft > 0
      })() && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Membership Expiring Soon</h3>
                <p className="text-slate-600 mt-1">
                  Your membership expires on {format(new Date(user.membershipExpiry!), 'MMMM dd, yyyy')}
                </p>
              </div>
              <Link href="/member/membership">
                <Button className="bg-yellow-600 hover:bg-yellow-700">
                  Renew Membership
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> To update your personal information, please contact the library administrator.
        </p>
      </div>
    </div>
  )
}
