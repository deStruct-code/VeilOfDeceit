import { useEffect, useState } from 'react'

export interface Me {
  id: number
  name: string
  email: string
  avatar: string | null
}

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '') || 'http://localhost:8000'

export function useMe() {
  const [me, setMe] = useState<Me | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setMe(data.user ?? null))
      .catch(() => setMe(null))
      .finally(() => setIsLoading(false))
  }, [])

  const logout = async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    setMe(null)
  }

  return { me, isLoading, logout }
}