
const express = require("express");
const request = require("supertest");
const app = require("../src/app");
const requestId = require("../src/middleware/requestId");
const errorHandler = require("../src/middleware/errorHandler");

describe("Backend Request ID Tracking", () => {
  test("assigns a request ID to successful requests", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-request-id"]).toBeDefined();
    expect(response.headers["x-request-id"]).toEqual(
      expect.any(String)
    );
  });

  test("generates unique IDs for different requests", async () => {
    const first = await request(app).get("/api/v1/health");
    const second = await request(app).get("/api/v1/health");

    expect(first.headers["x-request-id"]).not.toBe(
      second.headers["x-request-id"]
    );
  });

  test("assigns a request ID to unknown routes", async () => {
    const response = await request(app).get("/api/v1/unknown");

    expect(response.statusCode).toBe(404);
    expect(response.headers["x-request-id"]).toBeDefined();
  });

  test("does not trust client-provided request IDs", async () => {
    const response = await request(app)
      .get("/api/v1/health")
      .set("X-Request-ID", "fake-client-id");

    expect(response.headers["x-request-id"]).toBeDefined();
    expect(response.headers["x-request-id"]).not.toBe(
      "fake-client-id"
    );
  });

  test("includes matching request IDs in shared error responses", async () => {
    const testApp = express();

    testApp.use(requestId);

    testApp.get("/test-error", (req, res, next) => {
      const error = new Error("Test validation error");
      error.status = 400;
      next(error);
    });

    testApp.use(errorHandler);

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => { });

    try {
      const response = await request(testApp)
        .get("/test-error");

      expect(response.statusCode).toBe(400);

      expect(response.headers["x-request-id"]).toBeDefined();

      expect(response.body.requestId).toBe(
        response.headers["x-request-id"]
      );

      expect(response.body.error).toBe(
        "Test validation error"
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });
});
