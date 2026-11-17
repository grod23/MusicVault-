const crypto = require("crypto");

const {
  exchangeCodeForTokens
} = require("../services/spotifyService");

function redirectToSpotify(req, res) {
  const state = crypto.randomBytes(16).toString("hex");

  // Associate OAuth state with the initiating session.
  req.session.spotifyOAuthState = state;

  const scopes = [
    "user-read-private",
    "user-read-email",
    "user-top-read"
  ].join(" ");

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: scopes,
    state
  });

  const spotifyAuthorizationUrl =
    `https://accounts.spotify.com/authorize?${params.toString()}`;

  return req.session.save((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "SPOTIFY_AUTH_START_FAILED",
        message: "Unable to start Spotify authentication. Please try again."
      });
    }

    return res.redirect(spotifyAuthorizationUrl);
  });
}

async function spotifyCallback(req, res) {
  const { code, error, state } = req.query;

  const expectedState = req.session.spotifyOAuthState;

  // Consume the state so it cannot be reused.
  delete req.session.spotifyOAuthState;

  // Validate OAuth state to protect against CSRF attacks.
  if (
    typeof state !== "string" ||
    typeof expectedState !== "string" ||
    state.length !== expectedState.length ||
    !crypto.timingSafeEqual(
      Buffer.from(state),
      Buffer.from(expectedState)
    )
  ) {
    return res.status(400).json({
      success: false,
      error: "SPOTIFY_INVALID_STATE",
      message: "Invalid Spotify authentication state"
    });
  }

  // Handle authorization denied by the user.
  if (error) {
    return res.status(400).json({
      success: false,
      error: "SPOTIFY_AUTH_DENIED",
      message: "Spotify authorization was denied. Please try connecting again."
    });
  }

  // Handle missing authorization code.
  if (typeof code !== "string" || !code) {
    return res.status(400).json({
      success: false,
      error: "SPOTIFY_CODE_MISSING",
      message: "Spotify authorization could not be completed. Please try again."
    });
  }

  try {
    const tokenData = await exchangeCodeForTokens(code);

    // Store Spotify tokens securely in the session.
    req.session.spotifyAccessToken = tokenData.access_token;
    req.session.spotifyRefreshToken = tokenData.refresh_token;
    req.session.spotifyTokenExpiresAt =
      Date.now() + tokenData.expires_in * 1000;

    return res.status(200).json({
      success: true,
      message: "Spotify authentication successful",
      expiresIn: tokenData.expires_in
    });
  } catch (err) {
    // Avoid exposing sensitive Spotify API details.
    console.error("Spotify token exchange failed");

    return res.status(502).json({
      success: false,
      error: "SPOTIFY_TOKEN_EXCHANGE_FAILED",
      message: "Unable to connect to Spotify right now. Please try again later."
    });
  }
}

module.exports = {
  redirectToSpotify,
  spotifyCallback
};