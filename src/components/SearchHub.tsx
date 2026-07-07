import { useMemo, useState } from 'react'
import { apps, type AppItem } from '../data/apps'
import { useFavorites } from '../hooks/useFavorites'
import AppCard from './AppCard'

const MAX_RESULTS = 24

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function scoreApp(app: AppItem, query: string): number {
  const q = normalize(query)
  let score = 0

  if (normalize(app.title).includes(q)) score += 5
  if (normalize(app.category).includes(q)) score += 4
  if (app.tags.some((tag) => normalize(tag).includes(q))) score += 3
  if (normalize(app.description).includes(q)) score += 2
  if (normalize(app.badge).includes(q) || normalize(app.status).includes(q)) score += 1

  return score
}

function SearchHub() {
  const [query, setQuery] = useState('')
  const { isFavorite, toggleFavorite } = useFavorites()

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return []

    return apps
      .map((app) => ({ app, score: scoreApp(app, q) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.app.title.localeCompare(b.app.title, 'ko'))
      .slice(0, MAX_RESULTS)
      .map((entry) => entry.app)
  }, [query])

  const hasQuery = query.trim().length > 0

  return (
    <section className="search-hub" id="search">
      <div className="search-hub__inner">
        <label className="search-hub__label" htmlFor="tool-search">
          전체 도구 검색
        </label>
        <input
          id="tool-search"
          type="search"
          className="search-hub__input"
          placeholder="예: 사진, 검측, KCS, 레미탈, 실정보고, TBM, CSI"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <p className="search-hub__note">검색은 모든 폴더의 도구와 기준 카드를 대상으로 합니다.</p>

        {hasQuery && (
          <div className="search-hub__panel">
            <p className="search-hub__result-title">검색 결과 {results.length}개</p>
            {results.length === 0 ? (
              <p className="search-hub__empty">아직 등록되지 않은 검색어입니다.</p>
            ) : (
              <div className="app-grid app-grid--search">
                {results.map((app) => (
                  <AppCard key={app.id} app={app} isFavorite={isFavorite(app.id)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default SearchHub
