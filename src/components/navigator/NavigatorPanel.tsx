import { useState, useEffect } from 'react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { searchSpecs, getSpecDetail, summarizeWithAI } from '../../services/specEngine'
import type { SpecIndexItem, SpecNode } from '../../types/spec'

// Inline basic Markdown parser to avoid external dependencies
function parseInlineMarkdown(text: string) {
  const boldRegex = /\*\*(.*?)\*\*/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    parts.push(<strong key={match.index}>{match[1]}</strong>)
    lastIndex = boldRegex.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }
  return parts.length > 0 ? parts : text
}

function renderMarkdown(text: string) {
  if (!text) return null
  const lines = text.split('\n')
  return lines.map((line, idx) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('### ')) {
      return <h4 key={idx} className="mds-md-h3">{parseInlineMarkdown(trimmed.replace('### ', ''))}</h4>
    }
    if (trimmed.startsWith('## ')) {
      return <h3 key={idx} className="mds-md-h2">{parseInlineMarkdown(trimmed.replace('## ', ''))}</h3>
    }
    if (trimmed.startsWith('# ')) {
      return <h2 key={idx} className="mds-md-h1">{parseInlineMarkdown(trimmed.replace('# ', ''))}</h2>
    }
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      return <li key={idx} className="mds-md-li">{parseInlineMarkdown(trimmed.substring(2))}</li>
    }
    if (!trimmed) {
      return <div key={idx} className="mds-md-br" />
    }
    return <p key={idx} className="mds-md-p">{parseInlineMarkdown(line)}</p>
  })
}

