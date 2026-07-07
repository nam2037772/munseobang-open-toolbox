import { apps, folders, type FolderId } from '../data/apps'

interface FolderGridProps {
  onSelect: (id: FolderId) => void
}

function FolderGrid({ onSelect }: FolderGridProps) {
  return (
    <section className="folders" id="folders">
      <div className="workspace-heading">
        <p className="workspace-heading__eyebrow">업무 폴더</p>
        <h1 className="workspace-heading__title">오늘 할 업무를 선택하세요</h1>
        <p className="workspace-heading__desc">도구 이름을 몰라도 괜찮습니다. 업무 폴더를 열면 필요한 카드만 모아 보여줍니다.</p>
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
