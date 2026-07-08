import { useWorkspace } from '../context/WorkspaceContext'

function WorkflowTimeline() {
  const { activeTask, activeStep, selectStep } = useWorkspace()

  if (!activeTask) return null

  return (
    <div className="mds-workflow" aria-label="업무 워크플로우 단계">
      <div className="mds-workflow__container">
        {activeTask.workflow.map((node, index) => {
          const isCompleted = node.status === 'completed'
          const isActive = index === activeStep
          let statusClass = 'is-pending'
          let statusIndicator = '○'

          if (isCompleted) {
            statusClass = 'is-completed'
            statusIndicator = '✓'
          } else if (isActive) {
            statusClass = 'is-active'
            statusIndicator = '●'
          }

          return (
            <div key={node.id} className="mds-workflow__node-wrapper">
              <button type="button" className={`mds-workflow__node ${statusClass} ${isActive ? 'is-focused' : ''}`} onClick={() => selectStep(index)} aria-current={isActive ? 'step' : undefined}>
                <span className="mds-workflow__indicator" aria-hidden="true">{statusIndicator}</span>
                <span className="mds-workflow__name">{node.name}</span>
              </button>
              {index < activeTask.workflow.length - 1 && (
                <div className={`mds-workflow__connector ${isCompleted ? 'is-completed' : ''}`} aria-hidden="true">
                  <svg className="mds-workflow__arrow-svg" viewBox="0 0 24 8">
                    <path d="M0,4 L20,4" className="mds-workflow__arrow-line" stroke={isCompleted ? 'var(--mds-color-success)' : 'var(--mds-color-border-subtle)'} strokeWidth="2" strokeDasharray={isCompleted ? 'none' : '4 2'} />
                    <polygon points="24,4 18,1 18,7" fill={isCompleted ? 'var(--mds-color-success)' : 'var(--mds-color-border-subtle)'} />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WorkflowTimeline
