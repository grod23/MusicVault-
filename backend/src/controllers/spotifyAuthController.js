const crypto = require("crypto");

function redirectToSpotify(req, res) {
  const state = crypto.randomBytes(16).toString("hex");

  // Temporary for now.
  // Later we should store this in the user's session and verify it
  // when Spotify redirects back.
  const scopes = [
    "user-read-private",
    "user-read-email"
  ].join(" ");

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: scopes,
    state: state
  });

  const spotifyAuthorizationUrl =
    `https://accounts.spotify.com/authorize?${params.toString()}`;

  return res.redirect(spotifyAuthorizationUrl);
}

function spotifyCallback(req, res) {
  const { code, state, error } = req.query;

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Spotify authorization was denied"
    });
  }

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "Spotify authorization code was not provided"
    });
  }

  return res.status(200).json({
    success: true,
    message: "Spotify authorization callback received",
    code,
    state
  });
}

module.exports = {
  redirectToSpotify,
  spotifyCallback
};