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
        setItems(Array.isArray(data) ? data : [])
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

  const sources = useMemo(() => [ALL, ...new Set(items.map((item) => item.source))], [items])
  const categories = useMemo(() => [ALL, ...new Set(items.map((item) => item.category))], [items])

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return items
      .filter((item) => sourceFilter === ALL || item.source === sourceFilter)
      .filter((item) => categoryFilter === ALL || item.category === categoryFilter)
      .filter((item) => !q || item.title.toLowerCase().includes(q))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  }, [items, sourceFilter, categoryFilter, keyword])

  return (
    <section className="news" id="news">
      <div className="news__inner">
        <h2 className="section-title">건설 실무 최신소식</h2>
        <p className="news__note">
          국토교통부, 대한건설협회, 대한건축사협회, CSI(건설공사 안전관리 종합정보망) 등 공식 출처의 공지·보도자료·안전자료를
          하루 1~2회 자동 수집합니다. 공식 출처 링크만 제공합니다.
        </p>

        <div className="news__filters">
          <select
            className="news__select"
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            aria-label="출처 필터"
          >
            {sources.map((source) => (
              <option key={source} value={source}>
                {source === ALL ? '출처 전체' : source}
              </option>
            ))}
          </select>

          <select
            className="news__select"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="카테고리 필터"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === ALL ? '카테고리 전체' : category}
              </option>
            ))}
          </select>

          <input
            type="text"
            className="news__search"
            placeholder="제목 키워드 검색"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            aria-label="키워드 검색"
          />
        </div>

        {status === 'loading' && <p className="news__empty">최신소식을 불러오는 중입니다.</p>}
        {status === 'error' && (
          <p className="news__empty">최신소식을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
        )}
        {status === 'ready' && filtered.length === 0 && (
          <p className="news__empty">조건에 맞는 소식이 아직 없습니다.</p>
        )}

        {status === 'ready' && filtered.length > 0 && (
          <ul className="news__list">
            {filtered.map((item) => (
              <li key={item.url} className="news-card">
                <div className="news-card__meta">
                  <span className="news-card__source">{item.source}</span>
                  <span className="news-card__category">{item.category}</span>
                  <span className="news-card__date">{item.date}</span>
                </div>
                <p className="news-card__title">{item.title}</p>
                <a
                  className="news-card__link"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  원문보기
                </a>
              </li>
            ))}
          </ul>
        )}

        <p className="news__disclaimer">공식 출처 링크만 제공합니다. 원문 전문은 저장하지 않습니다.</p>
      </div>
    </section>
  )
}

export default News
