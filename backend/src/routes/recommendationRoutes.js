const express = require("express");
const recommendationController = require("../controllers/recommendationController");

const router = express.Router();

router.get("/", recommendationController.getRecommendations);

module.exports = router;
