const request = require("supertest");
const app = require("../src/app");

describe("404 handling", () => {
  test("returns 404 for an unknown route", async () => {
    const response = await request(app).get("/api/v1/does-not-exist");

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Route not found",
    });
  });
});
