const pool = require("../config/database");

async function getSongs({
  search,
  genre,
  mood,
  page = 1,
  limit = 20,
} = {}) {
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const offset = (pageNumber - 1) * pageLimit;

  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);

    conditions.push(`
      (
        title ILIKE $${values.length}
        OR artist ILIKE $${values.length}
        OR album ILIKE $${values.length}
      )
    `);
  }

  if (genre) {
    values.push(genre);
    conditions.push(`genre ILIKE $${values.length}`);
  }

  if (mood) {
    values.push(mood);
    conditions.push(`mood ILIKE $${values.length}`);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const countResult = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM songs
      ${whereClause}
    `,
    values
  );

  const total = Number(countResult.rows[0].total);

  const queryValues = [...values, pageLimit, offset];

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
      ORDER BY id ASC
      LIMIT $${queryValues.length - 1}
      OFFSET $${queryValues.length}
    `,
    queryValues
  );

  return {
    songs: result.rows,
    pagination: {
      page: pageNumber,
      limit: pageLimit,
      total,
      totalPages: Math.ceil(total / pageLimit),
    },
  };
}

async function getSongById(songId) {
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
      WHERE id = $1
    `,
    [songId]
  );

  return result.rows[0] || null;
}

async function getGlobalTop100() {
  const result = await pool.query(`
    SELECT
      gt.rank,
      s.id,
      s.title,
      s.artist,
      s.album,
      s.genre,
      s.mood,
      s.tempo,
      s.audio_url
    FROM global_top_100 gt
    JOIN songs s ON gt.song_id = s.id
    ORDER BY gt.rank ASC
    LIMIT 100
  `);

  return result.rows;
}

module.exports = {
  getSongs,
  getSongById,
  getGlobalTop100,
};
