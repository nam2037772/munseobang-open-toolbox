import type { AppItem } from '../data/apps'

interface AppCardProps {
  app: AppItem
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  compact?: boolean
}

function AppCard({ app, isFavorite, onToggleFavorite, compact = false }: AppCardProps) {
  const openApp = () => {
    if (app.url) {
      window.open(app.url, '_blank', 'noopener,noreferrer')
      return
    }

    alert(`${app.title}은 현재 ${app.status} 항목입니다. 기존 링크는 보존하고, 준비되는 대로 연결합니다.`)
  }

  return (
    <article className={`app-card ${compact ? 'app-card--compact' : ''} app-card--${app.status === '사용가능' ? 'ready' : 'pending'}`}>
      <div className="app-card__top">
        <span className="app-card__category">{app.category}</span>
        <button
          type="button"
          className={`app-card__favorite ${isFavorite ? 'app-card__favorite--active' : ''}`}
          aria-label={isFavorite ? `${app.title} 즐겨찾기 해제` : `${app.title} 즐겨찾기 추가`}
          onClick={() => onToggleFavorite(app.id)}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      <h3 className="app-card__title">{app.title}</h3>
      <p className="app-card__desc">{app.description}</p>

      <div className="app-card__meta">
        <span>{app.badge}</span>
        <span>{app.status}</span>
      </div>

      <button type="button" className="app-card__open" onClick={openApp}>
        {app.url ? '열기' : app.status}
      </button>
    </article>
  )
}

export default AppCard
