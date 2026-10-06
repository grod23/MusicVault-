const {
  getTop100Tracks
} = require("../services/spotifyService");

async function getUserTopTracks(req, res) {
  const accessToken =
    req.session.spotifyAccessToken;

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message:
        "Spotify account is not connected"
    });
  }

  try {
    const tracks =
      await getTop100Tracks(accessToken);

    return res.status(200).json({
      success: true,
      count: tracks.length,
      tracks
    });
  } catch (error) {
    console.error(
      "Spotify top tracks request failed:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve Spotify top tracks"
    });
  }
}

module.exports = {
  getUserTopTracks
};