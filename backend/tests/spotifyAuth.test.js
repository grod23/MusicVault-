const request = require("supertest");
const app = require("../src/app");

describe("Spotify authentication routes", () => {
  beforeEach(() => {
    process.env.SPOTIFY_CLIENT_ID = "test-client-id";
    process.env.SPOTIFY_CLIENT_SECRET = "test-client-secret";
    process.env.SPOTIFY_REDIRECT_URI =
      "http://127.0.0.1:3001/api/auth/spotify/callback";
  });

  test("GET /api/auth/spotify redirects to Spotify", async () => {
    const response = await request(app)
      .get("/api/auth/spotify")
      .expect(302);

    expect(response.headers.location).toContain(
      "https://accounts.spotify.com/authorize"
    );
  });

  test("Spotify redirect includes the client id", async () => {
    const response = await request(app)
      .get("/api/auth/spotify")
      .expect(302);

    expect(response.headers.location).toContain(
      "client_id=test-client-id"
    );
  });

  test("Spotify redirect requests authorization code flow", async () => {
    const response = await request(app)
      .get("/api/auth/spotify")
      .expect(302);

    expect(response.headers.location).toContain(
      "response_type=code"
    );
  });

  test("Spotify redirect contains the configured redirect URI", async () => {
    const response = await request(app)
      .get("/api/auth/spotify")
      .expect(302);

    const redirectUrl = new URL(response.headers.location);

    expect(
      redirectUrl.searchParams.get("redirect_uri")
    ).toBe(
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

  test("GET /api/auth/spotify/callback succeeds when code is provided", async () => {
    const response = await request(app)
      .get("/api/auth/spotify/callback")
      .query({
        code: "spotify-test-code",
        state: "test-state"
      })
      .expect(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
      "Spotify authorization callback received"
    );

    expect(response.body.code).toBe(
      "spotify-test-code"
    );
  });

  test("callback rejects request when authorization code is missing", async () => {
    const response = await request(app)
      .get("/api/auth/spotify/callback")
      .query({
        state: "test-state"
      })
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: "Spotify authorization code was not provided"
    });
  });

  test("callback handles Spotify authorization denial", async () => {
    const response = await request(app)
      .get("/api/auth/spotify/callback")
      .query({
        error: "access_denied",
        state: "test-state"
      })
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: "Spotify authorization was denied"
    });
  });
});