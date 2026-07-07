export type ToolCategory =
  | '문서'
  | '계산기'
  | '기준'
  | 'CAD 소스'
  | '공사일보'
  | '사진대지'
  | '공정관리'
  | '품질관리'
  | '최신소식'
  | '실무검토'

export type TrustLabel = '공식자료 우선' | '기준 확인' | '실무 기준' | '검토필요'

export interface ToolItem {
  id: string
  title: string
  category: ToolCategory
  answer: string
  description: string
  trustLabel: TrustLabel
  sourceLabel: string
  feature: string
  status: '준비됨' | '준비중'
  keywords: string[]
  link?: string
}

export const tools: ToolItem[] = [
  {
    id: 'tbm-log',
    title: 'TBM 일지 표준 양식',
    category: '문서',
    answer: '현장 TBM 기록은 참석자, 위험요인, 조치사항을 한 장으로 남기는 것이 기본입니다.',
    description: 'TBM 회의 기록에 필요한 참석자, 위험요인, 감소대책, 확인 결과를 작성하고 PC에 저장하는 도구입니다.',
    trustLabel: '실무 기준',
    sourceLabel: '현장 표준 양식',
    feature: 'TBM일지프로 앱으로 연결',
    status: '준비됨',
    keywords: ['tbm', '안전회의', '위험성평가', '일지', '안전'],
    link: 'https://nam2037772.github.io/tbm-log-pro/',
  },
  {
    id: 'risk-assessment',
    title: '위험성평가 문서',
    category: '문서',
    answer: '위험성평가는 유해위험요인, 위험성 결정, 감소대책, 실행 여부가 핵심입니다.',
    description: '산업안전보건 기준에 맞춰 위험성평가 문서 작성 흐름을 정리합니다.',
    trustLabel: '공식자료 우선',
    sourceLabel: '산업안전보건법 및 고용노동부 자료',
    feature: '작성 기준 카드',
    status: '준비중',
    keywords: ['위험성평가', '산업안전보건법', '안전', '유해위험요인'],
  },
  {
    id: 'daily-report',
    title: '공사일보 작성기',
    category: '공사일보',
    answer: '현장명, 날짜, 날씨, 작업내용을 입력해 공사일보를 만들고 PC에 저장하는 도구입니다.',
    description: '서버 저장 없이 브라우저에서 작성하고 결과물을 내려받는 방식으로 설계합니다.',
    trustLabel: '실무 기준',
    sourceLabel: '현장 표준 양식',
    feature: '공사일보프로 앱으로 연결',
    status: '준비됨',
    keywords: ['공사일보', '작업일보', '현장일지', '일일보고'],
    link: 'https://nam2037772.github.io/gongsailbo-pro/',
  },
  {
    id: 'photo-ledger',
    title: '사진대지 PDF 작성기',
    category: '사진대지',
    answer: '사진과 설명을 배치해 사진대지 PDF를 만들고 PC에 저장하는 도구입니다.',
    description: '업로드 파일을 서버에 보관하지 않는 로컬 처리 방식을 우선합니다.',
    trustLabel: '실무 기준',
    sourceLabel: '현장 표준 양식',
    feature: '사진대지프로 앱으로 연결',
    status: '준비됨',
    keywords: ['사진대지', '사진관리', '준공사진', '공사사진', 'pdf'],
    link: 'https://nam2037772.github.io/sajindaeji-pro/',
  },
  {
    id: 'process-schedule',
    title: '공정관리 도구',
    category: '공정관리',
    answer: '공정표와 진행률을 정리해 현장 공정관리를 돕는 도구입니다.',
    description: '전체 공정 계획과 실적을 비교해 관리하는 별도 앱으로 연결됩니다.',
    trustLabel: '실무 기준',
    sourceLabel: '현장 표준 양식',
    feature: '공정관리프로 앱으로 연결',
    status: '준비됨',
    keywords: ['공정관리', '공정표', '일정관리', '진행률'],
    link: 'https://nam2037772.github.io/gongjung-pro/',
  },
  {
    id: 'inspection-pro',
    title: '검측프로',
    category: '품질관리',
    answer: '검측요청서, 검측점검표, 결과통보서, 참여자 실명부와 사진대지를 브라우저에서 작성합니다.',
    description: '서버 저장 없이 localStorage 임시저장, JSON 저장/불러오기, 브라우저 PDF 출력으로 현장 검측 문서를 관리합니다.',
    trustLabel: '실무 기준',
    sourceLabel: '일반 건설 검측 실무 기준',
    feature: '검측프로 앱으로 연결',
    status: '준비됨',
    keywords: ['검측', '검측요청서', '검측점검표', '품질관리', '검측결과통보', '사진대지'],
    link: 'https://nam2037772.github.io/gumcheuk-pro/',
  },
  {
    id: 'construction-briefing',
    title: '건설실무브리핑',
    category: '최신소식',
    answer: '국토교통부, 협회, CSI 등 공식 출처의 건설 실무 소식을 빠르게 확인합니다.',
    description: '원문 전문을 저장하지 않고 제목, 날짜, 출처, 카테고리, 공식 링크만 모아 보여주는 독립 브리핑 앱입니다.',
    trustLabel: '공식자료 우선',
    sourceLabel: '국토교통부·대한건설협회·대한건축사협회·CSI',
    feature: '건설실무브리핑 앱으로 연결',
    status: '준비됨',
    keywords: ['건설실무브리핑', '최신소식', '공지', '정책', '안전', '건설기술', '법령', '고시'],
    link: 'https://nam2037772.github.io/gunseol-silmu-briefing/',
  },
  {
    id: 'remitar-calc',
    title: '레미탈 소요량 계산기',
    category: '계산기',
    answer: '면적과 두께를 기준으로 레미탈 예상 소요량을 빠르게 계산합니다.',
    description: '현장 발주 전 대략 물량을 점검하는 계산 카드입니다. 제조사 기준 확인이 필요합니다.',
    trustLabel: '검토필요',
    sourceLabel: '제조사 기준 및 현장 보정 필요',
    feature: '계산기프로 앱으로 연결',
    status: '준비됨',
    keywords: ['레미탈', '몰탈', '모르타르', '소요량', '자재량'],
    link: 'https://nam2037772.github.io/calculator-pro/',
  },
  {
    id: 'slope-calc',
    title: '경사도 계산기',
    category: '계산기',
    answer: '높이와 수평거리를 입력해 경사율과 각도를 계산합니다.',
    description: '구배, 경사율, 각도 환산을 현장에서 바로 확인하는 계산 카드입니다.',
    trustLabel: '실무 기준',
    sourceLabel: '수학식 기준',
    feature: '계산기프로 앱으로 연결',
    status: '준비됨',
    keywords: ['경사도', '구배', '기울기', '퍼센트', '각도'],
    link: 'https://nam2037772.github.io/calculator-pro/',
  },
  {
    id: 'vat-calc',
    title: '부가세 계산기',
    category: '계산기',
    answer: '공급가액과 부가세, 합계금액을 서로 환산합니다.',
    description: '견적서와 세금계산서 금액 확인에 쓰는 단순 계산 카드입니다.',
    trustLabel: '기준 확인',
    sourceLabel: '부가가치세 기본 계산식',
    feature: '계산기프로 앱으로 연결',
    status: '준비됨',
    keywords: ['부가세', '세금계산서', 'vat', '공급가액', '합계금액'],
    link: 'https://nam2037772.github.io/calculator-pro/',
  },
  {
    id: 'standard-market-price',
    title: '표준시장단가 기준 카드',
    category: '기준',
    answer: '공종별 표준시장단가는 최신 공고와 적용 시점을 확인해야 합니다.',
    description: '국토교통부 고시 기준을 우선해 관련 기준으로 이동하는 카드입니다.',
    trustLabel: '공식자료 우선',
    sourceLabel: '국토교통부 고시',
    feature: '기준 조회 예정',
    status: '준비중',
    keywords: ['표준시장단가', '단가', '공종', '고시', '국토교통부'],
  },
  {
    id: 'ks-standard',
    title: 'KS 기준 카드',
    category: '기준',
    answer: 'KS는 국가표준 원문과 최신 개정 여부를 우선 확인해야 합니다.',
    description: '관련 KS 기준을 찾기 위한 정리 카드입니다. 원문 확인 경로를 우선합니다.',
    trustLabel: '공식자료 우선',
    sourceLabel: '국가기술표준원 KS',
    feature: '기준 조회 예정',
    status: '준비중',
    keywords: ['ks', '한국산업표준', '국가기술표준원', '표준'],
  },
  {
    id: 'kcs-standard',
    title: 'KCS 표준시방서 카드',
    category: '기준',
    answer: 'KCS는 공종별 표준시방 기준과 최신 개정일을 함께 확인해야 합니다.',
    description: '건설공사 표준시방서 기준을 찾아가는 기준 카드입니다.',
    trustLabel: '공식자료 우선',
    sourceLabel: '국토교통부 KCS',
    feature: '기준 조회 예정',
    status: '준비중',
    keywords: ['kcs', '표준시방서', '건설기준', '시방서'],
  },
  {
    id: 'kds-standard',
    title: 'KDS 설계기준 카드',
    category: '기준',
    answer: 'KDS는 설계 조건과 적용 범위를 확인한 뒤 현장 조건에 맞게 검토해야 합니다.',
    description: '건설공사 설계기준을 공식 자료 중심으로 정리하는 카드입니다.',
    trustLabel: '공식자료 우선',
    sourceLabel: '국토교통부 KDS',
    feature: '기준 조회 예정',
    status: '준비중',
    keywords: ['kds', '설계기준', '건설기준', '설계'],
  },
  {
    id: 'cad-source',
    title: 'CAD 소스 정리',
    category: 'CAD 소스',
    answer: '자주 쓰는 CAD 블록과 상세도는 출처와 적용 조건을 확인해 사용해야 합니다.',
    description: '현장 실무자가 반복해서 찾는 CAD 자료를 정리할 예정입니다.',
    trustLabel: '검토필요',
    sourceLabel: '실무 자료 및 출처 확인 필요',
    feature: 'CAD 파일 제공 예정',
    status: '준비중',
    keywords: ['cad', '캐드', '상세도', '블록', '도면기호'],
  },
  {
    id: 'field-report-review',
    title: '실정보고 검토 체크카드',
    category: '실무검토',
    answer: '실정보고는 계약근거, 현장상황, 물량, 금액, 증빙을 함께 검토해야 합니다.',
    description: 'AI 기능을 전면에 세우지 않고, 검토 항목을 먼저 정리하는 실무 카드입니다.',
    trustLabel: '검토필요',
    sourceLabel: '계약문서 및 관련 기준 확인 필요',
    feature: '검토 체크리스트 예정',
    status: '준비중',
    keywords: ['실정보고', '검토', '변경', '증빙', '계약'],
  },
  {
    id: 'dispute-review',
    title: '분쟁검토 체크카드',
    category: '실무검토',
    answer: '분쟁 검토는 계약 조항, 공문 이력, 지시 근거, 손해 산정 자료를 먼저 정리해야 합니다.',
    description: '향후 AI 보조 검토로 확장하되, MVP에서는 검증 항목 카드로만 제공합니다.',
    trustLabel: '검토필요',
    sourceLabel: '계약문서 및 법률 검토 필요',
    feature: '검토 체크리스트 예정',
    status: '준비중',
    keywords: ['분쟁', '클레임', '공문', '계약', '검토'],
  },
]

