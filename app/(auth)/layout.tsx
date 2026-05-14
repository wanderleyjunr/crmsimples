export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f4f7] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#0a1317]">CRM Simples</h1>
          <p className="text-sm text-[#5d6c7b] mt-1">Gerencie seus clientes e tarefas</p>
        </div>
        {children}
      </div>
    </div>
  )
}
