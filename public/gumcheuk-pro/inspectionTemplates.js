/**
 * 검측프로 - 공종/세부공종/검사항목 템플릿 데이터
 *
 * 이 파일만 수정/추가하면 새로운 공종·세부공종·검사항목을 확장할 수 있다.
 * (앱 로직인 app.js는 이 데이터 구조에만 의존한다)
 *
 * WORK_CATEGORIES: 대공종 목록 (선택박스용)
 * SUB_WORK_TEMPLATES: 세부공종별 기본 검사항목 세트
 *   - code: 공종 CODE No. 로 사용되는 식별자
 *   - category: 소속 대공종 (WORK_CATEGORIES 의 id)
 *   - items: [{ item(검사항목), standard(검사기준/시방) }]
 *
 * 주의: 아래 검사항목/기준은 일반적인 감리 검측(ITP) 실무 관행을 참고해
 * 작성한 기본값이며, 현장 시방서 및 사내 지침(90.현장참조자료 내 검측업무지침)과
 * 반드시 대조 후 사용해야 한다. (자동 법적 판단 아님)
 */

const WORK_CATEGORIES = [
  { id: "earth", name: "토공사" },
  { id: "rc", name: "철근콘크리트공사" },
  { id: "form", name: "거푸집공사" },
  { id: "rebar", name: "철근공사" },
  { id: "concrete", name: "콘크리트공사" },
  { id: "waterproof", name: "방수공사" },
  { id: "masonry", name: "조적공사" },
  { id: "plaster", name: "미장공사" },
  { id: "tile", name: "타일공사" },
  { id: "window", name: "창호공사" },
  { id: "paint", name: "도장공사" },
  { id: "steel", name: "철골공사" },
  { id: "metal", name: "금속공사" },
  { id: "stone", name: "석공사" },
  { id: "finish", name: "기타 마감공사" },
  { id: "mech", name: "기계설비공사" },
  { id: "elec", name: "전기설비공사" },
  { id: "etc", name: "기타" },
];

