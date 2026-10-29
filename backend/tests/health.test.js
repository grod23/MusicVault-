
const request = require("supertest");
const app = require("../src/app");

describe("GET /api/v1/health", () => {
  test("returns 200 and backend status", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("musicvault-backend");
  });

  test("includes backend uptime", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.body.uptimeSeconds).toEqual(
      expect.any(Number)
    );
    expect(response.body.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  test("includes a valid timestamp", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.body.timestamp).toEqual(
      expect.any(String)
    );

    expect(Number.isNaN(
      Date.parse(response.body.timestamp)
    )).toBe(false);
  });

  test("returns JSON content", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.headers["content-type"]).toMatch(/json/);
  });
});
