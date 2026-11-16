
function normalizeSpotifyTrack(track) {
  if (!track || typeof track !== "object" || Array.isArray(track)) {
    throw new TypeError("Invalid Spotify track");
  }

  if (!track.id || typeof track.id !== "string" ||
      !track.name || typeof track.name !== "string") {
    throw new TypeError("Spotify track must have an id and name");
  }

  const artists = Array.isArray(track.artists)
    ? track.artists
        .filter(artist => artist && typeof artist.name === "string")
        .map(artist => artist.name)
    : [];

  return {
    spotifyId: track.id,
    title: track.name,
    artist: artists.join(", ") || "Unknown Artist",
    album: track.album?.name ?? null,
    coverUrl: track.album?.images?.[0]?.url ?? null,
    durationMs: track.duration_ms ?? null,
    popularity: track.popularity ?? null,
    spotifyUrl: track.external_urls?.spotify ?? null
  };
}

function normalizeSpotifyTracks(tracks) {
  if (!Array.isArray(tracks)) {
    throw new TypeError("Spotify tracks must be an array");
  }

  return tracks.map(normalizeSpotifyTrack);
}

module.exports = {
  normalizeSpotifyTrack,
  normalizeSpotifyTracks
};
