
import { useState } from "react";
import { Heart } from "lucide-react";
import Header from "../Dashcomponents/Header";
import Sidebar from "../Dashcomponents/Sidebar";
import MusicPlayer from "../Dashcomponents/MusicPlayer";
import LikedSongs from "../Dashcomponents/LikedSongs";
import Browse from "../Dashcomponents/Browse";
import TopSongs from "../Dashcomponents/TopSongs";
import DiscoverMusic from "./DiscoverMusic";

// Placeholder data until Spotify/Supabase integration.
const recentlyPlayed = [
  {
    id: 1,
    title: "Talk To Me",
    artist: "Mina Okabe",
    duration: "2:57",
    cover: "linear-gradient(180deg, #3b2a6b 0%, #c4506a 62%, #1a1020 100%)",
  },
  {
    id: 2,
    title: "IT'S GOING DOWN",
    artist: "The Vanished People, WaMi",
    duration: "1:59",
    cover: "linear-gradient(180deg, #f0a24a 0%, #c9772e 55%, #5a3418 100%)",
  },
  {
    id: 3,
    title: "Echoes in Glass",
    artist: "Atlas Bloom",
    duration: "3:18",
    cover: "linear-gradient(180deg, #3a9b9e 0%, #1f6a72 60%, #0c3036 100%)",
  },
  {
    id: 4,
    title: "Afterglow",
    artist: "Luna Static",
    duration: "2:56",
    cover: "linear-gradient(180deg, #5b3fa0 0%, #b8509a 65%, #2a1540 100%)",
  },
  {
    id: 5,
    title: "Slow Motion",
    artist: "Paper Skies",
    duration: "3:34",
    cover: "linear-gradient(180deg, #a9bcbd 0%, #4d6e66 60%, #1b3330 100%)",
  },
];

// Generate a randomly ordered list using Fisher-Yates shuffle.
function shuffleSongs(songs) {
  const shuffled = [...songs];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[i],
    ];
  }

  return shuffled;
}

