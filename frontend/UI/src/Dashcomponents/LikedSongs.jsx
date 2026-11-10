
import { useState } from "react";
import {
  Play,
  Heart,
  Music2,
  Search,
} from "lucide-react";

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
    <section className="modern-liked-page">

      {/* HEADER */}
      <div className="modern-liked-header">
        <div className="modern-liked-heading">
          <h1>
            Liked Songs
          </h1>

          <p>
            Your Library • {likedCount} songs
          </p>
        </div>
      </div>

      {/* FILTER AND SEARCH CONTROLS */}
      <div className="modern-liked-toolbar">
        <div className="modern-liked-filters">
          <button
            type="button"
            className={`modern-filter ${
              sortMode === "all" ? "selected" : ""
            }`}
            onClick={() => setSortMode("all")}
          >
            All Songs
          </button>

          <button
            type="button"
            className={`modern-filter ${
              sortMode === "recent" ? "selected" : ""
            }`}
            onClick={() => setSortMode("recent")}
          >
            Recently Added
          </button>
        </div>

        <div className="modern-liked-search">
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

      {/* SONG CARDS */}
      <div className="modern-liked-list">
        {visibleSongs.map((song) => (
          <div className="modern-song-card" key={song.id}>

            {/* Album Cover */}
            <div className="modern-song-cover">
              <Music2 size={24} className="modern-cover-fallback" />

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

            {/* Song Information */}
            <div className="modern-song-info">
              <span className="modern-song-title">
                {song.title}
              </span>

              <span className="modern-song-details">
                {song.artist} • {song.album}
              </span>
            </div>

            {/* Duration */}
            <span className="modern-song-duration">
              {song.duration}
            </span>

            {/* Favorite Button */}
            <button
              type="button"
              className="modern-song-like"
              onClick={() => toggleLike(song.id)}
              aria-label={`Unlike ${song.title}`}
              title="Remove from liked songs"
            >
              <Heart
                size={20}
                fill="currentColor"
              />
            </button>
          </div>
        ))}

        {visibleSongs.length === 0 && (
          <div className="modern-liked-empty">
            <Music2 size={36} />
            <p>No liked songs found.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default LikedSongs;
