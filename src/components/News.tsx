import { useEffect, useMemo, useState } from 'react'

interface NewsItem {
  source: string
  category: string
  title: string
  date: string
  url: string
  tags?: string[]
}

const ALL = '전체'

function parseDate(value: string) {
  const time = new Date(`${value}T00:00:00+09:00`).getTime()
  return Number.isFinite(time) ? time : 0
}

function isNewsItem(item: unknown): item is NewsItem {
  if (!item || typeof item !== 'object') return false
  const value = item as Record<string, unknown>
  return ['source', 'category', 'title', 'date', 'url'].every((key) => typeof value[key] === 'string')
}

function News() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [sourceFilter, setSourceFilter] = useState(ALL)
  const [categoryFilter, setCategoryFilter] = useState(ALL)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    let cancelled = false

    fetch(`${import.meta.env.BASE_URL}data/news.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: unknown) => {
        if (cancelled) return
        setItems(Array.isArray(data) ? data.filter(isNewsItem) : [])
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const sources = useMemo(() => [ALL, ...Array.from(new Set(items.map((item) => item.source))).sort()], [items])
  const categories = useMemo(() => [ALL, ...Array.from(new Set(items.map((item) => item.category))).sort()], [items])

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return items
      .filter((item) => sourceFilter === ALL || item.source === sourceFilter)
      .filter((item) => categoryFilter === ALL || item.category === categoryFilter)
      .filter((item) => !q || item.title.toLowerCase().includes(q) || item.source.toLowerCase().includes(q))
      .sort((a, b) => parseDate(b.date) - parseDate(a.date) || a.title.localeCompare(b.title, 'ko'))
  }, [items, sourceFilter, categoryFilter, keyword])

  return (
    <section className="news" id="news">
      <div className="news__head">
        <p className="workspace-heading__eyebrow">공식소식</p>
        <h2 className="news__title">건설실무브리핑 최신소식</h2>
        <p className="news__note">원문 전문을 저장하지 않고 공식 출처 링크와 요약 목록만 제공합니다.</p>
      </div>

      <div className="news__filters">
        <select className="news__select" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} aria-label="출처 필터">
          {sources.map((source) => (
            <option key={source} value={source}>{source === ALL ? '출처 전체' : source}</option>
          ))}
        </select>
        <select className="news__select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="카테고리 필터">
          {categories.map((category) => (
            <option key={category} value={category}>{category === ALL ? '카테고리 전체' : category}</option>
          ))}
        </select>
        <input className="news__search" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="뉴스 제목 검색" aria-label="뉴스 제목 검색" />
      </div>

      {status === 'loading' && <p className="empty-state">최신소식을 불러오는 중입니다.</p>}
      {status === 'error' && <p className="empty-state">최신소식을 불러오지 못했습니다.</p>}
      {status === 'ready' && filtered.length === 0 && <p className="empty-state">조건에 맞는 소식이 없습니다.</p>}

      {status === 'ready' && filtered.length > 0 && (
        <ul className="news__list">
          {filtered.slice(0, 24).map((item) => (
            <li key={item.url} className="news-card">
              <div className="news-card__meta">
                <span>{item.source}</span>
                <span>{item.category}</span>
                <time dateTime={item.date}>{item.date}</time>
              </div>
              <p className="news-card__title">{item.title}</p>
              <a className="news-card__link" href={item.url} target="_blank" rel="noopener noreferrer">원문보기</a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default News
