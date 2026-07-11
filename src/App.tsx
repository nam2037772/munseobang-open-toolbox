import { useState, useEffect } from 'react'
import { WorkspaceProvider } from './context/WorkspaceContext'
import CommandBar from './components/CommandBar'
import ConstructionPortal from './components/ConstructionPortal'
import NavigatorPanel from './components/navigator/NavigatorPanel'
import { quickPortals } from './data/portalSites'
import { familyApps } from './data/apps'
import type { FamilyApp } from './data/apps'
import ainSafetyThumb from './assets/ainsafety_banner_thumb.png'
import './App.css'

const PLACEHOLDERS = [
  '예: KCS 되메우기 기준',
  '예: TBM 작성법',
  '예: 콘크리트 양생 기준',
  '예: 국토부 방수 기준',
  '예: 산안비 사용 기준',
  '예: 공사일보 작성 양식'
]

interface SidebarBanner {
  id: string
  label: string
  title: string
  content: string
  buttonText: string
  link: string
  imageUrl?: string
}

const bannerData: SidebarBanner[] = [
  {
    id: 'recommendation',
    label: '추천 도구',
    title: '실무 도구 제안',
    content: '건설 실무에 필요한 양식과 업무 도구를 수시로 개발하고 있습니다.',
    buttonText: '제안/문의',
    link: 'mailto:contact@munseobang.com'
  },
  {
    id: 'ainsafety',
    label: '협력사',
    title: '아인산업안전',
    content: '전국 온라인 안전용품전문점 · 건설자재 · 방수자재 납품',
    buttonText: '바로가기',
    link: 'https://ainsafety.com',
    imageUrl: ainSafetyThumb
  }
]

