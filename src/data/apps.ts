export type FolderId = '공사' | '공무' | '품질' | '안전' | '환경' | '감리' | '기준/법령' | '계산기' | 'CAD 자료실' | '건설실무브리핑'
export type AppStatus = '사용 가능' | '준비중'
export type AppBadge = '공식자료 우선' | '기준 확인' | '실무 기준' | '검토 필요'

export interface AppItem { id: string; title: string; description: string; category: FolderId; tags: string[]; status: AppStatus; badge: AppBadge; url?: string }
export interface FolderInfo { id: FolderId; icon: string; title: string; description: string }

import type { ExplorerFolder } from '../context/WorkspaceContext'

export const folders: FolderInfo[] = [
  { id: '공사', icon: '□', title: '공사', description: '공사일보, 사진대지, 공정관리처럼 현장에서 매일 쓰는 도구입니다.' },
  { id: '공무', icon: '□', title: '공무', description: '공문, 실정보고, 설계변경, 기성, 계약 업무를 정리합니다.' },
  { id: '품질', icon: '□', title: '품질', description: '검측, 자재검수, ITP, 하자보수 등 품질 업무 기준입니다.' },
  { id: '안전', icon: '□', title: '안전', description: 'TBM, 위험성평가, 보호구, 안전교육 기록을 관리합니다.' },
  { id: '환경', icon: '□', title: '환경', description: '폐기물, 비산먼지, 환경점검, 관련 법규를 정리합니다.' },
  { id: '감리', icon: '□', title: '감리', description: '감리 체크리스트, 입회, 준공검사, 설계도서 검토 도구입니다.' },
  { id: '기준/법령', icon: '□', title: '기준/법령', description: 'KS, KCS, KDS, 표준시장단가와 건설 관련 법령을 확인합니다.' },
  { id: '계산기', icon: '□', title: '계산기', description: '레미탈, 경사도, 부가세, 물량 산출 계산기 모음입니다.' },
  { id: 'CAD 자료실', icon: '□', title: 'CAD 자료실', description: 'CAD 블록, 표준도, 상세도, 도면 기호 자료입니다.' },
  { id: '건설실무브리핑', icon: '□', title: '건설실무브리핑', description: '공식 출처 중심의 건설 실무 최신 소식을 모읍니다.' },
]

export const DEFAULT_FAVORITE_IDS: string[] = ['photo-ledger', 'daily-report', 'inspection-pro', 'process-schedule', 'tbm-log']

export const apps: AppItem[] = [
  { id: 'daily-report', title: '공사일보 작성기', description: '현장명, 날짜, 날씨, 작업 내용을 입력해 공사일보를 작성하고 PC에 저장합니다.', category: '공사', tags: ['공사일보', '작업일보', '현장일지', '일일보고'], status: '사용 가능', badge: '실무 기준', url: 'https://nam2037772.github.io/gongsailbo-pro/' },
  { id: 'photo-ledger', title: '사진대지 PDF 작성기', description: '사진과 설명을 배치해 사진대지 PDF를 만들고 PC에 저장합니다.', category: '공사', tags: ['사진', '사진대지', '준공사진', '공사사진', 'pdf'], status: '사용 가능', badge: '실무 기준', url: 'https://nam2037772.github.io/sajindaeji-pro/' },
  { id: 'process-schedule', title: '공정관리 도구', description: '공정표와 진행률을 정리해 현장 공정 흐름을 확인합니다.', category: '공사', tags: ['공정관리', '공정표', '일정관리', '진행률'], status: '사용 가능', badge: '실무 기준', url: 'https://nam2037772.github.io/gongjung-pro/' },
  { id: 'inspection-pro', title: '검측프로', description: '검측요청서, 검측점검표, 결과통보서와 사진대지를 브라우저에서 작성합니다.', category: '품질', tags: ['검측', '검측요청서', '검측점검표', '품질관리'], status: '사용 가능', badge: '실무 기준', url: './gumcheuk-pro/' },
  { id: 'tbm-log', title: 'TBM 일지 작성', description: 'TBM 참석자, 위험요인, 조치사항을 기록하는 양식입니다.', category: '안전', tags: ['tbm', '안전회의', '위험성평가', '안전'], status: '준비중', badge: '실무 기준' },
  { id: 'risk-assessment', title: '위험성평가 문서', description: '유해위험요인, 위험도 결정, 감소대책 이행 여부를 확인합니다.', category: '안전', tags: ['위험성평가', '산업안전보건법', '안전'], status: '준비중', badge: '공식자료 우선' },
  { id: 'official-document', title: '공문 작성', description: '발신, 수신, 제목, 본문 형식에 맞춰 공문 초안을 작성합니다.', category: '공무', tags: ['공문', '문서작성', '공무'], status: '준비중', badge: '실무 기준' },
  { id: 'design-change', title: '설계변경 검토', description: '설계변경 사유, 근거, 물량과 금액 변동을 정리합니다.', category: '공무', tags: ['설계변경', '변경계약', '물량변경'], status: '준비중', badge: '검토 필요' },
  { id: 'material-inspection', title: '자재검수 체크카드', description: '반입 자재의 규격, 수량, 시험성적서 확인 항목을 정리합니다.', category: '품질', tags: ['자재검수', '반입검수', '시험성적서'], status: '준비중', badge: '검토 필요' },
  { id: 'waste-management', title: '폐기물 관리', description: '건설폐기물 배출, 처리, 인계서류 기준을 정리합니다.', category: '환경', tags: ['폐기물', '건설폐기물', '환경'], status: '준비중', badge: '공식자료 우선' },
  { id: 'ks-standard', title: 'KS 기준 카드', description: 'KS와 관련 고시의 최신 개정 여부를 확인합니다.', category: '기준/법령', tags: ['ks', '표준', '기준'], status: '준비중', badge: '공식자료 우선' },
  { id: 'remitar-calc', title: '레미탈 소요량 계산기', description: '면적과 두께를 기준으로 레미탈 예상 소요량을 계산합니다.', category: '계산기', tags: ['레미탈', '몰탈', '소요량', '계산기'], status: '사용 가능', badge: '검토 필요', url: 'https://nam2037772.github.io/calculator-pro/' },
  { id: 'cad-source', title: 'CAD 소스 정리', description: 'CAD 블록과 상세도 자료의 출처와 적용 조건을 확인합니다.', category: 'CAD 자료실', tags: ['cad', '블록', '상세도'], status: '준비중', badge: '검토 필요' },
  { id: 'construction-briefing', title: '건설실무브리핑', description: '국토교통부, 협회, CSI 등 공식 출처의 공지와 안전 정보를 모아 보여줍니다.', category: '건설실무브리핑', tags: ['최신소식', '뉴스', '공지', '안전'], status: '사용 가능', badge: '공식자료 우선', url: 'https://nam2037772.github.io/gunseol-silmu-briefing/' },
]

