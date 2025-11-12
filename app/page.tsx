import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="text-center space-y-6 p-8 max-w-4xl">
        {/* Logo and Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary-teal rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold">
            <span className="text-primary-teal">Library</span>{' '}
            <span className="text-neutral-800">Nexus</span>
          </h1>
          <p className="text-xl text-neutral-600">
            Modern Library Management System
          </p>
        </div>

        {/* Portal Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/member/discover">
            <Button size="lg" className="px-8">
              Member Portal
            </Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button size="lg" variant="outline" className="px-8">
              Admin Portal
            </Button>
          </Link>
        </div>

        {/* Status Card */}
        <Card className="mt-12 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Phase 1: Core Infrastructure Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-left text-sm">
              <div className="space-y-2 text-neutral-600">
                <p>✅ Next.js 15 with TypeScript</p>
                <p>✅ Tailwind CSS + Design System</p>
                <p>✅ Drizzle ORM + PostgreSQL</p>
                <p>✅ NextAuth.js v5 ready</p>
              </div>
              <div className="space-y-2 text-neutral-600">
                <p>✅ shadcn/ui Components</p>
                <p>✅ Admin Portal Layout</p>
                <p>✅ Member App Layout</p>
                <p>✅ Error & Loading States</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-8 flex gap-4 justify-center text-sm text-neutral-600">
          <Link href="/admin/dashboard" className="hover:text-primary-teal transition-colors">
            Admin Dashboard →
          </Link>
          <Link href="/member/discover" className="hover:text-primary-teal transition-colors">
            Discover Books →
          </Link>
        </div>
      </div>
    </div>
  );
}
