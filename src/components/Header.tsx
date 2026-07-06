import { useState } from 'react'

const NAV_ITEMS = [
  { label: '문서', href: '#category-docs' },
  { label: '계산기', href: '#category-calculators' },
  { label: '기준', href: '#category-standards' },
  { label: 'CAD 소스', href: '#category-cad' },
  { label: '공사일보', href: '#category-daily-report' },
  { label: '사진대지', href: '#category-photo-log' },
  { label: '최신 기준', href: '#updates' },
]

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="header">
      <div className="header__inner">
        <a href="#top" className="header__brand">
          <span className="header__logo">문서방</span>
          <span className="header__slogan">건설인 오픈 툴박스</span>
        </a>

        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`} aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="header__nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="header__menu-btn"
          aria-expanded={menuOpen}
          aria-label="메뉴 열기"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? '닫기' : '메뉴'}
        </button>
      </div>
    </header>
  )
}

export default Header
