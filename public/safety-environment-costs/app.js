const money = new Intl.NumberFormat('ko-KR')

const pages = {
  industrial: {
    title: '산업안전보건관리비',
    ledger: '산업안전보건관리비 항목별 사용 내역',
    desc: '엑셀의 산안사용/산안항목 시트를 기준으로 항목, 사용일자, 품명, 수량, 단가, 거래처를 입력합니다.',
    budget: 32533285,
    columns: [
      { key: 'category', label: '항목', type: 'select', options: ['안전관리자 등 인건비 및 각종 업무수당 등', '안전시설비 등', '개인보호구 및 안전장구 구입비 등', '안전진단비 등', '안전보건교육비 및 행사비 등', '근로자 건강진단비 등', '건설재해예방 기술지도비', '본사사용비'] },
      { key: 'date', label: '사용날짜', type: 'text' },
      { key: 'item', label: '사용내역/품명', type: 'text' },
      { key: 'quantity', label: '수량', type: 'number' },
      { key: 'unitPrice', label: '단가', type: 'number' },
      { key: 'vendor', label: '비고/거래처', type: 'text' },
    ],
    references: ['PE 드럼', '천막', '마대', '안전모', '안전화', '구급함', '안전기원제 행사비'],
    rows: [
      { category: '안전시설비 등', date: '6월 23일', item: 'PE 드럼', quantity: 20, unitPrice: 20364, vendor: '㈜아인산업안전' },
      { category: '개인보호구 및 안전장구 구입비 등', date: '6월 16일', item: '안전모', quantity: 50, unitPrice: 5000, vendor: '㈜아인산업안전' },
    ],
  },
  safety: {
    title: '안전관리비',
    ledger: '건설기술진흥법 안전관리비 사용 내역',
    desc: '계약 세부항목별 공급가액, 거래처, 사용내용과 증빙번호를 관리합니다.',
    budget: 2731720,
    columns: [
      { key: 'date', label: '사용일자', type: 'date' },
      { key: 'category', label: '계약 세부항목', type: 'select', options: ['안전관리계획 작성비', '정기안전점검비', '가설구조물 구조안전확인비'] },
      { key: 'item', label: '세부 사용내용', type: 'text' },
      { key: 'vendor', label: '거래처/지급대상', type: 'text' },
      { key: 'amount', label: '공급가액', type: 'number' },
      { key: 'evidence', label: '증빙번호', type: 'text' },
    ],
    references: ['세금계산서', '계약서', '점검보고서', '완료사진', '안전관리계획서'],
    rows: [
      { date: '2026-05-11', category: '안전관리계획 작성비', item: '안전관리계획서', vendor: '㈜도하안전기술원', amount: 2000000, evidence: '' },
      { date: '2026-05-13', category: '가설구조물 구조안전확인비', item: '안전관리계획서 검토', vendor: '㈜대산구조엔지니어링', amount: 1050000, evidence: '' },
    ],
  },
  environment: {
    title: '환경보전비',
    ledger: '환경보전비 항목별 사용 내역',
    desc: '환경사용/환경항목 시트의 비산먼지, 소음·진동, 폐기물 처리시설, 수질오염, 기타 보전비 분류를 따릅니다.',
    budget: 6410315,
    columns: [
      { key: 'category', label: '항목', type: 'select', options: ['비산먼지 방지시설 등', '소음, 진동 방지시설 등', '폐기물 처리시설 등', '수질오염 방지시설 등', '기타 보전비'] },
      { key: 'date', label: '사용일자', type: 'date' },
      { key: 'item', label: '품명/사용내역', type: 'select', options: ['세륜시설', '살수시설', '살수차량', '방진덮개(망)', '방진벽', '집진시설', '방음벽', '소각시설', '폐기물보관시설', '오폐수처리시설', '이동식간이화장실', '교육/홍보'] },
      { key: 'unit', label: '단위', type: 'text' },
      { key: 'quantity', label: '수량', type: 'number' },
      { key: 'unitPrice', label: '단가', type: 'number' },
      { key: 'vendor', label: '거래처/비고', type: 'text' },
    ],
    references: ['살수차량/물탱크 임대료', '분진막 설치비', '이동식 간이화장실', '집진시설', '가설방음벽', '세륜시설', '고압분무기'],
    rows: [
      { category: '비산먼지 방지시설 등', date: '', item: '세륜시설', unit: '', quantity: 1, unitPrice: 0, vendor: '' },
      { category: '수질오염 방지시설 등', date: '', item: '이동식간이화장실', unit: '', quantity: 1, unitPrice: 0, vendor: '' },
    ],
  },
  waste: {
    title: '폐기물반출현황',
    ledger: '폐기물 반출 현황',
    desc: '일자별 폐기물 반출 실적을 종류, 처리운반업, 수량, 단위 기준으로 기록합니다.',
    hasAmount: false,
    numbered: true,
    columns: [
      { key: 'date', label: '처리일', type: 'date' },
      { key: 'category', label: '폐기물종류', type: 'select', options: ['폐목재', '폐콘크리트', '혼합건설폐기물', '폐아스콘', '석고보드류', '건설폐재류'] },
      { key: 'vendor', label: '처리운반업', type: 'text' },
      { key: 'quantity', label: '실적수량', type: 'number' },
      { key: 'unit', label: '단위', type: 'select', options: ['TON', '㎥'] },
    ],
    references: ['건설폐재류', '혼합폐기물', '폐콘크리트', '폐목재류', '폐아스콘', '운반비', '계량증명서'],
    rows: [
      { date: '2026-06-01', category: '폐목재', vendor: '제주산업㈜', quantity: 0.83, unit: 'TON' },
      { date: '2026-06-05', category: '폐콘크리트', vendor: '제주산업㈜', quantity: 125.2, unit: 'TON' },
    ],
  },
}

