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
    <section className="folder-view">
      <div className="folder-view__breadcrumb">
        <p className="folder-view__path">
          문서방 <span aria-hidden="true">&gt;</span> {folder?.title ?? folderId}
        </p>
        <button type="button" className="folder-view__back" onClick={onBack}>
          ← 전체 업무
        </button>
      </div>

      {folder && <p className="folder-view__desc">{folder.description}</p>}

      <div className="folder-view__grid">
        {folderApps.length === 0 ? (
          <p className="folder-view__empty">이 폴더에는 아직 등록된 도구가 없습니다.</p>
        ) : (
          folderApps.map((app) => (
            <AppCard key={app.id} app={app} isFavorite={isFavorite(app.id)} onToggleFavorite={toggleFavorite} compact />
          ))
        )}
      </div>

      {folderId === '건설뉴스브리핑' && <News />}
    </section>
  )
}

export default FolderView
