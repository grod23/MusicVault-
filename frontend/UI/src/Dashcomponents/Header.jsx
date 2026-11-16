import "./Header.css";

function Header() {
  return (
    <header className="dashboard-header">
      <div className="header-logo">
        {/* Logo mark (inline SVG: sharp at any size) */}
        <svg
          className="header-logo-icon"
          viewBox="0 0 70 55"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="mv-gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f5d78f" />
              <stop offset="1" stopColor="#d19f43" />
            </linearGradient>
          </defs>
          <g fill="url(#mv-gold)">
            <path d="M17.5 44.5 V28.4 A18.1 18.1 0 0 1 53.7 28.4 V44.5 H50.9 V28.4 A15.3 15.3 0 0 0 20.3 28.4 V44.5 Z" />
            <rect x="11.2" y="28.6" width="5.2" height="14.6" rx="2.6" />
            <rect x="54.8" y="28.6" width="5.2" height="14.6" rx="2.6" />
            <rect x="24.4" y="31.4" width="6.2" height="14.1" rx="0.7" />
            <rect x="32.8" y="27.8" width="6.2" height="17.7" rx="0.7" />
            <rect x="41" y="25.6" width="5.9" height="19.9" rx="0.7" />
          </g>
        </svg>

        <h2>Music Vault</h2>
      </div>

      <div className="header-search">
        <span className="search-icon">⌕</span>
        <input
          type="text"
          placeholder="What do you want to play?"
          aria-label="Search music"
        />
      </div>

      <div className="header-profile">
        <button type="button" aria-label="User profile">
          👤
        </button>
      </div>
    </header>
  );
}

export default Header;