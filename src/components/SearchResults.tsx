import { useMemo } from 'react'
import { apps, type AppItem } from '../data/apps'
import { useFavorites } from '../hooks/useFavorites'
import AppCard from './AppCard'

interface SearchResultsProps {
  query: string
}

function scoreApp(app: AppItem, q: string): number {
  let score = 0
  if (app.title.toLowerCase().includes(q)) score += 4
  if (app.tags.some((tag) => tag.toLowerCase().includes(q))) score += 3
  if (app.category.toLowerCase().includes(q)) score += 2
  if (app.description.toLowerCase().includes(q)) score += 1
  return score
}

function SearchResults({ query }: SearchResultsProps) {
  const { isFavorite, toggleFavorite } = useFavorites()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return apps
      .map((app) => ({ app, score: scoreApp(app, q) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.app)
  }, [query])

  return (
    <section className="search-results">
      <p className="search-results__title">검색 결과 {results.length}건</p>
      <div className="search-results__grid">
        {results.length === 0 ? (
          <p className="search-results__empty">일치하는 도구가 없습니다.</p>
        ) : (
          results.map((app) => (
            <AppCard key={app.id} app={app} isFavorite={isFavorite(app.id)} onToggleFavorite={toggleFavorite} />
          ))
        )}
      </div>
    </section>
  )
}

export default SearchResults
