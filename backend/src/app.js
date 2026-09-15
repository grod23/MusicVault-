const express = require("express");
const cors = require("cors");
const songRoutes = require("./routes/songRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.use("/api/v1/songs", songRoutes);

module.exports = app;
