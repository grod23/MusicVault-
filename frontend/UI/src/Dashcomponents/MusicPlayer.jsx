
import { useState } from "react";
import {
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat2,
  Heart,
  Volume2,
  VolumeX,
  Music2,
} from "lucide-react";

import "./MusicPlayer.css";

function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [progress, setProgress] = useState(63);
  const [volume, setVolume] = useState(70);
  const [previousVolume, setPreviousVolume] = useState(70);

  // Placeholder song information until Spotify integration
  const song = {
    title: "Talk To Me",
    artist: "Mina Okabe",
    albumCover: "",
    duration: 176,
  };

  // Convert seconds into M:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
    } else {
      setVolume(previousVolume || 70);
    }
  };

  return (
    <footer className="music-player">

      {/* LEFT: Song Information */}
      <div className="player-song">
        <div className="player-album">
          {song.albumCover ? (
            <img src={song.albumCover} alt="Album cover" />
          ) : (
            <Music2 size={28} />
          )}
        </div>

        <div className="player-song-info">
          <span className="player-song-title">{song.title}</span>
          <span className="player-song-artist">{song.artist}</span>
        </div>

        <button
          className={`player-icon-button player-like ${isLiked ? "active" : ""}`}
          onClick={() => setIsLiked(!isLiked)}
          aria-label="Like song"
          aria-pressed={isLiked}
          type="button"
        >
          <Heart size={19} fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* CENTER: Playback Controls */}
      <div className="player-center">

        <div className="player-controls">
          <button
            className={`player-icon-button ${isShuffled ? "active" : ""}`}
            onClick={() => setIsShuffled(!isShuffled)}
            aria-label="Shuffle"
            aria-pressed={isShuffled}
            type="button"
          >
            <Shuffle size={19} />
          </button>

          <button
            className="player-icon-button"
            aria-label="Previous song"
            type="button"
          >
            <SkipBack size={21} fill="currentColor" />
          </button>

          <button
            className="player-play-button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause" : "Play"}
            type="button"
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
          </button>

          <button
            className="player-icon-button"
            aria-label="Next song"
            type="button"
          >
            <SkipForward size={21} fill="currentColor" />
          </button>

          <button
            className={`player-icon-button ${isRepeating ? "active" : ""}`}
            onClick={() => setIsRepeating(!isRepeating)}
            aria-label="Repeat"
            aria-pressed={isRepeating}
            type="button"
          >
            <Repeat2 size={19} />
          </button>
        </div>

        {/* Song Progress Bar */}
        <div className="player-progress">
          <span className="player-time">
            {formatTime(progress)}
          </span>

          <input
            type="range"
            min="0"
            max={song.duration}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="player-slider"
            style={{
              "--slider-progress": `${(progress / song.duration) * 100}%`,
            }}
            aria-label="Song progress"
          />

          <span className="player-time">
            {formatTime(song.duration)}
          </span>
        </div>
      </div>

      {/* RIGHT: Volume Controls */}
      <div className="player-right">
        <button
          className="player-icon-button"
          onClick={toggleMute}
          aria-label={volume === 0 ? "Unmute" : "Mute"}
          type="button"
        >
          {volume === 0 ? (
            <VolumeX size={20} />
          ) : (
            <Volume2 size={20} />
          )}
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="player-slider player-volume-slider"
          style={{
            "--slider-progress": `${volume}%`,
          }}
          aria-label="Volume"
        />
      </div>
    </footer>
  );
}

export default MusicPlayer;
