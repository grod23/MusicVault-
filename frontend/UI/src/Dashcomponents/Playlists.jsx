import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Heart,
  Music2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import "./LikedSongs.css"; // song list styling is shared with Liked Songs
import "./Playlists.css";

const STORAGE_KEY = "musicvault-playlists";

// TEMPORARY: sample songs so you can preview the playlist layout.
// Remove once songs can be added to playlists for real.
const SAMPLE_SONGS = [
  {
    id: 1,
    title: "Talk To Me",
    album: "Spinning Around",
    artist: "Mina Okabe",
    duration: "2:57",
    albumCover: "/images/talk-to-me.jpg",
    dateAdded: "2026-11-01",
  },
  {
    id: 2,
    title: "IT'S GOING DOWN",
    album: "IT'S GOING DOWN",
    artist: "The Vanished People, WaMi",
    duration: "1:59",
    albumCover: "/images/going-down.jpg",
    dateAdded: "2026-10-28",
  },
  {
    id: 3,
    title: "Echoes in Glass",
    album: "Glasswork",
    artist: "Atlas Bloom",
    duration: "3:18",
    albumCover: "",
    dateAdded: "2026-11-10",
  },
];

// Placeholder persistence until Supabase integration.
function loadPlaylists() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return [];
    return saved.map((playlist) => ({ songs: [], ...playlist }));
  } catch {
    return [];
  }
}

