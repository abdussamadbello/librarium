'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Users, BookOpen, Download, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function BulkOperationsPage() {
  const handleDownloadBookTemplate = () => {
    const csvContent = [
      ['title', 'isbn', 'authorName', 'categoryName', 'publisher', 'publicationYear', 'language', 'description', 'totalCopies'],
      ['Sample Book Title', '978-0-123456-78-9', 'Author Name', 'Fiction', 'Publisher Name', '2024', 'English', 'Book description here', '3'],
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'book-import-template.csv'
    a.click()
  }

  const handleDownloadMemberTemplate = () => {
    const csvContent = [
      ['name', 'email', 'phone', 'membershipType', 'address', 'dateOfBirth'],
      ['John Doe', 'john.doe@example.com', '555-0123', 'standard', '123 Main St', '1990-01-15'],
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'member-import-template.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Bulk Operations</h1>
        <p className="text-slate-600 mt-1">Import and manage data in bulk</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bulk Book Import */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                  Bulk Book Import
                </CardTitle>
                <CardDescription className="mt-2">
                  Import multiple books from CSV file
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">CSV Format Requirements:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Title (required)</li>
                <li>• ISBN (optional, must be unique)</li>
                <li>• Author Name (required)</li>
                <li>• Category Name (required)</li>
                <li>• Publisher (optional)</li>
                <li>• Publication Year (optional)</li>
                <li>• Language (optional)</li>
                <li>• Description (optional)</li>
                <li>• Total Copies (required, default: 1)</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleDownloadBookTemplate}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
              <Link href="/admin/bulk-operations/books">
                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Books
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Member Import */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Bulk Member Import
                </CardTitle>
                <CardDescription className="mt-2">
                  Import multiple members from CSV file
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">CSV Format Requirements:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Name (required)</li>
                <li>• Email (required, must be unique)</li>
                <li>• Phone (optional)</li>
                <li>• Membership Type (required: standard, premium, student)</li>
                <li>• Address (optional)</li>
                <li>• Date of Birth (optional, format: YYYY-MM-DD)</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleDownloadMemberTemplate}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
              <Link href="/admin/bulk-operations/members">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Members
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Important Notes */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-yellow-800 space-y-2">
            <li>• Duplicate detection: Books with existing ISBNs or members with existing emails will be skipped</li>
            <li>• Data validation: All records will be validated before import</li>
            <li>• Preview before import: You can review all data before confirming the import</li>
            <li>• Authors and categories: Will be created automatically if they don't exist</li>
            <li>• Large imports: For files with more than 1000 records, processing may take several minutes</li>
            <li>• Error handling: Failed records will be logged and can be downloaded for correction</li>
          </ul>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Operations History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <p>No bulk operations performed yet</p>
            <p className="text-sm mt-1">Import history will appear here once you perform bulk operations</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
