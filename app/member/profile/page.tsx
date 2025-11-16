'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LibraryCard } from '@/components/qr/library-card'
import { User, Mail, Phone, MapPin, Calendar, CreditCard, AlertCircle, Clock } from 'lucide-react'
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
    <div className="container max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-600 mt-1">Manage your account information</p>
      </div>

      {/* Membership Alerts */}
      {user && (!user.membershipExpiry || new Date(user.membershipExpiry) < new Date()) && (
        <Card className="border-teal-200 bg-teal-50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {user.membershipExpiry ? 'Membership Expired' : 'No Active Membership'}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Subscribe to a membership plan to start borrowing books
                  </p>
                </div>
              </div>
              <Link href="/member/membership">
                <Button className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                  Subscribe Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {user && user.membershipExpiry && (() => {
        const expiryDate = new Date(user.membershipExpiry)
        const now = new Date()
        const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return daysLeft <= 30 && daysLeft > 0
      })() && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">Membership Expiring Soon</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Your membership expires on {format(new Date(user.membershipExpiry!), 'MMMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <Link href="/member/membership">
                <Button className="bg-yellow-600 hover:bg-yellow-700 w-full sm:w-auto">
                  Renew Membership
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{user?.name || 'Loading...'}</h2>
              <p className="text-slate-600 mt-1">{user?.email || ''}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={status.variant} className="text-xs">
                  {status.label}
                </Badge>
                {user?.membershipType && (
                  <Badge variant="outline" className="text-xs">
                    {user.membershipType} Plan
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your account details and contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Full Name</p>
                    <p className="text-sm font-medium text-slate-900 mt-1 truncate">{user?.name || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email Address</p>
                    <p className="text-sm font-medium text-slate-900 mt-1 truncate">{user?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone Number</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date of Birth</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {user?.dateOfBirth
                        ? format(new Date(user.dateOfBirth), 'MMMM d, yyyy')
                        : 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 md:col-span-2">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Address</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">{user?.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> To update your personal information, please contact the library administrator.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Library Card */}
      <Card>
        <CardHeader>
          <CardTitle>Library Card</CardTitle>
          <CardDescription>Your library membership details</CardDescription>
        </CardHeader>
        <CardContent>
          {user && <LibraryCard user={user} />}
          </CardContent>
          </Card>

      </div>
    </div>
  )
}
