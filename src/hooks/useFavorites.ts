import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_FAVORITE_IDS } from '../data/apps'

const STORAGE_KEY = 'munseobang:favorites'

function loadFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_FAVORITE_IDS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : DEFAULT_FAVORITE_IDS
  } catch {
    return DEFAULT_FAVORITE_IDS
  }
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(loadFavorites)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds))
  }, [favoriteIds])

  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds])

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }, [])

  return { favoriteIds, isFavorite, toggleFavorite }
}
