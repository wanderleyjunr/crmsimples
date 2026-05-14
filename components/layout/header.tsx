'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { getInitials } from '@/lib/utils'
import { signOut } from '@/lib/actions/auth'
import { MobileNav } from './mobile-nav'

interface HeaderProps {
  user: {
    email: string
    name: string
  }
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clients': 'Clientes',
  '/clients/new': 'Novo Cliente',
  '/tasks': 'Tarefas',
  '/tasks/new': 'Nova Tarefa',
  '/settings': 'Configurações',
}

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (pathname.match(/^\/clients\/[^/]+\/edit$/)) return 'Editar Cliente'
  if (pathname.match(/^\/clients\/[^/]+$/)) return 'Detalhes do Cliente'
  if (pathname.match(/^\/tasks\/[^/]+\/edit$/)) return 'Editar Tarefa'
  return 'CRM Simples'
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-white px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
        <Menu className="size-5" />
      </Button>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <MobileNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <h2 className="text-lg font-semibold text-foreground">{getPageTitle(pathname)}</h2>

      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-full size-10 hover:bg-muted transition-colors">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
              <Settings className="size-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => signOut()}
            >
              <LogOut className="size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
