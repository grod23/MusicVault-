const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/config/database");

jest.mock("../src/config/database", () => ({
  query: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe("Song API", () => {
  test("GET /api/v1/songs returns songs with pagination", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ total: "2" }],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            title: "Song One",
            artist: "Artist One",
            album: "Album One",
            genre: "Pop",
            mood: "Happy",
            tempo: 120,
            audio_url: "/audio/song1.mp3",
          },
          {
            id: 2,
            title: "Song Two",
            artist: "Artist Two",
            album: "Album Two",
            genre: "Rock",
            mood: "Energetic",
            tempo: 130,
            audio_url: "/audio/song2.mp3",
          },
        ],
      });

    const response = await request(app).get("/api/v1/songs");

    expect(response.status).toBe(200);
    expect(response.body.songs).toHaveLength(2);
    expect(response.body.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
    });
  });

  test("GET /api/v1/songs supports search", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ total: "1" }],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            title: "Midnight Drive",
            artist: "Example Artist",
            album: "Night",
            genre: "Pop",
            mood: "Chill",
            tempo: 100,
            audio_url: "/audio/midnight.mp3",
          },
        ],
      });

    const response = await request(app)
      .get("/api/v1/songs")
      .query({ search: "midnight" });

    expect(response.status).toBe(200);
    expect(response.body.songs).toHaveLength(1);

    expect(pool.query.mock.calls[0][1]).toContain("%midnight%");
  });

  test("GET /api/v1/songs supports genre and mood filters", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ total: "1" }],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 3,
            title: "Good Day",
            artist: "Example",
            album: "Example Album",
            genre: "Pop",
            mood: "Happy",
            tempo: 125,
            audio_url: "/audio/good-day.mp3",
          },
        ],
      });

    const response = await request(app)
      .get("/api/v1/songs")
      .query({
        genre: "Pop",
        mood: "Happy",
      });

    expect(response.status).toBe(200);
    expect(response.body.songs).toHaveLength(1);

    expect(pool.query.mock.calls[0][1]).toEqual([
      "Pop",
      "Happy",
    ]);
  });

  test("GET /api/v1/songs supports pagination", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ total: "40" }],
      })
      .mockResolvedValueOnce({
        rows: [],
      });

    const response = await request(app)
      .get("/api/v1/songs")
      .query({
        page: 2,
        limit: 10,
      });

    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 40,
      totalPages: 4,
    });

    expect(pool.query.mock.calls[1][1]).toEqual([
      10,
      10,
    ]);
  });

  test("GET /api/v1/songs/:songId returns one song", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 5,
          title: "Test Song",
          artist: "Test Artist",
          album: "Test Album",
          genre: "Pop",
          mood: "Happy",
          tempo: 120,
          audio_url: "/audio/test.mp3",
        },
      ],
    });

    const response = await request(app).get("/api/v1/songs/5");

    expect(response.status).toBe(200);
    expect(response.body.song.id).toBe(5);
    expect(response.body.song.title).toBe("Test Song");

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE id = $1"),
      ["5"]
    );
  });

  test("GET /api/v1/songs/:songId returns 404 when song does not exist", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [],
    });

    const response = await request(app).get("/api/v1/songs/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Song not found",
    });
  });

  test("GET /api/v1/songs/top100 returns ranked songs", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          rank: 1,
          id: 10,
          title: "Top Song",
          artist: "Top Artist",
          album: "Top Album",
          genre: "Pop",
          mood: "Happy",
          tempo: 120,
          audio_url: "/audio/top-song.mp3",
        },
        {
          rank: 2,
          id: 11,
          title: "Second Song",
          artist: "Second Artist",
          album: "Second Album",
          genre: "Rock",
          mood: "Energetic",
          tempo: 130,
          audio_url: "/audio/second-song.mp3",
        },
      ],
    });

    const response = await request(app).get("/api/v1/songs/top100");

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.songs).toHaveLength(2);
    expect(response.body.songs[0].rank).toBe(1);
    expect(response.body.songs[1].rank).toBe(2);
  });
});
