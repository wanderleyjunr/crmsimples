import { ClientForm } from '@/components/forms/client-form'
import { createClient } from '@/lib/actions/clients'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export const metadata = {
  title: 'Novo Cliente',
}

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/clients"
          className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
          aria-label="Voltar para clientes"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Novo Cliente</h1>
          <p className="text-sm text-muted-foreground">Preencha os dados para cadastrar um novo cliente.</p>
        </div>
      </div>

      <ClientForm onSubmit={createClient} />
    </div>
  )
}
