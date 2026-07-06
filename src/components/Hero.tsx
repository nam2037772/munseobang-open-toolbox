const BADGES = ['회원가입 없음', '서버 저장 없음', '공식자료 우선', '내 PC에 저장']

function Hero() {
  const handleDailyReportClick = () => {
    alert('공사일보 작성기는 다음 단계에서 서버 저장 없는 PC 저장 방식으로 연결합니다.')
  }

  return (
    <section className="hero">
      <div className="hero__inner">
        <p className="hero__eyebrow">건설인 오픈 툴박스</p>
        <h1 className="hero__title">문서방</h1>
        <p className="hero__subtitle">
          우리는 정보를 모으지 않습니다. 우리는 답을 정리합니다.
          <br />
          문서방은 커뮤니티도, 자료창고도, AI 검색 사이트도 아닙니다. 검증된 기준과 실무 도구를 바로 꺼내 쓰고 결과물을 내 PC에 저장하는 레퍼런스입니다.
        </p>

        <ul className="hero__badges" aria-label="문서방 원칙">
          {BADGES.map((badge) => (
            <li key={badge} className="hero__badge">
              {badge}
            </li>
          ))}
        </ul>

        <div className="hero__actions">
          <a href="#search" className="btn btn--primary">
            답안 카드 찾기
          </a>
          <button type="button" className="btn btn--outline" onClick={handleDailyReportClick}>
            공사일보 준비중
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero
