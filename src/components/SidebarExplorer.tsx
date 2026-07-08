import { explorerFolders } from '../data/apps'
import { useWorkspace } from '../context/WorkspaceContext'
import type { ConstructionTask } from '../context/WorkspaceContext'

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
                  <FolderIcon isOpen={isExpanded} />
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
      <div className="mds-sidebar__footer"><div className="mds-status-indicator"><span className="mds-status-indicator__dot"></span><span className="mds-status-indicator__label">로컬 보안 모드 사용 가능</span></div></div>
    </aside>
  )
}

export default SidebarExplorer
