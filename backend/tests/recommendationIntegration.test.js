const request = require("supertest");

jest.mock("../src/services/recommendationService", () => ({
  getRecommendations: jest.fn(),
}));

const recommendationService = require("../src/services/recommendationService");
const app = require("../src/app");

describe("Recommendation integration flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns recommendation results through the API", async () => {
    recommendationService.getRecommendations.mockResolvedValue([
      {
        id: 1,
        title: "Test Song",
        artist: "Test Artist",
        genre: "rock",
        mood: "energetic",
      },
    ]);

    const response = await request(app)
      .get("/api/v1/recommendations");

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.recommendations).toHaveLength(1);

    expect(recommendationService.getRecommendations).toHaveBeenCalledTimes(1);
  });

  test("returns an empty recommendation list when no matches exist", async () => {
    recommendationService.getRecommendations.mockResolvedValue([]);

    const response = await request(app)
      .get("/api/v1/recommendations");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      recommendations: [],
      total: 0,
    });
  });

  test("passes service errors to the API error handler", async () => {
    recommendationService.getRecommendations.mockRejectedValue(
      new Error("Recommendation service unavailable")
    );

    const response = await request(app)
      .get("/api/v1/recommendations");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe(
      "Recommendation service unavailable"
    );
  });
});
