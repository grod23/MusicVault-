import { useEffect, useState } from "react";

const BACKEND_URL = "http://127.0.0.1:3001";

function Home({ goToLogin }) {
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyName, setSpotifyName] = useState("");

  const [spotifyError, setSpotifyError] = useState(() => {
    const params = new URLSearchParams(window.location.search);

    return params.get("spotify") === "denied"
      ? "Spotify authorization was denied. Please try again."
      : "";
  });

  useEffect(() => {
    let cancelled = false;

    async function checkSpotifyConnection() {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/auth/spotify/status`,
          {
            credentials: "include"
          }
        );

        if (!response.ok) {
          throw new Error("Unable to check Spotify connection");
        }

        const data = await response.json();

        if (!cancelled) {
          setSpotifyConnected(data.connected);
          setSpotifyName(data.displayName || "");
        }
      } catch {
        if (!cancelled) {
          setSpotifyError("Unable to check Spotify connection status.");
        }
      }
    }

    checkSpotifyConnection();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSpotifyConnect() {
    window.location.assign(
      `${BACKEND_URL}/api/auth/spotify`
    );
  }

  return (
    <div className="vault-home-page">
      <div className="vault-home-card">
        <div className="vault-home-banner" aria-hidden="true">
          <div className="vault-home-door">
            <div className="vault-home-core">♫</div>
          </div>
        </div>

        <div className="vault-home-body">
          <h1>Music Vault</h1>

          <p className="vault-home-subtitle">
            Discover music beyond the usual recommendations.
          </p>

          <p className="vault-home-description">
            Music Vault helps you explore personalized songs, hidden gems,
            and lesser-known artists based on the music you already enjoy.
          </p>

          {spotifyConnected && (
            <p role="status" style={{ color: "#1DB954" }}>
              Connected to Spotify — {spotifyName}
            </p>
          )}

          {spotifyError && (
            <p role="alert" style={{ color: "#ff6b6b" }}>
              {spotifyError}
            </p>
          )}

          <button
            className="vault-home-spotify"
            onClick={handleSpotifyConnect}
          >
            {spotifyConnected
              ? "Reconnect Spotify"
              : "Connect to Spotify"}
          </button>

          <div className="vault-home-divider">
            <span>or</span>
          </div>

          <button
            className="vault-home-register"
            onClick={goToLogin}
          >
            Continue with Music Vault
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;