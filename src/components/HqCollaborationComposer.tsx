import { useMemo, useState } from 'react'

type Priority = '일반' | '긴급' | '검토필요'

interface AttachmentRow {
  id: number
  title: string
  note: string
}

const requestTypes = [
  '실정보고 검토 요청',
  '설계변경 검토 요청',
  '계약/단가 검토 요청',
  '기술지원 요청',
  '안전/품질 협의',
  '자재/장비/인력 지원 요청',
]

const defaultAttachments: AttachmentRow[] = [
  { id: 1, title: '현장사진', note: '위치 및 상황 확인 자료' },
  { id: 2, title: '도면 또는 위치도', note: '검토 구간 표시' },
  { id: 3, title: '산출근거 또는 견적자료', note: '금액/물량 검토 시 첨부' },
]

function formatDate(dateValue: string) {
  if (!dateValue) return ''
  const [year, month, day] = dateValue.split('-')
  return `${year}. ${month}. ${day}`
}

function HqCollaborationComposer() {
  const today = new Date().toISOString().slice(0, 10)
  const [siteName, setSiteName] = useState('○○ 현장')
  const [requestType, setRequestType] = useState(requestTypes[0])
  const [priority, setPriority] = useState<Priority>('검토필요')
  const [recipient, setRecipient] = useState('본사 공무팀')
  const [requester, setRequester] = useState('현장대리인')
  const [requestDate, setRequestDate] = useState(today)
  const [replyDue, setReplyDue] = useState(today)
  const [subject, setSubject] = useState('[본사검토요청] ○○현장 실정보고 검토 요청')
  const [summary, setSummary] = useState('현장 여건 변동으로 인한 추가 검토사항이 발생하여 본사 검토 및 업무협조를 요청드립니다.')
  const [siteStatus, setSiteStatus] = useState('당초 설계와 현장 조건이 일부 상이하여 공정 지연 및 추가 비용 발생 가능성이 있습니다.')
  const [requestItems, setRequestItems] = useState('1. 실정보고 처리 방향 검토\n2. 발주처 제출 전 보완사항 확인\n3. 계약/단가 반영 가능 여부 검토')
  const [neededDecision, setNeededDecision] = useState('회신기한 내 본사 검토 의견 및 제출 가능 문안을 회신 요청드립니다.')
  const [attachments, setAttachments] = useState<AttachmentRow[]>(defaultAttachments)
  const [copied, setCopied] = useState(false)

  const attachmentText = useMemo(() => attachments
    .filter((item) => item.title.trim())
    .map((item, index) => `${index + 1}. ${item.title}${item.note ? ` - ${item.note}` : ''}`)
    .join('\n'), [attachments])

  const documentText = useMemo(() => [
    '본사 업무협조 요청서',
    `현장명: ${siteName}`,
    `요청유형: ${requestType}`,
    `중요도: ${priority}`,
    `수신: ${recipient}`,
    `요청자: ${requester}`,
    `요청일: ${formatDate(requestDate)}`,
    `회신기한: ${formatDate(replyDue)}`,
    '',
    `제목: ${subject}`,
    '',
    `[요청개요]\n${summary}`,
    '',
    `[현장상황]\n${siteStatus}`,
    '',
    `[본사 검토/협조 요청사항]\n${requestItems}`,
    '',
    `[필요 의사결정]\n${neededDecision}`,
    '',
    `[첨부자료]\n${attachmentText || '첨부자료 없음'}`,
  ].join('\n'), [attachmentText, neededDecision, priority, recipient, replyDue, requestDate, requestItems, requester, requestType, siteName, siteStatus, subject, summary])

  const updateAttachment = (id: number, key: keyof Omit<AttachmentRow, 'id'>, value: string) => {
    setAttachments((current) => current.map((item) => (item.id === id ? { ...item, [key]: value } : item)))
  }

  const addAttachment = () => {
    setAttachments((current) => [...current, { id: Date.now(), title: '', note: '' }])
  }

  const removeAttachment = (id: number) => {
    setAttachments((current) => current.filter((item) => item.id !== id))
  }

  const copyDocument = async () => {
    await navigator.clipboard.writeText(documentText)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="hq-collab">
      <header className="hq-collab__toolbar">
        <div>
          <p className="hq-collab__eyebrow">본사협업 / 업무협조 요청</p>
          <h2 className="hq-collab__title">본사 업무협조 요청서</h2>
        </div>
        <div className="hq-collab__actions">
          <button type="button" className="mds-btn" onClick={copyDocument}>{copied ? '복사됨' : '본문 복사'}</button>
          <button type="button" className="mds-btn mds-btn--primary" onClick={() => window.print()}>PDF 저장/인쇄</button>
        </div>
      </header>

      <div className="hq-collab__grid">
        <section className="hq-collab__panel" aria-label="본사 업무협조 입력">
          <div className="hq-collab__fields">
            <label className="hq-collab__field"><span>현장명</span><input value={siteName} onChange={(event) => setSiteName(event.target.value)} /></label>
            <label className="hq-collab__field"><span>요청유형</span><select value={requestType} onChange={(event) => setRequestType(event.target.value)}>{requestTypes.map((type) => <option value={type} key={type}>{type}</option>)}</select></label>
            <label className="hq-collab__field"><span>중요도</span><select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}><option>일반</option><option>긴급</option><option>검토필요</option></select></label>
            <label className="hq-collab__field"><span>수신부서</span><input value={recipient} onChange={(event) => setRecipient(event.target.value)} /></label>
            <label className="hq-collab__field"><span>요청자</span><input value={requester} onChange={(event) => setRequester(event.target.value)} /></label>
            <label className="hq-collab__field"><span>요청일</span><input type="date" value={requestDate} onChange={(event) => setRequestDate(event.target.value)} /></label>
            <label className="hq-collab__field"><span>회신기한</span><input type="date" value={replyDue} onChange={(event) => setReplyDue(event.target.value)} /></label>
            <label className="hq-collab__field hq-collab__field--wide"><span>제목</span><input value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
            <label className="hq-collab__field hq-collab__field--wide"><span>요청개요</span><textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} /></label>
            <label className="hq-collab__field hq-collab__field--wide"><span>현장상황</span><textarea value={siteStatus} onChange={(event) => setSiteStatus(event.target.value)} rows={4} /></label>
            <label className="hq-collab__field hq-collab__field--wide"><span>본사 검토/협조 요청사항</span><textarea value={requestItems} onChange={(event) => setRequestItems(event.target.value)} rows={5} /></label>
            <label className="hq-collab__field hq-collab__field--wide"><span>필요 의사결정</span><textarea value={neededDecision} onChange={(event) => setNeededDecision(event.target.value)} rows={3} /></label>
          </div>

          <div className="hq-collab__panel-header">
            <h3>첨부자료</h3>
            <button type="button" className="hq-collab__icon-btn" onClick={addAttachment} aria-label="첨부자료 추가">+</button>
          </div>
          <div className="hq-collab__attachment-list">
            {attachments.map((item, index) => (
              <div className="hq-collab__attachment" key={item.id}>
                <span>{index + 1}</span>
                <input value={item.title} onChange={(event) => updateAttachment(item.id, 'title', event.target.value)} placeholder="첨부자료명" />
                <input value={item.note} onChange={(event) => updateAttachment(item.id, 'note', event.target.value)} placeholder="비고" />
                <button type="button" className="hq-collab__icon-btn" onClick={() => removeAttachment(item.id)} aria-label={`${index + 1}번 첨부자료 삭제`}>x</button>
              </div>
            ))}
          </div>
        </section>

        <section className="hq-collab__preview" aria-label="본사 업무협조 요청서 미리보기">
          <article className="hq-collab__paper">
            <header className="hq-form__head">
              <p>본사협업</p>
              <h1>업무협조 요청서</h1>
              <span>{priority}</span>
            </header>

            <table className="hq-form__summary">
              <tbody>
                <tr><th>현장명</th><td>{siteName}</td><th>요청유형</th><td>{requestType}</td></tr>
                <tr><th>수신</th><td>{recipient}</td><th>요청자</th><td>{requester}</td></tr>
                <tr><th>요청일</th><td>{formatDate(requestDate)}</td><th>회신기한</th><td>{formatDate(replyDue)}</td></tr>
              </tbody>
            </table>

            <div className="hq-form__subject"><span>제목</span><strong>{subject}</strong></div>

            <section className="hq-form__section"><h3>1. 요청개요</h3><p>{summary}</p></section>
            <section className="hq-form__section"><h3>2. 현장상황</h3><p>{siteStatus}</p></section>
            <section className="hq-form__section"><h3>3. 본사 검토/협조 요청사항</h3>{requestItems.split('\n').map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</section>
            <section className="hq-form__section"><h3>4. 필요 의사결정</h3><p>{neededDecision}</p></section>
            <section className="hq-form__section hq-form__attachments"><h3>5. 첨부자료</h3><ol>{attachments.filter((item) => item.title.trim()).map((item) => <li key={item.id}>{item.title}{item.note ? ` - ${item.note}` : ''}</li>)}</ol></section>
          </article>
        </section>
      </div>
    </div>
  )
}

export default HqCollaborationComposer