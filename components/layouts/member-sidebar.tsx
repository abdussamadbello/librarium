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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
}

const navItems: NavItem[] = [
  { label: 'Discover', icon: Compass, href: '/member/discover' },
  { label: 'Category', icon: LayoutGrid, href: '/member/category' },
  { label: 'My Library', icon: Library, href: '/member/library' },
  { label: 'Favorites', icon: Heart, href: '/member/favorites' },
]

export function MemberSidebar() {
  const pathname = usePathname()

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
      <nav className="flex-1 space-y-2">
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

      {/* User Profile */}
      <div className="mt-auto">
        <div className="p-3 bg-teal-50 rounded-lg flex items-center space-x-3 border border-teal-100 cursor-pointer hover:bg-teal-100 transition-colors">
          <Avatar className="w-10 h-10">
            <AvatarImage src="https://placehold.co/100x100/66C0B7/FFF?text=DW" />
            <AvatarFallback>DW</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold text-sm text-teal-900">Davis Workman</div>
            <div className="text-xs text-teal-700">Premium Member</div>
          </div>
          <Settings className="w-5 h-5 text-neutral-500 hover:text-neutral-800" />
        </div>
      </div>
    </div>
  )
}
