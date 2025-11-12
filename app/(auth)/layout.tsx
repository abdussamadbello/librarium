import { BookOpen } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary-teal rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold">
            <span className="text-primary-teal">Library</span>{' '}
            <span className="text-neutral-800">Nexus</span>
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Library Management System
          </p>
        </div>

        {/* Auth Content */}
        {children}
      </div>
    </div>
  )
}
