'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, CreditCard } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface MembershipPlan {
  id: string
  name: string
  duration: number // in months
  price: number
  features: string[]
  recommended?: boolean
}

const membershipPlans: MembershipPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    duration: 1,
    price: 9.99,
    features: [
      'Borrow up to 3 books at a time',
      'Access to digital library',
      'Free WiFi access',
      'Online book reservation',
    ],
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    duration: 3,
    price: 24.99,
    features: [
      'Borrow up to 5 books at a time',
      'Access to digital library',
      'Free WiFi access',
      'Online book reservation',
      'Priority book holds',
      '10% off late fees',
    ],
    recommended: true,
  },
  {
    id: 'annual',
    name: 'Annual',
    duration: 12,
    price: 89.99,
    features: [
      'Borrow up to 10 books at a time',
      'Access to digital library',
      'Free WiFi access',
      'Online book reservation',
      'Priority book holds',
      'No late fees',
      'Access to premium events',
      'Free inter-library loans',
    ],
  },
]

export default function MembershipPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const user = session?.user as any

  const handleSubscribe = async (planId: string) => {
    setLoading(true)
    setSelectedPlan(planId)

    try {
      const plan = membershipPlans.find((p) => p.id === planId)
      if (!plan) return

      const res = await fetch('/api/member/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          duration: plan.duration,
          price: plan.price,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to subscribe')
        return
      }

      alert('Membership subscription successful!')
      router.push('/member/profile')
      router.refresh()
    } catch (error) {
      console.error('Subscription error:', error)
      alert('Failed to process subscription')
    } finally {
      setLoading(false)
      setSelectedPlan(null)
    }
  }

  const isExpired = user?.membershipExpiry
    ? new Date(user.membershipExpiry) < new Date()
    : true

  const daysLeft = user?.membershipExpiry
    ? Math.ceil(
        (new Date(user.membershipExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Membership Plans</h1>
        <p className="text-slate-600 mt-1">
          {isExpired
            ? 'Choose a plan to start your library membership'
            : 'Upgrade or renew your membership'}
        </p>
      </div>

      {/* Current Status */}
      {user && (
        <Card className={isExpired ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Current Membership Status</h3>
                {isExpired ? (
                  <p className="text-slate-600 mt-1">
                    Your membership has {user.membershipExpiry ? 'expired' : 'not been activated'}
                  </p>
                ) : (
                  <p className="text-slate-600 mt-1">
                    Your membership is active ({daysLeft} days remaining)
                  </p>
                )}
              </div>
              <Badge variant={isExpired ? 'destructive' : 'default'} className="text-sm">
                {isExpired ? 'Expired' : 'Active'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Membership Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {membershipPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.recommended
                ? 'border-teal-600 shadow-lg scale-105'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-teal-600 text-white">Recommended</Badge>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-center">
                <div className="text-2xl font-bold text-slate-900">{plan.name}</div>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-teal-600">${plan.price}</span>
                  <span className="text-slate-500 ml-1">/ {plan.duration} month{plan.duration > 1 ? 's' : ''}</span>
                </div>
                <div className="text-sm text-slate-500 mt-2">
                  ${(plan.price / plan.duration).toFixed(2)} per month
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
                className={`w-full ${
                  plan.recommended
                    ? 'bg-teal-600 hover:bg-teal-700'
                    : 'bg-slate-600 hover:bg-slate-700'
                }`}
              >
                {loading && selectedPlan === plan.id ? (
                  'Processing...'
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isExpired ? 'Subscribe' : 'Upgrade/Renew'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900">How does membership work?</h4>
            <p className="text-slate-600 text-sm mt-1">
              Select a plan and complete the payment. Your membership will be activated immediately,
              and you can start borrowing books right away.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900">Can I upgrade my plan?</h4>
            <p className="text-slate-600 text-sm mt-1">
              Yes! You can upgrade to a higher tier at any time. The remaining value of your current
              plan will be credited toward the new plan.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900">What happens when my membership expires?</h4>
            <p className="text-slate-600 text-sm mt-1">
              You&apos;ll need to return all borrowed books and renew your membership to continue
              borrowing. Your account data and history will be preserved.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900">Are there any hidden fees?</h4>
            <p className="text-slate-600 text-sm mt-1">
              No hidden fees! The price shown is what you pay. Late fees may apply if books are
              returned after the due date (except for annual members).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Need help?</strong> Contact our support team at support@library.com or call
          (555) 123-4567 for assistance with membership plans.
        </p>
      </div>
    </div>
  )
}
