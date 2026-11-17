const express = require("express");
const cors = require("cors");
const session = require("express-session");

const songRoutes = require("./routes/songRoutes");
const spotifyAuthRoutes = require("./routes/spotifyAuthRoutes");
const spotifyRoutes = require("./routes/spotifyRoutes");
const userRoutes = require("./routes/userRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const securityLogger = require("./middleware/securityLogger");
const requestId = require("./middleware/requestId");

const {
  spotifyConnectionStatus
} = require("./controllers/spotifyAuthController");

const app = express();

app.use(requestId);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174"
    ],
    credentials: true
  })
);

app.use(express.json());
app.use(securityLogger);

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "musicvault-development-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax"
    }
  })
);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "musicvault-backend",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.get(
  "/api/auth/spotify/status",
  spotifyConnectionStatus
);

app.use("/api/v1/songs", songRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/recommendations", recommendationRoutes);

app.use("/api/auth/spotify", spotifyAuthRoutes);
app.use("/api/spotify", spotifyRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;