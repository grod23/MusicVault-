
const express = require("express");
const request = require("supertest");
const errorHandler = require("../src/middleware/errorHandler");

describe("Backend API Error Handling", () => {
  let app;
  let consoleSpy;

  beforeEach(() => {
    app = express();

    consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => { });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  function setupErrorRoute(error) {
    app.get("/test-error", (req, res, next) => {
      next(error);
    });

    app.use(errorHandler);
  }

  test("returns a 400 response for validation errors", async () => {
    const error = new Error("Invalid request parameters");
    error.status = 400;

    setupErrorRoute(error);

    const response = await request(app).get("/test-error");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid request parameters");
  });

  test("hides internal details for server errors", async () => {
    const error = new Error("Database password or connection failed");
    error.status = 500;

    setupErrorRoute(error);

    const response = await request(app).get("/test-error");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Internal server error");
    expect(response.text).not.toContain(
      "Database password or connection failed"
    );
  });

  test("defaults to 500 for invalid error status codes", async () => {
    const error = new Error("Unexpected error");
    error.status = 200;

    setupErrorRoute(error);

    const response = await request(app).get("/test-error");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Internal server error");
  });

  test("defaults to 500 for errors without a status", async () => {
    setupErrorRoute(new Error("Unexpected failure"));

    const response = await request(app).get("/test-error");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Internal server error");
  });

  test("does not log expected validation errors", async () => {
    const error = new Error("Invalid input");
    error.status = 400;

    setupErrorRoute(error);

    await request(app).get("/test-error").expect(400);

    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
