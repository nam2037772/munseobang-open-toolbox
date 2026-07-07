import { useMemo } from 'react'
import { apps, type AppItem } from '../data/apps'
import { useFavorites } from '../hooks/useFavorites'
import AppCard from './AppCard'

const MAX_RESULTS = 36

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function scoreApp(app: AppItem, query: string): number {
  const q = normalize(query)
  let score = 0

  if (normalize(app.title).includes(q)) score += 6
  if (normalize(app.category).includes(q)) score += 4
  if (app.tags.some((tag) => normalize(tag).includes(q))) score += 3
  if (normalize(app.description).includes(q)) score += 2
  if (normalize(app.badge).includes(q) || normalize(app.status).includes(q)) score += 1

  return score
}

interface SearchResultsProps {
  query: string
}

function SearchResults({ query }: SearchResultsProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const results = useMemo(() => {
    return apps
      .map((app) => ({ app, score: scoreApp(app, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.app.title.localeCompare(b.app.title, 'ko'))
      .slice(0, MAX_RESULTS)
      .map((entry) => entry.app)
  }, [query])

  return (
    <section className="search-results">
      <div className="workspace-heading">
        <p className="workspace-heading__eyebrow">전체 검색</p>
        <h1 className="workspace-heading__title">검색 결과 {results.length}개</h1>
        <p className="workspace-heading__desc">모든 업무 폴더 안의 도구와 기준 카드를 함께 찾습니다.</p>
      </div>

      {results.length === 0 ? (
        <p className="empty-state">아직 등록되지 않은 검색어입니다.</p>
      ) : (
        <div className="app-grid app-grid--compact">
          {results.map((app) => (
            <AppCard key={app.id} app={app} isFavorite={isFavorite(app.id)} onToggleFavorite={toggleFavorite} compact />
          ))}
        </div>
      )}
    </section>
  )
}

export default SearchResults
