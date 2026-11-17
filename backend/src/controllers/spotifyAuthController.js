const crypto = require("crypto");

const {
  exchangeCodeForTokens,
  getSpotifyProfile
} = require("../services/spotifyService");

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

function redirectToSpotify(req, res) {
  const state = crypto.randomBytes(16).toString("hex");

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

  const authorizationUrl =
    `https://accounts.spotify.com/authorize?${params.toString()}`;

  return req.session.save((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "SPOTIFY_AUTH_START_FAILED",
        message: "Unable to start Spotify authentication."
      });
    }

    return res.redirect(authorizationUrl);
  });
}

async function spotifyCallback(req, res) {
  const { code, error, state } = req.query;
  const expectedState = req.session.spotifyOAuthState;

  delete req.session.spotifyOAuthState;

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

  if (error) {
    return res.redirect(
      `${FRONTEND_URL}/?spotify=denied`
    );
  }

  if (typeof code !== "string" || !code) {
    return res.status(400).json({
      success: false,
      error: "SPOTIFY_CODE_MISSING",
      message: "Spotify authorization could not be completed."
    });
  }

  try {
    const tokenData = await exchangeCodeForTokens(code);

    req.session.spotifyAccessToken = tokenData.access_token;
    req.session.spotifyRefreshToken = tokenData.refresh_token;
    req.session.spotifyTokenExpiresAt =
      Date.now() + tokenData.expires_in * 1000;

    try {
      const profile = await getSpotifyProfile(
        tokenData.access_token
      );

      req.session.spotifyDisplayName =
        profile.display_name || profile.id || "Spotify User";
    } catch (profileError) {
      req.session.spotifyDisplayName = "Spotify User";
    }

    return req.session.save((saveError) => {
      if (saveError) {
        return res.status(500).json({
          success: false,
          error: "SPOTIFY_SESSION_SAVE_FAILED",
          message: "Unable to save Spotify connection."
        });
      }

      return res.redirect(
        `${FRONTEND_URL}/?spotify=connected`
      );
    });
  } catch (err) {
    console.error("Spotify token exchange failed");

    return res.status(502).json({
      success: false,
      error: "SPOTIFY_TOKEN_EXCHANGE_FAILED",
      message: "Unable to connect to Spotify right now."
    });
  }
}

function spotifyConnectionStatus(req, res) {
  const expiresAt = req.session.spotifyTokenExpiresAt;

  const connected =
    Boolean(req.session.spotifyAccessToken) &&
    typeof expiresAt === "number" &&
    Date.now() < expiresAt;

  return res.status(200).json({
    connected,
    displayName: connected
      ? req.session.spotifyDisplayName || "Spotify User"
      : null
  });
}

module.exports = {
  redirectToSpotify,
  spotifyCallback,
  spotifyConnectionStatus
};