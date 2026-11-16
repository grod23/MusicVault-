
function Home({ goToLogin }) {
  function handleSpotifyConnect() {
    // Spotify integration will be connected later.
  }

  return (
    <div className="vault-home-page">
      <div className="vault-home-card">
        {/* Decorative vault door banner (pure CSS) */}
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

          <button
            className="vault-home-spotify"
            onClick={handleSpotifyConnect}
          >
            Connect to Spotify
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