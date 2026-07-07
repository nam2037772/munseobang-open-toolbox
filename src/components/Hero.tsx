const BADGES = ['업무 폴더 중심', '회원가입 없음', '서버 저장 없음', '공식자료 우선']

function Hero() {
  return (
    <section className="hero">
      <div className="hero__inner">
        <p className="hero__eyebrow">건설인 오픈 툴박스</p>
        <h1 className="hero__title">문서방</h1>
        <p className="hero__subtitle">
          앱 이름을 외우지 않아도 됩니다. 공사, 공무, 품질, 안전처럼 지금 하는 업무 폴더를 열고 필요한 도구를 바로 꺼내 쓰세요.
        </p>

        <ul className="hero__badges" aria-label="문서방 원칙">
          {BADGES.map((badge) => (
            <li key={badge} className="hero__badge">
              {badge}
            </li>
          ))}
        </ul>

        <div className="hero__actions">
          <a href="#folders" className="btn btn--primary">
            업무 폴더 열기
          </a>
          <a href="#search" className="btn btn--outline">
            전체 도구 검색
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero
