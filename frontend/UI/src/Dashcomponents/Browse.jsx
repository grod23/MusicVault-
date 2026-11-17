import SongList from "./SongList";
import "./Browse.css";

function Browse({ onSelectSong }) {
  return (
    <SongList
      mode="browse"
      onSelectSong={onSelectSong}
    />
  );
}

export default Browse;