const params = new URLSearchParams(location.search)
const pageKey = pages[params.get('page')] ? params.get('page') : 'industrial'
const page = pages[pageKey]
const storageKey = `munseobang:safety-costs:${pageKey}`
const saved = JSON.parse(localStorage.getItem(storageKey) || 'null')
let rows = saved?.rows || page.rows

const title = document.querySelector('#page-title')
const ledgerTitle = document.querySelector('#ledger-title')
const ledgerDesc = document.querySelector('#ledger-desc')
const totalAmount = document.querySelector('#total-amount')
const head = document.querySelector('#ledger-head')
const body = document.querySelector('#ledger-body')
const siteName = document.querySelector('#site-name')
const reportMonth = document.querySelector('#report-month')
const reportDate = document.querySelector('#report-date')
const budget = document.querySelector('#budget')
const referenceList = document.querySelector('#reference-list')

title.textContent = page.title
ledgerTitle.textContent = page.ledger
ledgerDesc.textContent = page.desc
siteName.value = saved?.siteName || params.get('siteName') || '한국정보통신공사협회 제주특별자치도 회관 신축공사'
reportMonth.value = saved?.reportMonth || '2026-06'
reportDate.value = saved?.reportDate || params.get('date') || '2026-06-30'
budget.value = saved?.budget || page.budget || 0
if (page.hasAmount === false) budget.closest('label').style.display = 'none'
referenceList.innerHTML = page.references.map((item) => `<span class="reference-chip">${item}</span>`).join('')

function amountFor(row) {
  if (row.amount) return Number(row.amount) || 0
  return (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0)
}

function save() {
  localStorage.setItem(storageKey, JSON.stringify({
    siteName: siteName.value,
    reportMonth: reportMonth.value,
    reportDate: reportDate.value,
    budget: budget.value,
    rows,
  }))
}

function updateTotals() {
  if (page.hasAmount === false) {
    totalAmount.textContent = `총 ${rows.length}건`
    return
  }
  const total = rows.reduce((sum, row) => sum + amountFor(row), 0)
  totalAmount.textContent = `합계 ${money.format(total)}원`
}

function render() {
  const numberHeader = page.numbered ? '<th>NO</th>' : ''
  const amountHeader = page.hasAmount === false ? '' : '<th>금액</th>'
  head.innerHTML = `<tr>${numberHeader}${page.columns.map((col) => `<th>${col.label}</th>`).join('')}${amountHeader}<th></th></tr>`
  body.innerHTML = rows.map((row, rowIndex) => {
    const numberCell = page.numbered ? `<td class="row-no">${rowIndex + 1}</td>` : ''
    const cells = page.columns.map((col) => {
      const value = row[col.key] ?? ''
      if (col.type === 'select') {
        return `<td><select data-row="${rowIndex}" data-key="${col.key}">${col.options.map((option) => `<option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>`).join('')}</select></td>`
      }
      return `<td><input data-row="${rowIndex}" data-key="${col.key}" type="${col.type}" value="${value}" ${col.type === 'number' ? 'min="0" step="0.01"' : ''}></td>`
    }).join('')
    const amountCell = page.hasAmount === false ? '' : `<td class="row-total">${money.format(amountFor(row))}원</td>`
    return `<tr>${numberCell}${cells}${amountCell}<td><button type="button" class="delete-row" data-delete="${rowIndex}" aria-label="행 삭제">×</button></td></tr>`
  }).join('')
  updateTotals()
  save()
}

function emptyRow() {
  const row = {}
  page.columns.forEach((col) => {
    row[col.key] = col.type === 'number' ? 0 : (col.options?.[0] || '')
  })
  return row
}

document.querySelector('#add-row').addEventListener('click', () => {
  rows = [...rows, emptyRow()]
  render()
})

document.querySelector('#export-json').addEventListener('click', () => {
  const payload = { title: page.title, siteName: siteName.value, reportMonth: reportMonth.value, reportDate: reportDate.value, budget: budget.value, rows }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${page.title}_${reportMonth.value || '입력내역'}.json`
  link.click()
  URL.revokeObjectURL(link.href)
})

document.querySelector('#print-page').addEventListener('click', () => window.print())

function handleLedgerInput(event) {
  const target = event.target
  if (!target.dataset.row) return
  const rowIndex = Number(target.dataset.row)
  rows[rowIndex][target.dataset.key] = target.type === 'number' ? Number(target.value) : target.value
  const totalCell = target.closest('tr')?.querySelector('.row-total')
  if (totalCell) totalCell.textContent = `${money.format(amountFor(rows[rowIndex]))}원`
  updateTotals()
  save()
}

body.addEventListener('input', handleLedgerInput)
body.addEventListener('change', handleLedgerInput)

body.addEventListener('click', (event) => {
  const target = event.target
  if (!target.dataset.delete) return
  rows = rows.filter((_, index) => index !== Number(target.dataset.delete))
  render()
})

;[siteName, reportMonth, reportDate, budget].forEach((input) => input.addEventListener('input', save))

render()


