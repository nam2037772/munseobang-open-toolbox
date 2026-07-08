import { useEffect, useRef, useState } from 'react'
import { explorerFolders } from '../data/apps'
import { useWorkspace } from '../context/WorkspaceContext'
import type { ConstructionTask } from '../context/WorkspaceContext'

interface SearchResultItem { folderName: string; task: ConstructionTask }

function CommandBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { selectTask } = useWorkspace()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
        setQuery('')
        setSelectedIndex(0)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) window.setTimeout(() => inputRef.current?.focus(), 50)
  }, [isOpen])

  const searchResults: SearchResultItem[] = []
  const lowerQuery = query.trim().toLowerCase()
  explorerFolders.forEach((folder) => {
    folder.tasks.forEach((task) => {
      const matches = !lowerQuery || task.name.toLowerCase().includes(lowerQuery) || task.workflow.some((node) => node.name.toLowerCase().includes(lowerQuery))
      if (matches) searchResults.push({ folderName: folder.name, task })
    })
  })

  const runSelected = () => {
    const selected = searchResults[selectedIndex]
    if (!selected) return
    selectTask(selected.folderName, selected.task)
    setIsOpen(false)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchResults.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % searchResults.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      runSelected()
    }
  }

  if (!isOpen) return null

  return (
    <div className="mds-command-overlay" onClick={() => setIsOpen(false)}>
      <div className="mds-command-box" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="업무 검색">
        <div className="mds-command-box__input-wrapper">
          <span className="mds-command-box__search-icon" aria-hidden="true">⌕</span>
          <input ref={inputRef} type="text" className="mds-command-box__input" placeholder="무엇을 하시겠습니까? 예: 타설, 사진, 검측" value={query} onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }} onKeyDown={handleInputKeyDown} />
        </div>
        <div className="mds-command-box__results" role="listbox">
          {searchResults.length > 0 ? searchResults.map((item, index) => {
            const isSelected = index === selectedIndex
            return (
              <button type="button" key={`${item.task.id}-${index}`} className={`mds-command-box__item ${isSelected ? 'is-selected' : ''}`} onMouseEnter={() => setSelectedIndex(index)} onClick={runSelected} role="option" aria-selected={isSelected}>
                <div className="mds-command-box__item-meta"><span className="mds-command-box__item-folder">□ {item.folderName}</span><span className="mds-command-box__item-task">▣ {item.task.name}</span></div>
                <div className="mds-command-box__item-workflow">{item.task.workflow.map((node) => node.name).join(' → ')}</div>
              </button>
            )
          }) : <div className="mds-command-box__empty">매칭되는 업무나 도구가 없습니다. 검색어를 다시 확인해 주세요.</div>}
        </div>
        <div className="mds-command-box__footer"><span>↑↓ 이동</span><span>Enter 실행</span><span>ESC 닫기</span></div>
      </div>
    </div>
  )
}

export default CommandBar
