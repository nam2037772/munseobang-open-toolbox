interface AboutProps {
  onBackToHome: () => void
}

function About({ onBackToHome }: AboutProps) {
  return (
    <section className="about-page">
      <div className="about-page__inner">
        <p className="workspace-heading__eyebrow">문서방 소개</p>
        <h1 className="workspace-heading__title">문서방은 건설인의 웹 기반 작업대입니다.</h1>
        <p className="about-page__lead">
          문서방은 자료를 쌓아두는 저장소가 아니라, 현장에서 바로 쓰는 도구와 기준 카드를 업무 폴더별로 꺼내 쓰는 오픈 툴박스입니다.
        </p>
        <ul className="about-page__list">
          <li>회원가입과 서버 저장 없이 정적 웹으로 동작합니다.</li>
          <li>공식자료와 현장 실무 흐름을 우선합니다.</li>
          <li>앱이 늘어나도 데이터 파일에 추가하면 폴더와 검색에 자동 반영됩니다.</li>
        </ul>
        <button type="button" className="about-page__back" onClick={onBackToHome}>
          업무 폴더 보러 가기
        </button>
      </div>
    </section>
  )
}

export default About
