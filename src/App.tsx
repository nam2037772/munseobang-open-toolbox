import { useState } from 'react'
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext'
import SidebarExplorer from './components/SidebarExplorer'
import WorkflowTimeline from './components/WorkflowTimeline'
import WorkspaceCanvas from './components/WorkspaceCanvas'
import CommandBar from './components/CommandBar'
import ConstructionPortal from './components/ConstructionPortal'
import './App.css'

function AppContent() {
  const { activeTask, selectedPath, resetWorkspace } = useWorkspace()
  const [googleQuery, setGoogleQuery] = useState('')
  const [googleError, setGoogleError] = useState('')

  const handleGoogleSearch = () => {
    const trimmed = googleQuery.trim()
    if (!trimmed) {
      setGoogleError('검색어를 입력해 주세요.')
      return
    }
    setGoogleError('')
    window.open(`https://www.google.com/search?q=${encodeURIComponent(trimmed)}`, '_blank', 'noopener,noreferrer')
  }

  if (window.self !== window.top) {
    return (
      <div className="mds-frame-guard">
        <h3>도구 연결 실패</h3>
        <p>외부 도구 주소가 만료되었거나 iframe 로딩이 차단되었습니다.</p>
      </div>
    )
  }

  return (
    <div className="mds-os-container">
      <CommandBar />
      <SidebarExplorer />

      <div className="mds-main-content">
        <header className="mds-topbar">
          <nav className="mds-breadcrumb" aria-label="현재 위치">
            <button type="button" className="mds-breadcrumb__home" onClick={resetWorkspace}>
              문서방
            </button>
            {selectedPath.map((path) => (
              <span key={path} className="mds-breadcrumb__item">
                <span className="mds-breadcrumb__separator" aria-hidden="true">/</span>
                <span className="mds-breadcrumb__name">{path}</span>
              </span>
            ))}
          </nav>
          <div className="mds-topbar__search-guide"><kbd>Ctrl + K</kbd> 도구 찾기</div>
        </header>

        <main className="mds-canvas">
          {activeTask === null ? (
            <div className="mds-dashboard">
              <section className="mds-dashboard__hero">
                <h1 className="mds-dashboard__title">무엇을 도와드릴까요?</h1>
                <p className="mds-dashboard__subtitle">문서방은 작업을 시작하는 공간입니다. 검색을 통해 답을 찾거나, 왼쪽 탐색기에서 업무를 선택하세요.</p>

                {/* 검색 통합 허브 영역 */}
                <div className="mds-search-hub">
                  
                  {/* Google에서 검색하기 */}
                  <div className="mds-search-box-card mds-search-box-card--google">
                    <label className="mds-search-box-label" htmlFor="google-search-input">
                      <span className="mds-search-box-label__icon">⌕</span> Google에서 검색하기
                    </label>
                    <div className="mds-search-box-group">
                      <input
                        id="google-search-input"
                        type="text"
                        className="mds-search-input"
                        placeholder="예: KCS 되메우기 기준"
                        value={googleQuery}
                        onChange={(e) => {
                          setGoogleQuery(e.target.value)
                          if (e.target.value.trim()) setGoogleError('')
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleGoogleSearch()}
                      />
                      <button
                        type="button"
                        className="mds-search-btn mds-search-btn--google"
                        onClick={handleGoogleSearch}
                      >
                        Google 검색
                      </button>
                    </div>
                    {googleError && (
                      <div className="mds-search-error-feedback">
                        {googleError}
                      </div>
                    )}
                  </div>

                </div>
              </section>

              {/* 건설 실무 포털 허브 */}
              <ConstructionPortal />

              <section className="mds-dashboard__shortcuts" aria-labelledby="shortcut-title">
                <h3 id="shortcut-title" className="mds-dashboard__section-title">주요 업무 바로가기</h3>
                <div className="mds-grid mds-grid--cols-4">
                  <div className="mds-shortcut-card"><span className="mds-shortcut-card__icon" aria-hidden="true">▣</span><span className="mds-shortcut-card__title">콘크리트 타설</span><span className="mds-shortcut-card__desc">TBM, 사진대지, 검측, 공사일보</span></div>
                  <div className="mds-shortcut-card"><span className="mds-shortcut-card__icon" aria-hidden="true">▣</span><span className="mds-shortcut-card__title">철근/거푸집 공사</span><span className="mds-shortcut-card__desc">위험성평가, 배근 사진, 검측</span></div>
                  <div className="mds-shortcut-card"><span className="mds-shortcut-card__icon" aria-hidden="true">▣</span><span className="mds-shortcut-card__title">방수/마감 공사</span><span className="mds-shortcut-card__desc">자재 반입, 검수, 사진, 마감 검측</span></div>
                  <div className="mds-shortcut-card"><span className="mds-shortcut-card__icon" aria-hidden="true">▣</span><span className="mds-shortcut-card__title">현장 TBM / 안전</span><span className="mds-shortcut-card__desc">위험요인 조회와 TBM 일지 작성</span></div>
                </div>
              </section>

              <div className="mds-dashboard__split">
                <section className="mds-feed-panel" aria-labelledby="brief-title">
                  <div className="mds-feed-panel__header">
                    <h3 id="brief-title" className="mds-dashboard__section-title mds-dashboard__section-title--flush">오늘의 업무 브리핑</h3>
                    <a className="mds-feed-panel__link" href="https://nam2037772.github.io/gunseol-silmu-briefing/" target="_blank" rel="noopener noreferrer">건설뉴스브리핑 전체보기 ↗</a>
                  </div>
                  <ul className="mds-feed-list">
                    <li className="mds-feed-item"><span className="mds-feed-item__source mds-feed-item__source--molit">국토부</span><span className="mds-feed-item__title">소규모 건축공사 감리 기준 개정 고시 확인 필요</span></li>
                    <li className="mds-feed-item"><span className="mds-feed-item__source mds-feed-item__source--kcs">KCS</span><span className="mds-feed-item__title">콘크리트 마감 시공기준 변경안 확인</span></li>
                    <li className="mds-feed-item"><span className="mds-feed-item__source mds-feed-item__source--csi">CSI</span><span className="mds-feed-item__title">동절기 콘크리트 타설 중 품질 사고 주의</span></li>
                  </ul>
                </section>

                <section className="mds-feed-panel" aria-labelledby="recent-title">
                  <h3 id="recent-title" className="mds-dashboard__section-title">최근 진행 업무</h3>
                  <ul className="mds-feed-list">
                    <li className="mds-feed-item"><span className="mds-feed-item__time">방금 전</span><span className="mds-feed-item__title">[공사] 0708_콘크리트_타설_사진대지.pdf</span></li>
                    <li className="mds-feed-item"><span className="mds-feed-item__time">어제</span><span className="mds-feed-item__title">[안전] 0707_위험성평가_회의록.json</span></li>
                    <li className="mds-feed-item"><span className="mds-feed-item__time">3일 전</span><span className="mds-feed-item__title">[공무] 설계변경_실정보고서_초안.json</span></li>
                  </ul>
                </section>
              </div>
            </div>
          ) : (
            <div className="mds-workbench">
              <div className="mds-workbench__header"><h2 className="mds-workbench__title">{activeTask.name}</h2></div>
              <WorkflowTimeline />
              <WorkspaceCanvas />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function App() {
  return <WorkspaceProvider><AppContent /></WorkspaceProvider>
}

export default App

