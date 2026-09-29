const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/config/database");

jest.mock("../src/config/database", () => ({
  query: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe("User API", () => {
  test("GET /api/v1/users/:userId/profile returns profile", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          email: "user@example.com",
          display_name: "Test User",
        },
      ],
    });

    const response = await request(app).get("/api/v1/users/1/profile");

    expect(response.status).toBe(200);
    expect(response.body.profile.id).toBe(1);
    expect(response.body.profile.display_name).toBe("Test User");
  });

  test("PUT /api/v1/users/:userId/profile updates profile", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          email: "user@example.com",
          display_name: "Updated User",
        },
      ],
    });

    const response = await request(app)
      .put("/api/v1/users/1/profile")
      .send({
        displayName: "Updated User",
      });

    expect(response.status).toBe(200);
    expect(response.body.profile.display_name).toBe("Updated User");
  });

  test("GET /api/v1/users/:userId/preferences returns preferences", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          user_id: 1,
          favorite_genres: ["Pop", "Rock"],
          favorite_moods: ["Happy"],
        },
      ],
    });

    const response = await request(app).get(
      "/api/v1/users/1/preferences"
    );

    expect(response.status).toBe(200);
    expect(response.body.preferences.favorite_genres).toEqual([
      "Pop",
      "Rock",
    ]);
  });

  test("PUT /api/v1/users/:userId/preferences saves preferences", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          user_id: 1,
          favorite_genres: ["Pop"],
          favorite_moods: ["Chill"],
        },
      ],
    });

    const response = await request(app)
      .put("/api/v1/users/1/preferences")
      .send({
        favoriteGenres: ["Pop"],
        favoriteMoods: ["Chill"],
      });

    expect(response.status).toBe(200);
    expect(response.body.preferences.favorite_moods).toEqual([
      "Chill",
    ]);
  });

  test("POST /api/v1/users/:userId/favorites adds favorite song", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          user_id: 1,
          song_id: 5,
        },
      ],
    });

    const response = await request(app)
      .post("/api/v1/users/1/favorites")
      .send({
        songId: 5,
      });

    expect(response.status).toBe(201);
    expect(response.body.favorite.song_id).toBe(5);
  });

  test("GET /api/v1/users/:userId/favorites returns favorite songs", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 5,
          title: "Favorite Song",
          artist: "Test Artist",
          album: "Test Album",
          genre: "Pop",
          mood: "Happy",
          tempo: 120,
          audio_url: "/audio/favorite.mp3",
        },
      ],
    });

    const response = await request(app).get(
      "/api/v1/users/1/favorites"
    );

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.songs[0].title).toBe("Favorite Song");
  });
});
