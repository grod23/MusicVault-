const request = require("supertest");

jest.mock("../src/services/recommendationService", () => ({
  getRecommendations: jest.fn(),
}));

const recommendationService = require("../src/services/recommendationService");
const app = require("../src/app");

describe("Recommendation edge-case and regression tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    recommendationService.getRecommendations.mockResolvedValue([]);
  });

  test("accepts minimum valid limit of 1", async () => {
    const response = await request(app)
      .get("/api/v1/recommendations?limit=1");

    expect(response.status).toBe(200);
  });

  test("accepts maximum valid limit of 50", async () => {
    const response = await request(app)
      .get("/api/v1/recommendations?limit=50");

    expect(response.status).toBe(200);
  });

  test("works when no optional filters are provided", async () => {
    const response = await request(app)
      .get("/api/v1/recommendations");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("recommendations");
    expect(response.body).toHaveProperty("total");
  });

  test("handles empty genre and mood values without crashing", async () => {
    const response = await request(app)
      .get("/api/v1/recommendations?genre=&mood=");

    expect(response.status).toBe(200);
  });

  test("returns multiple recommendation results correctly", async () => {
    recommendationService.getRecommendations.mockResolvedValue([
      {
        id: 1,
        title: "Song One",
        artist: "Artist One",
      },
      {
        id: 2,
        title: "Song Two",
        artist: "Artist Two",
      },
    ]);

    const response = await request(app)
      .get("/api/v1/recommendations");

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.recommendations).toHaveLength(2);
  });

  test("health endpoint still works after recommendation changes", async () => {
    const response = await request(app)
      .get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  test("unknown API route still returns 404", async () => {
    const response = await request(app)
      .get("/api/v1/does-not-exist");

    expect(response.status).toBe(404);
  });
});
