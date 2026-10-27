jest.mock("../src/config/database", () => ({
  query: jest.fn(),
}));

const pool = require("../src/config/database");
const recommendationService = require(
  "../src/services/recommendationService"
);

describe("Recommendation service integration", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();

    pool.query.mockResolvedValue({
      rows: [
        {
          id: 1,
          title: "Believer",
          artist: "Imagine Dragons",
          genre: "rock",
          mood: "energetic",
          popularity: 90,
        },
        {
          id: 2,
          title: "Yellow",
          artist: "Coldplay",
          genre: "rock",
          mood: "calm",
          popularity: 85,
        },
      ],
    });

    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("sends PostgreSQL songs to Python ranking engine", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        recommendations: [
          { id: 1, title: "Believer", score: 99 },
          { id: 2, title: "Yellow", score: 68.5 },
        ],
        total: 2,
      }),
    });

    const results =
      await recommendationService.getRecommendations({
        genre: "rock",
        mood: "energetic",
        limit: 5,
      });

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url, options] = global.fetch.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(url).toBe(
      process.env.RECOMMENDATION_ENGINE_URL ||
        "http://127.0.0.1:8000/rank"
    );

    expect(options.method).toBe("POST");
    expect(body.songs).toHaveLength(2);
    expect(body.genre).toBe("rock");
    expect(body.mood).toBe("energetic");
    expect(body.limit).toBe(5);

    expect(results).toHaveLength(2);
    expect(results[0].score).toBe(99);
  });

  test("returns empty recommendations from Python", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        recommendations: [],
        total: 0,
      }),
    });

    const results =
      await recommendationService.getRecommendations();

    expect(results).toEqual([]);
  });

  test("handles Python recommendation service errors", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(
      recommendationService.getRecommendations()
    ).rejects.toThrow(
      "Recommendation engine returned 500"
    );
  });

  test("handles Python service connection failures", async () => {
    global.fetch.mockRejectedValue(
      new Error("Connection refused")
    );

    await expect(
      recommendationService.getRecommendations()
    ).rejects.toThrow("Connection refused");
  });

  test("limits recommendations to maximum of 50", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        recommendations: [],
        total: 0,
      }),
    });

    await recommendationService.getRecommendations({
      limit: 100,
    });

    const body = JSON.parse(
      global.fetch.mock.calls[0][1].body
    );

    expect(body.limit).toBe(50);
  });

  test("handles PostgreSQL query failures", async () => {
    pool.query.mockRejectedValue(
      new Error("Database unavailable")
    );

    await expect(
      recommendationService.getRecommendations()
    ).rejects.toThrow("Database unavailable");

    expect(global.fetch).not.toHaveBeenCalled();
  });
});