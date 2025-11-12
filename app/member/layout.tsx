import { MemberSidebar } from '@/components/layouts/member-sidebar'

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-neutral-100">
      <MemberSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
