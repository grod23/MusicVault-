const express = require("express");

const {
  redirectToSpotify,
  spotifyCallback
} = require("../controllers/spotifyAuthController");

const router = express.Router();

router.get("/", redirectToSpotify);

router.get("/callback", spotifyCallback);

module.exports = router;