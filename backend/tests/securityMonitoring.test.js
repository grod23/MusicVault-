const request = require("supertest");

describe("CC7.2 Security Event Monitoring", () => {
  let app;
  let monitor;
  let logs;
  let consoleSpy;

  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-11-02T12:00:00Z"));

    logs = [];

    consoleSpy = jest
      .spyOn(console, "info")
      .mockImplementation((message) => {
        logs.push(JSON.parse(message));
      });

    app = require("../src/app");
    monitor = require("../src/services/securityMonitor");
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.useRealTimers();
  });

  test("logs invalid API requests", async () => {
    await request(app)
      .get("/api/v1/recommendations?limit=-1")
      .expect(400);

    expect(logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: "INVALID_API_REQUEST",
          method: "GET",
          statusCode: 400,
          route: expect.stringContaining("recommendations"),
          timestamp: expect.any(String)
        })
      ])
    );
  });

  test("detects five invalid requests within 60 seconds", async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .get("/api/v1/recommendations?limit=-1")
        .expect(400);
    }

    const suspiciousEvents = logs.filter(
      (log) => log.eventType === "SUSPICIOUS_ACTIVITY"
    );

    expect(suspiciousEvents).toHaveLength(1);
    expect(suspiciousEvents[0].attemptCount).toBe(5);
    expect(suspiciousEvents[0].reason).toBe(
      "Repeated invalid API requests"
    );
  });

  test("does not flag requests outside 60 seconds", async () => {
    for (let i = 0; i < 4; i++) {
      await request(app)
        .get("/api/v1/recommendations?limit=-1")
        .expect(400);
    }

    jest.advanceTimersByTime(61000);

    await request(app)
      .get("/api/v1/recommendations?limit=-1")
      .expect(400);

    expect(
      logs.filter(
        (log) => log.eventType === "SUSPICIOUS_ACTIVITY"
      )
    ).toHaveLength(0);
  });

  test("tracks different request sources independently", () => {
    for (let i = 0; i < 4; i++) {
      monitor.recordInvalidRequest({
        source: "source-A",
        method: "GET",
        route: "/api/v1/recommendations",
        statusCode: 400
      });
    }

    monitor.recordInvalidRequest({
      source: "source-B",
      method: "GET",
      route: "/api/v1/recommendations",
      statusCode: 400
    });

    expect(
      logs.filter(
        (log) => log.eventType === "SUSPICIOUS_ACTIVITY"
      )
    ).toHaveLength(0);

    monitor.recordInvalidRequest({
      source: "source-A",
      method: "GET",
      route: "/api/v1/recommendations",
      statusCode: 400
    });

    expect(
      logs.filter(
        (log) => log.eventType === "SUSPICIOUS_ACTIVITY"
      )
    ).toHaveLength(1);
  });

  test("does not flag valid API requests", async () => {
    await request(app)
      .get("/api/v1/health")
      .expect(200);

    expect(logs).toHaveLength(0);
  });

  test("does not expose sensitive query information", async () => {
    const secret = "super-secret-test-token";

    await request(app)
      .get("/api/v1/recommendations")
      .query({
        limit: -1,
        token: secret
      })
      .expect(400);

    const output = JSON.stringify(logs);

    expect(output).not.toContain(secret);
    expect(output).not.toContain("token");
    expect(output).not.toContain("password");
    expect(output).not.toContain("authorization");
  });
});
