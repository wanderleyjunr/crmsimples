'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validations/settings'
import { updateProfile } from '@/lib/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfileFormProps {
  defaultName: string
  email: string
}

export function ProfileForm({ defaultName, email }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: defaultName },
  })

  async function onSubmit(values: UpdateProfileInput) {
    const formData = new FormData()
    formData.set('name', values.name)

    const result = await updateProfile(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Perfil atualizado com sucesso!')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          placeholder="Seu nome"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
          className="opacity-60"
        />
        <p className="text-xs text-muted-foreground">O email não pode ser alterado aqui.</p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}
