function errorHandler(err, req, res, next) {
  console.error(err);

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    error: err.message || "Internal server error",
    requestId: req.requestId
  });
}

module.exports = errorHandler;
