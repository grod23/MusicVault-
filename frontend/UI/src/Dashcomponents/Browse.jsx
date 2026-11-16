import { useState } from "react";
import { Heart } from "lucide-react";

import "./Browse.css";

// Placeholder listings until Spotify/Supabase integration.
// Swap `cover` for an image URL later (the gradients are stand-ins).
const browseSongs = [
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
  {
    id: 6,
    title: "Neon Harbor",
    artist: "Velvet Tide",
    duration: "3:05",
    cover: "linear-gradient(180deg, #2b6cb0 0%, #6b46c1 60%, #1a1033 100%)",
  },
  {
    id: 7,
    title: "Paper Lanterns",
    artist: "Juniper Lane",
    duration: "2:41",
    cover: "linear-gradient(180deg, #e8b04a 0%, #c0562f 60%, #3a1a14 100%)",
  },
  {
    id: 8,
    title: "Midnight Drive",
    artist: "Cold Meridian",
    duration: "4:12",
    cover: "linear-gradient(180deg, #1f3a5f 0%, #0f1f33 60%, #05090f 100%)",
  },
];

function Browse() {
  const [likedIds, setLikedIds] = useState([]);

  const toggleLike = (id) => {
    setLikedIds((previous) =>
      previous.includes(id)
        ? previous.filter((songId) => songId !== id)
        : [...previous, id]
    );
  };

  return (
    <section className="browse-page">
      <div className="browse-heading">
        <h1>Browse</h1>
        <span>{browseSongs.length} tracks</span>
      </div>

      <div className="browse-list">
        {browseSongs.map((track, index) => {
          const isLiked = likedIds.includes(track.id);

          return (
            <div className="browse-track" key={track.id}>
              <span className="browse-number">{index + 1}</span>

              <div
                className="browse-cover"
                style={{ background: track.cover }}
              />

              <div className="browse-info">
                <span className="browse-title">{track.title}</span>
                <span className="browse-artist">{track.artist}</span>
              </div>

              <span className="browse-duration">{track.duration}</span>

              <button
                type="button"
                className="browse-like"
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
  );
}

export default Browse;