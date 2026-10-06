const {
  getTopTracks,
  getTop100Tracks
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


describe("Spotify Service - getTop100Tracks", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });


  test("retrieves and combines up to 100 top tracks", async () => {
    const first50 = Array.from(
      { length: 50 },
      (_, index) => ({
        id: `track-${index + 1}`,
        name: `Song ${index + 1}`
      })
    );

    const second50 = Array.from(
      { length: 50 },
      (_, index) => ({
        id: `track-${index + 51}`,
        name: `Song ${index + 51}`
      })
    );

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          items: first50
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          items: second50
        })
      });

    const result =
      await getTop100Tracks("test-access-token");

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(100);

    expect(result[0].id).toBe("track-1");
    expect(result[99].id).toBe("track-100");
  });


  test("first top 100 request uses offset 0", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          items: []
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          items: []
        })
      });

    await getTop100Tracks(
      "test-access-token"
    );

    const firstUrl =
      fetch.mock.calls[0][0];

    expect(firstUrl).toContain(
      "limit=50"
    );

    expect(firstUrl).toContain(
      "offset=0"
    );
  });


  test("second top 100 request uses offset 50", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          items: []
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          items: []
        })
      });

    await getTop100Tracks(
      "test-access-token"
    );

    const secondUrl =
      fetch.mock.calls[1][0];

    expect(secondUrl).toContain(
      "limit=50"
    );

    expect(secondUrl).toContain(
      "offset=50"
    );
  });


  test("handles fewer than 100 available tracks", async () => {
    const firstPage = Array.from(
      { length: 30 },
      (_, index) => ({
        id: `track-${index + 1}`
      })
    );

    const secondPage = Array.from(
      { length: 10 },
      (_, index) => ({
        id: `track-${index + 31}`
      })
    );

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          items: firstPage
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          items: secondPage
        })
      });

    const result =
      await getTop100Tracks(
        "test-access-token"
      );

    expect(result).toHaveLength(40);
  });


  test("propagates an error if Spotify fails on the second request", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          items: []
        })
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401
      });

    await expect(
      getTop100Tracks("expired-token")
    ).rejects.toThrow(
      "Spotify top tracks request failed: 401"
    );
  });
});