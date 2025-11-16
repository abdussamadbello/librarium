'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, TrendingUp, Package, XCircle } from 'lucide-react'

interface InventoryStats {
  totalBooks: number
  lowStock: number
  outOfStock: number
  highDemand: number
}

interface BookAlert {
  book: {
    id: number
    title: string
    isbn: string | null
    totalCopies: number
    availableCopies: number
  }
  author: {
    name: string
  } | null
  category: {
    name: string
  } | null
  reservationCount?: number
}

export default function InventoryPage() {
  const [stats, setStats] = useState<InventoryStats>({
    totalBooks: 0,
    lowStock: 0,
    outOfStock: 0,
    highDemand: 0,
  })
  const [lowStockBooks, setLowStockBooks] = useState<BookAlert[]>([])
  const [highDemandBooks, setHighDemandBooks] = useState<BookAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    try {
      const res = await fetch('/api/admin/inventory')
      const data = await res.json()

      setStats(data.stats)
      setLowStockBooks(data.lowStock || [])
      setHighDemandBooks(data.highDemand || [])
    } catch (error) {
      console.error('Failed to fetch inventory data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockBadge = (available: number, total: number) => {
    if (available === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (available <= 3) {
      return <Badge className="bg-yellow-600">Low Stock</Badge>
    }
    return <Badge variant="secondary">In Stock</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Inventory Alerts & Management</h1>
        <p className="text-slate-600 mt-1">Monitor stock levels and high-demand books</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Books</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalBooks}</p>
              </div>
              <Package className="w-8 h-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">High Demand</p>
                <p className="text-2xl font-bold text-blue-600">{stats.highDemand}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Low Stock Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : lowStockBooks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No low stock alerts</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Total Copies</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockBooks.map((item) => (
                    <TableRow key={item.book.id}>
                      <TableCell className="font-medium">{item.book.title}</TableCell>
                      <TableCell>{item.author?.name || 'Unknown'}</TableCell>
                      <TableCell>{item.category?.name || 'Uncategorized'}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.book.isbn || '-'}
                      </TableCell>
                      <TableCell>{item.book.totalCopies}</TableCell>
                      <TableCell>
                        <span
                          className={
                            item.book.availableCopies === 0
                              ? 'font-bold text-red-600'
                              : 'font-semibold text-yellow-600'
                          }
                        >
                          {item.book.availableCopies}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStockBadge(item.book.availableCopies, item.book.totalCopies)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* High Demand Alert */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            High Demand Books
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : highDemandBooks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No high demand alerts</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Total Copies</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Reservations</TableHead>
                    <TableHead>Recommendation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {highDemandBooks.map((item) => (
                    <TableRow key={item.book.id}>
                      <TableCell className="font-medium">{item.book.title}</TableCell>
                      <TableCell>{item.author?.name || 'Unknown'}</TableCell>
                      <TableCell>{item.category?.name || 'Uncategorized'}</TableCell>
                      <TableCell>{item.book.totalCopies}</TableCell>
                      <TableCell>{item.book.availableCopies}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-600">{item.reservationCount || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Order {Math.max(3, (item.reservationCount || 0) - item.book.totalCopies)}{' '}
                          more copies
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Inventory Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• <strong>Low Stock:</strong> Consider ordering more copies of books with less than 3 available copies</li>
            <li>• <strong>High Demand:</strong> Books with 3+ active reservations should be prioritized for reordering</li>
            <li>• <strong>Out of Stock:</strong> Immediate action needed for books with 0 available copies</li>
            <li>• <strong>Optimal Level:</strong> Aim to maintain at least 3-5 available copies of popular books</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
