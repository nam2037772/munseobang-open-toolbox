# 문서방 프로젝트 로그

## 문서 우선 원칙

새로운 작업자는 먼저 `MANIFESTO.md`를 읽고, 다음으로 이 `PROJECT_LOG.md`를 읽은 뒤 코드를 분석한다. 코드는 철학을 구현하는 수단이며, 프로젝트 문서는 프로젝트의 기억이다.

## 2026-07-05

### 오늘 구현한 기능

- 문서방 MVP 첫 화면을 정상 한글 UI로 복구했다.
- 검색을 `src/data/tools.ts`의 프론트엔드 정적 데이터 필터링으로 정리했다.
- 검색 결과 카드를 제목, 분류, 한 줄 답, 설명, 신뢰 라벨, 제공 기능, 근거, 열기 버튼 구조로 정리했다.
- 모바일에서 카드가 한 열로 안정적으로 보이도록 CSS를 정리했다.
- GitHub Pages 하위 경로 배포를 고려해 Vite `base: './'` 설정과 favicon 상대 경로를 반영했다.
- 프로젝트 문서 4종을 생성 또는 최신화했다.

### 오늘 결정한 정책

- MVP는 정적 웹으로 유지한다.
- 로그인, 회원가입, DB, 게시판, 커뮤니티 기능은 넣지 않는다.
- 사용자 문서와 업로드 파일은 서버에 저장하지 않는다.
- 결과물은 사용자의 PC에 저장하는 방향을 기본 정책으로 삼는다.
- 검색은 AI 검색이 아니라 검증된 답안 카드 검색이다.
- 공식자료, 법령, KS, KCS, KDS, 표준시장단가를 우선 근거로 삼는다.
- AI는 검색의 주체가 아니며, 향후 실정보고/분쟁검토의 보조 기능으로만 검토한다.
- 앞으로 작업자는 코드보다 `MANIFESTO.md`와 `PROJECT_LOG.md`를 먼저 읽는다.

### 수정한 내용

- 깨진 한글 인코딩과 JSX/TypeScript 문법 오류 가능성을 복구했다.
- `src/data/tools.ts`의 검색 데이터를 답안 카드 구조에 맞게 재작성했다.
- `Header`, `Hero`, `SearchHub`, `CategoryGrid`, `Principles`, `Workflow`, `Updates`, `Footer` 컴포넌트 문구를 프로젝트 철학에 맞게 정리했다.
- `src/App.css`에서 검색 카드, 신뢰 라벨, 메타 정보, 모바일 반응형을 개선했다.
- `README.md`, `MANIFESTO.md`, `PROJECT_LOG.md`, `ROADMAP.md`, `CHANGELOG.md`를 한국어 기준 문서로 정리했다.

### 발견한 문제

- 기존 코드와 문서의 한글이 깨져 있었고 일부 파일은 JSX/TypeScript 문법 자체가 깨질 수 있었다.
- 검색 결과가 검증된 답안 카드라기보다 관련 항목 목록처럼 흐를 위험이 있었다.
- GitHub Pages 하위 경로 배포 시 절대 경로 리소스가 깨질 수 있었다.
- PowerShell에서 `npm install`은 `npm.ps1` 실행 정책에 막혔고, `npm.cmd install`로 검증해야 했다.
- Google Drive 경로에서 `npm install` 실행 시 tar write/EBADF 경고가 발생했지만 종료 코드는 0이었다.

### 검증 결과

- `npm.cmd install`: 성공, 취약점 0개
- `npm.cmd run build`: 성공, TypeScript 빌드 및 Vite 빌드 통과
- `npm run dev`: Vite dev 서버 기동 확인

## 2026-07-08

### 오늘 구현한 기능 (디자인 시스템 수립)
- 문서방 공식 디자인 시스템 **MDS (Munseobang Design System)**을 최종 수립하고 명세화했다.
- 점진적 노출(Progressive Disclosure) 및 4단계 탐색(Explorer -> Task -> Workflow -> Workspace) 아키텍처를 정의하고 3가지 비주얼 UI 목업을 제작했다.
- MDS 표준을 명시한 `01_DESIGN_SYSTEM.md`부터 `06_HANDOVER_NOTES.md`까지 총 6종의 표준 기획 문서를 생성했다.
- 다음 단계 개발 에이전트(혹은 코더)를 위한 구현 착수 매핑 및 로컬 퍼스트 연동 전제 조건 정리를 완료했다.

