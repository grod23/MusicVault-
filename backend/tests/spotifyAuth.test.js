
const request = require("supertest");

jest.mock("../src/services/spotifyService", () => ({
  exchangeCodeForTokens: jest.fn(),
  getTop100Tracks: jest.fn()
}));

const {
  exchangeCodeForTokens
} = require("../src/services/spotifyService");

const app = require("../src/app");

describe("Spotify authentication routes", () => {
  beforeEach(() => {
    process.env.SPOTIFY_CLIENT_ID = "test-client-id";
    process.env.SPOTIFY_CLIENT_SECRET = "test-client-secret";
    process.env.SPOTIFY_REDIRECT_URI =
      "http://127.0.0.1:3001/api/auth/spotify/callback";

    exchangeCodeForTokens.mockReset();
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

  test("GET /api/auth/spotify redirects to Spotify", async () => {
    const response = await request(app)
      .get("/api/auth/spotify")
      .expect(302);

    expect(response.headers.location)
      .toContain("https://accounts.spotify.com/authorize");
  });

  test("Spotify redirect includes the client id", async () => {
    const response = await request(app)
      .get("/api/auth/spotify")
      .expect(302);

    const redirectUrl = new URL(response.headers.location);

    expect(redirectUrl.searchParams.get("client_id"))
      .toBe("test-client-id");
  });

  test("Spotify redirect requests authorization code flow", async () => {
    const response = await request(app)
      .get("/api/auth/spotify")
      .expect(302);

    const redirectUrl = new URL(response.headers.location);

    expect(redirectUrl.searchParams.get("response_type"))
      .toBe("code");
  });

  test("Spotify redirect contains the configured redirect URI", async () => {
    const response = await request(app)
      .get("/api/auth/spotify")
      .expect(302);

    const redirectUrl = new URL(response.headers.location);

    expect(redirectUrl.searchParams.get("redirect_uri"))
      .toBe(
        "http://127.0.0.1:3001/api/auth/spotify/callback"
      );
  });

  test("Spotify redirect requests expected scopes", async () => {
    const response = await request(app)
      .get("/api/auth/spotify")
      .expect(302);

    const redirectUrl = new URL(response.headers.location);
    const scope = redirectUrl.searchParams.get("scope");

    expect(scope).toContain("user-read-private");
    expect(scope).toContain("user-read-email");
    expect(scope).toContain("user-top-read");
  });

  test("Spotify redirect includes a state value", async () => {
    const response = await request(app)
      .get("/api/auth/spotify")
      .expect(302);

    const redirectUrl = new URL(response.headers.location);
    const state = redirectUrl.searchParams.get("state");

    expect(state).toBeTruthy();
    expect(state.length).toBeGreaterThan(0);
  });

  test("callback exchanges authorization code for tokens", async () => {
    const agent = request.agent(app);
    const state = await beginSpotifyAuth(agent);

    exchangeCodeForTokens.mockResolvedValue({
      access_token: "fake-access-token",
      refresh_token: "fake-refresh-token",
      expires_in: 3600
    });

    const response = await agent
      .get("/api/auth/spotify/callback")
      .query({
        code: "spotify-test-code",
        state
      })
      .expect(200);

    expect(exchangeCodeForTokens).toHaveBeenCalledTimes(1);
    expect(exchangeCodeForTokens)
      .toHaveBeenCalledWith("spotify-test-code");

    expect(response.body).toEqual({
      success: true,
      message: "Spotify authentication successful",
      expiresIn: 3600
    });

    expect(JSON.stringify(response.body))
      .not.toContain("fake-access-token");

    expect(JSON.stringify(response.body))
      .not.toContain("fake-refresh-token");
  });

  test("callback rejects request when authorization code is missing", async () => {
    const agent = request.agent(app);
    const state = await beginSpotifyAuth(agent);

    const response = await agent
      .get("/api/auth/spotify/callback")
      .query({ state })
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: "Spotify authorization code was not provided"
    });

    expect(exchangeCodeForTokens).not.toHaveBeenCalled();
  });

  test("callback handles Spotify authorization denial", async () => {
    const agent = request.agent(app);
    const state = await beginSpotifyAuth(agent);

    const response = await agent
      .get("/api/auth/spotify/callback")
      .query({
        error: "access_denied",
        state
      })
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: "Spotify authorization was denied"
    });

    expect(exchangeCodeForTokens).not.toHaveBeenCalled();
  });

  test("callback handles token exchange failure", async () => {
    const agent = request.agent(app);
    const state = await beginSpotifyAuth(agent);

    exchangeCodeForTokens.mockRejectedValue(
      new Error("Spotify rejected authorization code")
    );

    const response = await agent
      .get("/api/auth/spotify/callback")
      .query({
        code: "invalid-code",
        state
      })
      .expect(500);

    expect(exchangeCodeForTokens)
      .toHaveBeenCalledWith("invalid-code");

    expect(response.body).toEqual({
      success: false,
      message: "Spotify token exchange failed"
    });
  });

  test("SECURITY: callback rejects missing OAuth state", async () => {
    exchangeCodeForTokens.mockResolvedValue({
      access_token: "dummy-access-token",
      refresh_token: "dummy-refresh-token",
      expires_in: 3600
    });

    const response = await request(app)
      .get("/api/auth/spotify/callback")
      .query({ code: "dummy-authorization-code" })
      .expect(400);

    expect(exchangeCodeForTokens).not.toHaveBeenCalled();
  });

  test("SECURITY: callback rejects invalid OAuth state", async () => {
    const agent = request.agent(app);
    await beginSpotifyAuth(agent);

    const response = await agent
      .get("/api/auth/spotify/callback")
      .query({
        code: "dummy-authorization-code",
        state: "incorrect-oauth-state"
      })
      .expect(400);

    expect(exchangeCodeForTokens).not.toHaveBeenCalled();
  });

  test("SECURITY: OAuth state cannot be reused", async () => {
    const agent = request.agent(app);
    const state = await beginSpotifyAuth(agent);

    exchangeCodeForTokens.mockResolvedValue({
      access_token: "dummy-access-token",
      refresh_token: "dummy-refresh-token",
      expires_in: 3600
    });

    await agent
      .get("/api/auth/spotify/callback")
      .query({ code: "first-code", state })
      .expect(200);

    await agent
      .get("/api/auth/spotify/callback")
      .query({ code: "second-code", state })
      .expect(400);

    expect(exchangeCodeForTokens).toHaveBeenCalledTimes(1);
  });
});
