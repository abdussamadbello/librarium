'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Calendar, TrendingUp, Users, DollarSign, BookOpen } from 'lucide-react'

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null)

  const reports = [
    {
      id: 'circulation',
      title: 'Circulation Report',
      description: 'Detailed report of all book transactions within a date range',
      icon: TrendingUp,
      color: 'bg-teal-100 text-teal-600',
    },
    {
      id: 'members',
      title: 'Member Activity Report',
      description: 'Member borrowing patterns and membership status',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'fines',
      title: 'Fines & Revenue Report',
      description: 'Fine collection statistics and revenue breakdown',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'overdue',
      title: 'Overdue Books Report',
      description: 'List of all overdue books with member details',
      icon: Calendar,
      color: 'bg-red-100 text-red-600',
    },
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Complete book inventory with availability status',
      icon: BookOpen,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'popular',
      title: 'Popular Books Report',
      description: 'Most borrowed books and trending categories',
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-600',
    },
  ]

  const handleGenerateReport = async (reportId: string) => {
    setGenerating(reportId)

    // Simulate report generation
    setTimeout(() => {
      setGenerating(null)
      alert(`${reports.find((r) => r.id === reportId)?.title} generated successfully!`)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-600 mt-1">Generate and download library reports</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-slate-500">Reports Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">This Month</p>
                <p className="text-xs text-slate-500">Current Period</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">CSV</p>
                <p className="text-xs text-slate-500">Export Format</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">Live</p>
                <p className="text-xs text-slate-500">Real-time Data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${report.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Available
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2">{report.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{report.description}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={generating === report.id}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    {generating === report.id ? (
                      'Generating...'
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-medium text-sm">Circulation Report - November 2024</p>
                  <p className="text-xs text-slate-500">Generated on Nov 12, 2024</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-medium text-sm">Member Activity Report - Q4 2024</p>
                  <p className="text-xs text-slate-500">Generated on Nov 10, 2024</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-medium text-sm">Fines & Revenue Report - October 2024</p>
                  <p className="text-xs text-slate-500">Generated on Nov 1, 2024</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
