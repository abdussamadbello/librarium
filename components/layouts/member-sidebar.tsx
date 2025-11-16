"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Compass,
  LayoutGrid,
  Library,
  Heart,
  Settings,
  BookOpen,
  LogOut,
  MessageSquare,
  Home,
  History,
  DollarSign,
  Bell,
  Search,
  CreditCard,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { UserButton } from '@/components/shared/user-button'
import { useCurrentUser } from '@/hooks/use-current-user'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/member/dashboard' },
  { label: 'Discover', icon: Compass, href: '/member/discover' },
  { label: 'Search', icon: Search, href: '/member/search' },
  { label: 'Book Chat', icon: MessageSquare, href: '/member/chat' },
  { label: 'History', icon: History, href: '/member/history' },
  { label: 'Reservations', icon: Calendar, href: '/member/reservations' },
  { label: 'Fines', icon: DollarSign, href: '/member/fines' },
  { label: 'Membership', icon: CreditCard, href: '/member/membership' },
  { label: 'Notifications', icon: Bell, href: '/member/notifications' },
]

export function MemberSidebar() {
  const pathname = usePathname()
  const { user } = useCurrentUser()
  
  // Use Gravatar default mystery person icon
  const gravatarUrl = `https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y&s=80`

  return (
    <div className="w-64 bg-white border-r border-neutral-200 flex flex-col p-4 h-screen">
      {/* Logo/Title */}
      <div className="flex items-center space-x-2 p-3 mb-4 border-b border-neutral-200 pb-5">
        <div className="w-8 h-8 bg-primary-teal rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-teal-700">Library</span>
        <span className="text-xl font-light text-neutral-500">Nexus</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
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
                  ? 'bg-primary-teal text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="px-3 py-2">
        <ThemeToggle />
      </div>

      {/* User Profile */}
      <div className="mt-2 space-y-2">
        <Link href="/member/profile">
          <div className="p-3 bg-teal-50 rounded-lg flex items-center space-x-3 border border-teal-100 cursor-pointer hover:bg-teal-100 transition-colors">
            <Avatar className="w-10 h-10">
              <AvatarImage src={gravatarUrl} />
              <AvatarFallback className="bg-teal-600 text-white">
                {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-semibold text-sm text-teal-900">{user?.name || 'User'}</div>
              <div className="text-xs text-teal-700">Member</div>
            </div>
            <Settings className="w-5 h-5 text-neutral-500 hover:text-neutral-800" />
          </div>
        </Link>
        
        {/* Sign Out Button */}
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