function Playlists() {
  const [playlists, setPlaylists] = useState(loadPlaylists);
  const [openId, setOpenId] = useState(null);
  const [sortMode, setSortMode] = useState("all");
  const [search, setSearch] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
    } catch {
      // Storage unavailable: playlists just won't persist.
    }
  }, [playlists]);

  const createPlaylist = () => {
    setPlaylists((previous) => {
      const nextNumber =
        previous.reduce((max, playlist) => Math.max(max, playlist.number), 0) +
        1;

      return [
        ...previous,
        {
          id: Date.now(),
          number: nextNumber,
          name: `Playlist ${nextNumber}`,
          songs: [],
        },
      ];
    });
  };

  const updateSongs = (playlistId, updater) => {
    setPlaylists((previous) =>
      previous.map((playlist) =>
        playlist.id === playlistId
          ? { ...playlist, songs: updater(playlist.songs) }
          : playlist
      )
    );
  };

  const openPlaylist = (id) => {
    setOpenId(id);
    setSortMode("all");
    setSearch("");
    setIsRenaming(false);
  };

  const startRenaming = (currentName) => {
    setDraftName(currentName);
    setIsRenaming(true);
  };

  const saveName = (playlistId) => {
    const trimmed = draftName.trim();

    // An empty name keeps the old one.
    if (trimmed) {
      setPlaylists((previous) =>
        previous.map((playlist) =>
          playlist.id === playlistId ? { ...playlist, name: trimmed } : playlist
        )
      );
    }

    setIsRenaming(false);
  };

  const deletePlaylist = (playlistId, name) => {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;

    setPlaylists((previous) => previous.filter((p) => p.id !== playlistId));
    setOpenId(null);
    setIsRenaming(false);
  };

  const openPlaylistData = playlists.find((p) => p.id === openId);

  /* ---------- PLAYLIST DETAIL VIEW ---------- */

  if (openPlaylistData) {
    const { id, name, songs } = openPlaylistData;

    const visibleSongs = songs
      .filter((song) => {
        const query = search.toLowerCase();

        return (
          song.title.toLowerCase().includes(query) ||
          song.artist.toLowerCase().includes(query) ||
          song.album.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sortMode === "recent") {
          return new Date(b.dateAdded) - new Date(a.dateAdded);
        }
        return 0;
      });

    return (
      <section className="liked-page">
        <div className="playlists-topbar">
          <button
            type="button"
            className="playlists-back"
            onClick={() => setOpenId(null)}
          >
            <ArrowLeft size={18} />
            All Playlists
          </button>

          <button
            type="button"
            className="playlists-delete"
            onClick={() => deletePlaylist(id, name)}
            aria-label={`Delete ${name}`}
            title="Delete playlist"
          >
            <Trash2 size={17} />
            Delete
          </button>
        </div>

        <div className="liked-heading">
          {isRenaming ? (
            <div className="playlists-rename">
              <input
                type="text"
                className="playlists-rename-input"
                value={draftName}
                maxLength={40}
                autoFocus
                aria-label="Playlist name"
                onChange={(event) => setDraftName(event.target.value)}
                onFocus={(event) => event.target.select()}
                onBlur={() => saveName(id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveName(id);
                  if (event.key === "Escape") setIsRenaming(false);
                }}
              />
              <button
                type="button"
                className="playlists-rename-button"
                // mousedown fires before the input's blur, so save once here
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => saveName(id)}
                aria-label="Save playlist name"
                title="Save name"
              >
                <Check size={20} />
              </button>
            </div>
          ) : (
            <div className="playlists-title">
              <h1>{name}</h1>
              <button
                type="button"
                className="playlists-rename-button"
                onClick={() => startRenaming(name)}
                aria-label={`Rename ${name}`}
                title="Rename playlist"
              >
                <Pencil size={20} />
              </button>
            </div>
          )}
          <span>
            {songs.length} {songs.length === 1 ? "track" : "tracks"}
          </span>
        </div>

        {/* FILTER AND SEARCH CONTROLS */}
        <div className="liked-toolbar">
          <div className="liked-filters">
            <button
              type="button"
              className={`liked-filter ${sortMode === "all" ? "selected" : ""}`}
              onClick={() => setSortMode("all")}
            >
              All Songs
            </button>

            <button
              type="button"
              className={`liked-filter ${
                sortMode === "recent" ? "selected" : ""
              }`}
              onClick={() => setSortMode("recent")}
            >
              Recently Added
            </button>
          </div>

          <div className="liked-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search this playlist"
              aria-label="Search this playlist"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {/* SONG LIST */}
        {visibleSongs.length > 0 ? (
          <div className="liked-list">
            {visibleSongs.map((song, index) => (
              <div className="liked-track" key={song.id}>
                <span className="liked-number">{index + 1}</span>

                <div className="liked-cover">
                  <Music2 size={20} className="liked-cover-fallback" />

                  {song.albumCover && (
                    <img
                      src={song.albumCover}
                      alt={`${song.album} cover`}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </div>

                <div className="liked-info">
                  <span className="liked-title">{song.title}</span>
                  <span className="liked-artist">
                    {song.artist} • {song.album}
                  </span>
                </div>

                <span className="liked-duration">{song.duration}</span>

                <button
                  type="button"
                  className="liked-like"
                  onClick={() =>
                    updateSongs(id, (current) =>
                      current.filter((s) => s.id !== song.id)
                    )
                  }
                  aria-label={`Remove ${song.title} from ${name}`}
                  title="Remove from playlist"
                >
                  <Heart size={20} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="liked-empty">
            <Music2 size={36} />
            <p>
              {songs.length === 0
                ? "This playlist is empty."
                : "No songs found."}
            </p>

            {songs.length === 0 && (
              <button
                type="button"
                className="playlists-create"
                onClick={() => updateSongs(id, () => SAMPLE_SONGS)}
              >
                <Plus size={18} />
                Add sample songs (test)
              </button>
            )}
          </div>
        )}
      </section>
    );
  }

  /* ---------- PLAYLIST GRID VIEW ---------- */

  return (
    <section className="playlists-page">
      <div className="playlists-heading">
        <h1>Playlists</h1>
        <span>
          {playlists.length} {playlists.length === 1 ? "playlist" : "playlists"}
        </span>
      </div>

      <button
        type="button"
        className="playlists-create"
        onClick={createPlaylist}
      >
        <Plus size={18} />
        Create Playlist
      </button>

      {playlists.length > 0 && (
        <div className="playlists-grid">
          {playlists.map((playlist) => (
            <button
              type="button"
              className="playlists-card"
              key={playlist.id}
              onClick={() => openPlaylist(playlist.id)}
              aria-label={`Open ${playlist.name}`}
            >
              <div className="playlists-icon" aria-hidden="true">
                ♫
              </div>
              <span className="playlists-name">{playlist.name}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default Playlists;