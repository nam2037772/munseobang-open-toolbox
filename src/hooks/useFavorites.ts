import { useEffect, useState } from 'react'
import { DEFAULT_FAVORITE_IDS } from '../data/apps'

const STORAGE_KEY = 'munseobang.favoriteApps'

function readFavorites(): string[] {
  if (typeof window === 'undefined') return DEFAULT_FAVORITE_IDS

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_FAVORITE_IDS
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) && parsed.every((item) => typeof item === 'string') ? parsed : DEFAULT_FAVORITE_IDS
  } catch {
    return DEFAULT_FAVORITE_IDS
  }
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(readFavorites)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds))
    } catch {
      // localStorage가 막힌 환경에서는 기본 즐겨찾기만 유지합니다.
    }
  }, [favoriteIds])

  const toggleFavorite = (id: string) => {
    setFavoriteIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [id, ...current]))
  }

  const isFavorite = (id: string) => favoriteIds.includes(id)

  return { favoriteIds, isFavorite, toggleFavorite }
}
