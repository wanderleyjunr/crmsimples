import { notFound } from 'next/navigation'
import { ClientForm } from '@/components/forms/client-form'
import { getClientById, updateClient } from '@/lib/actions/clients'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

interface EditClientPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditClientPageProps) {
  const { id } = await params
  const result = await getClientById(id)
  return {
    title: result ? `Editar ${result.client.name}` : 'Editar Cliente',
  }
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params
  const result = await getClientById(id)

  if (!result) notFound()

  const { client } = result

  const defaultValues = {
    name: client.name,
    email: client.email ?? '',
    phone: client.phone ?? '',
    cep: client.cep ?? '',
    street: client.street ?? '',
    number: client.number ?? '',
    complement: client.complement ?? '',
    neighborhood: client.neighborhood ?? '',
    city: client.city ?? '',
    state: client.state ?? '',
  }

  async function handleUpdate(formData: FormData) {
    'use server'
    return updateClient(id, formData)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/clients/${id}`}
          className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
          aria-label="Voltar para o cliente"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Editar Cliente</h1>
          <p className="text-sm text-muted-foreground">Atualize os dados de {client.name}.</p>
        </div>
      </div>

      <ClientForm
        defaultValues={defaultValues}
        avatarUrl={client.avatar_url}
        onSubmit={handleUpdate}
        isEdit
      />
    </div>
  )
}
