'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, Send, Users, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function EmailPage() {
  const [formData, setFormData] = useState({
    recipient: 'all',
    subject: '',
    message: '',
  })
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setResult(null)

    try {
      // Simulated email sending - in production, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setResult({
        type: 'success',
        message: `Email sent successfully to ${formData.recipient === 'all' ? 'all members' : formData.recipient}!`,
      })
      setFormData({ recipient: 'all', subject: '', message: '' })
    } catch (error) {
      setResult({
        type: 'error',
        message: 'Failed to send email. Please try again.',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Email Communications</h1>
        <p className="text-slate-600 mt-1">Send announcements and notifications to members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
              <CardDescription>
                Send emails to members, staff, or specific groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipients *</Label>
                  <Select
                    value={formData.recipient}
                    onValueChange={(value) => setFormData({ ...formData, recipient: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      <SelectItem value="active">Active Members</SelectItem>
                      <SelectItem value="overdue">Members with Overdue Books</SelectItem>
                      <SelectItem value="fines">Members with Pending Fines</SelectItem>
                      <SelectItem value="premium">Premium Members</SelectItem>
                      <SelectItem value="staff">Staff Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Email subject line"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Type your message here..."
                    rows={10}
                    required
                  />
                  <p className="text-sm text-slate-500">
                    Use plain text or basic formatting. HTML is not supported in this version.
                  </p>
                </div>

                {result && (
                  <Alert variant={result.type === 'success' ? 'default' : 'destructive'}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{result.message}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({ recipient: 'all', subject: '', message: '' })}
                  >
                    Clear
                  </Button>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {sending ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Quick Templates & Info */}
        <div className="space-y-6">
          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-3">
              <div className="flex items-start">
                <Mail className="w-4 h-4 mr-2 mt-0.5 text-teal-600" />
                <div>
                  <p className="font-medium">Professional Tone</p>
                  <p className="text-xs">Keep messages clear and professional</p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="w-4 h-4 mr-2 mt-0.5 text-teal-600" />
                <div>
                  <p className="font-medium">Target Audience</p>
                  <p className="text-xs">Select appropriate recipient groups</p>
                </div>
              </div>
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-teal-600" />
                <div>
                  <p className="font-medium">Important Info</p>
                  <p className="text-xs">Include action items clearly</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-sm"
                onClick={() =>
                  setFormData({
                    ...formData,
                    subject: 'Library Announcement',
                    message: 'Dear Members,\n\nWe would like to inform you about...\n\nBest regards,\nLibrary Team',
                  })
                }
              >
                General Announcement
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-sm"
                onClick={() =>
                  setFormData({
                    ...formData,
                    subject: 'Overdue Book Reminder',
                    message: 'Dear Member,\n\nThis is a friendly reminder that you have books that are overdue. Please return them at your earliest convenience to avoid additional fines.\n\nThank you,\nLibrary Team',
                  })
                }
              >
                Overdue Reminder
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-sm"
                onClick={() =>
                  setFormData({
                    ...formData,
                    subject: 'New Books Available',
                    message: 'Dear Members,\n\nWe are excited to announce new additions to our library collection!\n\nVisit the library to check out these new titles.\n\nHappy Reading!\nLibrary Team',
                  })
                }
              >
                New Books Announcement
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-sm"
                onClick={() =>
                  setFormData({
                    ...formData,
                    subject: 'Library Hours Update',
                    message: 'Dear Members,\n\nPlease note that our library hours have been updated.\n\nNew Hours:\nMonday - Friday: 9 AM - 6 PM\nSaturday: 10 AM - 4 PM\nSunday: Closed\n\nThank you,\nLibrary Team',
                  })
                }
              >
                Hours Update
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Members</span>
                <span className="font-semibold">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Active Members</span>
                <span className="font-semibold">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Emails Sent (This Month)</span>
                <span className="font-semibold">0</span>
              </div>
              <p className="text-xs text-slate-500 pt-2">
                Note: Email functionality is currently in basic mode. Advanced analytics coming soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> This is a simplified email interface. In production, you would integrate with
          an email service provider (like Resend, SendGrid, or AWS SES) for actual email delivery.
          Currently, this interface demonstrates the UI and workflow.
        </AlertDescription>
      </Alert>
    </div>
  )
}
