const pool = require("../config/database");

async function getSongs() {
  const result = await pool.query(`
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
    ORDER BY id ASC
  `);

  return result.rows;
}

module.exports = {
  getSongs,
};
