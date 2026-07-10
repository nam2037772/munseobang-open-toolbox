import { useState, useEffect } from 'react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { searchSpecs, getSpecDetail } from '../../services/specEngine'
import type { SpecIndexItem, SpecNode } from '../../types/spec'

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
        <h3 className="mds-navigator-widget__title">📘 건설기준 Navigator</h3>
        <p className="mds-navigator-widget__subtitle">KCS/KDS 핵심 수치와 관련 업무 도구를 바로 찾아 연결합니다.</p>
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
              <li className="mds-navigator-widget__empty">검색 결과가 없습니다.</li>
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

              {/* 원문 보기 버튼 */}
              <footer className="mds-spec-detail-card__footer">
                <div className="mds-spec-dependencies">
                  <strong>연관 기준:</strong> {selectedNode.relations.dependencies.join(', ') || '없음'}
                </div>
                <a
                  href={selectedNode.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mds-spec-origin-btn"
                >
                  국토부 원문 보기 ↗
                </a>
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
