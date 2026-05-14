'use client'

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="text-7xl font-bold text-destructive">!</span>
        <h1 className="text-2xl font-semibold text-foreground">
          Algo deu errado
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ocorreu um erro inesperado. Tente novamente ou volte mais tarde.
        </p>
      </div>
      <Button onClick={reset}>Tentar novamente</Button>
    </main>
  )
}