function Dashboard() {
  const [activeSection, setActiveSection] = useState("home");
  const [likedIds, setLikedIds] = useState([2]);

  // Selected song and current song list.
  const [selectedSong, setSelectedSong] = useState(null);
  const [songQueue, setSongQueue] = useState([]);

  // Shuffle mode.
  const [isShuffled, setIsShuffled] = useState(false);

  // Songs that have not yet been selected in this shuffle cycle.
  const [shuffleRemaining, setShuffleRemaining] = useState([]);

  // History for the Previous button in shuffle mode.
  const [songHistory, setSongHistory] = useState([]);

  // Select a song from Browse or Global Top 100.
  const handleSongSelect = (track, songs) => {
    const newQueue = Array.isArray(songs) ? songs : [];

    setSelectedSong(track);
    setSongQueue(newQueue);
    setSongHistory([]);

    // The selected song counts as the first song of a new cycle.
    if (isShuffled) {
      const otherSongs = newQueue.filter(
        (song) => String(song.id) !== String(track.id)
      );

      setShuffleRemaining(shuffleSongs(otherSongs));
    } else {
      setShuffleRemaining([]);
    }
  };

  // Enable or disable shuffle mode.
  const handleToggleShuffle = () => {
    const nextShuffled = !isShuffled;

    setIsShuffled(nextShuffled);
    setSongHistory([]);

    if (nextShuffled && selectedSong) {
      // Start a fresh shuffle cycle.
      // Exclude the song already selected.
      const otherSongs = songQueue.filter(
        (song) =>
          String(song.id) !== String(selectedSong.id)
      );

      setShuffleRemaining(shuffleSongs(otherSongs));
    } else {
      setShuffleRemaining([]);
    }
  };

  // Move to the next song.
  const handleNextSong = () => {
    if (!selectedSong || songQueue.length < 2) {
      return;
    }

    const currentIndex = songQueue.findIndex(
      (song) =>
        String(song.id) === String(selectedSong.id)
    );

    if (currentIndex === -1) {
      return;
    }

    let nextSong;

    if (isShuffled) {
      let remaining = shuffleRemaining;

      // Every song in the current shuffle cycle has been selected.
      // Start a new randomized cycle, avoiding an immediate repeat.
      if (remaining.length === 0) {
        const otherSongs = songQueue.filter(
          (song) =>
            String(song.id) !== String(selectedSong.id)
        );

        remaining = shuffleSongs(otherSongs);
      }

      // Take the next unplayed song from the shuffled queue.
      nextSong = remaining[0];

      // Remove it so it cannot be selected again this cycle.
      setShuffleRemaining(remaining.slice(1));
    } else {
      // Normal sequential order.
      const nextIndex =
        (currentIndex + 1) % songQueue.length;

      nextSong = songQueue[nextIndex];
    }

    if (nextSong) {
      setSongHistory((previous) => [
        ...previous,
        selectedSong,
      ]);

      setSelectedSong(nextSong);
    }
  };

  // Move to the previous song.
  const handlePreviousSong = () => {
    if (!selectedSong || songQueue.length === 0) {
      return;
    }

    // In shuffle mode, return to the previously selected song.
    if (isShuffled && songHistory.length > 0) {
      const previousSong =
        songHistory[songHistory.length - 1];

      setSongHistory((previous) =>
        previous.slice(0, -1)
      );

      setSelectedSong(previousSong);
      return;
    }

    // Otherwise use the original song order.
    const currentIndex = songQueue.findIndex(
      (song) =>
        String(song.id) === String(selectedSong.id)
    );

    if (currentIndex === -1) {
      return;
    }

    const previousIndex =
      (currentIndex - 1 + songQueue.length) %
      songQueue.length;

    setSelectedSong(songQueue[previousIndex]);
  };

  const toggleLike = (id) => {
    setLikedIds((previous) =>
      previous.includes(id)
        ? previous.filter((songId) => songId !== id)
        : [...previous, id]
    );
  };

  return (
    <div className="dashboard-layout">
      <Header />

      <div className="dashboard-body">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <main className="dashboard-main">
          {activeSection === "liked" && <LikedSongs />}

          {activeSection === "home" && (
            <>
              {/* HOME BANNER */}
              <section className="home-banner">
                <h1>Home</h1>
                <div
                  className="home-banner-art"
                  aria-hidden="true"
                />
              </section>

              {/* RECENTLY PLAYED */}
              <section className="home-recent">
                <div className="home-recent-heading">
                  <h2>Recently Played</h2>
                  <span>{recentlyPlayed.length} tracks</span>
                </div>

                <div className="home-recent-list">
                  {recentlyPlayed.map((track) => {
                    const isLiked = likedIds.includes(track.id);

                    return (
                      <div
                        className="home-recent-track"
                        key={track.id}
                      >
                        <div
                          className="home-recent-cover"
                          style={{ background: track.cover }}
                        />

                        <div className="home-recent-info">
                          <span className="home-recent-title">
                            {track.title}
                          </span>

                          <span className="home-recent-artist">
                            {track.artist}
                          </span>
                        </div>

                        <span className="home-recent-duration">
                          {track.duration}
                        </span>

                        <button
                          type="button"
                          className="home-recent-like"
                          onClick={() => toggleLike(track.id)}
                          aria-label={`${isLiked ? "Unlike" : "Like"
                            } ${track.title}`}
                          aria-pressed={isLiked}
                        >
                          <Heart
                            size={20}
                            fill={
                              isLiked ? "currentColor" : "none"
                            }
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {/* MUSIC CATALOG */}
          {activeSection === "browse" && (
            <Browse onSelectSong={handleSongSelect} />
          )}

          {/* GLOBAL TOP 100 */}
          {activeSection === "top" && (
            <TopSongs onSelectSong={handleSongSelect} />
          )}

          {activeSection === "playlists" && (
            <h1>Playlists</h1>
          )}

          {activeSection === "discover" && (
            <DiscoverMusic />
          )}
        </main>
      </div>

      {/* BOTTOM MUSIC PLAYER */}
      <MusicPlayer
        selectedSong={selectedSong}
        onNext={handleNextSong}
        onPrevious={handlePreviousSong}
        isShuffled={isShuffled}
        onToggleShuffle={handleToggleShuffle}
      />
    </div>
  );
}

export default Dashboard;
