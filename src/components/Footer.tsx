const FOOTER_LINKS = ['프로젝트 철학', '자료 출처 정책', '변경 기록', '로드맵']

function Footer() {
  const handleClick = (label: string) => {
    alert(`${label} 문서는 프로젝트 루트의 Markdown 파일에서 관리합니다.`)
  }

  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__tagline">
          문서방은 건설인이 검증된 기준과 도구를 빠르게 꺼내 쓰도록 돕는 신뢰 기반 오픈 툴박스입니다.
        </p>
        <ul className="footer__links">
          {FOOTER_LINKS.map((label) => (
            <li key={label}>
              <button type="button" className="footer__link" onClick={() => handleClick(label)}>
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}

export default Footer
