import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="text-7xl font-bold text-primary">404</span>
        <h1 className="text-2xl font-semibold text-foreground">
          Página não encontrada
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          A página que você está procurando não existe ou foi movida.
        </p>
      </div>
      <Link href="/dashboard" className={buttonVariants()}>
        Voltar ao início
      </Link>
    </main>
  )
}
