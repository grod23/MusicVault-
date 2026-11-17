import SongList from "./SongList";
import "./TopSongs.css";

function TopSongs({ onSelectSong }) {
  return (
    <SongList
      mode="top"
      onSelectSong={onSelectSong}
    />
  );
}

export default TopSongs;
