'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CheckSquare, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/tasks', label: 'Tarefas', icon: CheckSquare },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:border-r border-border bg-white h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">CRM Simples</h1>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 pb-4">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
            pathname.startsWith('/settings')
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Settings className="size-5" />
          Configurações
        </Link>
      </div>
    </aside>
  )
}
