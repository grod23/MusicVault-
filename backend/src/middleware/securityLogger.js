const { recordInvalidRequest } = require("../services/securityMonitor");

function securityLogger(req, res, next) {
  res.on("finish", () => {
    if (![400, 401, 403, 422].includes(res.statusCode)) {
      return;
    }

    const route = req.route
      ? `${req.baseUrl}${req.route.path}`
      : "unmatched";

    recordInvalidRequest({
      source: req.ip || "unknown",
      method: req.method,
      route,
      statusCode: res.statusCode
    });
  });

  next();
}

module.exports = securityLogger;
