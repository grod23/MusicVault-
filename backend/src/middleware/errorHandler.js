function errorHandler(err, req, res, next) {
  const statusCode =
    Number.isInteger(err.status) &&
    err.status >= 400 &&
    err.status <= 599
      ? err.status
      : 500;

  if (statusCode >= 500) {
    console.error("Backend error:", err);
  }

  const message =
    statusCode >= 500
      ? "Internal server error"
      : err.message || "Request failed";

  const response = {
    error: message
  };

  if (req.requestId) {
    response.requestId = req.requestId;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