export interface CategoryInfo {
  id: string
  title: string
  description: string
}

export const categories: CategoryInfo[] = [
  { id: 'category-docs', title: '문서', description: '착공, 안전, 준공, 보고 문서의 핵심 항목을 정리합니다.' },
  { id: 'category-calculators', title: '계산기', description: '부가세, 레미탈, 경사도처럼 현장에서 자주 쓰는 계산을 빠르게 처리합니다.' },
  { id: 'category-standards', title: '기준', description: '법령, KS, KCS, KDS, 표준시장단가 등 공식 기준을 우선 연결합니다.' },
  { id: 'category-cad', title: 'CAD 소스', description: '자주 쓰는 CAD 블록, 상세도, 기호 자료를 출처와 함께 정리합니다.' },
  { id: 'category-daily-report', title: '공사일보', description: '현장 정보를 입력해 문서를 만들고 결과물을 내 PC에 저장하는 도구로 확장합니다.' },
  { id: 'category-photo-log', title: '사진대지', description: '사진과 설명을 배치해 PDF로 저장하는 현장 문서 도구로 확장합니다.' },
  { id: 'category-process', title: '공정관리', description: '공정표와 진행률을 정리해 현장 공정을 관리하는 도구로 확장합니다.' },
  { id: 'category-quality', title: '품질관리', description: '검측 요청, 점검표, 결과통보와 사진 증빙을 내 PC 중심으로 작성합니다.' },
  { id: 'category-news', title: '최신소식', description: '공식 출처의 건설 정책, 안전, 기술, 법령 소식을 빠르게 확인합니다.' },
  { id: 'category-review', title: '실무검토', description: '실정보고와 분쟁검토는 검토 항목을 먼저 정리하고, AI는 보조 기능으로만 다룹니다.' },
  { id: 'updates', title: '최신 기준', description: '법령, 기준, 양식 변경사항을 공식자료 중심으로 정리합니다.' },
]








