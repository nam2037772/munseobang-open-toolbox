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
      <h2 className="section-title">⭐ 즐겨찾기</h2>
      <div className="favorites__grid">
        {favoriteApps.map((app) => (
          <AppCard key={app.id} app={app} isFavorite={isFavorite(app.id)} onToggleFavorite={toggleFavorite} compact />
        ))}
      </div>
    </section>
  )
}

export default Favorites
