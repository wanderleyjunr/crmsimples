# CRM Simples

**Do Prompt ao Primeiro APP** — Este projeto foi construido ao vivo, do zero, usando **Claude Code** como orquestrador de agentes. Um unico prompt gerou o PRD, o plano de implementacao e toda a base de codigo que voce ve aqui.

---

## O que e?

Um CRM pessoal para gerenciar clientes e tarefas. Cada usuario acessa apenas seus proprios dados. Simples, rapido, funcional.

**Numeros da build:**
- 96 arquivos, ~6.800 linhas de codigo
- 14 rotas (4 publicas + 10 autenticadas)
- 6 sprints executados em paralelo por agentes Sonnet
- 0 linhas escritas manualmente — 100% gerado e orquestrado por IA

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router, Server Actions) |
| Linguagem | TypeScript (strict) |
| UI | shadcn/ui + Tailwind CSS |
| Design System | Meta (cobalt blue, pill buttons, 32px cards) |
| Backend/DB | Supabase (Postgres + RLS) |
| Auth | Supabase Auth (email + senha) |
| Storage | Supabase Storage (avatares) |
| Forms | React Hook Form + Zod v4 |
| Tabelas | TanStack Table |
| CEP | ViaCEP API |

---

## Funcionalidades

### Auth
- Login, cadastro, recuperacao de senha
- Sem verificacao de email (acesso imediato)
- Middleware protege todas as rotas autenticadas

### Clientes
- CRUD completo com avatar upload
- Busca de CEP automatica via ViaCEP (preenche endereco)
- Mascara de telefone BR
- Tabela com busca, paginacao, ordenacao
- Pagina de detalhe com tarefas vinculadas

### Tarefas
- CRUD com vinculo opcional a cliente
- Status (A Fazer / Em Andamento / Concluida) com mudanca inline
- Prioridade (Baixa / Media / Alta)
- Prazo com indicador de atraso
- Filtros por status e prioridade

### Dashboard
- Cards: total clientes, tarefas pendentes, concluidas, atrasadas
- Proximas 5 tarefas com prazo
- Ultimos 5 clientes cadastrados
- Saudacao dinamica (Bom dia/Boa tarde/Boa noite)

### Settings
- Editar nome
- Alterar senha
- Excluir conta (com confirmacao textual "EXCLUIR")

---

## Seguranca

- **Row Level Security** em todas as tabelas — usuario A nunca ve dados do usuario B
- **Ownership check** em todas as Server Actions (alem do RLS)
- **Signed URLs** para avatares (bucket privado, URLs expiram em 1h)
- **Validacao Zod** em todas as mutations (client + server)
- **Service Role** para exclusao de conta
- Sem secrets no codigo fonte

---

## Como rodar

### 1. Clone e instale

```bash
git clone git@github.com:wanderleyjunr/crmsimples.git
cd crmsimples
pnpm install
```

### 2. Configure o Supabase

Crie um projeto no [supabase.com](https://supabase.com) e execute o SQL das migrations no SQL Editor:

```
supabase/migrations/001_clients.sql
supabase/migrations/002_tasks.sql
supabase/migrations/003_storage.sql
```

Desative "Enable email confirmations" em Authentication > Settings.

### 3. Configure as variaveis de ambiente

Crie `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### 4. Rode

```bash
pnpm dev
```

Acesse `http://localhost:3000`, crie uma conta e comece a usar.

---

## Estrutura do projeto

```
app/
  (auth)/          # Login, Signup, Forgot Password
  (app)/           # Rotas autenticadas
    dashboard/     # Cards + resumos
    clients/       # CRUD clientes
    tasks/         # CRUD tarefas
    settings/      # Perfil + senha + excluir conta
components/
  ui/              # shadcn/ui customizado (Meta design)
  forms/           # Formularios (client, task, auth, settings)
  tables/          # Tabelas TanStack (clients, tasks)
  layout/          # Sidebar, Header, Mobile Nav
lib/
  actions/         # Server Actions (auth, clients, tasks, dashboard, settings)
  validations/     # Schemas Zod
  supabase/        # Client, Server, Middleware
hooks/             # useCep (ViaCEP)
supabase/
  migrations/      # SQL: tabelas, RLS, storage
types/             # TypeScript types
```

---

## Como foi construido

Este app foi criado em uma unica sessao usando **Claude Code (Opus 4.6)** como orquestrador:

1. **PRD** — Um prompt descrevendo o CRM desejado + design system Meta
2. **Plano** — Claude gerou 6 sprints com 22 tarefas e dependencias
3. **Execucao** — Agentes Sonnet rodaram em paralelo (ate 4 simultaneos)
4. **Review** — Code review + Security review automaticos
5. **Fixes** — Correcoes de build, seguranca e compatibilidade aplicadas
6. **Commit** — Tudo commitado e publicado

O fluxo completo: **Implementacao -> Review -> Commit**, com maximo paralelismo.

---

## Decisoes tecnicas

| Decisao | Motivo |
|---------|--------|
| Excluir cliente seta `client_id = NULL` nas tarefas | Preserva historico de tarefas |
| Kanban fica para v2 | MVP focado em tabela funcional |
| Light mode only | Design Meta e predominantemente claro |
| Signed URLs para avatares | Bucket privado, seguranca por padrao |
| Zod v4 | Versao mais recente, `.issues` em vez de `.errors` |

---

## Proximos passos (v2)

- [ ] Kanban drag-and-drop para tarefas
- [ ] Historico de interacoes por cliente
- [ ] Exportacao CSV
- [ ] Trocar email do usuario
- [ ] Notificacoes de tarefas vencendo
- [ ] Dark mode

---

Feito ao vivo na serie **Do Prompt ao Primeiro APP**.