const SUB_WORK_TEMPLATES = [
  {
    code: "EA-01",
    name: "터파기",
    category: "earth",
    items: [
      { item: "터파기 심도 및 규격(폭·연장)", standard: "설계도면 치수 대비 ±허용오차 이내" },
      { item: "지반 지지력(지내력) 상태", standard: "지반조사 보고서 및 구조기준 충족 여부" },
      { item: "법면 기울기 및 붕괴·용수 여부", standard: "시방서 및 가시설 계획 기준" },
      { item: "배수로 확보 상태", standard: "우수 유입 방지 및 배수 계획 반영 여부" },
      { item: "터파기 저면 이물질/연약층 제거 여부", standard: "설계도서 기준 청소 상태" },
    ],
  },
  {
    code: "CO-01",
    name: "버림콘크리트",
    category: "concrete",
    items: [
      { item: "버림콘크리트 두께", standard: "설계도면 두께(통상 50~100mm) 이내" },
      { item: "레벨(고저) 및 수평 상태", standard: "설계 기준레벨 대비 허용오차 이내" },
      { item: "배합강도 및 자재 확인(계량증명서)", standard: "시방 배합기준(설계기준강도) 적합 여부" },
      { item: "양생 상태 및 양생 기간", standard: "시방서 양생 기준(최소 재령일) 준수" },
      { item: "타설 전 바닥 다짐 및 이물질 제거", standard: "설계도서 기준" },
    ],
  },
  {
    code: "RB-01",
    name: "기초철근배근",
    category: "rebar",
    items: [
      { item: "철근 규격(호칭경) 및 재질", standard: "설계도면 철근 규격(SD400 등) 일치 여부" },
      { item: "배근 간격 및 단수", standard: "구조도면 배근 간격 허용오차 이내" },
      { item: "피복두께 확보 상태(스페이서)", standard: "구조기준 피복두께(예: 기초 60~80mm) 이상" },
      { item: "이음길이 및 정착길이", standard: "구조설계기준 정착·이음길이 산정값 이상" },
      { item: "철근 결속 및 조립 상태(들뜸·오염)", standard: "시방서 기준, 부식·유해물질 부착 없을 것" },
      { item: "매입 배관/슬리브 위치 간섭 여부", standard: "설비도면과의 간섭 확인" },
    ],
  },
  {
    code: "RB-02",
    name: "벽체/기둥 철근배근",
    category: "rebar",
    items: [
      { item: "철근 규격(호칭경) 및 재질", standard: "설계도면 철근 규격 일치 여부" },
      { item: "수직·수평 배근 간격", standard: "구조도면 배근 간격 허용오차 이내" },
      { item: "피복두께 확보 상태(스페이서)", standard: "구조기준 피복두께 이상 확보" },
      { item: "수직도 및 결속 상태", standard: "수직 허용오차 이내, 결속 이완 없을 것" },
      { item: "이음/정착 길이 및 위치(엇갈림)", standard: "구조설계기준 이음길이 및 위치 분산 기준" },
      { item: "개구부 보강근 배치", standard: "구조도면 보강상세 반영 여부" },
    ],
  },
  {
    code: "FM-01",
    name: "Slab 배근 및 거푸집공사",
    category: "form",
    items: [
      { item: "거푸집 규격 및 설치 상태(변형·이격)", standard: "설계도면 치수, 시방 허용오차 이내" },
      { item: "동바리(서포트) 간격 및 수직도", standard: "구조검토서/시방 기준 간격 준수" },
      { item: "Slab 철근 배근 간격 및 상하부근 구분", standard: "구조도면 배근 상세 일치 여부" },
      { item: "상부근 고임대(체어) 설치 상태", standard: "설계 두께 확보용 고임대 적정 배치" },
      { item: "피복두께 확보 상태", standard: "구조기준 피복두께 이상" },
      { item: "매입 배관/전기박스 위치", standard: "설비·전기도면과의 간섭 확인" },
      { item: "거푸집 청소 및 박리제 도포 상태", standard: "시방서 기준" },
    ],
  },
  {
    code: "CC-01",
    name: "콘크리트 타설 전",
    category: "concrete",
    items: [
      { item: "철근/거푸집 최종 확인(승인 여부)", standard: "선행 검측(배근/거푸집) 합격 여부" },
      { item: "레미콘 배합표 및 납품서 확인", standard: "설계기준강도, 슬럼프, 골재 최대치수 적합" },
      { item: "타설 장비 및 인원 배치 계획", standard: "타설계획서 반영 여부" },
      { item: "이물질 제거 및 청소 상태", standard: "시방서 기준" },
      { item: "우수/한중/서중 대책 준비 여부", standard: "계절별 콘크리트 시공 지침 준수" },
    ],
  },
  {
    code: "CC-02",
    name: "콘크리트 타설 중",
    category: "concrete",
    items: [
      { item: "슬럼프 테스트 결과", standard: "시방 기준값(예: 120~150mm) 이내" },
      { item: "공시체 채취(강도시험용)", standard: "KS 기준 채취 수량 및 방법 준수" },
      { item: "타설 순서 및 이어치기 위치", standard: "타설계획서 반영 여부" },
      { item: "진동다짐(바이브레이터) 시공 상태", standard: "과다/과소 다짐 없이 시방 기준 시공" },
      { item: "타설 중 거푸집 변형·누출 여부", standard: "시공 중 지속 확인, 이상 없을 것" },
      { item: "레벨(타설 높이) 확인", standard: "설계 레벨 대비 허용오차 이내" },
    ],
  },
  {
    code: "CC-03",
    name: "콘크리트 타설 후",
    category: "concrete",
    items: [
      { item: "표면 마감 상태(평활도)", standard: "시방서 기준 평활도, 균열·공극 없을 것" },
      { item: "양생 방법 및 양생 기간", standard: "습윤양생/양생포 등 시방 기준 준수" },
      { item: "거푸집 존치기간", standard: "구조기준 존치기간(부재별) 준수" },
      { item: "균열/콜드조인트 발생 여부", standard: "육안 검사, 구조적 결함 없을 것" },
      { item: "양생 온도 관리(한중/서중)", standard: "계절별 콘크리트 시공 지침 준수" },
    ],
  },
  {
    code: "WP-01",
    name: "방수 바탕면 처리",
    category: "waterproof",
    items: [
      { item: "바탕면 평활도 및 청소 상태", standard: "시방서 기준, 요철·이물질 제거" },
      { item: "함수율(건조 상태) 확인", standard: "방수재 시공 가능 함수율 기준 이내" },
      { item: "균열 및 발생부위 보수 여부", standard: "방수 시공 전 균열 보수 완료" },
      { item: "코너/모서리 면접기(사모따기) 처리", standard: "방수 상세도 기준 처리" },
      { item: "돌출부(배관 등) 주변 처리 상태", standard: "방수 상세도 기준 추가 보강 여부" },
    ],
  },
  {
    code: "WP-02",
    name: "시멘트 액체방수",
    category: "waterproof",
    items: [
      { item: "재료(방수제) 반입 및 배합비 확인", standard: "제품 시방 및 승인 자재 사용 여부" },
      { item: "도포 횟수 및 두께", standard: "시방서 기준 횟수(통상 2~3회) 및 두께" },
      { item: "도포 간 양생시간 준수 여부", standard: "제품 시방 기준 양생시간" },
      { item: "누락 부위 및 핀홀 여부", standard: "육안 검사, 도포 누락 없을 것" },
      { item: "담수시험(누수 확인) 결과", standard: "시방서 기준 담수시험 시간 및 누수 없음" },
    ],
  },
  {
    code: "MS-01",
    name: "조적쌓기",
    category: "masonry",
    items: [
      { item: "블록/벽돌 규격 및 승인 자재 확인", standard: "승인도서 및 자재승인서와 일치" },
      { item: "먹매김, 벽체 위치 및 두께", standard: "설계도면 치수 및 위치 허용오차 이내" },
      { item: "수직도, 수평줄눈 및 통줄눈 방지", standard: "시방서 허용오차 이내, 줄눈 균일" },
      { item: "모르타르 배합 및 충전 상태", standard: "시방 배합 기준, 빈틈 없이 충전" },
      { item: "개구부 및 인방/보강철물 설치", standard: "상세도 및 구조 보강 기준 준수" },
    ],
  },
  {
    code: "PL-01",
    name: "내부 미장",
    category: "plaster",
    items: [
      { item: "바탕면 청소 및 접착 상태", standard: "이물질 제거, 들뜸·박리 우려 없음" },
      { item: "미장 두께 및 배합", standard: "시방서 지정 두께 및 배합 기준 준수" },
      { item: "평활도 및 수직·수평 상태", standard: "마감 허용오차 이내" },
      { item: "균열 방지 보강 처리", standard: "이질재 접합부 메쉬 등 상세 기준 반영" },
      { item: "양생 및 보양 상태", standard: "급건조·동해 방지, 보양 기준 준수" },
    ],
  },
  {
    code: "TL-01",
    name: "벽/바닥 타일 붙임",
    category: "tile",
    items: [
      { item: "타일 규격, 색상 및 승인 자재", standard: "자재승인서 및 마감표와 일치" },
      { item: "바탕면 평활도 및 방수층 손상 여부", standard: "시방서 기준, 방수층 훼손 없음" },
      { item: "붙임 모르타르/접착제 도포 상태", standard: "제품 시방 기준, 들뜸 방지 충분 도포" },
      { item: "줄눈 폭, 구배 및 배수 방향", standard: "상세도 및 설계 구배 준수" },
      { item: "두드림 검사 및 오염/파손 여부", standard: "들뜸·균열·오염 없음" },
    ],
  },
  {
    code: "AW-01",
    name: "AL창호 설치",
    category: "window",
    items: [
      { item: "창호 규격, 형식 및 승인 자재", standard: "창호도, 제작승인도 및 자재승인서와 일치" },
      { item: "개구부 치수 및 설치 위치", standard: "설계도면 허용오차 이내" },
      { item: "수직·수평 및 고정철물 설치", standard: "시방서 기준, 견고하게 고정" },
      { item: "실링, 방수테이프 및 단열 충전", standard: "누수·결로 방지 상세 기준 준수" },
      { item: "개폐 작동 및 유리/부속 상태", standard: "작동 원활, 손상·누락 없음" },
    ],
  },
  {
    code: "PT-01",
    name: "내부 도장",
    category: "paint",
    items: [
      { item: "바탕면 함수율, 평활도 및 오염 제거", standard: "제품 시방 기준 이내, 이물질 없음" },
      { item: "퍼티 및 샌딩 처리", standard: "면 고름 상태 양호, 자국 과다 없음" },
      { item: "프라이머 및 도장 횟수", standard: "시방서/제품 기준 도장 체계 준수" },
      { item: "색상, 광택 및 도막 균일성", standard: "마감표와 일치, 얼룩·흘러내림 없음" },
      { item: "보양 및 주변 오염 관리", standard: "오염·손상 없이 보양 상태 양호" },
    ],
  },
  {
    code: "ST-01",
    name: "철골 설치",
    category: "steel",
    items: [
      { item: "부재 규격 및 제작검사 성적서", standard: "구조도면 및 승인 제작도와 일치" },
      { item: "앵커볼트 위치, 레벨 및 조임 상태", standard: "설계 허용오차 이내, 너트 체결 확인" },
      { item: "부재 수직도, 수평도 및 변형 여부", standard: "철골공사 표준시방 허용오차 이내" },
      { item: "볼트 체결/용접 상태", standard: "토크, 체결 수량, 용접 외관 기준 충족" },
      { item: "방청도장 및 손상부 보수", standard: "도장 사양 준수, 손상부 터치업 완료" },
    ],
  },
  {
    code: "MT-01",
    name: "금속공사 설치",
    category: "metal",
    items: [
      { item: "자재 규격, 마감 및 승인 여부", standard: "승인도서 및 샘플과 일치" },
      { item: "설치 위치, 간격 및 레벨", standard: "상세도 치수 및 허용오차 이내" },
      { item: "고정철물 및 앵커 체결 상태", standard: "견고하게 고정, 흔들림 없음" },
      { item: "접합부 마감 및 실링 상태", standard: "틈새·날카로운 모서리 없이 마감" },
      { item: "표면 손상, 오염 및 보양 상태", standard: "찍힘·변색·오염 없음" },
    ],
  },
  {
    code: "SN-01",
    name: "석재 붙임/깔기",
    category: "stone",
    items: [
      { item: "석재 규격, 색상 및 결함 여부", standard: "승인 샘플과 일치, 균열·파손 없음" },
      { item: "바탕면 상태 및 고정 방식", standard: "상세도 및 시방 기준 준수" },
      { item: "줄눈 폭, 수평·수직 및 평활도", standard: "마감 허용오차 이내" },
      { item: "앵커/철물 및 접착재 시공 상태", standard: "지정 자재 사용, 견고하게 고정" },
      { item: "오염 방지, 보양 및 실링", standard: "오염·백화 방지, 실링 누락 없음" },
    ],
  },
  {
    code: "FN-01",
    name: "기타 마감공사 공통",
    category: "finish",
    items: [
      { item: "마감 자재 승인 및 반입 상태", standard: "마감표, 승인도서, 샘플과 일치" },
      { item: "선행 공정 완료 및 바탕 상태", standard: "선행 검측 완료, 들뜸·오염·습기 없음" },
      { item: "설치 위치, 치수 및 마감선", standard: "도면 및 상세도 허용오차 이내" },
      { item: "접합부, 코너 및 이질재 접합 처리", standard: "균열·틈새·단차 없이 마감" },
      { item: "완료 후 보양 및 하자 여부", standard: "오염·파손 없이 보양 상태 양호" },
    ],
  },];

/** code 로 세부공종 템플릿 조회 */
function getSubWorkTemplate(code) {
  return SUB_WORK_TEMPLATES.find((t) => t.code === code) || null;
}

/** 대공종(category) 별 세부공종 목록 */
function getSubWorkByCategory(categoryId) {
  return SUB_WORK_TEMPLATES.filter((t) => t.category === categoryId);
}

/** 결과 통보서 등에서 쓰는 검사결과 옵션 */
const RESULT_OPTIONS = ["적합", "부적합", "해당없음"];

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    WORK_CATEGORIES,
    SUB_WORK_TEMPLATES,
    RESULT_OPTIONS,
    getSubWorkTemplate,
    getSubWorkByCategory,
  };
}

