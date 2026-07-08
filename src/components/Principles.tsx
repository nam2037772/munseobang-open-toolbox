const PRINCIPLES = [
  '회원가입을 요구하지 않습니다.',
  '사용자 문서와 현장자료를 서버에 저장하지 않습니다.',
  '검증되지 않은 정보를 정답처럼 제공하지 않습니다.',
  '커뮤니티 게시판이나 토론 기능을 운영하지 않습니다.',
  '검색 결과를 많이 보여주기보다 신뢰할 수 있는 답안 카드만 보여줍니다.',
]

function Principles() {
  return (
    <section className="principles">
      <h2 className="section-title">문서방이 하지 않는 것</h2>
      <ul className="principles__list">
        {PRINCIPLES.map((item) => (
          <li key={item} className="principles__item">
            <span className="principles__icon" aria-hidden="true">
              -
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Principles
