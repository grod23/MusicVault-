const userService = require("../services/userService");

async function getProfile(req, res, next) {
  try {
    const profile = await userService.getProfile(req.params.userId);

    if (!profile) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json({
      profile,
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { displayName } = req.body;

    const profile = await userService.updateProfile(
      req.params.userId,
      displayName
    );

    if (!profile) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json({
      profile,
    });
  } catch (error) {
    next(error);
  }
}

async function getPreferences(req, res, next) {
  try {
    const preferences = await userService.getPreferences(req.params.userId);

    res.status(200).json({
      preferences,
    });
  } catch (error) {
    next(error);
  }
}

async function savePreferences(req, res, next) {
  try {
    const { favoriteGenres = [], favoriteMoods = [] } = req.body;

    const preferences = await userService.savePreferences(
      req.params.userId,
      favoriteGenres,
      favoriteMoods
    );

    res.status(200).json({
      preferences,
    });
  } catch (error) {
    next(error);
  }
}

async function addFavoriteSong(req, res, next) {
  try {
    const favorite = await userService.addFavoriteSong(
      req.params.userId,
      req.body.songId
    );

    res.status(201).json({
      favorite,
    });
  } catch (error) {
    next(error);
  }
}

async function getFavoriteSongs(req, res, next) {
  try {
    const songs = await userService.getFavoriteSongs(req.params.userId);

    res.status(200).json({
      songs,
      total: songs.length,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getPreferences,
  savePreferences,
  addFavoriteSong,
  getFavoriteSongs,
};
