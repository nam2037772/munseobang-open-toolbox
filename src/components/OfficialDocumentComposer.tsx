import { useMemo, useState } from 'react'

interface OfficialDocumentComposerProps {
  onComplete: () => void
}

interface AttachmentRow {
  id: number
  title: string
  count: string
  note: string
}

const defaultAttachments: AttachmentRow[] = [
  { id: 1, title: '관련 공문 또는 지시서', count: '1부', note: '발주처 지시, 회의록, 메일 등 근거 자료' },
  { id: 2, title: '검토서 또는 산출근거', count: '1부', note: '물량, 금액, 일정 검토 근거' },
  { id: 3, title: '현장사진 또는 위치도', count: '1부', note: '필요 시 사진대지, 도면 캡처 첨부' },
]

function OfficialDocumentComposer({ onComplete }: OfficialDocumentComposerProps) {
  const [sender, setSender] = useState('현장대리인')
  const [receiver, setReceiver] = useState('감독관')
  const [reference, setReference] = useState('')
  const [docNo, setDocNo] = useState('')
  const [subject, setSubject] = useState('공문 제목을 입력하세요')
  const [body, setBody] = useState('1. 귀 기관의 무궁한 발전을 기원합니다.\n2. 아래 사항에 대하여 검토 및 조치 요청드립니다.\n\n  가. 내용:\n  나. 사유:\n  다. 요청사항:\n')
  const [attachments, setAttachments] = useState<AttachmentRow[]>(defaultAttachments)
  const [copied, setCopied] = useState(false)

  const documentText = useMemo(() => {
    const attachmentText = attachments
      .filter((item) => item.title.trim())
      .map((item, index) => `  ${index + 1}. ${item.title}${item.count ? ` ${item.count}` : ''}${item.note ? ` - ${item.note}` : ''}`)
      .join('\n')

    return [
      `문서번호: ${docNo || '(자동/수기 입력)'}`,
      `수신: ${receiver}`,
      reference ? `참조: ${reference}` : '',
      `발신: ${sender}`,
      `제목: ${subject}`,
      '',
      body.trim(),
      '',
      '붙임',
      attachmentText || '  1. 첨부서류 없음',
      '',
      '끝.',
    ].filter(Boolean).join('\n')
  }, [attachments, body, docNo, receiver, reference, sender, subject])

  const updateAttachment = (id: number, key: keyof Omit<AttachmentRow, 'id'>, value: string) => {
    setAttachments((current) => current.map((item) => (item.id === id ? { ...item, [key]: value } : item)))
  }

  const addAttachment = () => {
    setAttachments((current) => [
      ...current,
      { id: Date.now(), title: '', count: '1부', note: '' },
    ])
  }

  const removeAttachment = (id: number) => {
    setAttachments((current) => current.filter((item) => item.id !== id))
  }

  const copyDocument = async () => {
    await navigator.clipboard.writeText(documentText)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const downloadDocument = () => {
    const blob = new Blob([documentText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${subject.replace(/[\\/:*?"<>|]/g, '_') || '공문'}_초안.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const printDocument = () => {
    window.print()
  }

  return (
    <div className="official-doc">
      <header className="official-doc__toolbar">
        <div>
          <p className="official-doc__eyebrow">공무 / 공문발송</p>
          <h2 className="official-doc__title">공문 기본틀</h2>
        </div>
        <div className="official-doc__actions">
          <button type="button" className="mds-btn" onClick={copyDocument}>{copied ? '복사됨' : '본문 복사'}</button>
          <button type="button" className="mds-btn" onClick={downloadDocument}>TXT 저장</button>
          <button type="button" className="mds-btn mds-btn--primary" onClick={printDocument}>PDF 저장/인쇄</button>
          <button type="button" className="mds-btn mds-btn--success" onClick={onComplete}>단계 완료</button>
        </div>
      </header>

      <div className="official-doc__grid">
        <section className="official-doc__panel" aria-label="공문 입력">
          <div className="official-doc__fields">
            <label className="official-doc__field">
              <span>문서번호</span>
              <input value={docNo} onChange={(event) => setDocNo(event.target.value)} placeholder="예: 문서방-공무-001" />
            </label>
            <label className="official-doc__field">
              <span>수신</span>
              <input value={receiver} onChange={(event) => setReceiver(event.target.value)} />
            </label>
            <label className="official-doc__field">
              <span>참조</span>
              <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="선택 입력" />
            </label>
            <label className="official-doc__field">
              <span>발신</span>
              <input value={sender} onChange={(event) => setSender(event.target.value)} />
            </label>
            <label className="official-doc__field official-doc__field--wide">
              <span>제목</span>
              <input value={subject} onChange={(event) => setSubject(event.target.value)} />
            </label>
            <label className="official-doc__field official-doc__field--wide">
              <span>본문</span>
              <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={10} />
            </label>
          </div>
        </section>

        <section className="official-doc__panel" aria-label="첨부서류 기본틀">
          <div className="official-doc__panel-header">
            <h3>첨부서류</h3>
            <button type="button" className="official-doc__icon-btn" onClick={addAttachment} title="첨부서류 추가" aria-label="첨부서류 추가">+</button>
          </div>
          <div className="official-doc__attachment-list">
            {attachments.map((item, index) => (
              <div className="official-doc__attachment" key={item.id}>
                <span className="official-doc__attachment-index">{index + 1}</span>
                <input value={item.title} onChange={(event) => updateAttachment(item.id, 'title', event.target.value)} placeholder="첨부서류명" />
                <input value={item.count} onChange={(event) => updateAttachment(item.id, 'count', event.target.value)} placeholder="수량" />
                <input value={item.note} onChange={(event) => updateAttachment(item.id, 'note', event.target.value)} placeholder="비고" />
                <button type="button" className="official-doc__icon-btn" onClick={() => removeAttachment(item.id)} title="삭제" aria-label={`${index + 1}번 첨부서류 삭제`}>x</button>
              </div>
            ))}
          </div>
        </section>

        <section className="official-doc__preview" aria-label="공문 미리보기">
          <h3>미리보기</h3>
          <pre>{documentText}</pre>
        </section>
      </div>
    </div>
  )
}

export default OfficialDocumentComposer