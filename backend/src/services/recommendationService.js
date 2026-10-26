const pool = require("../config/database");

async function getRecommendations({
  genre,
  mood,
  limit = 10,
} = {}) {
  const conditions = [];
  const values = [];

  if (genre) {
    values.push(genre);
    conditions.push(`genre ILIKE $${values.length}`);
  }

  if (mood) {
    values.push(mood);
    conditions.push(`mood ILIKE $${values.length}`);
  }

  const recommendationLimit = Math.min(
    Math.max(parseInt(limit, 10) || 10, 1),
    50
  );

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  values.push(recommendationLimit);

  const result = await pool.query(
    `
      SELECT
        id,
        title,
        artist,
        album,
        genre,
        mood,
        tempo,
        audio_url
      FROM songs
      ${whereClause}
      ORDER BY RANDOM()
      LIMIT $${values.length}
    `,
    values
  );

  return result.rows;
}

module.exports = {
  getRecommendations,
};
