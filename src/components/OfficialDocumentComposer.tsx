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

const defaultBody = `당 현장 공사 진행 중 아래와 같은 사항이 확인되어 보고드립니다.

1. 관련근거
  가. 설계도서 및 현장 조사자료
  나. 관련 회의록 또는 지시사항

2. 실정보고 내용
  현장 여건 확인 결과 당초 설계와 상이한 사항이 확인되었습니다.

이에 따라 공정 지연 방지 및 안전 확보를 위하여 필요한 조치를 우선 시행하고자 하오니 검토하여 주시기 바랍니다.`

const defaultAttachments: AttachmentRow[] = [
  { id: 1, title: '관련 공문 또는 지시서', count: '1부', note: '발주처 지시, 회의록, 메일 등 근거 자료' },
  { id: 2, title: '검토서 또는 산출근거', count: '1부', note: '물량, 금액, 일정 검토 근거' },
  { id: 3, title: '현장사진 또는 위치도', count: '1부', note: '필요 시 사진대지, 도면 캡처 첨부' },
]

function formatDate(dateValue: string) {
  if (!dateValue) return ''
  const [year, month, day] = dateValue.split('-')
  return `${year}. ${month}. ${day}`
}

function OfficialDocumentComposer({ onComplete }: OfficialDocumentComposerProps) {
  const [companyName, setCompanyName] = useState('일성종합건설주식회사')
  const [companyInfo, setCompanyInfo] = useState('우) 63587 / 제주특별자치도 서귀포시 동홍중앙로66번길22 / 전화 (064)767-1700 / 팩스 (064)767-1710')
  const [docNo, setDocNo] = useState('일성 - 호')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10))
  const [sender, setSender] = useState('㈜종합건축사사무소그룹케이 감리원')
  const [receiver, setReceiver] = useState('한국정보통신공사협회')
  const [reference, setReference] = useState('제주특별자치도회')
  const [subject, setSubject] = useState('공문 제목을 입력하세요')
  const [body, setBody] = useState(defaultBody)
  const [attachments, setAttachments] = useState<AttachmentRow[]>(defaultAttachments)
  const [copied, setCopied] = useState(false)

  const attachmentText = useMemo(() => attachments
    .filter((item) => item.title.trim())
    .map((item, index) => `${index + 1}. ${item.title}${item.count ? ` ${item.count}` : ''}${item.note ? ` - ${item.note}` : ''}`)
    .join('\n'), [attachments])

  const documentText = useMemo(() => [
    companyName,
    companyInfo,
    '',
    `문서번호  ${docNo}`,
    `시행일자  ${formatDate(issueDate)}`,
    `수신  ${sender}`,
    `참조  ${receiver}${reference ? `\n      ${reference}` : ''}`,
    '',
    `제목: ${subject}`,
    '',
    body.trim(),
    '',
    '붙임',
    attachmentText || '첨부서류 없음',
    '',
    '끝.',
  ].filter(Boolean).join('\n'), [attachmentText, body, companyInfo, companyName, docNo, issueDate, receiver, reference, sender, subject])

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

  const printDocument = () => {
    window.print()
  }

  return (
    <div className="official-doc">
      <header className="official-doc__toolbar">
        <div>
          <p className="official-doc__eyebrow">공무 / 공문발송</p>
          <h2 className="official-doc__title">공문 발송 양식</h2>
        </div>
        <div className="official-doc__actions">
          <button type="button" className="mds-btn" onClick={copyDocument}>{copied ? '복사됨' : '본문 복사'}</button>
          <button type="button" className="mds-btn mds-btn--primary" onClick={printDocument}>PDF 저장/인쇄</button>
          <button type="button" className="mds-btn mds-btn--success" onClick={onComplete}>단계 완료</button>
        </div>
      </header>

      <div className="official-doc__grid official-doc__grid--form">
        <section className="official-doc__panel" aria-label="공문 입력">
          <div className="official-doc__fields">
            <label className="official-doc__field official-doc__field--wide">
              <span>회사명</span>
              <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
            </label>
            <label className="official-doc__field official-doc__field--wide">
              <span>주소/연락처</span>
              <input value={companyInfo} onChange={(event) => setCompanyInfo(event.target.value)} />
            </label>
            <label className="official-doc__field">
              <span>문서번호</span>
              <input value={docNo} onChange={(event) => setDocNo(event.target.value)} />
            </label>
            <label className="official-doc__field">
              <span>시행일자</span>
              <input type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} />
            </label>
            <label className="official-doc__field official-doc__field--wide">
              <span>수신</span>
              <input value={sender} onChange={(event) => setSender(event.target.value)} />
            </label>
            <label className="official-doc__field official-doc__field--wide">
              <span>참조 1</span>
              <input value={receiver} onChange={(event) => setReceiver(event.target.value)} />
            </label>
            <label className="official-doc__field official-doc__field--wide">
              <span>참조 2</span>
              <input value={reference} onChange={(event) => setReference(event.target.value)} />
            </label>
            <label className="official-doc__field official-doc__field--wide">
              <span>제목</span>
              <input value={subject} onChange={(event) => setSubject(event.target.value)} />
            </label>
            <label className="official-doc__field official-doc__field--wide">
              <span>본문</span>
              <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={14} />
            </label>
          </div>

          <div className="official-doc__panel-header official-doc__panel-header--attachments">
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
          <article className="official-doc__paper">
            <header className="official-doc-form__head">
              <h1>{companyName}</h1>
              <p>{companyInfo}</p>
              <div aria-hidden="true" />
            </header>

            <div className="official-doc-form__meta-row">
              <div className="official-doc-form__meta">
                <div><span>문서번호</span><strong>{docNo}</strong></div>
                <div><span>시행일자</span><strong>{formatDate(issueDate)}</strong></div>
                <div><span>수신</span><strong>{sender}</strong></div>
                <div><span>참조</span><strong>{receiver}<br />{reference}</strong></div>
              </div>
              <table className="official-doc-form__approval" aria-label="결재란">
                <tbody>
                  <tr>
                    <th rowSpan={4}>선<br />결<br /><br />접<br />수</th>
                    <th>일자</th>
                    <td />
                    <th rowSpan={4}>지<br />시<br /><br />결<br />재<br />·<br />공<br />람</th>
                    <td />
                    <td />
                  </tr>
                  <tr>
                    <th>시간</th>
                    <td />
                    <td />
                    <td />
                  </tr>
                  <tr>
                    <th>번호</th>
                    <td />
                    <td />
                    <td />
                  </tr>
                  <tr>
                    <th>처리과</th>
                    <td />
                    <td />
                    <td />
                  </tr>
                  <tr>
                    <th>담당자</th>
                    <td colSpan={2} />
                    <td />
                    <td />
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="official-doc-form__subject">
              <span>제&nbsp;&nbsp;목&nbsp;:</span>
              <strong>{subject}</strong>
            </div>

            <div className="official-doc-form__body">
              {body.split('\n').map((line, index) => (
                <p key={`${line}-${index}`} className={line.trim() ? undefined : 'is-blank'}>{line}</p>
              ))}
            </div>

            <div className="official-doc-form__attachments">
              <strong>붙임</strong>
              <ol>
                {attachments.filter((item) => item.title.trim()).map((item) => (
                  <li key={item.id}>{item.title}{item.count ? ` ${item.count}` : ''}{item.note ? ` - ${item.note}` : ''}</li>
                ))}
              </ol>
            </div>
          </article>
        </section>
      </div>
    </div>
  )
}

export default OfficialDocumentComposer