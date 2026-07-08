import { apps, folders, type FolderId } from '../data/apps'

interface FolderGridProps {
  onSelect: (id: FolderId) => void
}

function FolderGrid({ onSelect }: FolderGridProps) {
  return (
    <section className="folders" id="folders">
      <div className="folders__grid">
        {folders.map((folder) => {
          const count = apps.filter((app) => app.category === folder.id).length
          return (
            <button key={folder.id} type="button" className="folder-card" onClick={() => onSelect(folder.id)}>
              <span className="folder-card__icon" aria-hidden="true">{folder.icon}</span>
              <span className="folder-card__title">{folder.title}</span>
              <span className="folder-card__count">{count}개 도구</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default FolderGrid
