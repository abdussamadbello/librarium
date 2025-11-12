'use client'

import { signOut } from 'next-auth/react'
import { useCurrentUser } from '@/hooks/use-current-user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { getRoleDisplayName, UserRole } from '@/lib/auth/roles'

export function UserButton() {
  const { user, isLoading } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <div className="flex items-center space-x-3">
      <Avatar className="w-8 h-8">
        <AvatarImage src={user.image || undefined} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="text-left hidden md:block">
        <div className="font-semibold text-sm text-slate-800">{user.name}</div>
        <div className="text-xs text-slate-500">
          {getRoleDisplayName((user.role as UserRole) || UserRole.MEMBER)}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => signOut({ callbackUrl: '/login' })}
        title="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  )
}
