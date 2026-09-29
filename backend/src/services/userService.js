const pool = require("../config/database");

async function getProfile(userId) {
  const result = await pool.query(
    `
      SELECT
        id,
        email,
        display_name
      FROM users
      WHERE id = $1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

async function updateProfile(userId, displayName) {
  const result = await pool.query(
    `
      UPDATE users
      SET display_name = $1
      WHERE id = $2
      RETURNING id, email, display_name
    `,
    [displayName, userId]
  );

  return result.rows[0] || null;
}

async function getPreferences(userId) {
  const result = await pool.query(
    `
      SELECT
        user_id,
        favorite_genres,
        favorite_moods
      FROM user_preferences
      WHERE user_id = $1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

async function savePreferences(userId, favoriteGenres, favoriteMoods) {
  const result = await pool.query(
    `
      INSERT INTO user_preferences (
        user_id,
        favorite_genres,
        favorite_moods
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id)
      DO UPDATE SET
        favorite_genres = EXCLUDED.favorite_genres,
        favorite_moods = EXCLUDED.favorite_moods
      RETURNING
        user_id,
        favorite_genres,
        favorite_moods
    `,
    [userId, favoriteGenres, favoriteMoods]
  );

  return result.rows[0];
}

async function addFavoriteSong(userId, songId) {
  const result = await pool.query(
    `
      INSERT INTO favorite_songs (user_id, song_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, song_id)
      DO NOTHING
      RETURNING user_id, song_id
    `,
    [userId, songId]
  );

  return result.rows[0] || {
    user_id: userId,
    song_id: songId,
  };
}

async function getFavoriteSongs(userId) {
  const result = await pool.query(
    `
      SELECT
        s.id,
        s.title,
        s.artist,
        s.album,
        s.genre,
        s.mood,
        s.tempo,
        s.audio_url
      FROM favorite_songs f
      JOIN songs s ON f.song_id = s.id
      WHERE f.user_id = $1
      ORDER BY s.id ASC
    `,
    [userId]
  );

  return result.rows;
}

module.exports = {
  getProfile,
  updateProfile,
  getPreferences,
  savePreferences,
  addFavoriteSong,
  getFavoriteSongs,
};
