import { explorerFolders } from '../data/apps'
import { useWorkspace } from '../context/WorkspaceContext'
import type { ConstructionTask } from '../context/WorkspaceContext'
import ainSafetyThumb from '../assets/ainsafety_banner_thumb.png'

// Windows Explorer Yellow Folder Icon Component
function FolderIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg 
      className="mds-tree__icon-svg" 
      viewBox="0 0 24 24" 
      width="16" 
      height="16" 
      style={{ marginRight: '8px', flexShrink: 0 }}
    >
      <path 
        d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" 
        fill={isOpen ? "#fde047" : "#eab308"} 
        stroke="#ca8a04" 
        strokeWidth="1.5"
      />
      {isOpen && (
        <path 
          d="M3 10h18" 
          stroke="#ca8a04" 
          strokeWidth="1.5"
        />
      )}
    </svg>
  )
}

// Windows Explorer File Icon Component
function FileIcon() {
  return (
    <svg 
      className="mds-tree__icon-svg" 
      viewBox="0 0 24 24" 
      width="16" 
      height="16" 
      style={{ marginRight: '8px', flexShrink: 0 }}
    >
      <path 
        d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" 
        fill="#f1f5f9" 
        stroke="#475569" 
        strokeWidth="1.5"
      />
      <path 
        d="M14 2v4a2 2 0 0 0 2 2h4" 
        stroke="#475569" 
        strokeWidth="1.5"
      />
    </svg>
  )
}

// Newspaper Briefing Icon Component
function NewsIcon() {
  return (
    <svg 
      className="mds-tree__icon-svg" 
      viewBox="0 0 24 24" 
      width="16" 
      height="16" 
      style={{ marginRight: '8px', flexShrink: 0 }}
    >
      <rect 
        x="3" 
        y="4" 
        width="18" 
        height="16" 
        rx="2" 
        fill="#f8fafc" 
        stroke="#475569" 
        strokeWidth="1.5" 
      />
      <path d="M14 8h4M14 12h4M14 16h4" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="6" y="8" width="5" height="8" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
    </svg>
  )
}

interface SidebarBanner {
  id: string;
  label: string;
  title: string;
  content: string;
  buttonText: string;
  link: string;
  imageUrl?: string;
}

const bannerData: SidebarBanner[] = [
  {
    id: 'recommendation',
    label: '추천 도구',
    title: '실무 도구 제안',
    content: '건설 실무에 필요한 양식과 업무 도구를 수시로 개발하고 있습니다.',
    buttonText: '제안/문의',
    link: 'mailto:contact@munseobang.com'
  },
  {
    id: 'ainsafety',
    label: '협력사',
    title: '아인산업안전',
    content: '전국 온라인 안전용품전문점 · 건설자재 · 방수자재 납품',
    buttonText: '바로가기',
    link: 'https://ainsafety.com',
    imageUrl: ainSafetyThumb
  }
]

function SidebarExplorer() {
  const { selectedPath, expandedFolders, activeTask, toggleFolder, selectTask, resetWorkspace } = useWorkspace()

  return (
    <aside className="mds-sidebar" aria-label="건설 업무 탐색기">
      <button type="button" className="mds-sidebar__header" onClick={resetWorkspace}>
        {/* Header Logo standard Windows yellow folder */}
        <FolderIcon isOpen={false} />
        <h2 className="mds-sidebar__title">문서방 OS</h2>
      </button>
      <nav className="mds-sidebar__nav">
        <ul className="mds-tree">
          {explorerFolders.map((folder) => {
            const isExpanded = expandedFolders.includes(folder.id)
            const opensDirectly = folder.id === 'briefing'
            const directTask = folder.tasks[0]
            const isDirectActive = opensDirectly && activeTask?.id === directTask?.id
            return (
              <li key={folder.id} className="mds-tree__folder-group">
                <button
                  type="button"
                  className={`mds-tree__item mds-tree__item--folder ${selectedPath[0] === folder.name || isDirectActive ? 'is-selected' : ''}`}
                  onClick={() => (opensDirectly && directTask ? selectTask(folder.name, directTask) : toggleFolder(folder.id))}
                  aria-expanded={opensDirectly ? undefined : isExpanded}
                >
                  <span className={`mds-tree__arrow ${isExpanded ? 'is-expanded' : ''}`}>{opensDirectly ? '' : '▶'}</span>
                  {opensDirectly ? <NewsIcon /> : <FolderIcon isOpen={isExpanded} />}
                  <span className="mds-tree__name">{folder.name}</span>
                </button>
                {!opensDirectly && isExpanded && (
                  <ul className="mds-tree__sub">
                    {folder.tasks.map((task: ConstructionTask) => {
                      const isTaskActive = activeTask?.id === task.id
                      return (
                        <li key={task.id} className="mds-tree__task-item">
                          <button type="button" className={`mds-tree__item mds-tree__item--task ${isTaskActive ? 'is-selected' : ''}`} onClick={() => selectTask(folder.name, task)}>
                            <FileIcon />
                            <span className="mds-tree__name">{task.name}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* 광고/추천 배너 영역 */}
      <div className="mds-sidebar__banner-container" aria-label="공지 및 협력사 안내">
        {bannerData.map((banner) => (
          <div key={banner.id} className="mds-sidebar-banner">
            {banner.imageUrl && (
              <img 
                src={banner.imageUrl} 
                alt={`${banner.title} 이미지`}
                className="mds-sidebar-banner__image" 
              />
            )}
            <div className="mds-sidebar-banner__header">
              <span className="mds-sidebar-banner__label">{banner.label}</span>
              <h4 className="mds-sidebar-banner__title">{banner.title}</h4>
            </div>
            <p className="mds-sidebar-banner__content">{banner.content}</p>
            <a 
              href={banner.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mds-sidebar-banner__btn"
              title={`${banner.title} 바로가기`}
            >
              {banner.buttonText}
            </a>
          </div>
        ))}
      </div>

      <div className="mds-sidebar__footer"><div className="mds-status-indicator"><span className="mds-status-indicator__dot"></span><span className="mds-status-indicator__label">로컬 보안 모드 사용 가능</span></div></div>
    </aside>
  )
}

export default SidebarExplorer
