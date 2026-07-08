import { useState } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'
import OfficialDocumentComposer from './OfficialDocumentComposer'
import HqCollaborationComposer from './HqCollaborationComposer'
import HqDraftComposer from './HqDraftComposer'
import NavigatorPanel from './navigator/NavigatorPanel'

function WorkspaceCanvas() {
  const { activeTask, activeStep, sharedData, completeStep } = useWorkspace()
  const [localSite, setLocalSite] = useState(sharedData.siteName || '')
  const [localWeather, setLocalWeather] = useState(sharedData.weather || '맑음')

  if (!activeTask) return null

  const currentNode = activeTask.workflow[activeStep]

  if (currentNode.id === 'official-document') {
    return <OfficialDocumentComposer />
  }

  if (currentNode.id === 'hq-collaboration-request') {
    return <HqCollaborationComposer />
  }

  if (currentNode.id === 'hq-draft') {
    return <HqDraftComposer />
  }

  if (currentNode.url === 'local://navigator') {
    return <NavigatorPanel />
  }

  if (!currentNode.url) {
    return (
      <div className="mds-canvas-empty">
        <span className="mds-canvas-empty__icon" aria-hidden="true">□</span>
        <h3 className="mds-canvas-empty__title">'{currentNode.name}' 도구는 준비중입니다.</h3>
        <p className="mds-canvas-empty__desc">현재 단계는 공식 배포 전입니다. 필요한 경우 이 단계를 완료 처리하고 다음 단계로 이동할 수 있습니다.</p>
        <button type="button" className="mds-btn mds-btn--primary" onClick={() => completeStep(activeStep)}>이 단계 완료하고 건너뛰기</button>
      </div>
    )
  }

  const queryParams = new URLSearchParams()
  queryParams.set('siteName', localSite || sharedData.siteName || '')
  queryParams.set('weather', localWeather || sharedData.weather || '맑음')
  queryParams.set('date', sharedData.date || new Date().toISOString().split('T')[0])
  const iframeSrc = `${currentNode.url}?${queryParams.toString()}`


  return (
    <div className="mds-canvas-workspace">
      <div className="mds-meta-bar">
        <div className="mds-meta-bar__fields">
          <div className="mds-meta-bar__field">
            <label className="mds-meta-bar__label" htmlFor="site-name">현장명</label>
            <input id="site-name" type="text" className="mds-meta-bar__input" value={localSite} placeholder="예: 제주 현장" onChange={(e) => setLocalSite(e.target.value)} />
          </div>
          <div className="mds-meta-bar__field">
            <label className="mds-meta-bar__label" htmlFor="weather">날씨</label>
            <select id="weather" className="mds-meta-bar__select" value={localWeather} onChange={(e) => setLocalWeather(e.target.value)}>
              <option value="맑음">맑음</option>
              <option value="흐림">흐림</option>
              <option value="비">비</option>
              <option value="눈">눈</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mds-iframe-wrapper">
        <iframe key={`${currentNode.id}-${activeStep}`} src={iframeSrc} className="mds-iframe-canvas" title={currentNode.name} sandbox="allow-scripts allow-same-origin allow-downloads allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox" />
      </div>
    </div>
  )
}

export default WorkspaceCanvas

