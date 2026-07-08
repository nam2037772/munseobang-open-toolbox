export type PortalCategory = 
  | 'government'   // 정부기관
  | 'standards'    // 건설기준
  | 'safety'       // 안전
  | 'associations' // 협회
  | 'realestate'   // 부동산
  | 'weather'      // 기상
  | 'ai'           // AI
  | 'cadbim'       // CAD/BIM
  | 'manufacturers'// 제조사

export interface PortalSite {
  id: string;
  name: string;
  url: string;
  description: string;
  category: PortalCategory;
  isOfficial: boolean;
  icon: string; // Emoji
}

export interface PortalCategoryInfo {
  id: PortalCategory | 'all';
  name: string;
  label: string; // Filter button label
}

export const portalCategories: PortalCategoryInfo[] = [
  { id: 'all', name: '전체', label: '전체' },
  { id: 'government', name: '정부기관', label: '정부' },
  { id: 'standards', name: '건설기준', label: '기준' },
  { id: 'safety', name: '안전', label: '안전' },
  { id: 'associations', name: '협회', label: '협회' },
  { id: 'realestate', name: '부동산', label: '부동산' },
  { id: 'weather', name: '기상', label: '기상' },
  { id: 'ai', name: 'AI', label: 'AI' },
  { id: 'cadbim', name: 'CAD/BIM', label: 'CAD/BIM' },
  { id: 'manufacturers', name: '제조사', label: '제조사' },
]

