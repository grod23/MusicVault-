import { useEffect, useRef, useState } from "react";
import { Music2, Search } from "lucide-react";
import "./Header.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"
).replace(/\/$/, "");

const MAX_SUGGESTIONS = 6;
const DEBOUNCE_MS = 250;

// TEST MODE: set to false to use the real backend instead of filler songs.
const USE_FILLER_SONGS = true;

const FILLER_SONGS = [
  { id: "f1", title: "Talk To Me", artist: "Mina Okabe", album: "Spinning Around" },
  { id: "f2", title: "IT'S GOING DOWN", artist: "The Vanished People, WaMi", album: "IT'S GOING DOWN" },
  { id: "f3", title: "Echoes in Glass", artist: "Atlas Bloom", album: "Glasswork" },
  { id: "f4", title: "Afterglow", artist: "Luna Static", album: "Night Signals" },
  { id: "f5", title: "Slow Motion", artist: "Paper Skies", album: "Low Tide" },
  { id: "f6", title: "Talk Is Cheap", artist: "Velvet Harbor", album: "Small Hours" },
  { id: "f7", title: "Midnight Drive", artist: "Atlas Bloom", album: "Glasswork" },
  { id: "f8", title: "Golden Hour", artist: "Luna Static", album: "Night Signals" },
  { id: "f9", title: "Static Hearts", artist: "Paper Skies", album: "Low Tide" },
  { id: "f10", title: "Vault Door", artist: "Mina Okabe", album: "Spinning Around" },
];

// onSelectSong is optional: Dashboard can pass a handler to react to a pick.
function Header({ onSelectSong }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const searchRef = useRef(null);

  // Fetch suggestions (debounced) whenever the query changes.
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
  return;
}

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      if (USE_FILLER_SONGS) {
        const lower = trimmed.toLowerCase();
        setSuggestions(
          FILLER_SONGS.filter(
            (song) =>
              song.title.toLowerCase().includes(lower) ||
              song.artist.toLowerCase().includes(lower) ||
              song.album.toLowerCase().includes(lower)
          ).slice(0, MAX_SUGGESTIONS)
        );
        setActiveIndex(-1);
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/songs?search=${encodeURIComponent(
            trimmed
          )}&page=1&limit=${MAX_SUGGESTIONS * 4}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const lower = trimmed.toLowerCase();

        // Filter client-side too, in case the backend ignores `search`.
        const matches = (data.songs || [])
          .filter(
            (song) =>
              song.title?.toLowerCase().includes(lower) ||
              song.artist?.toLowerCase().includes(lower) ||
              song.album?.toLowerCase().includes(lower)
          )
          .slice(0, MAX_SUGGESTIONS);

        if (!controller.signal.aborted) {
          setSuggestions(matches);
          setActiveIndex(-1);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Close the dropdown when clicking outside the search box.
  useEffect(() => {
    const onPointerDown = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const selectSong = (song) => {
    setQuery(song.title);
    setOpen(false);
    setActiveIndex(-1);
    if (onSelectSong) onSelectSong(song);
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (!open || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSong(suggestions[activeIndex]);
    }
  };

  const showDropdown = open && query.trim().length >= 2;

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

      <div className="header-search" ref={searchRef}>
        <Search size={20} className="search-icon" aria-hidden="true" />
        <input
          type="text"
          placeholder="What do you want to play?"
          aria-label="Search music"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />

        {showDropdown && (
          <ul
            id="search-suggestions"
            className="search-suggestions"
            role="listbox"
          >
            {loading && suggestions.length === 0 && (
              <li className="search-suggestion-message">Searching...</li>
            )}

            {!loading && suggestions.length === 0 && (
              <li className="search-suggestion-message">
                No songs found for “{query.trim()}”
              </li>
            )}

            {suggestions.map((song, index) => (
              <li
                key={song.id}
                role="option"
                aria-selected={index === activeIndex}
                className={`search-suggestion ${
                  index === activeIndex ? "active" : ""
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  // mousedown (not click) so the input doesn't blur first
                  event.preventDefault();
                  selectSong(song);
                }}
              >
                <div className="search-suggestion-cover">
                  {song.cover_url ? (
                    <img src={song.cover_url} alt="" />
                  ) : (
                    <Music2 size={16} />
                  )}
                </div>

                <div className="search-suggestion-info">
                  <span className="search-suggestion-title">{song.title}</span>
                  <span className="search-suggestion-artist">
                    {song.artist}
                    {song.album ? ` · ${song.album}` : ""}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
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
