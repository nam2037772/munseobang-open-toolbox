import type { AppItem } from '../data/apps'

interface AppCardProps {
  app: AppItem
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  compact?: boolean
}

function handleOpen(app: AppItem) {
  if (!app.url) {
    alert(`${app.title}은 현재 MVP 준비 항목입니다. 서버 저장 없이 PC 저장 방식으로 확장할 예정입니다.`)
    return
  }
  if (app.url.startsWith('#')) {
    document.querySelector(app.url)?.scrollIntoView({ behavior: 'smooth' })
    return
  }
  window.open(app.url, '_blank', 'noopener,noreferrer')
}

function AppCard({ app, isFavorite, onToggleFavorite, compact = false }: AppCardProps) {
  return (
    <article className={`tool-card ${compact ? 'tool-card--compact' : ''}`}>
      {!compact && (
        <div className="tool-card__top">
          <span className="tool-card__category">{app.category}</span>
          <span className="tool-card__trust">{app.badge}</span>
        </div>
      )}

      <div className="tool-card__head">
        <h3 className="tool-card__title">{app.title}</h3>
        <button type="button" className={`tool-card__fav ${isFavorite ? 'tool-card__fav--active' : ''}`} onClick={() => onToggleFavorite(app.id)} aria-label={isFavorite ? '즐겨찾기에서 빼기' : '즐겨찾기에 추가'} aria-pressed={isFavorite}>
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      <p className="tool-card__desc">{app.description}</p>

      <div className="tool-card__footer">
        <span className={`tool-card__status tool-card__status--${app.status === '사용가능' ? 'ready' : 'soon'}`}>{app.status}</span>
        <button type="button" className="tool-card__open" onClick={() => handleOpen(app)}>열기</button>
      </div>
    </article>
  )
}

export default AppCard