export const portalSites: PortalSite[] = [
  // 1. 정부기관
  { id: 'molit', name: '국토교통부', url: 'https://www.molit.go.kr', description: '국토교통 정책, 고시, 공고 및 행정 정보 제공', category: 'government', isOfficial: true, icon: '🏛️' },
  { id: 'law', name: '국가법령정보센터', url: 'https://www.law.go.kr', description: '대한민국 모든 법령, 자치법규, 판례 검색 및 법제처 자료', category: 'government', isOfficial: true, icon: '⚖️' },
  { id: 'gov24', name: '정부24', url: 'https://www.gov.kr', description: '정부 서비스 신청, 조회 및 민원 서류 발급 통합 포털', category: 'government', isOfficial: true, icon: '🇰🇷' },
  { id: 'pps', name: '조달청', url: 'https://www.pps.go.kr', description: '공공조달 정책 및 공공 자재 비축, 조달 행정 제공', category: 'government', isOfficial: true, icon: '📦' },
  { id: 'g2b', name: '나라장터', url: 'https://www.g2b.go.kr', description: '조달청 국가종합전자조달 시스템, 입찰 및 계약 정보', category: 'government', isOfficial: true, icon: '🛒' },
  { id: 'kiscon', name: 'KISCON (건설산업지식정보시스템)', url: 'https://www.kiscon.net', description: '건설업체 실적 정보, 하도급 계약 대장 등 건설지식 확인', category: 'government', isOfficial: true, icon: '🏢' },
  { id: 'eais', name: '세움터 (건축행정시스템)', url: 'https://www.eais.go.kr', description: '건축허가, 착공, 준공 등 건축 관련 민원 온라인 접수창구', category: 'government', isOfficial: true, icon: '📐' },

  // 2. 건설기준
  { id: 'kcs', name: 'KCS (국가건설기준 표준시방서)', url: 'https://www.kcsc.re.kr', description: '공종별 건설 표준시방기준 원문 및 개정 이력 조회', category: 'standards', isOfficial: true, icon: '📕' },
  { id: 'kds', name: 'KDS (국가건설설계기준)', url: 'https://www.kcsc.re.kr', description: '구조, 토목, 설비 등 설계 시 준수해야 할 국가 설계 표준', category: 'standards', isOfficial: true, icon: '📘' },
  { id: 'ks', name: 'KS (한국산업표준)', url: 'https://standard.go.kr', description: '국가 규격 표준 정보, 제품 검사 기준 및 원문 조회', category: 'standards', isOfficial: true, icon: '📒' },
  { id: 'kict-품셈', name: '건설공사 표준품셈', url: 'https://www.kict.re.kr', description: '정부 공식 건설공사 표준 노무/자재 투입 단위 품셈 자료', category: 'standards', isOfficial: true, icon: '📋' },
  { id: 'market-price', name: '표준시장단가', url: 'https://www.kict.re.kr', description: '공공 공사 예정가격 산정에 활용되는 최신 표준시장 단가 고시', category: 'standards', isOfficial: true, icon: '🪙' },
  { id: 'codil', name: 'CODIL (건설기술정보시스템)', url: 'https://www.codil.or.kr', description: '건설공사 표준도면, 건설신기술, 시방 지침 DB 포털', category: 'standards', isOfficial: true, icon: '💾' },

  // 3. 안전
  { id: 'kosha', name: 'KOSHA (안전보건공단)', url: 'https://www.kosha.or.kr', description: '산업안전 기준, 현장 점검 가이드라인 및 재해 예방 자료 제공', category: 'safety', isOfficial: true, icon: '🦺' },
  { id: 'risk', name: '위험성평가 지원시스템 (KRAS)', url: 'https://kras.kosha.or.kr', description: '현장 유해위험요인 발굴 및 연간 위험성평가 온라인 수립 도구', category: 'safety', isOfficial: true, icon: '⚠️' },
  { id: 'csi', name: 'CSI (건설공사 안전관리 종합정보망)', url: 'https://www.csi.go.kr', description: '건설사고 보고, 안전관리계획서 제출 및 현장 점검 통계 확인', category: 'safety', isOfficial: true, icon: '🚨' },
  { id: 'safetygo', name: '안전신문고', url: 'https://www.safetyreport.go.kr', description: '행정안전부 생활 및 현장 위해 요인 주민 신고 창구', category: 'safety', isOfficial: true, icon: '🔔' },

  // 4. 협회
  { id: 'cak', name: '대한건설협회', url: 'http://www.cak.or.kr', description: '종합건설업 권익 옹호, 실적 신고 대행 및 품셈 정보 제공', category: 'associations', isOfficial: true, icon: '🤝' },
  { id: 'kosca', name: '대한전문건설협회', url: 'http://www.kosca.or.kr', description: '전문업종별 권익 대표, 하도급 분쟁 지원 및 실적 관리', category: 'associations', isOfficial: true, icon: '🧱' },
  { id: 'kira', name: '대한건축사협회', url: 'http://www.kira.or.kr', description: '건축사 면허 관리, 법령 제도 개선 및 공인 실무 교육 주관', category: 'associations', isOfficial: true, icon: '✏️' },
  { id: 'kocea', name: '한국건설기술인협회', url: 'https://www.kocea.or.kr', description: '건설기술인 경력 신고, 교육 이력 관리 및 경력증명서 발급', category: 'associations', isOfficial: true, icon: '🪪' },
  { id: 'kase', name: '한국시설안전협회', url: 'http://www.kase.or.kr', description: '시설물 정밀안전진단, 유지관리업체 정보 및 기술 정보 안내', category: 'associations', isOfficial: true, icon: '🛡️' },

  // 5. 부동산
  { id: 'eum', name: '토지이음', url: 'https://www.eum.go.kr', description: '토지이용계획확인원, 도시계획 정보 및 규제 지도 통합 열람', category: 'realestate', isOfficial: true, icon: '🗺️' },
  { id: 'vworld', name: '브이월드', url: 'https://www.vworld.kr', description: '국가 공간정보 오픈플랫폼, 3D 지도 및 수치지도 다운로드', category: 'realestate', isOfficial: true, icon: '🌐' },
  { id: 'rtms', name: '국토부 실거래가 공개시스템', url: 'https://rt.molit.go.kr', description: '아파트, 토지, 상업용 빌딩 최신 매매/전월세 실거래 가격 열람', category: 'realestate', isOfficial: true, icon: '📈' },
  { id: 'onnara', name: '온나라 부동산포털', url: 'http://www.onnara.go.kr', description: '국가 부동산 정보 통합 포털, 공시지가 및 매물 동향 열람', category: 'realestate', isOfficial: true, icon: '🏡' },

  // 6. 기상
  { id: 'kma', name: '기상청 날씨누리', url: 'https://www.weather.go.kr', description: '기상청 공식 일기예보 및 실시간 기상 특보 정보', category: 'weather', isOfficial: true, icon: '☀️' },
  { id: 'radar', name: '실시간 기상레이더 지도', url: 'https://www.weather.go.kr/w/image/radar.do', description: '비구름 이동 현황 및 강수 예측 실시간 레이더 화면', category: 'weather', isOfficial: true, icon: '📡' },
  { id: 'forecast', name: '동네예보 (단기예보)', url: 'https://www.weather.go.kr/w/theme/daily-table.do', description: '현장 동네 위치별 시간 단위 상세 기온, 바람, 강수 예측 정보', category: 'weather', isOfficial: true, icon: '⛅' },
  { id: 'typhoon', name: '태풍 정보 센터', url: 'https://www.weather.go.kr/w/typhoon/report.do', description: '태풍 발생 현황, 이동 경로 예측 및 비상 조치 기상 정보', category: 'weather', isOfficial: true, icon: '🌀' },

  // 7. AI
  { id: 'chatgpt', name: 'ChatGPT (OpenAI)', url: 'https://chat.openai.com', description: '시방서 질문 대조, 문서 요약, 영문 번역 등 범용 질문 AI 보조', category: 'ai', isOfficial: true, icon: '🤖' },
  { id: 'claude', name: 'Claude (Anthropic)', url: 'https://claude.ai', description: '장문 시방 파일 검토, 논리 분석 및 기획서 서식 초안 피드백 우수 AI', category: 'ai', isOfficial: true, icon: '🧠' },
  { id: 'gemini', name: 'Gemini (Google)', url: 'https://gemini.google.com', description: '구글 실시간 검색 기반의 최신 규정 및 뉴스 크로스체크 보조 AI', category: 'ai', isOfficial: true, icon: '✦' },
  { id: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai', description: '검색 엔진 기반 실시간 팩트체크 및 출처 매핑 인용 전문 AI', category: 'ai', isOfficial: true, icon: '🔍' },

  // 8. CAD/BIM
  { id: 'cadblocks', name: 'CAD Blocks Free', url: 'https://www.cadblocksfree.com', description: '건축, 토목 2D/3D CAD 블록 도면 라이브러리 무료 다운로드', category: 'cadbim', isOfficial: false, icon: '🧱' },
  { id: 'warehouse', name: 'SketchUp 3D Warehouse', url: 'https://3dwarehouse.sketchup.com', description: '스케치업 3D 모델링 컴포넌트 및 가구/설비 소스 검색 라이브러리', category: 'cadbim', isOfficial: true, icon: '🏠' },
  { id: 'bimlibrary', name: 'BIMobject Library', url: 'https://www.bimobject.com', description: '글로벌 제조사 정품 레빗(Revit), 아키캐드 등 BIM 객체 모델 소스 다운로드', category: 'cadbim', isOfficial: true, icon: '🧊' },

  // 9. 제조사
  { id: 'kcc', name: 'KCC (케이씨씨)', url: 'https://www.kccworld.co.kr', description: '창호, 페인트, 단열재, 석고보드 등 종합 건축자재 전문 브랜드', category: 'manufacturers', isOfficial: true, icon: '🏢' },
  { id: 'lx', name: 'LX하우시스', url: 'https://www.lxhausys.co.kr', description: '바닥재, 벽지, 창호, 인조대리석 등 프리미엄 인테리어 건축자재', category: 'manufacturers', isOfficial: true, icon: '🚪' },
  { id: 'hanyoung', name: '한영철강', url: 'http://www.hysteels.co.kr', description: '철근, H형강, 봉강, 후판 등 건설 구조용 강재 전문 제조사', category: 'manufacturers', isOfficial: true, icon: '⛓️' },
  { id: 'ssangyong', name: '쌍용C&E (쌍용시멘트)', url: 'http://www.ssangyongcne.co.kr', description: '국내 대표 포틀랜드 시멘트, 슬래그 시멘트 및 시멘트계 제품 제조', category: 'manufacturers', isOfficial: true, icon: '🪨' },
  { id: 'samhwa', name: '삼화페인트', url: 'https://www.samhwa.com', description: '친환경 실내외 건축용 도료 및 방수, 결로 방지 기능성 페인트 제조사', category: 'manufacturers', isOfficial: true, icon: '🎨' },
]
