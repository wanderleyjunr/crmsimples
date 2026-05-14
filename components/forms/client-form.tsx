'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Loader2, Upload, User } from 'lucide-react'

import { clientSchema, type ClientInput } from '@/lib/validations/client'
import { useCep } from '@/hooks/use-cep'
import { getInitials } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const BR_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

function formatPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

interface ClientFormProps {
  defaultValues?: Partial<ClientInput>
  avatarUrl?: string | null
  onSubmit: (formData: FormData) => Promise<{ error?: string }>
  isEdit?: boolean
}

export function ClientForm({
  defaultValues,
  avatarUrl,
  onSubmit,
  isEdit = false,
}: ClientFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl ?? null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      ...defaultValues,
    },
  })

  const cepValue = watch('cep') ?? ''
  const nameValue = watch('name') ?? ''
  const { data: cepData, isLoading: cepLoading, error: cepError } = useCep(cepValue)

  useEffect(() => {
    if (cepData) {
      setValue('street', cepData.logradouro, { shouldValidate: false })
      setValue('neighborhood', cepData.bairro, { shouldValidate: false })
      setValue('city', cepData.localidade, { shouldValidate: false })
      setValue('state', cepData.uf, { shouldValidate: false })
    }
  }, [cepData, setValue])

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const masked = formatPhoneMask(e.target.value)
    setValue('phone', masked, { shouldValidate: true })
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setAvatarError(null)
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAvatarError('Formato inválido. Use JPG, PNG ou WebP.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Imagem muito grande. Máximo 2MB.')
      return
    }

    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleFormSubmit(data: ClientInput) {
    setIsPending(true)
    setServerError(null)

    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value)
      }
    })
    if (avatarFile) {
      formData.append('avatar', avatarFile)
    }

    const result = await onSubmit(formData)
    if (result?.error) {
      setServerError(result.error)
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* Dados pessoais */}
      <Card>
        <CardHeader>
          <CardTitle>Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="size-20 text-lg">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt={nameValue} />
              ) : null}
              <AvatarFallback>
                {nameValue ? (
                  getInitials(nameValue)
                ) : (
                  <User className="size-7 text-muted-foreground" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-3.5" />
                {avatarPreview ? 'Alterar foto' : 'Adicionar foto'}
              </Button>
              <p className="text-xs text-muted-foreground">JPG, PNG ou WebP • máx. 2MB</p>
              {avatarError && (
                <p className="text-xs text-destructive">{avatarError}</p>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Nome <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Nome completo"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              aria-invalid={!!errors.phone}
              {...register('phone')}
              onChange={handlePhoneChange}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* CEP */}
          <div className="space-y-1.5">
            <Label htmlFor="cep">
              CEP
              {cepLoading && (
                <Loader2 className="ml-1 inline size-3.5 animate-spin text-muted-foreground" />
              )}
            </Label>
            <Input
              id="cep"
              placeholder="00000-000"
              maxLength={9}
              aria-invalid={!!errors.cep}
              {...register('cep')}
            />
            {errors.cep && (
              <p className="text-xs text-destructive">{errors.cep.message}</p>
            )}
            {cepError && !errors.cep && (
              <p className="text-xs text-muted-foreground">{cepError}</p>
            )}
          </div>

          {/* Street + Number */}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="street">Rua / Logradouro</Label>
              <Input
                id="street"
                placeholder="Rua das Flores"
                {...register('street')}
              />
            </div>
            <div className="w-24 space-y-1.5">
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                placeholder="123"
                {...register('number')}
              />
            </div>
          </div>

          {/* Complement */}
          <div className="space-y-1.5">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              placeholder="Apto 42, Bloco B"
              {...register('complement')}
            />
          </div>

          {/* Neighborhood */}
          <div className="space-y-1.5">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              placeholder="Centro"
              {...register('neighborhood')}
            />
          </div>

          {/* City + State */}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                placeholder="São Paulo"
                {...register('city')}
              />
            </div>
            <div className="w-28 space-y-1.5">
              <Label htmlFor="state">Estado</Label>
              <Select
                defaultValue={defaultValues?.state ?? ''}
                onValueChange={(val) => setValue('state', val ?? '', { shouldValidate: true })}
              >
                <SelectTrigger id="state" className="w-full h-11 rounded-xl border-input">
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {BR_STATES.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-xs text-destructive">{errors.state.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link href="/clients" className={buttonVariants({ variant: 'outline' })}>
          Cancelar
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? 'Salvar alterações' : 'Salvar Cliente'}
        </Button>
      </div>
    </form>
  )
}
