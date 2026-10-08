const recommendationService = require("../services/recommendationService");

async function getRecommendations(req, res, next) {
  try {
    const recommendations =
      await recommendationService.getRecommendations();

    res.status(200).json({
      recommendations,
      total: recommendations.length,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRecommendations,
};
