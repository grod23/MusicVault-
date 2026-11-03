const WINDOW_MS = 60 * 1000;
const MAX_INVALID_REQUESTS = 5;

const invalidRequests = new Map();

function logSecurityEvent(event) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType: event.eventType,
    method: event.method,
    route: event.route,
    statusCode: event.statusCode,
    ...(event.reason && { reason: event.reason }),
    ...(event.attemptCount && {
      attemptCount: event.attemptCount
    })
  };

  console.info(JSON.stringify(logEntry));
}

function recordInvalidRequest({ source, method, route, statusCode }) {
  const now = Date.now();

  const recentRequests = (invalidRequests.get(source) || [])
    .filter(timestamp => now - timestamp < WINDOW_MS);

  recentRequests.push(now);
  invalidRequests.set(source, recentRequests);

  logSecurityEvent({
    eventType: "INVALID_API_REQUEST",
    method,
    route,
    statusCode
  });

  if (recentRequests.length === MAX_INVALID_REQUESTS) {
    logSecurityEvent({
      eventType: "SUSPICIOUS_ACTIVITY",
      method,
      route,
      statusCode,
      reason: "Repeated invalid API requests",
      attemptCount: recentRequests.length
    });
  }
}

module.exports = {
  recordInvalidRequest
};
