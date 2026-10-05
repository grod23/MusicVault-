async function exchangeCodeForTokens(code) {
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI
  });

  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    }
  );

  if (!response.ok) {
    throw new Error(
      "Spotify token exchange failed"
    );
  }

  return response.json();
}


async function getTopTracks(
  accessToken,
  limit = 20,
  offset = 0
) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    time_range: "medium_term"
  });

  const response = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?${params}`,
    {
      method: "GET",
      headers: {
        Authorization:
          `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      `Spotify top tracks request failed: ${response.status}`
    );
  }

  return response.json();
}


module.exports = {
  exchangeCodeForTokens,
  getTopTracks
};