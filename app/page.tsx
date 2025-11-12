export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-primary-teal">
            Library <span className="text-neutral-800">Nexus</span>
          </h1>
          <p className="text-xl text-neutral-600">
            Library Management System
          </p>
        </div>

        <div className="flex gap-4 justify-center mt-8">
          <a
            href="/member/discover"
            className="px-6 py-3 bg-primary-teal text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
          >
            Member Portal
          </a>
          <a
            href="/admin/dashboard"
            className="px-6 py-3 bg-admin-dark text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
          >
            Admin Portal
          </a>
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-sm border border-neutral-200 max-w-2xl">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">
            Phase 0: Project Setup Complete ✅
          </h2>
          <ul className="text-left space-y-2 text-sm text-neutral-600">
            <li>✅ Next.js 15 with TypeScript</li>
            <li>✅ Tailwind CSS with custom theme</li>
            <li>✅ Project structure initialized</li>
            <li>🚧 Installing dependencies next...</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
