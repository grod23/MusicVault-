const express = require("express");
const songController = require("../controllers/songController");

const router = express.Router();

router.get("/", songController.getSongs);
router.get("/:songId", songController.getSongById);

module.exports = router;