function NavigatorPanel() {
  const { selectTask } = useWorkspace()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SpecIndexItem[]>([])
  const [selectedNode, setSelectedNode] = useState<SpecNode | null>(null)
  
  // States for handling error and loading status
  const [loadingIndex, setLoadingIndex] = useState(false)
  const [indexError, setIndexError] = useState<string | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  
  const [filterType, setFilterType] = useState<'all' | 'KCS' | 'KDS' | 'KS'>('all')

  // AI 요약 관련 상태
  const [aiSummary, setAiSummary] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showApiSettings, setShowApiSettings] = useState(false)
  const [tempApiKey, setTempApiKey] = useState('')

  // Load API key from local storage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('munseobang_gemini_api_key') || ''
    setApiKey(savedKey)
    setTempApiKey(savedKey)
  }, [])

  // Reset AI summary when node changes
  useEffect(() => {
    setAiSummary('')
  }, [selectedNode])

  // Load index / search on query change
  useEffect(() => {
    let active = true
    const delayDebounce = setTimeout(async () => {
      if (!active) return
      setLoadingIndex(true)
      setIndexError(null)
      try {
        const searchResults = await searchSpecs(query)
        if (active) {
          setResults(searchResults)
        }
      } catch (error: any) {
        if (active) {
          console.error(error)
          setIndexError('기준 정보 인덱스를 로드하지 못했습니다. 네트워크 상태나 파일 경로를 확인해 주세요.')
        }
      } finally {
        if (active) {
          setLoadingIndex(false)
        }
      }
    }, 200)

    return () => {
      active = false
      clearTimeout(delayDebounce)
    }
  }, [query])

  // Select a spec item to view details
  const handleSelectSpec = async (code: string) => {
    setLoadingDetail(true)
    setDetailError(null)
    try {
      const detail = await getSpecDetail(code)
      if (!detail) {
        throw new Error('상세 데이터를 찾을 수 없습니다.')
      }
      setSelectedNode(detail)
    } catch (error: any) {
      console.error(error)
      setDetailError(`'${code}' 기준의 상세 데이터를 불러오지 못했습니다.`)
      setSelectedNode(null)
    } finally {
      setLoadingDetail(false)
    }
  }

  // Handle AI summary generation
  const handleAiSummary = async () => {
    if (!selectedNode) return
    setAiLoading(true)
    try {
      const result = await summarizeWithAI(selectedNode, apiKey)
      setAiSummary(result)
    } catch (e: any) {
      setAiSummary(`오류가 발생했습니다: ${e.message}`)
    } finally {
      setAiLoading(false)
    }
  }

  // Save API Key
  const handleSaveApiKey = () => {
    const key = tempApiKey.trim()
    localStorage.setItem('munseobang_gemini_api_key', key)
    setApiKey(key)
    setShowApiSettings(false)
    alert('API 키가 저장되었습니다.')
  }

  // Delete API Key
  const handleDeleteApiKey = () => {
    localStorage.removeItem('munseobang_gemini_api_key')
    setApiKey('')
    setTempApiKey('')
    setShowApiSettings(false)
    alert('API 키가 브라우저에서 제거되었습니다.')
  }

  // Handle clicking a related app button in the spec card
  const handleLaunchApp = (appId: string) => {
    if (appId === 'calculator-pro' || appId === 'calculator-task') {
      selectTask('공통 업무', {
        id: 'calculator-task',
        name: '계산기',
        workflow: [
          { id: 'remitar-calc', name: '레미탈 계산기', status: 'active', url: 'https://nam2037772.github.io/calculator-pro/' }
        ]
      })
    } else {
      alert(`[문서방 OS] '${appId}' 도구로 이동합니다. 지정된 서식을 열어주세요.`);
    }
  }

  const filteredResults = filterType === 'all' 
    ? results 
    : results.filter(item => item.type === filterType)

  return (
    <div className="mds-navigator-widget">
      <div className="mds-navigator-widget__header">
        <div className="mds-navigator-widget__title-row">
          <div>
            <h3 className="mds-navigator-widget__title">📘 건설기준 Navigator</h3>
            <p className="mds-navigator-widget__subtitle">KCS/KDS 핵심 수치와 관련 업무 도구를 바로 찾아 연결합니다.</p>
          </div>
          <button 
            type="button" 
            className={`mds-navigator-settings-btn ${apiKey ? 'has-key' : ''}`}
            onClick={() => setShowApiSettings(!showApiSettings)}
            title="Gemini API 설정"
          >
            ⚙️ {apiKey ? 'AI 활성화됨' : 'AI 실험실 설정'}
          </button>
        </div>

        {/* API 설정 창 */}
        {showApiSettings && (
          <div className="mds-api-settings-panel">
            <h4 className="mds-api-settings-panel__title">⚙️ Gemini API 설정 (개발자용 / 실험 기능)</h4>
            <div className="mds-api-settings-warning">
              <p>⚠️ **보안 및 사용 주의사항**</p>
              <ul>
                <li>입력하신 API Key는 브라우저 LocalStorage에 저장됩니다. (공용 PC에서는 사용하지 마십시오.)</li>
                <li>언제든지 키를 삭제하여 폐기하실 수 있습니다.</li>
                <li>과금 방지를 위해 Google AI Studio에서 API 호출 제한 및 사용량 한도 설정을 권장합니다.</li>
              </ul>
            </div>
            <div className="mds-api-settings-panel__form">
              <input
                type="password"
                className="mds-api-settings-panel__input"
                placeholder="Gemini API Key 입력"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
              />
              <div className="mds-api-settings-panel__buttons">
                <a 
                  href="https://aistudio.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mds-api-settings-panel__link"
                >
                  무료 API 키 발급받기 ↗
                </a>
                <div className="mds-api-settings-panel__action-btns">
                  {apiKey && (
                    <button 
                      type="button" 
                      className="mds-btn mds-btn--danger" 
                      onClick={handleDeleteApiKey}
                    >
                      키 삭제
                    </button>
                  )}
                  <button 
                    type="button" 
                    className="mds-btn mds-btn--primary" 
                    onClick={handleSaveApiKey}
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 1. 검색바 영역 */}
      <div className="mds-navigator-widget__search-bar">
        <span className="mds-navigator-widget__search-icon" aria-hidden="true">⌕</span>
        <input
          type="text"
          className="mds-navigator-widget__search-input"
          placeholder="예: 철근 피복두께, 슬럼프, 양생, 되메우기"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="건설기준 검색"
        />
        {query && (
          <button type="button" className="mds-navigator-widget__clear" onClick={() => setQuery('')}>
            ✕
          </button>
        )}
      </div>

      {/* 2. 5대 공종 퀵 가이드 필터 */}
      <div className="mds-navigator-widget__quick-filters">
        <button 
          type="button" 
          className={`mds-navigator-widget__filter-chip ${filterType === 'all' ? 'is-active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          전체
        </button>
        <button 
          type="button" 
          className={`mds-navigator-widget__filter-chip ${filterType === 'KCS' ? 'is-active' : ''}`}
          onClick={() => setFilterType('KCS')}
        >
          시방기준 (KCS)
        </button>
      </div>

      {/* 3. 2열 레이아웃: 검색 목록 & 상세 체크포인트 카드 */}
      <div className="mds-navigator-widget__body">
        
        {/* 검색 결과 리스트 */}
        <div className="mds-navigator-widget__list-panel">
          <h4 className="mds-navigator-widget__panel-title">기준 목록 ({filteredResults.length})</h4>
          <ul className="mds-navigator-widget__list">
            {indexError ? (
              <li className="mds-navigator-widget__error-item">{indexError}</li>
            ) : loadingIndex ? (
              <li className="mds-navigator-widget__empty">검색 중...</li>
            ) : filteredResults.length === 0 ? (
              <>
                <li className="mds-navigator-widget__empty">검색 결과가 없습니다.</li>
                {query.trim() && (
                  <li className="mds-navigator-widget__external-search">
                    <p className="mds-navigator-widget__external-search-desc">원하는 기준을 찾지 못하셨나요? 국가건설기준센터 외부 검색을 이용해 보세요.</p>
                    <div className="mds-navigator-widget__external-search-btns">
                      <a
                        href={`https://www.kcsc.re.kr/Search/List?searchTxt=${encodeURIComponent(query)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mds-navigator-external-btn"
                      >
                        KCSC 외부 검색 ↗
                      </a>
                      <a
                        href={`https://www.google.com/search?q=site:kcsc.re.kr+${encodeURIComponent(query)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mds-navigator-external-btn"
                      >
                        Google KCSC 검색 ↗
                      </a>
                    </div>
                  </li>
                )}
              </>
            ) : (
              filteredResults.map((item) => (
                <li key={item.code} className="mds-navigator-item">
                  <button
                    type="button"
                    className={`mds-navigator-item__btn ${selectedNode?.code === item.code ? 'is-selected' : ''}`}
                    onClick={() => handleSelectSpec(item.code)}
                  >
                    <span className="mds-navigator-item__code">{item.code}</span>
                    <span className="mds-navigator-item__title">{item.title}</span>
                    <span className="mds-navigator-item__arrow">▶</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* 상세 보기 및 체크포인트 카드 패널 */}
        <div className="mds-navigator-widget__detail-panel">
          {loadingDetail ? (
            <div className="mds-navigator-widget__detail-empty">스펙 상세를 로드하는 중...</div>
          ) : detailError ? (
            <div className="mds-navigator-widget__detail-empty mds-navigator-widget__detail-error">
              <span className="mds-navigator-widget__decor-star" aria-hidden="true">⚠️</span>
              <p>{detailError}</p>
            </div>
          ) : selectedNode ? (
            <article className="mds-spec-detail-card">
              <header className="mds-spec-detail-card__header">
                <div className="mds-spec-detail-card__code-badge">
                  {selectedNode.type} {selectedNode.code}
                </div>
                <h3 className="mds-spec-detail-card__title">{selectedNode.title}</h3>
                <span className="mds-spec-detail-card__date">개정: {selectedNode.revisionDate}</span>
              </header>

              {/* 핵심 체크포인트 */}
              <section className="mds-spec-section">
                <h4 className="mds-spec-section__title">📌 핵심 체크포인트</h4>
                <ul className="mds-spec-checkpoints">
                  {selectedNode.checkpoints.map((cp) => (
                    <li key={cp.id} className="mds-spec-cp-item">
                      <div className="mds-spec-cp-item__meta">
                        <span className="mds-spec-cp-item__category">{cp.category}</span>
                        <strong className="mds-spec-cp-item__name">{cp.item}</strong>
                      </div>
                      <p className="mds-spec-cp-item__criteria">{cp.criteria}</p>
                      {cp.testMethod && (
                        <span className="mds-spec-cp-item__method">시험규격: {cp.testMethod}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>

              {/* AI 기준 요약 섹션 (실험 기능) */}
              <section className="mds-spec-section mds-spec-section--ai">
                <div className="mds-spec-section__header-row">
                  <h4 className="mds-spec-section__title">✨ AI 기준 요약 <span className="mds-badge-experimental">실험실</span></h4>
                  <button
                    type="button"
                    className="mds-spec-ai-btn"
                    onClick={handleAiSummary}
                    disabled={aiLoading}
                  >
                    {aiLoading ? '요약 분석 중...' : 'AI로 기준 요약하기'}
                  </button>
                </div>
                
                {aiLoading && (
                  <div className="mds-spec-ai-loading">
                    <span className="mds-navigator-ai-loading-spinner" />
                    <p>제공된 실제 기준 조항만을 바탕으로 AI가 정밀 요약 중입니다...</p>
                  </div>
                )}

                {aiSummary && (
                  <div className="mds-spec-ai-result-box">
                    {renderMarkdown(aiSummary)}
                  </div>
                )}
              </section>

              {/* 관련 업무 앱 연결 */}
              <section className="mds-spec-section">
                <h4 className="mds-spec-section__title">🛠️ 관련 작업대 연결</h4>
                <div className="mds-spec-apps-row">
                  {selectedNode.relatedApps.map((app) => (
                    <button
                      key={app.appId}
                      type="button"
                      className="mds-spec-app-btn"
                      onClick={() => handleLaunchApp(app.appId)}
                    >
                      <span className="mds-spec-app-btn__icon">▣</span>
                      {app.tabName || app.appId} 바로가기
                    </button>
                  ))}
                </div>
              </section>

              {/* 원문 및 외부 검색 링크 */}
              <footer className="mds-spec-detail-card__footer">
                <div className="mds-spec-dependencies">
                  <strong>연관 기준:</strong> {selectedNode.relations.dependencies.join(', ') || '없음'}
                </div>
                <div className="mds-spec-detail-card__links">
                  <a
                    href={selectedNode.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mds-spec-origin-btn"
                  >
                    국토부 원문 보기 ↗
                  </a>
                  <a
                    href={`https://www.kcsc.re.kr/Search/List?searchTxt=${encodeURIComponent(selectedNode.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mds-spec-external-btn"
                  >
                    건설기준센터 외부 검색 ↗
                  </a>
                  <a
                    href={`https://www.google.com/search?q=site:kcsc.re.kr+${encodeURIComponent(selectedNode.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mds-spec-external-btn"
                  >
                    Google KCSC 검색 ↗
                  </a>
                </div>
              </footer>
            </article>
          ) : (
            <div className="mds-navigator-widget__detail-empty">
              <span className="mds-navigator-widget__decor-star">★</span>
              왼쪽 목록에서 기준을 선택하거나 검색하여 핵심 체크포인트 수치를 확인하세요.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default NavigatorPanel
