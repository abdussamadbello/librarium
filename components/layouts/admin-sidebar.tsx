"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Book,
  Users,
  UserPlus,
  BookOpen,
  QrCode,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  FileText,
  Mail,
  BarChart2,
  Settings,
  Clock,
  Building2,
  ScrollText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/admin/dashboard' },
  { label: 'Manage Books', icon: Book, href: '/admin/books' },
  { label: 'Manage Members', icon: Users, href: '/admin/members' },
  { label: 'Manage Authors', icon: UserPlus, href: '/admin/authors' },
  { label: 'Manage Publishers', icon: Building2, href: '/admin/publishers' },
  { label: 'Manage Category', icon: BookOpen, href: '/admin/categories' },
  { label: 'QR Checkout', icon: QrCode, href: '/admin/qr-checkout' },
  { label: 'Book QR Codes', icon: QrCode, href: '/admin/book-qr-codes' },
  { label: 'Reservations', icon: Clock, href: '/admin/reservations' },
  { label: 'Issued Books', icon: ArrowRight, href: '/admin/issued' },
  { label: 'Returned Books', icon: ArrowLeft, href: '/admin/returned' },
  { label: 'Overdue Books', icon: AlertTriangle, href: '/admin/overdue' },
  { label: 'Fines & Payments', icon: FileText, href: '/admin/fines' },
  { label: 'Staff Management', icon: Users, href: '/admin/staff' },
  { label: 'Email', icon: Mail, href: '/admin/email' },
  { label: 'Audit Logs', icon: ScrollText, href: '/admin/audit-logs' },
  { label: 'Reports / Analytics', icon: BarChart2, href: '/admin/reports' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-slate-800 text-slate-300 flex flex-col h-screen">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 shadow-md bg-slate-900">
        <BookOpen className="w-6 h-6 text-white" />
        <span className="text-xl font-semibold text-white ml-2">LMS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'hover:bg-slate-700 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
