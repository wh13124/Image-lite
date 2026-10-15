import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="header-brand">
          <svg
            className="header-logo"
            viewBox="0 0 32 32"
            width="26"
            height="26"
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="7" fill="var(--color-accent)" />
            <path
              d="M9 13h14M11 20l5 3 5-3"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="header-name">ImageLite</span>
        </div>
        <span className="badge">本地处理 · 不上传</span>
      </div>
    </header>
  )
}

export default Header
