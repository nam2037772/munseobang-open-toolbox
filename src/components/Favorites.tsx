import { apps } from '../data/apps'
import { useFavorites } from '../hooks/useFavorites'
import AppCard from './AppCard'

function Favorites() {
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites()
  const favoriteApps = favoriteIds
    .map((id) => apps.find((app) => app.id === id))
    .filter((app): app is NonNullable<typeof app> => Boolean(app))

  return (
    <section className="favorites" id="favorites">
      <div className="section-heading">
        <p className="section-heading__eyebrow">빠른 실행</p>
        <h2 className="section-title">즐겨찾기</h2>
      </div>

      <div className="app-grid app-grid--favorites">
        {favoriteApps.map((app) => (
          <AppCard key={app.id} app={app} isFavorite={isFavorite(app.id)} onToggleFavorite={toggleFavorite} />
        ))}
      </div>
    </section>
  )
}

export default Favorites
