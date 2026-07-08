import { explorerFolders } from '../data/apps'
import { useWorkspace } from '../context/WorkspaceContext'
import type { ConstructionTask } from '../context/WorkspaceContext'

function SidebarExplorer() {
  const { selectedPath, expandedFolders, activeTask, toggleFolder, selectTask, resetWorkspace } = useWorkspace()

  return (
    <aside className="mds-sidebar" aria-label="건설 업무 탐색기">
      <button type="button" className="mds-sidebar__header" onClick={resetWorkspace}>
        <span className="mds-sidebar__logo" aria-hidden="true">□</span>
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
                  <span className="mds-tree__icon" aria-hidden="true">□</span>
                  <span className="mds-tree__name">{folder.name}</span>
                </button>
                {!opensDirectly && isExpanded && (
                  <ul className="mds-tree__sub">
                    {folder.tasks.map((task: ConstructionTask) => {
                      const isTaskActive = activeTask?.id === task.id
                      return (
                        <li key={task.id} className="mds-tree__task-item">
                          <button type="button" className={`mds-tree__item mds-tree__item--task ${isTaskActive ? 'is-selected' : ''}`} onClick={() => selectTask(folder.name, task)}>
                            <span className="mds-tree__icon" aria-hidden="true">▣</span>
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
