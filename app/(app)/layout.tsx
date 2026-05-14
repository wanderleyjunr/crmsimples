import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Usuário'

  return (
    <div className="flex min-h-screen bg-[#f1f4f7]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={{ email: user.email || '', name: userName }} />
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
