import { StatsCards } from '@/components/admin/dashboard/stats-cards'
import { QuickActions } from '@/components/admin/dashboard/quick-actions'
import { OverdueTable } from '@/components/admin/dashboard/overdue-table'
import { ActivityFeed } from '@/components/admin/dashboard/activity-feed'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome to your library management system</p>
      </div>

      {/* Stat Cards */}
      <StatsCards />

      {/* Quick Actions */}
      <QuickActions />

      {/* Overdue Books Table */}
      <OverdueTable />

      {/* Recent Activity */}
      <ActivityFeed />
    </div>
  )
}
