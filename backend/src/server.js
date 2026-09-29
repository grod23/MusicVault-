require("dotenv").config();

const app = require("./app");
const pool = require("./config/database");

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("Connected to PostgreSQL database");
  } catch (error) {
    console.warn(
      "Database unavailable. Starting server without database connection:",
      error.message
    );
  }

  app.listen(PORT, () => {
    console.log(`MusicVault backend running on port ${PORT}`);
  });
}

startServer();