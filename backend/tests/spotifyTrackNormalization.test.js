
const {
  normalizeSpotifyTrack,
  normalizeSpotifyTracks
} = require("../src/services/spotifyTrackNormalizer");

describe("Spotify Track Normalization", () => {
  const sampleTrack = {
    id: "spotify123",
    name: "Believer",
    artists: [{ name: "Imagine Dragons" }],
    album: {
      name: "Evolve",
      images: [{ url: "https://example.com/cover.jpg" }]
    },
    duration_ms: 204000,
    popularity: 85,
    external_urls: {
      spotify: "https://open.spotify.com/track/spotify123"
    }
  };

  test("normalizes a complete Spotify track", () => {
    expect(normalizeSpotifyTrack(sampleTrack)).toEqual({
      spotifyId: "spotify123",
      title: "Believer",
      artist: "Imagine Dragons",
      album: "Evolve",
      coverUrl: "https://example.com/cover.jpg",
      durationMs: 204000,
      popularity: 85,
      spotifyUrl: "https://open.spotify.com/track/spotify123"
    });
  });

  test("handles multiple artists", () => {
    const track = {
      ...sampleTrack,
      artists: [{ name: "Artist One" }, { name: "Artist Two" }]
    };

    expect(normalizeSpotifyTrack(track).artist)
      .toBe("Artist One, Artist Two");
  });

  test("handles missing optional metadata", () => {
    const result = normalizeSpotifyTrack({
      id: "123",
      name: "Test Song"
    });

    expect(result.artist).toBe("Unknown Artist");
    expect(result.album).toBeNull();
    expect(result.coverUrl).toBeNull();
    expect(result.durationMs).toBeNull();
    expect(result.popularity).toBeNull();
    expect(result.spotifyUrl).toBeNull();
  });

  test("handles an empty artists array", () => {
    const result = normalizeSpotifyTrack({
      ...sampleTrack,
      artists: []
    });

    expect(result.artist).toBe("Unknown Artist");
  });

  test.each([null, undefined, [], "invalid"])(
    "rejects invalid track objects",
    (track) => {
      expect(() => normalizeSpotifyTrack(track))
        .toThrow("Invalid Spotify track");
    }
  );

  test("rejects tracks without required fields", () => {
    expect(() => normalizeSpotifyTrack({ name: "Song" }))
      .toThrow("Spotify track must have an id and name");

    expect(() => normalizeSpotifyTrack({ id: "123" }))
      .toThrow("Spotify track must have an id and name");
  });

  test("normalizes multiple tracks", () => {
    const result = normalizeSpotifyTracks([
      sampleTrack,
      { id: "456", name: "Second Song" }
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].spotifyId).toBe("spotify123");
    expect(result[1].title).toBe("Second Song");
  });

  test("rejects a non-array track collection", () => {
    expect(() => normalizeSpotifyTracks(null))
      .toThrow("Spotify tracks must be an array");
  });

  test("does not modify the original Spotify track", () => {
    const original = JSON.parse(JSON.stringify(sampleTrack));

    normalizeSpotifyTrack(sampleTrack);

    expect(sampleTrack).toEqual(original);
  });
});
