const request = require("supertest");

jest.mock("../src/services/recommendationService", () => ({
  getRecommendations: jest.fn(),
}));

const recommendationService = require("../src/services/recommendationService");
const app = require("../src/app");

describe("Recommendation API validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    recommendationService.getRecommendations.mockResolvedValue([]);
  });

  test("GET /api/v1/recommendations accepts a valid limit", async () => {
    const response = await request(app)
      .get("/api/v1/recommendations?limit=5");

    expect(response.status).toBe(200);
  });

  test("rejects limit below 1", async () => {
    const response = await request(app)
      .get("/api/v1/recommendations?limit=0");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "limit must be an integer between 1 and 50"
    );
  });

  test("rejects limit above 50", async () => {
    const response = await request(app)
      .get("/api/v1/recommendations?limit=51");

    expect(response.status).toBe(400);
  });

  test("rejects non-numeric limit", async () => {
    const response = await request(app)
      .get("/api/v1/recommendations?limit=abc");

    expect(response.status).toBe(400);
  });

  test("rejects decimal limit", async () => {
    const response = await request(app)
      .get("/api/v1/recommendations?limit=5.5");

    expect(response.status).toBe(400);
  });
});
