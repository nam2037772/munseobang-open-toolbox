import { apps, folders, type FolderId } from '../data/apps'
import { useFavorites } from '../hooks/useFavorites'
import AppCard from './AppCard'
import News from './News'

interface FolderViewProps {
  folderId: FolderId
  onBack: () => void
}

function FolderView({ folderId, onBack }: FolderViewProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const folder = folders.find((item) => item.id === folderId)
  const folderApps = apps.filter((app) => app.category === folderId)

  return (
    <section className="folder-view" id="folder-view">
      <div className="folder-view__top">
        <div>
          <p className="folder-view__path">문서방 <span aria-hidden="true">&gt;</span> {folder?.title ?? folderId}</p>
          <h1 className="folder-view__title">{folder?.title ?? folderId}</h1>
          {folder && <p className="folder-view__desc">{folder.description}</p>}
        </div>
        <button type="button" className="folder-view__back" onClick={onBack}>
          전체 폴더로 돌아가기
        </button>
      </div>

      <div className="app-grid app-grid--compact">
        {folderApps.map((app) => (
          <AppCard key={app.id} app={app} isFavorite={isFavorite(app.id)} onToggleFavorite={toggleFavorite} compact />
        ))}
      </div>

      {folderId === '건설실무브리핑' && <News />}
    </section>
  )
}

export default FolderView
