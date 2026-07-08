import { useState, useEffect } from 'react'
import { portalSites, portalCategories, type PortalCategory } from '../data/portalSites'

const FAVORITES_KEY = 'munseobang_portal_favorites'

function ConstructionPortal() {
  const [activeCategory, setActiveCategory] = useState<PortalCategory | 'all'>('all')
  const [favorites, setFavorites] = useState<string[]>([])

  // Load favorites from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(FAVORITES_KEY)
    if (saved) {
      try {
        setFavorites(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse favorites from localStorage', e)
      }
    }
  }, [])

  // Toggle favorite status
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const updated = favorites.includes(id)
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id]
    setFavorites(updated)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
  }

  const favoriteSites = portalSites.filter((site) => favorites.includes(site.id))

  const filteredSites = activeCategory === 'all'
    ? portalSites
    : portalSites.filter((site) => site.category === activeCategory)

  return (
    <section className="mds-portal" aria-labelledby="portal-title">
      
      {/* 1. 즐겨찾는 실무 사이트 영역 (LocalStorage 기반) */}
      {favoriteSites.length > 0 && (
        <div className="mds-portal__favorites-section">
          <h3 className="mds-portal__section-subtitle">
            <span className="mds-portal__subtitle-star">★</span> 즐겨찾는 실무 사이트
          </h3>
          <div className="mds-portal__grid mds-portal__grid--favorites">
            {favoriteSites.map((site) => (
              <a
                key={`fav-${site.id}`}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mds-portal-card mds-portal-card--favorite"
                title={`${site.name} 새 창 열기`}
              >
                <div className="mds-portal-card__header">
                  <span className="mds-portal-card__icon" aria-hidden="true">{site.icon}</span>
                  <div className="mds-portal-card__title-area">
                    <h4 className="mds-portal-card__name">{site.name}</h4>
                  </div>
                  <button
                    type="button"
                    className="mds-portal-card__star-btn is-favorite"
                    onClick={(e) => toggleFavorite(site.id, e)}
                    title="즐겨찾기 해제"
                    aria-label={`${site.name} 즐겨찾기 해제`}
                  >
                    ★
                  </button>
                </div>
                <p className="mds-portal-card__desc">{site.description}</p>
                <div className="mds-portal-card__footer">
                  <span className="mds-portal-card__link-text">바로가기</span>
                  <span className="mds-portal-card__arrow" aria-hidden="true">↗</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 2. 전체 건설 실무 포털 목록 */}
      <div className="mds-portal__header">
        <h2 id="portal-title" className="mds-portal__title">건설 실무 포털</h2>
        <p className="mds-portal__subtitle">
          실무에 필수적인 정부 기관, 설계 기준, 안전 포털 및 자재 브랜드를 한눈에 확인하고 바로 이동합니다.
        </p>
      </div>

      {/* 카테고리 필터 영역 */}
      <div className="mds-portal__filters" role="tablist" aria-label="포털 카테고리 필터">
        {portalCategories.map((cat) => {
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`mds-portal__filter-btn ${isActive ? 'is-active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* 사이트 카드 그리드 */}
      <div className="mds-portal__grid">
        {filteredSites.map((site) => (
          <a
            key={site.id}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mds-portal-card"
            title={`${site.name} 새 창 열기`}
          >
            <div className="mds-portal-card__header">
              <span className="mds-portal-card__icon" aria-hidden="true">{site.icon}</span>
              <div className="mds-portal-card__title-area">
                <h3 className="mds-portal-card__name">{site.name}</h3>
                {site.isOfficial && (
                  <span className="mds-portal-card__badge" aria-label="공식 사이트">
                    공식
                  </span>
                )}
              </div>
              <button
                type="button"
                className={`mds-portal-card__star-btn ${favorites.includes(site.id) ? 'is-favorite' : ''}`}
                onClick={(e) => toggleFavorite(site.id, e)}
                title={favorites.includes(site.id) ? '즐겨찾기 해제' : '즐겨찾기 등록'}
                aria-label={`${site.name} 즐겨찾기 토글`}
              >
                {favorites.includes(site.id) ? '★' : '☆'}
              </button>
            </div>
            <p className="mds-portal-card__desc">{site.description}</p>
            <div className="mds-portal-card__footer">
              <span className="mds-portal-card__link-text">바로가기</span>
              <span className="mds-portal-card__arrow" aria-hidden="true">↗</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

export default ConstructionPortal
