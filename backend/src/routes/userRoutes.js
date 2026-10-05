const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/:userId/profile", userController.getProfile);
router.put("/:userId/profile", userController.updateProfile);

router.get("/:userId/preferences", userController.getPreferences);
router.put("/:userId/preferences", userController.savePreferences);

router.get("/:userId/favorites", userController.getFavoriteSongs);
router.post("/:userId/favorites", userController.addFavoriteSong);

module.exports = router;
