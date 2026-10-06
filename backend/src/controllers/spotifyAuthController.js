const crypto = require("crypto");

const {
  exchangeCodeForTokens
} = require("../services/spotifyService");

function redirectToSpotify(req, res) {
  const state = crypto
    .randomBytes(16)
    .toString("hex");

  const scopes = [
    "user-read-private",
    "user-read-email",
    "user-top-read"
  ].join(" ");

  const params = new URLSearchParams({
    client_id:
      process.env.SPOTIFY_CLIENT_ID,

    response_type: "code",

    redirect_uri:
      process.env.SPOTIFY_REDIRECT_URI,

    scope: scopes,

    state
  });

  const spotifyAuthorizationUrl =
    `https://accounts.spotify.com/authorize?${params.toString()}`;

  return res.redirect(
    spotifyAuthorizationUrl
  );
}

async function spotifyCallback(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).json({
      success: false,
      message:
        "Spotify authorization was denied"
    });
  }

  if (!code) {
    return res.status(400).json({
      success: false,
      message:
        "Spotify authorization code was not provided"
    });
  }

  try {
    const tokenData =
      await exchangeCodeForTokens(code);

    req.session.spotifyAccessToken =
      tokenData.access_token;

    req.session.spotifyRefreshToken =
      tokenData.refresh_token;

    req.session.spotifyTokenExpiresAt =
      Date.now() +
      tokenData.expires_in * 1000;

    return res.status(200).json({
      success: true,
      message:
        "Spotify authentication successful",
      expiresIn:
        tokenData.expires_in
    });
  } catch (error) {
    console.error(
      "Spotify token exchange failed:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Spotify token exchange failed"
    });
  }
}

module.exports = {
  redirectToSpotify,
  spotifyCallback
};