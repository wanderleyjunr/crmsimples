'use client'

import { useState, useEffect, useCallback } from 'react'

interface CepData {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

interface UseCepResult {
  data: CepData | null
  isLoading: boolean
  error: string | null
}

export function useCep(cep: string): UseCepResult {
  const [data, setData] = useState<CepData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCep = useCallback(async (cleanCep: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      const result = await response.json()
      if (result.erro) {
        setError('CEP não encontrado')
        setData(null)
      } else {
        setData(result)
      }
    } catch {
      setError('Erro ao buscar CEP')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      const timer = setTimeout(() => fetchCep(cleanCep), 500)
      return () => clearTimeout(timer)
    }
    setData(null)
    setError(null)
  }, [cep, fetchCep])

  return { data, isLoading, error }
}
