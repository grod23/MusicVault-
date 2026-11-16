
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
// Swap `cover` for an image URL later (the gradients are stand-ins).
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

function Dashboard() {
  const [activeSection, setActiveSection] = useState("home");
  const [likedIds, setLikedIds] = useState([2]);

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
              {/* BANNER: "Home" + vault image */}
              <section className="home-banner">
                <h1>Home</h1>
                <div className="home-banner-art" aria-hidden="true" />
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
                      <div className="home-recent-track" key={track.id}>
                        <div
                          className="home-recent-cover"
                          style={{ background: track.cover }}
                        />

                        <div className="home-recent-info">
                          <span className="home-recent-title">{track.title}</span>
                          <span className="home-recent-artist">{track.artist}</span>
                        </div>

                        <span className="home-recent-duration">{track.duration}</span>

                        <button
                          type="button"
                          className="home-recent-like"
                          onClick={() => toggleLike(track.id)}
                          aria-label={`${isLiked ? "Unlike" : "Like"} ${track.title}`}
                          aria-pressed={isLiked}
                        >
                          <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
          {activeSection === "browse" && <Browse />}
          {activeSection === "top" && <TopSongs />}
          {activeSection === "playlists" && <h1>Playlists</h1>}
          {activeSection === "discover" && <DiscoverMusic />}
        </main>
      </div>

      <MusicPlayer />
    </div>
  );
}

export default Dashboard;
