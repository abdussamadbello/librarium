"use client"

import { Search, Bell } from 'lucide-react'
import { UserButton } from '@/components/shared/user-button'

export function AdminHeader() {
  return (
    <header className="flex items-center justify-between h-14 bg-white shadow-sm px-6 border-b border-slate-200">
      {/* Welcome Message */}
      <div>
        <h1 className="text-sm font-semibold text-slate-800">Welcome! Admin</h1>
        <p className="text-xs text-slate-500">
          {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </p>
      </div>

      {/* Search & User */}
      <div className="flex items-center space-x-6">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search books, authors, or members..."
            className="w-64 bg-slate-100 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        {/* Notifications */}
        <button className="text-slate-500 hover:text-slate-800 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Menu with Sign Out */}
        <UserButton />
      </div>
    </header>
  )
}
