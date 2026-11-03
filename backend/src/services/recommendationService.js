
const pool = require("../config/database");

async function getRecommendations({
  genre,
  mood,
  limit = 10,
} = {}) {
  const recommendationLimit = Math.min(
    Math.max(parseInt(limit, 10) || 10, 1),
    50
  );

  // Retrieve candidate songs from PostgreSQL.
  const result = await pool.query(`
    SELECT
      id,
      title,
      artist,
      album,
      genre,
      mood,
      tempo,
      audio_url,
      popularity
    FROM songs
    ORDER BY id
  `);

  // Send songs to the Python ranking engine.
  const response = await fetch(
    process.env.RECOMMENDATION_ENGINE_URL ||
      "http://127.0.0.1:8000/rank",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        songs: result.rows,
        genre,
        mood,
        limit: recommendationLimit,
      }),
      signal: AbortSignal.timeout(5000),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Recommendation engine returned ${response.status}`
    );
  }

  const data = await response.json();

  return data.recommendations;
}

module.exports = {
  getRecommendations,
};