function AppContent() {
  const [googleQuery, setGoogleQuery] = useState('')
  const [googleError, setGoogleError] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false)

  // Rotate placeholders every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const handleGoogleSearch = () => {
    const trimmed = googleQuery.trim()
    if (!trimmed) {
      setGoogleError('검색어를 입력해 주세요.')
      return
    }
    setGoogleError('')
    window.open(`https://www.google.com/search?q=${encodeURIComponent(trimmed)}`, '_blank', 'noopener,noreferrer')
  }

  const handleOpenNavigator = () => {
    setIsNavigatorOpen(true)
  }

  const handleAppClick = (app: FamilyApp) => {
    if (app.status === '준비중') {
      alert(`'${app.name}' 독립 앱은 현재 준비 중입니다.`)
      return
    }
    if (app.url === 'local://navigator') {
      setIsNavigatorOpen(true)
      return
    }
    if (app.url) {
      window.open(app.url, '_blank', 'noopener,noreferrer')
    }
  }

  // Group apps by category
  const groupedApps = familyApps.reduce((acc, app) => {
    if (!acc[app.category]) {
      acc[app.category] = []
    }
    acc[app.category].push(app)
    return acc
  }, {} as Record<string, FamilyApp[]>)

  const categories = ['공사관리', '품질관리', '검수검측', '안전환경', '공무행정', '본사협업', '공통업무']

  if (window.self !== window.top) {
    return (
      <div className="mds-frame-guard">
        <h3>도구 연결 실패</h3>
        <p>외부 도구 주소가 만료되었거나 iframe 로딩이 차단되었습니다.</p>
      </div>
    )
  }

  return (
    <div className="mds-os-container mds-os-container--full">
      <CommandBar />

      <div className="mds-main-content mds-main-content--full">
        <header className="mds-topbar">
          <div className="mds-logo-area">
            <span className="mds-logo-icon">📂</span>
            <strong className="mds-logo-title">문서방 오픈툴박스</strong>
          </div>
          <div className="mds-topbar__search-guide">
            <span className="mds-status-indicator__dot"></span>
            <span className="mds-status-indicator__label">로컬 보안 모드 사용 가능</span>
          </div>
        </header>

        <main className="mds-canvas">
          <div className="mds-dashboard">
            <section className="mds-dashboard__hero">
              {/* 포털 바로가기 (최상단) */}
              <div className="mds-quick-portals">
                {quickPortals.map((portal) => (
                  <a
                    key={portal.id}
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mds-quick-portal-btn"
                    style={{ '--brand-color': portal.color } as React.CSSProperties}
                    title={`${portal.name} 새 창 열기`}
                  >
                    <span className="mds-quick-portal-btn__icon" aria-hidden="true">
                      {portal.icon}
                    </span>
                    <span className="mds-quick-portal-btn__name">{portal.name}</span>
                  </a>
                ))}
              </div>

              <h1 className="mds-dashboard__title">무엇을 찾으시나요?</h1>
              <p className="mds-dashboard__subtitle">문서방은 작업을 시작하는 공간입니다. 검색을 통해 답을 찾거나, 아래 개별 서비스로 빠르게 이동하세요.</p>

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
                      placeholder={PLACEHOLDERS[placeholderIndex]}
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

                {/* 건설기준 탐색기 바로가기 카드 */}
                <button 
                  type="button" 
                  className="mds-search-box-card mds-search-box-card--navigator-shortcut"
                  onClick={handleOpenNavigator}
                >
                  <div className="mds-navigator-shortcut-content">
                    <span className="mds-navigator-shortcut-icon">📘</span>
                    <div className="mds-navigator-shortcut-text">
                      <strong className="mds-navigator-shortcut-title">건설기준 탐색기 (Standards Navigator)</strong>
                      <p className="mds-navigator-shortcut-desc">철근 피복두께, 슬럼프, 되메우기 등 KCS 핵심 수치 기준을 0초만에 확인하세요.</p>
                    </div>
                  </div>
                  <span className="mds-navigator-shortcut-arrow">바로가기 ▶</span>
                </button>

              </div>
            </section>

            {/* 패밀리 앱 섹션 (문서방 개별 가벼운 앱) */}
            <section className="mds-family-apps" aria-labelledby="family-apps-title">
              <h2 id="family-apps-title" className="mds-family-apps__title">문서방 패밀리 앱</h2>
              <p className="mds-family-apps__subtitle">각 하위 카테고리별로 가볍고 신속하게 동작하는 개별 웹 독립 서비스 모음입니다.</p>
              
              <div className="mds-family-apps__grid">
                {categories.map((catName) => {
                  const catApps = groupedApps[catName] || []
                  if (catApps.length === 0) return null

                  return (
                    <div key={catName} className="mds-family-category-card">
                      <h3 className="mds-family-category-card__title">{catName}</h3>
                      <div className="mds-family-category-card__list">
                        {catApps.map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            className={`mds-family-app-item ${app.status === '준비중' ? 'is-prep' : ''}`}
                            onClick={() => handleAppClick(app)}
                            title={app.status === '준비중' ? `${app.name} 독립 앱 준비중` : `${app.name} 바로가기`}
                          >
                            <div className="mds-family-app-item__header">
                              <span className="mds-family-app-item__icon">{app.icon}</span>
                              <strong className="mds-family-app-item__name">{app.name}</strong>
                              {app.status === '준비중' ? (
                                <span className="mds-family-app-item__badge mds-family-app-item__badge--prep">준비중</span>
                              ) : (
                                <span className="mds-family-app-item__badge mds-family-app-item__badge--active">바로가기 ↗</span>
                              )}
                            </div>
                            <p className="mds-family-app-item__desc">{app.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* 건설 실무 포털 허브 */}
            <ConstructionPortal />

            <div className="mds-dashboard__split">
              {/* 오늘의 업무 브리핑 */}
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

              {/* 제안 및 광고 배너 영역 */}
              <section className="mds-dashboard-banners" aria-label="제안 및 제휴 안내">
                <div className="mds-dashboard-banners__grid">
                  {bannerData.map((banner) => (
                    <a 
                      key={banner.id} 
                      href={banner.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mds-dashboard-banner"
                      title={`${banner.title} 새 창 열기`}
                    >
                      {banner.imageUrl && (
                        <img 
                          src={banner.imageUrl} 
                          alt={`${banner.title} 이미지`}
                          className="mds-dashboard-banner__image" 
                        />
                      )}
                      <div className="mds-dashboard-banner__body">
                        <div className="mds-dashboard-banner__header">
                          <span className="mds-dashboard-banner__label">{banner.label}</span>
                          <h4 className="mds-dashboard-banner__title">{banner.title}</h4>
                        </div>
                        <p className="mds-dashboard-banner__content">{banner.content}</p>
                        <span className="mds-dashboard-banner__btn">
                          {banner.buttonText}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* 건설기준 탐색기 레이어 모달 */}
      {isNavigatorOpen && (
        <div className="mds-modal-overlay" onClick={() => setIsNavigatorOpen(false)}>
          <div className="mds-modal-content mds-modal-content--large" onClick={(e) => e.stopPropagation()}>
            <header className="mds-modal-header">
              <h3 className="mds-modal-title">📘 건설기준 탐색기 (Standards Navigator)</h3>
              <button type="button" className="mds-modal-close-btn" onClick={() => setIsNavigatorOpen(false)} aria-label="닫기">×</button>
            </header>
            <div className="mds-modal-body">
              <NavigatorPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  return <WorkspaceProvider><AppContent /></WorkspaceProvider>
}

export default App

