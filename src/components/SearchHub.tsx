import { useMemo, useState } from 'react'
import { tools, type ToolItem } from '../data/tools'

const MAX_RESULTS = 16

function scoreTool(tool: ToolItem, q: string): number {
  let score = 0
  if (tool.title.toLowerCase().includes(q)) score += 4
  if (tool.keywords.some((keyword) => keyword.toLowerCase().includes(q))) score += 3
  if (tool.category.toLowerCase().includes(q)) score += 2
  if (tool.answer.toLowerCase().includes(q)) score += 1
  if (tool.description.toLowerCase().includes(q)) score += 1
  return score
}

function SearchHub() {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (!q) {
      return tools.slice(0, MAX_RESULTS)
    }

    return tools
      .map((tool) => ({ tool, score: scoreTool(tool, q) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map((entry) => entry.tool)
  }, [query])

  const handleOpen = (tool: ToolItem) => {
    if (tool.link) {
      window.open(tool.link, '_blank', 'noopener,noreferrer')
      return
    }
    alert(`${tool.title}은 현재 MVP 준비 항목입니다. 서버 저장 없이 내 PC 저장 방식으로 확장할 예정입니다.`)
  }

  return (
    <section className="search-hub" id="search">
      <div className="search-hub__inner">
        <label className="search-hub__label" htmlFor="tool-search">
          검증된 답안 카드 찾기
        </label>
        <input
          id="tool-search"
          type="text"
          className="search-hub__input"
          placeholder="예: 검측프로, 공사일보, 사진대지, 레미탈, 경사도, KCS"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <p className="search-hub__note">
          검색은 AI 답변 생성이 아닙니다. 미리 정리한 기준 카드와 도구 카드 중 가장 가까운 항목만 보여줍니다.
        </p>

        <p className="search-hub__result-title">{query.trim() ? '검색 결과' : '자주 찾는 도구와 기준 카드'}</p>

        <div className="search-hub__results">
          {results.length === 0 && (
            <p className="search-hub__empty">아직 검증된 답안 카드가 준비되지 않은 검색어입니다.</p>
          )}

          {results.map((tool) => (
            <article key={tool.id} className="tool-card">
              <div className="tool-card__top">
                <span className="tool-card__category">{tool.category}</span>
                <span className="tool-card__trust">{tool.trustLabel}</span>
              </div>
              <h3 className="tool-card__title">{tool.title}</h3>
              <p className="tool-card__answer">{tool.answer}</p>
              <button type="button" className="tool-card__open" onClick={() => handleOpen(tool)}>
                {tool.link ? '열기' : '준비중'}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SearchHub



