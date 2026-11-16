const songService = require("../services/songService");

async function getSongs(req, res, next) {
  try {
    const result = await songService.getSongs({
      search: req.query.search,
      genre: req.query.genre,
      mood: req.query.mood,
      page: req.query.page,
      limit: req.query.limit,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function getSongById(req, res, next) {
  try {
    const songId = req.params.songId;

    if (
      !/^[1-9]\d*$/.test(songId) ||
      !Number.isSafeInteger(Number(songId))
    ) {
      return res.status(400).json({
        error: "songId must be a positive integer",
      });
    }

    const song = await songService.getSongById(songId);

    if (!song) {
      return res.status(404).json({
        error: "Song not found",
      });
    }

    res.status(200).json({
      song,
    });
  } catch (error) {
    next(error);
  }
}

async function getGlobalTop100(req, res, next) {
  try {
    const songs = await songService.getGlobalTop100();

    res.status(200).json({
      songs,
      total: songs.length,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSongs,
  getSongById,
  getGlobalTop100,
};
