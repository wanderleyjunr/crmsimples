import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { ProfileForm } from '@/components/forms/profile-form'
import { PasswordForm } from '@/components/forms/password-form'
import { DeleteAccountForm } from '@/components/forms/delete-account-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || ''
  const userEmail = user?.email || ''

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie seu perfil e preferências de conta.
        </p>
      </div>

      {/* Perfil */}
      <Card className="rounded-card">
        <CardContent className="pt-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-foreground">Perfil</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Atualize seu nome de exibição.
            </p>
          </div>
          <ProfileForm defaultName={userName} email={userEmail} />
        </CardContent>
      </Card>

      {/* Alterar Senha */}
      <Card className="rounded-card">
        <CardContent className="pt-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-foreground">Alterar Senha</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Escolha uma senha forte com pelo menos 6 caracteres.
            </p>
          </div>
          <PasswordForm />
        </CardContent>
      </Card>

      {/* Zona de Perigo */}
      <Card className="rounded-card border-destructive/40">
        <CardContent className="pt-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-destructive">Zona de Perigo</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ações irreversíveis. Prossiga com cautela.
            </p>
          </div>
          <DeleteAccountForm />
        </CardContent>
      </Card>
    </div>
  )
}
