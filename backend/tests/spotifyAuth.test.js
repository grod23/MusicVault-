const request = require("supertest");

jest.mock("../src/services/spotifyService", () => ({
  exchangeCodeForTokens: jest.fn(),
  getSpotifyProfile: jest.fn(),
  getTop100Tracks: jest.fn()
}));

const {
  exchangeCodeForTokens,
  getSpotifyProfile
} = require("../src/services/spotifyService");

const app = require("../src/app");

describe("Spotify authentication routes", () => {
  beforeEach(() => {
    process.env.SPOTIFY_CLIENT_ID = "test-client-id";
    process.env.SPOTIFY_CLIENT_SECRET = "test-client-secret";
    process.env.SPOTIFY_REDIRECT_URI =
      "http://127.0.0.1:3001/api/auth/spotify/callback";

    exchangeCodeForTokens.mockReset();
    getSpotifyProfile.mockReset();
  });

  async function beginSpotifyAuth(agent) {
    const response = await agent
      .get("/api/auth/spotify")
      .expect(302);

    const redirectUrl = new URL(response.headers.location);
    const state = redirectUrl.searchParams.get("state");

    expect(state).toBeTruthy();

    return state;
  }

  function mockSuccessfulConnection() {
    exchangeCodeForTokens.mockResolvedValue({
      access_token: "fake-access-token",
      refresh_token: "fake-refresh-token",
      expires_in: 3600
    });

    getSpotifyProfile.mockResolvedValue({
      id: "test-spotify-user",
      display_name: "MusicVault Test User"
    });
  }

  test("GET /api/auth/spotify redirects to Spotify", async () => {
    const response = await request(app)
      .get("/api/auth/spotify")
      .expect(302);

    expect(response.headers.location)
      .toContain("https://accounts.spotify.com/authorize");
  });

  test("Spotify redirect includes correct OAuth parameters", async () => {
    const response = await request(app)
      .get("/api/auth/spotify")
      .expect(302);

    const url = new URL(response.headers.location);

    expect(url.searchParams.get("client_id"))
      .toBe("test-client-id");

    expect(url.searchParams.get("response_type"))
      .toBe("code");

    expect(url.searchParams.get("redirect_uri"))
      .toBe(process.env.SPOTIFY_REDIRECT_URI);

    expect(url.searchParams.get("scope"))
      .toContain("user-read-private");

    expect(url.searchParams.get("scope"))
      .toContain("user-read-email");

    expect(url.searchParams.get("scope"))
      .toContain("user-top-read");

    expect(url.searchParams.get("state")).toBeTruthy();
  });

  test("successful callback redirects to MusicVault", async () => {
    const agent = request.agent(app);
    const state = await beginSpotifyAuth(agent);

    mockSuccessfulConnection();

    const response = await agent
      .get("/api/auth/spotify/callback")
      .query({
        code: "valid-code",
        state
      })
      .expect(302);

    expect(response.headers.location)
      .toContain("?spotify=connected");

    expect(exchangeCodeForTokens)
      .toHaveBeenCalledWith("valid-code");

    expect(getSpotifyProfile)
      .toHaveBeenCalledWith("fake-access-token");
  });

  test("connection status returns Spotify display name", async () => {
    const agent = request.agent(app);
    const state = await beginSpotifyAuth(agent);

    mockSuccessfulConnection();

    await agent
      .get("/api/auth/spotify/callback")
      .query({
        code: "valid-code",
        state
      })
      .expect(302);

    const response = await agent
      .get("/api/auth/spotify/status")
      .expect(200);

    expect(response.body).toEqual({
      connected: true,
      displayName: "MusicVault Test User"
    });
  });

  test("connection status does not expose Spotify tokens", async () => {
    const agent = request.agent(app);
    const state = await beginSpotifyAuth(agent);

    mockSuccessfulConnection();

    await agent
      .get("/api/auth/spotify/callback")
      .query({
        code: "valid-code",
        state
      })
      .expect(302);

    const response = await agent
      .get("/api/auth/spotify/status")
      .expect(200);

    const body = JSON.stringify(response.body);

    expect(body).not.toContain("fake-access-token");
    expect(body).not.toContain("fake-refresh-token");
  });

  test("connection status reports disconnected without a session", async () => {
    const response = await request(app)
      .get("/api/auth/spotify/status")
      .expect(200);

    expect(response.body).toEqual({
      connected: false,
      displayName: null
    });
  });

  test("Spotify session persists across requests", async () => {
    const agent = request.agent(app);
    const state = await beginSpotifyAuth(agent);

    mockSuccessfulConnection();

    await agent
      .get("/api/auth/spotify/callback")
      .query({
        code: "valid-code",
        state
      })
      .expect(302);

    await agent
      .get("/api/auth/spotify/status")
      .expect(200)
      .expect((res) => {
        expect(res.body.connected).toBe(true);
      });

    await agent
      .get("/api/auth/spotify/status")
      .expect(200)
      .expect((res) => {
        expect(res.body.connected).toBe(true);
      });
  });

  test("Spotify can be reconnected multiple times", async () => {
    const agent = request.agent(app);

    mockSuccessfulConnection();

    for (let attempt = 0; attempt < 3; attempt++) {
      const state = await beginSpotifyAuth(agent);

      await agent
        .get("/api/auth/spotify/callback")
        .query({
          code: `valid-code-${attempt}`,
          state
        })
        .expect(302);
    }

    expect(exchangeCodeForTokens)
      .toHaveBeenCalledTimes(3);

    const response = await agent
      .get("/api/auth/spotify/status")
      .expect(200);

    expect(response.body.connected).toBe(true);
  });

  test("authorization denial redirects back to MusicVault", async () => {
    const agent = request.agent(app);
    const state = await beginSpotifyAuth(agent);

    const response = await agent
      .get("/api/auth/spotify/callback")
      .query({
        error: "access_denied",
        state
      })
      .expect(302);

    expect(response.headers.location)
      .toContain("?spotify=denied");

    expect(exchangeCodeForTokens).not.toHaveBeenCalled();
  });

  test("missing authorization code returns an error", async () => {
    const agent = request.agent(app);
    const state = await beginSpotifyAuth(agent);

    const response = await agent
      .get("/api/auth/spotify/callback")
      .query({ state })
      .expect(400);

    expect(response.body.error)
      .toBe("SPOTIFY_CODE_MISSING");

    expect(exchangeCodeForTokens).not.toHaveBeenCalled();
  });

  test("token exchange failure returns a safe error", async () => {
    const agent = request.agent(app);
    const state = await beginSpotifyAuth(agent);

    exchangeCodeForTokens.mockRejectedValue(
      new Error("secret-spotify-error")
    );

    const response = await agent
      .get("/api/auth/spotify/callback")
      .query({
        code: "invalid-code",
        state
      })
      .expect(502);

    expect(response.body.error)
      .toBe("SPOTIFY_TOKEN_EXCHANGE_FAILED");

    expect(JSON.stringify(response.body))
      .not.toContain("secret-spotify-error");
  });

  test("profile failure does not prevent Spotify connection", async () => {
    const agent = request.agent(app);
    const state = await beginSpotifyAuth(agent);

    exchangeCodeForTokens.mockResolvedValue({
      access_token: "fake-access-token",
      refresh_token: "fake-refresh-token",
      expires_in: 3600
    });

    getSpotifyProfile.mockRejectedValue(
      new Error("Profile unavailable")
    );

    await agent
      .get("/api/auth/spotify/callback")
      .query({
        code: "valid-code",
        state
      })
      .expect(302);

    const response = await agent
      .get("/api/auth/spotify/status")
      .expect(200);

    expect(response.body).toEqual({
      connected: true,
      displayName: "Spotify User"
    });
  });

  test("SECURITY: missing OAuth state is rejected", async () => {
    const response = await request(app)
      .get("/api/auth/spotify/callback")
      .query({ code: "valid-code" })
      .expect(400);

    expect(response.body.error)
      .toBe("SPOTIFY_INVALID_STATE");
  });

  test("SECURITY: invalid OAuth state is rejected", async () => {
    const agent = request.agent(app);

    await beginSpotifyAuth(agent);

    const response = await agent
      .get("/api/auth/spotify/callback")
      .query({
        code: "valid-code",
        state: "invalid-state"
      })
      .expect(400);

    expect(response.body.error)
      .toBe("SPOTIFY_INVALID_STATE");
  });

  test("SECURITY: OAuth state cannot be reused", async () => {
    const agent = request.agent(app);
    const state = await beginSpotifyAuth(agent);

    mockSuccessfulConnection();

    await agent
      .get("/api/auth/spotify/callback")
      .query({
        code: "first-code",
        state
      })
      .expect(302);

    await agent
      .get("/api/auth/spotify/callback")
      .query({
        code: "second-code",
        state
      })
      .expect(400);

    expect(exchangeCodeForTokens)
      .toHaveBeenCalledTimes(1);
  });
});