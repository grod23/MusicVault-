import React from "react";
import "./Header.css";

function Header() {
  return (
    <header className="dashboard-header">
      <div className="header-logo">
        <h2>MusicVault</h2>
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