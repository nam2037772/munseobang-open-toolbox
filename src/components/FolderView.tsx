import { apps, folders, type FolderId } from '../data/apps'
import { useFavorites } from '../hooks/useFavorites'
import AppCard from './AppCard'

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
          <h2 className="folder-view__title">{folder?.title ?? folderId}</h2>
          {folder && <p className="folder-view__desc">{folder.description}</p>}
        </div>
        <button type="button" className="folder-view__back" onClick={onBack}>
          전체 폴더로 돌아가기
        </button>
      </div>

      <div className="app-grid">
        {folderApps.map((app) => (
          <AppCard key={app.id} app={app} isFavorite={isFavorite(app.id)} onToggleFavorite={toggleFavorite} />
        ))}
      </div>
    </section>
  )
}

export default FolderView
