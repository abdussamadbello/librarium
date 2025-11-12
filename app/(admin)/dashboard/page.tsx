import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Book, ArrowRight, AlertTriangle, Users } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Books', value: '12,450', icon: Book, color: 'blue' },
    { title: 'Borrowed Books', value: '680', icon: ArrowRight, color: 'purple' },
    { title: 'Overdue Books', value: '24', icon: AlertTriangle, color: 'red' },
    { title: 'Total Members', value: '15,000', icon: Users, color: 'green' },
  ]

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome to your library management system</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
              <Book className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="font-medium text-slate-700">Add New Book</p>
            </button>
            <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="font-medium text-slate-700">Register Member</p>
            </button>
            <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
              <ArrowRight className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="font-medium text-slate-700">Issue Book</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg">
              <div className="p-1.5 rounded-full bg-blue-100 text-blue-600">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">P. Nipuni Fernando</span> borrowed{' '}
                  <span className="font-medium">The Great Gatsby</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">2 seconds ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg">
              <div className="p-1.5 rounded-full bg-green-100 text-green-600">
                <Book className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Pathum Silva</span> returned{' '}
                  <span className="font-medium">The Hobbit</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">12 seconds ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