export const explorerFolders: ExplorerFolder[] = [
  { id: 'gongsa', name: '공사 관리', tasks: [
    { id: 'photo-ledger-task', name: '사진대지', workflow: [{ id: 'photo-ledger', name: '사진대지 PDF 작성', status: 'active', url: 'https://nam2037772.github.io/sajindaeji-pro/' }] },
    { id: 'daily-report-task', name: '공사일보', workflow: [{ id: 'daily-report', name: '공사일보 작성', status: 'active', url: 'https://nam2037772.github.io/gongsailbo-pro/' }] },
    { id: 'schedule-task', name: '공정관리', workflow: [{ id: 'process-schedule', name: '공정표 작성', status: 'active', url: 'https://nam2037772.github.io/gongjung-pro/' }] },
  ] },
  { id: 'quality', name: '품질/검측', tasks: [
    { id: 'inspection-task', name: '검측요청', workflow: [{ id: 'inspection-pro', name: '검측서 작성', status: 'active', url: './gumcheuk-pro/' }] },
    { id: 'material-inspection-task', name: '자재검수', workflow: [{ id: 'material-witness', name: '자재 반입 검수', status: 'active', url: './gumcheuk-pro/' }, { id: 'photo-ledger', name: '반입 사진대지', status: 'pending', url: 'https://nam2037772.github.io/sajindaeji-pro/' }] },
    { id: 'source-approval-task', name: '공급원승인', workflow: [{ id: 'source-approval', name: '공급원 승인 서류 작성', status: 'active' }] },
  ] },
  { id: 'safety', name: '안전/환경', tasks: [
    { id: 'safety-tbm', name: 'TBM', workflow: [{ id: 'tbm-log', name: 'TBM 일지 작성', status: 'active' }, { id: 'safety-training', name: '안전교육 기록', status: 'pending' }] },
    { id: 'risk-assessment-task', name: '위험성평가', workflow: [{ id: 'risk-assessment', name: '위험성평가 문서 작성', status: 'active' }] },
    { id: 'waste-management-task', name: '폐기물관리', workflow: [{ id: 'waste-manifest', name: '건설폐기물 배출 기록', status: 'active' }] },
  ] },
  { id: 'gongmu', name: '공무/행정', tasks: [
    { id: 'official-docs', name: '공문 및 기성 서류', workflow: [{ id: 'official-document', name: '공문 초안 작성', status: 'active' }, { id: 'design-change', name: '설계변경 검토', status: 'pending' }] },
    { id: 'monthly-settlement', name: '월정산보고', workflow: [{ id: 'monthly-settlement-doc', name: '월간 기성/정산 서류 작성', status: 'active' }] },
  ] },
  { id: 'common', name: '공통 업무', tasks: [
    { id: 'calculator-task', name: '계산기', workflow: [{ id: 'remitar-calc', name: '레미탈 계산기', status: 'active', url: 'https://nam2037772.github.io/calculator-pro/' }, { id: 'slope-calc', name: '구배 계산기', status: 'pending', url: 'https://nam2037772.github.io/calculator-pro/' }, { id: 'vat-calc', name: '부가세 계산기', status: 'pending', url: 'https://nam2037772.github.io/calculator-pro/' }] },
  ] },
]
