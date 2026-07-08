import { useState } from 'react'
import { portalSites, portalCategories, type PortalCategory } from '../data/portalSites'

function ConstructionPortal() {
  const [activeCategory, setActiveCategory] = useState<PortalCategory | 'all'>('all')

  const filteredSites = activeCategory === 'all'
    ? portalSites
    : portalSites.filter((site) => site.category === activeCategory)

  return (
    <section className="mds-portal" aria-labelledby="portal-title">
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
