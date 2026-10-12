const recommendationService = require("../services/recommendationService");

async function getRecommendations(req, res, next) {
  try {
    const { genre, mood, limit } = req.query;

    if (limit !== undefined) {
      const parsedLimit = Number(limit);

      if (
        !Number.isInteger(parsedLimit) ||
        parsedLimit < 1 ||
        parsedLimit > 50
      ) {
        return res.status(400).json({
          error: "limit must be an integer between 1 and 50",
        });
      }
    }

    const recommendations =
      await recommendationService.getRecommendations({
        genre,
        mood,
        limit,
      });

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
