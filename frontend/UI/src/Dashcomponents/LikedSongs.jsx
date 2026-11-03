import { Play, Clock3, Music2 } from "lucide-react";
import "./LikedSongs.css";

// Temporary
const likedSongs = [
  {
    id: 1,
    title: "IT'S GOING DOWN",
    album: "IT'S GOING DOWN",
    artist: "The Vanished People, WaMi",
    duration: "1:59",
    albumCover: "/images/going-down.jpg",
  },
  {
    id: 2,
    title: "Talk To Me",
    album: "Spinning Around",
    artist: "Mina Okabe",
    duration: "2:57",
    albumCover: "/images/talk-to-me.jpg",
  },
];

function LikedSongs() {
  return (
    <section className="liked-songs-page">

      {/* Purple Playlist Header */}
      <div className="liked-songs-header">
        <div className="liked-songs-artwork">
            <span className="liked-songs-heart">♥</span>
        </div>

        <div className="liked-songs-header-info">
          <h1>Liked Songs</h1>
          <p>
            Your MusicVault Library • {likedSongs.length} songs
          </p>
        </div>
      </div>

      {/* Playlist Content */}
      <div className="liked-songs-content">

        <div className="liked-songs-actions">
          <button
            className="liked-songs-play"
            type="button"
            aria-label="Play liked songs"
            disabled
            title="Playback coming with Spotify integration"
          >
            <Play size={26} fill="currentColor" />
          </button>
        </div>

        {/* Song Table Header */}
        <div className="liked-song-row liked-song-table-header">
          <span>#</span>
          <span>Title</span>
          <span>Album</span>
          <span>Artist</span>
          <span className="liked-song-time-heading">
            <Clock3 size={17} aria-label="Duration" />
          </span>
        </div>

        {/* Song List */}
        <div className="liked-songs-list">
          {likedSongs.map((song, index) => (
            <div className="liked-song-row" key={song.id}>
              <span className="liked-song-number">
                {index + 1}
              </span>

              <div className="liked-song-title-cell">
                <div className="liked-song-cover">
                  <img
                    src={song.albumCover}
                    alt={`${song.album} cover`}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                  <Music2 className="liked-song-cover-fallback" size={22} />
                </div>

                <span className="liked-song-title">
                  {song.title}
                </span>
              </div>

              <span className="liked-song-album">
                {song.album}
              </span>

              <span className="liked-song-artist">
                {song.artist}
              </span>

              <span className="liked-song-duration">
                {song.duration}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LikedSongs;
