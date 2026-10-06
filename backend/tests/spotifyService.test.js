const {
  getTopTracks
} = require("../src/services/spotifyService");

describe("Spotify Service - getTopTracks", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns top tracks from Spotify", async () => {
    const mockSpotifyResponse = {
      items: [
        {
          id: "track1",
          name: "Test Song",
          artists: [
            {
              id: "artist1",
              name: "Test Artist"
            }
          ]
        }
      ]
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest
        .fn()
        .mockResolvedValue(mockSpotifyResponse)
    });

    const result = await getTopTracks(
      "fake-access-token"
    );

    expect(result).toEqual(mockSpotifyResponse);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("sends the access token as a Bearer token", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        items: []
      })
    });

    await getTopTracks("test-access-token");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "https://api.spotify.com/v1/me/top/tracks"
      ),
      expect.objectContaining({
        method: "GET",
        headers: {
          Authorization:
            "Bearer test-access-token"
        }
      })
    );
  });

  test("uses default pagination parameters", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        items: []
      })
    });

    await getTopTracks("test-access-token");

    const requestedUrl =
      fetch.mock.calls[0][0];

    expect(requestedUrl).toContain(
      "limit=20"
    );

    expect(requestedUrl).toContain(
      "offset=0"
    );

    expect(requestedUrl).toContain(
      "time_range=medium_term"
    );
  });

  test("uses custom limit and offset values", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        items: []
      })
    });

    await getTopTracks(
      "test-access-token",
      50,
      25
    );

    const requestedUrl =
      fetch.mock.calls[0][0];

    expect(requestedUrl).toContain(
      "limit=50"
    );

    expect(requestedUrl).toContain(
      "offset=25"
    );
  });

  test("throws an error when Spotify returns 401", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401
    });

    await expect(
      getTopTracks("expired-token")
    ).rejects.toThrow(
      "Spotify top tracks request failed: 401"
    );
  });

  test("throws an error when Spotify returns 500", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500
    });

    await expect(
      getTopTracks("test-access-token")
    ).rejects.toThrow(
      "Spotify top tracks request failed: 500"
    );
  });
});