interface HeaderProps {
  onHome: () => void
  onAbout: () => void
}

function Header({ onHome, onAbout }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__inner">
        <button type="button" className="header__brand" onClick={onHome}>
          <span className="header__logo">문서방</span>
          <span className="header__slogan">건설인 오픈 툴박스</span>
        </button>

        <button type="button" className="header__nav-link" onClick={onAbout}>
          소개
        </button>
      </div>
    </header>
  )
}

export default Header
