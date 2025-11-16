'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings as SettingsIcon, DollarSign, Clock, Mail, Users, Save, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General
    libraryName: 'Library Management System',
    libraryEmail: 'contact@library.com',
    libraryPhone: '555-0100',
    libraryAddress: '123 Library St',
    defaultLoanPeriod: '14',
    maxRenewals: '2',

    // Fines
    fineRatePerDay: '0.50',
    maximumFine: '50.00',
    gracePeriodDays: '0',

    // Reservations
    reservationExpiryHours: '48',
    maxReservationsPerUser: '5',

    // Email
    emailEnabled: 'true',
    overdueReminderDays: '3',

    // Membership
    standardDuration: '365',
    premiumDuration: '365',
    studentDuration: '365',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data && Object.keys(data).length > 0) {
        setSettings({ ...settings, ...data })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
          <p className="text-slate-600 mt-1">Configure library system parameters</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="fines">Fines</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic library information and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="libraryName">Library Name</Label>
                  <Input
                    id="libraryName"
                    value={settings.libraryName}
                    onChange={(e) => handleChange('libraryName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="libraryEmail">Contact Email</Label>
                  <Input
                    id="libraryEmail"
                    type="email"
                    value={settings.libraryEmail}
                    onChange={(e) => handleChange('libraryEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="libraryPhone">Contact Phone</Label>
                  <Input
                    id="libraryPhone"
                    value={settings.libraryPhone}
                    onChange={(e) => handleChange('libraryPhone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="libraryAddress">Library Address</Label>
                  <Input
                    id="libraryAddress"
                    value={settings.libraryAddress}
                    onChange={(e) => handleChange('libraryAddress', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultLoanPeriod">Default Loan Period (days)</Label>
                  <Input
                    id="defaultLoanPeriod"
                    type="number"
                    value={settings.defaultLoanPeriod}
                    onChange={(e) => handleChange('defaultLoanPeriod', e.target.value)}
                  />
                  <p className="text-xs text-slate-500">Number of days a book can be borrowed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRenewals">Maximum Renewals</Label>
                  <Input
                    id="maxRenewals"
                    type="number"
                    value={settings.maxRenewals}
                    onChange={(e) => handleChange('maxRenewals', e.target.value)}
                  />
                  <p className="text-xs text-slate-500">How many times a book can be renewed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fine Settings */}
        <TabsContent value="fines">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Fine Settings
              </CardTitle>
              <CardDescription>Configure overdue fine rates and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fineRatePerDay">Fine Rate Per Day ($)</Label>
                  <Input
                    id="fineRatePerDay"
                    type="number"
                    step="0.01"
                    value={settings.fineRatePerDay}
                    onChange={(e) => handleChange('fineRatePerDay', e.target.value)}
                  />
                  <p className="text-xs text-slate-500">Amount charged per day for overdue books</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maximumFine">Maximum Fine Cap ($)</Label>
                  <Input
                    id="maximumFine"
                    type="number"
                    step="0.01"
                    value={settings.maximumFine}
                    onChange={(e) => handleChange('maximumFine', e.target.value)}
                  />
                  <p className="text-xs text-slate-500">Maximum fine amount per book</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gracePeriodDays">Grace Period (days)</Label>
                  <Input
                    id="gracePeriodDays"
                    type="number"
                    value={settings.gracePeriodDays}
                    onChange={(e) => handleChange('gracePeriodDays', e.target.value)}
                  />
                  <p className="text-xs text-slate-500">Days after due date before fines start</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reservation Settings */}
        <TabsContent value="reservations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Reservation Settings
              </CardTitle>
              <CardDescription>Configure book reservation rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reservationExpiryHours">Reservation Expiry (hours)</Label>
                  <Input
                    id="reservationExpiryHours"
                    type="number"
                    value={settings.reservationExpiryHours}
                    onChange={(e) => handleChange('reservationExpiryHours', e.target.value)}
                  />
                  <p className="text-xs text-slate-500">Hours to pick up reserved books</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxReservationsPerUser">Max Reservations Per User</Label>
                  <Input
                    id="maxReservationsPerUser"
                    type="number"
                    value={settings.maxReservationsPerUser}
                    onChange={(e) => handleChange('maxReservationsPerUser', e.target.value)}
                  />
                  <p className="text-xs text-slate-500">Maximum active reservations allowed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Settings
              </CardTitle>
              <CardDescription>Configure email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailEnabled">Email Notifications</Label>
                  <select
                    id="emailEnabled"
                    value={settings.emailEnabled}
                    onChange={(e) => handleChange('emailEnabled', e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overdueReminderDays">Overdue Reminder (days before)</Label>
                  <Input
                    id="overdueReminderDays"
                    type="number"
                    value={settings.overdueReminderDays}
                    onChange={(e) => handleChange('overdueReminderDays', e.target.value)}
                  />
                  <p className="text-xs text-slate-500">Send reminder emails X days before due date</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Membership Settings */}
        <TabsContent value="membership">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Membership Settings
              </CardTitle>
              <CardDescription>Configure membership durations and types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="standardDuration">Standard Duration (days)</Label>
                  <Input
                    id="standardDuration"
                    type="number"
                    value={settings.standardDuration}
                    onChange={(e) => handleChange('standardDuration', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="premiumDuration">Premium Duration (days)</Label>
                  <Input
                    id="premiumDuration"
                    type="number"
                    value={settings.premiumDuration}
                    onChange={(e) => handleChange('premiumDuration', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentDuration">Student Duration (days)</Label>
                  <Input
                    id="studentDuration"
                    type="number"
                    value={settings.studentDuration}
                    onChange={(e) => handleChange('studentDuration', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Management */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Category Management
              </CardTitle>
              <CardDescription>Manage book categories and hierarchy</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Manage categories from the dedicated category management page
              </p>
              <Link href="/admin/settings/categories">
                <Button>
                  Manage Categories
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
