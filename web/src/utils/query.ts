import { useLocation } from 'react-router-dom'
import React from 'react'

export default function useQuery<T extends Record<string, string | undefined>>(): T {
  const { search } = useLocation()
  return React.useMemo<T>(() => {
    const params = new URLSearchParams(search)
    return Object.fromEntries(params.entries()) as T
  }, [search])
}
