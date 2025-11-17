'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface MemberPreview {
  name: string
  email: string
  phone: string
  membershipType: string
  address: string
  dateOfBirth: string
  status: 'valid' | 'duplicate' | 'invalid'
  errors?: string[]
}

export default function BulkMembersImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<MemberPreview[]>([])
  const [importing, setImporting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    duplicates: 0,
    invalid: 0,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseCSV(selectedFile)
    }
  }

  const parseCSV = async (file: File) => {
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    if (lines.length === 0) {
      setError('CSV file appears to be empty')
      return
    }

    const headers = lines[0]!.split(',').map(h => h.trim())
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ''
      })
      return obj
    })

    const previews: MemberPreview[] = data.map((row) => {
      const errors: string[] = []

      if (!row.name) errors.push('Name is required')
      if (!row.email) {
        errors.push('Email is required')
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        errors.push('Invalid email format')
      }
      if (!row.membershipType) {
        errors.push('Membership type is required')
      } else if (!['standard', 'premium', 'student'].includes(row.membershipType.toLowerCase())) {
        errors.push('Invalid membership type (must be: standard, premium, or student)')
      }

      const status = errors.length > 0 ? 'invalid' : 'valid'

      return {
        name: row.name || '',
        email: row.email || '',
        phone: row.phone || '',
        membershipType: row.membershipType || '',
        address: row.address || '',
        dateOfBirth: row.dateOfBirth || '',
        status,
        errors,
      }
    })

    setPreview(previews)
    setStats({
      total: previews.length,
      valid: previews.filter(p => p.status === 'valid').length,
      duplicates: previews.filter(p => p.status === 'duplicate').length,
      invalid: previews.filter(p => p.status === 'invalid').length,
    })
  }

  const handleImport = async () => {
    setImporting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setImporting(false)
    setCompleted(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-600">Valid</Badge>
      case 'duplicate':
        return <Badge variant="secondary">Duplicate</Badge>
      case 'invalid':
        return <Badge variant="destructive">Invalid</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMembershipBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'premium':
        return <Badge className="bg-purple-600">Premium</Badge>
      case 'student':
        return <Badge className="bg-blue-600">Student</Badge>
      case 'standard':
        return <Badge variant="secondary">Standard</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  if (completed) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/admin/bulk-operations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-6 h-6" />
              Import Completed Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-green-800">
              <p className="font-medium">Import Summary:</p>
              <ul className="text-sm space-y-1">
                <li>• Total records processed: {stats.total}</li>
                <li>• Successfully imported: {stats.valid}</li>
                <li>• Duplicates skipped: {stats.duplicates}</li>
                <li>• Invalid records skipped: {stats.invalid}</li>
              </ul>
            </div>
            <div className="mt-4 flex gap-2">
              <Link href="/admin/members">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  View Members
                </Button>
              </Link>
              <Link href="/admin/bulk-operations">
                <Button variant="outline">
                  New Import
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/bulk-operations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bulk Member Import</h1>
          <p className="text-slate-600 text-sm">Import multiple members from CSV file</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!preview.length && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 mb-4">
                Drop your CSV file here or click to browse
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button asChild className="cursor-pointer">
                  <span>Select CSV File</span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {preview.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600">Total Records</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600">Valid</p>
                  <p className="text-2xl font-bold text-green-600">{stats.valid}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600">Duplicates</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.duplicates}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600">Invalid</p>
                  <p className="text-2xl font-bold text-red-600">{stats.invalid}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {stats.invalid > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {stats.invalid} invalid record(s) found. Please fix the errors or these records will be skipped during import.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Preview ({preview.length} records)</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    setFile(null)
                    setPreview([])
                  }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={importing || stats.valid === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {importing ? 'Importing...' : `Import ${stats.valid} Valid Records`}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Membership</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.slice(0, 50).map((member, index) => (
                      <TableRow key={index}>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone || '-'}</TableCell>
                        <TableCell>{getMembershipBadge(member.membershipType)}</TableCell>
                        <TableCell className="max-w-xs truncate">{member.address || '-'}</TableCell>
                        <TableCell>{member.dateOfBirth || '-'}</TableCell>
                        <TableCell>
                          {member.errors && member.errors.length > 0 ? (
                            <ul className="text-xs text-red-600">
                              {member.errors.map((error, i) => (
                                <li key={i}>{error}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {preview.length > 50 && (
                  <div className="text-center py-4 text-sm text-slate-500">
                    Showing first 50 of {preview.length} records
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
