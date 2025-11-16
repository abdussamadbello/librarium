import { MemberSidebar } from '@/components/layouts/member-sidebar'

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-white">
      <MemberSidebar />
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
        {children}
      </main>
    </div>
  )
}
