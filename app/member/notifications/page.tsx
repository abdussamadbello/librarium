import { Metadata } from 'next'
import { NotificationCenter } from '@/components/notifications/notification-center'

export const metadata: Metadata = {
  title: 'Notifications | Librarium',
  description: 'View and manage your notifications',
}

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-slate-900 mb-2">
          Notifications
        </h1>
        <p className="text-slate-600">
          Stay updated with your library activity and important reminders
        </p>
      </div>

      <NotificationCenter />
    </div>
  )
}
