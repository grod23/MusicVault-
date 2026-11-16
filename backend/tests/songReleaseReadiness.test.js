
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/config/database");

jest.mock("../src/config/database", () => ({
  query: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe("Sprint 5 Song Release Readiness", () => {
  test("Top 100 returns an empty list when no rankings exist", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .get("/api/v1/songs/top100");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      songs: [],
      total: 0,
    });
  });

  test("Top 100 retrieves ranked songs and limits results to 100", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { rank: 1, id: 10, title: "First", artist: "Artist A", cover_url: null },
        { rank: 2, id: 11, title: "Second", artist: "Artist B", cover_url: null },
      ],
    });

    const response = await request(app)
      .get("/api/v1/songs/top100");

    expect(response.status).toBe(200);
    expect(response.body.songs.map(song => song.rank))
      .toEqual([1, 2]);
    expect(response.body.total).toBe(2);

    const sql = pool.query.mock.calls[0][0];

    expect(sql).toMatch(/JOIN\s+songs\s+s\s+ON\s+gt\.song_id\s*=\s*s\.id/i);
    expect(sql).toMatch(/ORDER BY\s+gt\.rank\s+ASC/i);
    expect(sql).toMatch(/LIMIT\s+100/i);
    expect(sql).toMatch(/s\.cover_url/i);
  });

  test("song details include the required metadata", async () => {
    const song = {
      id: 5,
      title: "Demo Song",
      artist: "Demo Artist",
      album: "Demo Album",
      genre: "Pop",
      mood: "Upbeat",
      tempo: 120,
      audio_url: null,
      cover_url: null,
    };

    pool.query.mockResolvedValueOnce({
      rows: [song],
    });

    const response = await request(app)
      .get("/api/v1/songs/5");

    expect(response.status).toBe(200);
    expect(response.body.song).toEqual(song);

    const sql = pool.query.mock.calls[0][0];

    for (const field of ["album", "genre", "mood", "tempo", "cover_url"]) {
      expect(sql).toMatch(new RegExp(`\\b${field}\\b`));
    }
  });

  test("catalog-only songs work without audio URLs", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ total: "1" }],
      })
      .mockResolvedValueOnce({
        rows: [{
          id: 1,
          title: "Catalog Only",
          artist: "Demo Artist",
          album: "Demo Album",
          genre: "Pop",
          mood: "Calm",
          tempo: 100,
          audio_url: null,
          cover_url: null,
        }],
      });

    const response = await request(app)
      .get("/api/v1/songs");

    expect(response.status).toBe(200);
    expect(response.body.songs).toHaveLength(1);
    expect(response.body.songs[0].audio_url).toBeNull();

    expect(pool.query.mock.calls[1][0])
      .toMatch(/\bcover_url\b/);
  });

  test.each(["abc", "0", "-2", "1.5"])(
    "invalid song ID '%s' returns HTTP 400",
    async (songId) => {
      const response = await request(app)
        .get(`/api/v1/songs/${songId}`);

      expect(response.status).toBe(400);
      expect(response.body.error)
        .toBe("songId must be a positive integer");
      expect(pool.query).not.toHaveBeenCalled();
    }
  );

  test("database errors return a safe response", async () => {
    const errorLog = jest.spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      pool.query.mockRejectedValueOnce(
        new Error("password=private-database-secret")
      );

      const response = await request(app)
        .get("/api/v1/songs/top100");

      expect(response.status).toBe(500);
      expect(response.body.error)
        .toBe("Internal server error");
      expect(response.text)
        .not.toContain("private-database-secret");
    } finally {
      errorLog.mockRestore();
    }
  });
});
