const songService = require("../services/songService");

async function getSongs(req, res, next) {
  try {
    const songs = await songService.getSongs();

    res.status(200).json({
      songs,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSongs,
};
