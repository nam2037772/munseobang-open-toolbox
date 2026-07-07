import { apps } from '../data/apps'
import { useFavorites } from '../hooks/useFavorites'
import AppCard from './AppCard'

function Favorites() {
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites()
  const favoriteApps = favoriteIds
    .map((id) => apps.find((app) => app.id === id))
    .filter((app): app is NonNullable<typeof app> => Boolean(app))

  if (favoriteApps.length === 0) return null

  return (
    <section className="favorites" id="favorites">
      <div className="workspace-heading workspace-heading--compact">
        <p className="workspace-heading__eyebrow">빠른 실행</p>
        <h2 className="workspace-heading__title">즐겨찾기</h2>
      </div>

      <div className="app-grid app-grid--favorites app-grid--compact">
        {favoriteApps.map((app) => (
          <AppCard key={app.id} app={app} isFavorite={isFavorite(app.id)} onToggleFavorite={toggleFavorite} compact />
        ))}
      </div>
    </section>
  )
}

export default Favorites
