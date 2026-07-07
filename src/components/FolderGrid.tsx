import { apps, folders, type FolderId } from '../data/apps'

interface FolderGridProps {
  onSelect: (id: FolderId) => void
}

function FolderGrid({ onSelect }: FolderGridProps) {
  return (
    <section className="folders" id="folders">
      <div className="section-heading">
        <p className="section-heading__eyebrow">업무 카테고리</p>
        <h2 className="section-title">필요한 업무 폴더를 먼저 여세요</h2>
      </div>

      <div className="folders__grid">
        {folders.map((folder) => {
          const count = apps.filter((app) => app.category === folder.id).length

          return (
            <button key={folder.id} type="button" className="folder-card" onClick={() => onSelect(folder.id)}>
              <span className="folder-card__marker" aria-hidden="true">{folder.marker}</span>
              <span className="folder-card__title">{folder.title}</span>
              <span className="folder-card__desc">{folder.description}</span>
              <span className="folder-card__count">{count}개 항목</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default FolderGrid
