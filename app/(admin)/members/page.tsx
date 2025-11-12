'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash2, Mail, Phone } from 'lucide-react'
import { format } from 'date-fns'

interface Member {
  id: string
  name: string
  email: string
  phone: string | null
  membershipType: string | null
  membershipStart: Date | null
  membershipExpiry: Date | null
  createdAt: Date
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/admin/members?search=${search}&limit=50`)
      const data = await res.json()
      setMembers(data.members || [])
    } catch (error) {
      console.error('Failed to fetch members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    fetchMembers()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete member "${name}"?`)) return

    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Member deleted successfully')
        fetchMembers()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete member')
      }
    } catch (error) {
      alert('Failed to delete member')
    }
  }

  const getMembershipStatus = (expiry: Date | null) => {
    if (!expiry) return { label: 'No Membership', variant: 'secondary' as const }
    const expiryDate = new Date(expiry)
    const now = new Date()

    if (expiryDate < now) return { label: 'Expired', variant: 'destructive' as const }

    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 30) return { label: `Expires in ${daysLeft}d`, variant: 'outline' as const }

    return { label: 'Active', variant: 'default' as const }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Members Management</h1>
          <p className="text-slate-600 mt-1">Manage library members and their memberships</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Register New Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </div>
          </form>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No members found{search ? ` for "${search}"` : ''}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Membership</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => {
                    const status = getMembershipStatus(member.membershipExpiry)
                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="text-slate-600">{member.email}</span>
                            </div>
                            {member.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-600">{member.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">
                            {member.membershipType || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {format(new Date(member.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(member.id, member.name)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
