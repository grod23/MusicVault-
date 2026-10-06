const express = require("express");

const {
  getUserTopTracks
} = require(
  "../controllers/spotifyController"
);

const router = express.Router();

router.get(
  "/top-tracks",
  getUserTopTracks
);

module.exports = router;