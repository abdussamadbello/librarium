'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Users, Shield, Crown } from 'lucide-react'
import { format } from 'date-fns'

interface StaffMember {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/admin/staff')
      const data = await res.json()
      setStaff(data || [])
    } catch (error) {
      console.error('Failed to fetch staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (member?: StaffMember) => {
    if (member) {
      setEditingStaff(member)
      setFormData({
        name: member.name,
        email: member.email,
        password: '',
        role: member.role,
      })
    } else {
      setEditingStaff(null)
      setFormData({ name: '', email: '', password: '', role: 'staff' })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingStaff(null)
    setFormData({ name: '', email: '', password: '', role: 'staff' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingStaff && !formData.password) {
      alert('Password is required for new staff members')
      return
    }

    try {
      const url = editingStaff
        ? `/api/admin/staff/${editingStaff.id}`
        : '/api/admin/staff'
      const method = editingStaff ? 'PUT' : 'POST'

      const payload = editingStaff
        ? { name: formData.name, email: formData.email, role: formData.role }
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        alert(`Staff member ${editingStaff ? 'updated' : 'created'} successfully`)
        handleCloseDialog()
        fetchStaff()
      } else {
        const data = await res.json()
        alert(data.error || `Failed to ${editingStaff ? 'update' : 'create'} staff member`)
      }
    } catch (error) {
      alert(`Failed to ${editingStaff ? 'update' : 'create'} staff member`)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Staff member deleted successfully')
        fetchStaff()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete staff member')
      }
    } catch (error) {
      alert('Failed to delete staff member')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'director':
        return <Crown className="w-4 h-4 text-purple-600" />
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />
      case 'staff':
        return <Users className="w-4 h-4 text-teal-600" />
      default:
        return <Users className="w-4 h-4 text-slate-600" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'director':
        return <Badge className="bg-purple-600">Director</Badge>
      case 'admin':
        return <Badge className="bg-blue-600">Admin</Badge>
      case 'staff':
        return <Badge className="bg-teal-600">Staff</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const roleStats = {
    directors: staff.filter((s) => s.role === 'director').length,
    admins: staff.filter((s) => s.role === 'admin').length,
    staff: staff.filter((s) => s.role === 'staff').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-600 mt-1">Manage staff accounts and permissions</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Staff</p>
                <p className="text-2xl font-bold text-slate-900">{staff.length}</p>
              </div>
              <Users className="w-8 h-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Directors</p>
                <p className="text-2xl font-bold text-purple-600">{roleStats.directors}</p>
              </div>
              <Crown className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Administrators</p>
                <p className="text-2xl font-bold text-blue-600">{roleStats.admins}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Staff Members</p>
                <p className="text-2xl font-bold text-teal-600">{roleStats.staff}</p>
              </div>
              <Users className="w-8 h-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading staff...</div>
          ) : staff.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No staff members found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getRoleIcon(member.role)}
                        <span className="ml-2 font-medium">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{member.email}</TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {format(new Date(member.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleOpenDialog(member)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(member.id, member.name)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@library.com"
                  required
                />
              </div>
              {!editingStaff && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Secure password"
                    required={!editingStaff}
                  />
                  <p className="text-xs text-slate-500">
                    Password must be at least 8 characters long
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-slate-600 space-y-1 mt-2">
                  <p><strong>Staff:</strong> Can manage books and transactions</p>
                  <p><strong>Admin:</strong> Can delete books, manage fines, and manage staff</p>
                  <p><strong>Director:</strong> Full system access with analytics</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                {editingStaff ? 'Update' : 'Create'} Staff Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
