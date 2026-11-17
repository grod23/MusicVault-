import { useEffect, useRef, useState } from "react";
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

function MusicPlayer({
  selectedSong,
  onNext,
  onPrevious,
  isShuffled,
  onToggleShuffle,
}) {
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [previousVolume, setPreviousVolume] = useState(70);

  // Selected song information.
  const song = {
    title: selectedSong?.title ?? "Select a song",
    artist:
      selectedSong?.artist ?? "Browse Music or Global Top 100",
    albumCover: selectedSong?.cover_url ?? "",
    audioUrl: selectedSong?.audio_url ?? null,
  };

  // Apply volume to the actual audio element.
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Play or pause when an audio URL exists.
  const handlePlayPause = async () => {
    const audio = audioRef.current;

    if (!song.audioUrl || !audio) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        console.error("Unable to play audio:", error);
        setIsPlaying(false);
      }
    } else {
      audio.pause();
    }
  };

  // Navigate to the next song.
  const handleNext = () => {
    onNext?.();
  };

  // Navigate to the previous song.
  const handlePrevious = () => {
    onPrevious?.();
  };

  // Update playback progress.
  const handleTimeUpdate = () => {
    const audio = audioRef.current;

    if (audio) {
      setProgress(audio.currentTime);
    }
  };

  // Read duration when audio metadata loads.
  const handleLoadedMetadata = () => {
    const audio = audioRef.current;

    if (audio && Number.isFinite(audio.duration)) {
      setDuration(audio.duration);
    }
  };

  // Seek through audio when available.
  const handleProgressChange = (event) => {
    const newTime = Number(event.target.value);

    if (audioRef.current && song.audioUrl) {
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  // Format time as M:SS.
  const formatTime = (seconds) => {
    const safeSeconds = Number.isFinite(seconds)
      ? Math.floor(seconds)
      : 0;

    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  // Mute or unmute.
  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
    } else {
      setVolume(previousVolume || 70);
    }
  };

  const progressPercentage =
    duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <footer className="music-player">

      {/* AUDIO ELEMENT */}
      <audio
        ref={audioRef}
        src={song.audioUrl || undefined}
        loop={isRepeating}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
        }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={() => setIsPlaying(false)}
      />

      {/* LEFT: SONG INFORMATION */}
      <div className="player-song">
        <div className="player-album">
          {song.albumCover ? (
            <img
              src={song.albumCover}
              alt={`${song.title} album cover`}
            />
          ) : (
            <Music2 size={28} />
          )}
        </div>

        <div className="player-song-info">
          <span className="player-song-title">
            {song.title}
          </span>

          <span className="player-song-artist">
            {song.artist}
          </span>
        </div>

        <button
          className={`player-icon-button player-like ${
            isLiked ? "active" : ""
          }`}
          onClick={() => setIsLiked(!isLiked)}
          aria-label="Like song"
          aria-pressed={isLiked}
          title="Preview like (not saved to account)"
          type="button"
        >
          <Heart
            size={19}
            fill={isLiked ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* CENTER: PLAYBACK CONTROLS */}
      <div className="player-center">

        <div className="player-controls">

          {/* SHUFFLE */}
          <button
            className={`player-icon-button ${
              isShuffled ? "active" : ""
            }`}
            onClick={onToggleShuffle}
            aria-label="Shuffle"
            aria-pressed={isShuffled}
            type="button"
          >
            <Shuffle size={19} />
          </button>

          {/* PREVIOUS SONG */}
          <button
            className="player-icon-button"
            onClick={handlePrevious}
            aria-label="Previous song"
            type="button"
          >
            <SkipBack size={21} fill="currentColor" />
          </button>

          {/* PLAY / PAUSE */}
          <button
            className="player-play-button"
            onClick={handlePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            type="button"
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
          </button>

          {/* NEXT SONG */}
          <button
            className="player-icon-button"
            onClick={handleNext}
            aria-label="Next song"
            type="button"
          >
            <SkipForward size={21} fill="currentColor" />
          </button>

          {/* REPEAT */}
          <button
            className={`player-icon-button ${
              isRepeating ? "active" : ""
            }`}
            onClick={() => setIsRepeating(!isRepeating)}
            aria-label="Repeat"
            aria-pressed={isRepeating}
            type="button"
          >
            <Repeat2 size={19} />
          </button>
        </div>

        {/* SONG PROGRESS BAR */}
        <div className="player-progress">
          <span className="player-time">
            {formatTime(progress)}
          </span>

          <input
            type="range"
            min="0"
            max={duration || 1}
            value={progress}
            onChange={handleProgressChange}
            disabled={!song.audioUrl || duration === 0}
            className="player-slider"
            style={{
              "--slider-progress": `${progressPercentage}%`,
            }}
            aria-label="Song progress"
          />

          <span className="player-time">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* RIGHT: VOLUME CONTROLS */}
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
