import { useState } from "react";
import { Heart, Music2, Search } from "lucide-react";

import "./LikedSongs.css";

// Placeholder data until Spotify/Supabase integration
const initialLikedSongs = [
  {
    id: 1,
    title: "IT'S GOING DOWN",
    album: "IT'S GOING DOWN",
    artist: "The Vanished People, WaMi",
    duration: "1:59",
    albumCover: "/images/going-down.jpg",
    dateAdded: "2026-10-28",
  },
  {
    id: 2,
    title: "Talk To Me",
    album: "Spinning Around",
    artist: "Mina Okabe",
    duration: "2:57",
    albumCover: "/images/talk-to-me.jpg",
    dateAdded: "2026-11-01",
  },
];

function LikedSongs() {
  const songs = initialLikedSongs;
  const [sortMode, setSortMode] = useState("all");
  const [search, setSearch] = useState("");

  const [removedSongs, setRemovedSongs] = useState([]);

  const toggleLike = (id) => {
    setRemovedSongs((previous) =>
      previous.includes(id)
        ? previous.filter((songId) => songId !== id)
        : [...previous, id]
    );
  };

  const visibleSongs = songs
    .filter((song) => !removedSongs.includes(song.id))
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
      return a.id - b.id;
    });

  const likedCount = songs.length - removedSongs.length;

  return (
    <section className="liked-page">
      <div className="liked-heading">
        <h1>Liked Songs</h1>
        <span>{likedCount} tracks</span>
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
            className={`liked-filter ${sortMode === "recent" ? "selected" : ""}`}
            onClick={() => setSortMode("recent")}
          >
            Recently Added
          </button>
        </div>

        <div className="liked-search">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search liked songs"
            aria-label="Search liked songs"
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
                onClick={() => toggleLike(song.id)}
                aria-label={`Unlike ${song.title}`}
                title="Remove from liked songs"
              >
                <Heart size={20} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="liked-empty">
          <Music2 size={36} />
          <p>No liked songs found.</p>
        </div>
      )}
    </section>
  );
}

export default LikedSongs;