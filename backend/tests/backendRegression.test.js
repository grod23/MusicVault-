const request = require("supertest");
const app = require("../src/app");

describe("Sprint 4 Backend Integration and Regression Tests", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest
      .spyOn(console, "info")
      .mockImplementation(() => { });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("health endpoint includes status and request ID", async () => {
    const response = await request(app)
      .get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("musicvault-backend");
    expect(response.headers["x-request-id"]).toBeDefined();
  });

  test("unknown route preserves request tracking", async () => {
    const response = await request(app)
      .get("/api/v1/unknown-route");

    expect(response.status).toBe(404);
    expect(response.headers["x-request-id"]).toBeDefined();
    expect(response.body.error).toBe("Route not found");
  });

  test("invalid recommendation request preserves response format", async () => {
    const response = await request(app)
      .get("/api/v1/recommendations?limit=-1");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "limit must be an integer between 1 and 50"
    );
    expect(response.headers["x-request-id"]).toBeDefined();
  });

  test("failed API requests generate security events", async () => {
    const logs = [];

    consoleSpy.mockImplementation((message) => {
      logs.push(JSON.parse(message));
    });

    await request(app)
      .get("/api/v1/recommendations?limit=-1")
      .expect(400);

    expect(logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: "INVALID_API_REQUEST",
          statusCode: 400
        })
      ])
    );
  });

  test("valid health requests do not generate security events", async () => {
    const logs = [];

    consoleSpy.mockImplementation((message) => {
      logs.push(JSON.parse(message));
    });

    await request(app)
      .get("/api/v1/health")
      .expect(200);

    expect(logs).toHaveLength(0);
  });

  test("client-provided request IDs are replaced", async () => {
    const response = await request(app)
      .get("/api/v1/health")
      .set("X-Request-ID", "client-generated-id");

    expect(response.status).toBe(200);
    expect(response.headers["x-request-id"]).not.toBe(
      "client-generated-id"
    );
  });
});
