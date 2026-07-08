import { useMemo, useState } from 'react'

type DraftPriority = '일반' | '긴급' | '대표승인'

interface AttachmentRow {
  id: number
  title: string
  note: string
}

const draftTypes = [
  '실정보고 기안',
  '설계변경 기안',
  '계약/단가 기안',
  '자재/장비 발주 기안',
  '안전/품질 조치 기안',
  '비용 집행 기안',
]

const defaultAttachments: AttachmentRow[] = [
  { id: 1, title: '기안 근거자료', note: '관련 공문, 회의록, 지시사항' },
  { id: 2, title: '산출근거', note: '물량, 단가, 금액 산출자료' },
  { id: 3, title: '현장사진/도면', note: '위치와 현황 확인자료' },
]

function formatDate(dateValue: string) {
  if (!dateValue) return ''
  const [year, month, day] = dateValue.split('-')
  return `${year}. ${month}. ${day}`
}

function HqDraftComposer() {
  const today = new Date().toISOString().slice(0, 10)
  const [siteName, setSiteName] = useState('○○ 현장')
  const [draftType, setDraftType] = useState(draftTypes[0])
  const [priority, setPriority] = useState<DraftPriority>('대표승인')
  const [department, setDepartment] = useState('현장 공무')
  const [drafter, setDrafter] = useState('현장대리인')
  const [draftDate, setDraftDate] = useState(today)
  const [decisionDue, setDecisionDue] = useState(today)
  const [subject, setSubject] = useState('[본사기안] ○○현장 실정보고 승인 요청')
  const [purpose, setPurpose] = useState('현장 여건 변동으로 발생한 추가 공종 및 비용 반영을 위하여 본사 승인 기안을 상신합니다.')
  const [background, setBackground] = useState('당초 설계와 현장 조건이 일부 상이하여 공정 지연 및 비용 발생 가능성이 확인되었습니다.')
  const [proposal, setProposal] = useState('1. 실정보고 제출 방향 승인\n2. 추가 공종 및 비용 반영 검토\n3. 발주처 협의 및 제출 문안 확정')
  const [budgetImpact, setBudgetImpact] = useState('예상 비용 및 계약금액 변동 가능성이 있어 산출근거 검토 후 반영 여부 결정이 필요합니다.')
  const [approvalRequest, setApprovalRequest] = useState('상기 내용에 대하여 본사 검토 후 승인 또는 보완 의견을 회신하여 주시기 바랍니다.')
  const [attachments, setAttachments] = useState<AttachmentRow[]>(defaultAttachments)
  const [copied, setCopied] = useState(false)

  const attachmentText = useMemo(() => attachments
    .filter((item) => item.title.trim())
    .map((item, index) => `${index + 1}. ${item.title}${item.note ? ` - ${item.note}` : ''}`)
    .join('\n'), [attachments])

  const documentText = useMemo(() => [
    '본사기안서',
    `현장명: ${siteName}`,
    `기안유형: ${draftType}`,
    `결재구분: ${priority}`,
    `기안부서: ${department}`,
    `기안자: ${drafter}`,
    `기안일: ${formatDate(draftDate)}`,
    `결정요청일: ${formatDate(decisionDue)}`,
    '',
    `제목: ${subject}`,
    '',
    `[기안목적]\n${purpose}`,
    '',
    `[추진배경]\n${background}`,
    '',
    `[기안내용]\n${proposal}`,
    '',
    `[예산/계약 영향]\n${budgetImpact}`,
    '',
    `[승인요청사항]\n${approvalRequest}`,
    '',
    `[첨부자료]\n${attachmentText || '첨부자료 없음'}`,
  ].join('\n'), [approvalRequest, attachmentText, background, budgetImpact, decisionDue, department, draftDate, draftType, drafter, priority, proposal, purpose, siteName, subject])

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
          <p className="hq-collab__eyebrow">본사협업 / 본사기안</p>
          <h2 className="hq-collab__title">본사기안서</h2>
        </div>
        <div className="hq-collab__actions">
          <button type="button" className="mds-btn" onClick={copyDocument}>{copied ? '복사됨' : '본문 복사'}</button>
          <button type="button" className="mds-btn mds-btn--primary" onClick={() => window.print()}>PDF 저장/인쇄</button>
        </div>
      </header>

      <div className="hq-collab__grid">
        <section className="hq-collab__panel" aria-label="본사기안 입력">
          <div className="hq-collab__fields">
            <label className="hq-collab__field"><span>현장명</span><input value={siteName} onChange={(event) => setSiteName(event.target.value)} /></label>
            <label className="hq-collab__field"><span>기안유형</span><select value={draftType} onChange={(event) => setDraftType(event.target.value)}>{draftTypes.map((type) => <option value={type} key={type}>{type}</option>)}</select></label>
            <label className="hq-collab__field"><span>결재구분</span><select value={priority} onChange={(event) => setPriority(event.target.value as DraftPriority)}><option>일반</option><option>긴급</option><option>대표승인</option></select></label>
            <label className="hq-collab__field"><span>기안부서</span><input value={department} onChange={(event) => setDepartment(event.target.value)} /></label>
            <label className="hq-collab__field"><span>기안자</span><input value={drafter} onChange={(event) => setDrafter(event.target.value)} /></label>
            <label className="hq-collab__field"><span>기안일</span><input type="date" value={draftDate} onChange={(event) => setDraftDate(event.target.value)} /></label>
            <label className="hq-collab__field"><span>결정요청일</span><input type="date" value={decisionDue} onChange={(event) => setDecisionDue(event.target.value)} /></label>
            <label className="hq-collab__field hq-collab__field--wide"><span>제목</span><input value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
            <label className="hq-collab__field hq-collab__field--wide"><span>기안목적</span><textarea value={purpose} onChange={(event) => setPurpose(event.target.value)} rows={3} /></label>
            <label className="hq-collab__field hq-collab__field--wide"><span>추진배경</span><textarea value={background} onChange={(event) => setBackground(event.target.value)} rows={4} /></label>
            <label className="hq-collab__field hq-collab__field--wide"><span>기안내용</span><textarea value={proposal} onChange={(event) => setProposal(event.target.value)} rows={5} /></label>
            <label className="hq-collab__field hq-collab__field--wide"><span>예산/계약 영향</span><textarea value={budgetImpact} onChange={(event) => setBudgetImpact(event.target.value)} rows={3} /></label>
            <label className="hq-collab__field hq-collab__field--wide"><span>승인요청사항</span><textarea value={approvalRequest} onChange={(event) => setApprovalRequest(event.target.value)} rows={3} /></label>
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

        <section className="hq-collab__preview" aria-label="본사기안서 미리보기">
          <article className="hq-collab__paper">
            <header className="hq-form__head">
              <p>본사협업</p>
              <h1>본사기안서</h1>
              <span>{priority}</span>
            </header>

            <table className="hq-form__summary">
              <tbody>
                <tr><th>현장명</th><td>{siteName}</td><th>기안유형</th><td>{draftType}</td></tr>
                <tr><th>기안부서</th><td>{department}</td><th>기안자</th><td>{drafter}</td></tr>
                <tr><th>기안일</th><td>{formatDate(draftDate)}</td><th>결정요청일</th><td>{formatDate(decisionDue)}</td></tr>
              </tbody>
            </table>

            <div className="hq-form__subject"><span>제목</span><strong>{subject}</strong></div>

            <section className="hq-form__section"><h3>1. 기안목적</h3><p>{purpose}</p></section>
            <section className="hq-form__section"><h3>2. 추진배경</h3><p>{background}</p></section>
            <section className="hq-form__section"><h3>3. 기안내용</h3>{proposal.split('\n').map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</section>
            <section className="hq-form__section"><h3>4. 예산/계약 영향</h3><p>{budgetImpact}</p></section>
            <section className="hq-form__section"><h3>5. 승인요청사항</h3><p>{approvalRequest}</p></section>
            <section className="hq-form__section hq-form__attachments"><h3>6. 첨부자료</h3><ol>{attachments.filter((item) => item.title.trim()).map((item) => <li key={item.id}>{item.title}{item.note ? ` - ${item.note}` : ''}</li>)}</ol></section>
          </article>
        </section>
      </div>
    </div>
  )
}

export default HqDraftComposer