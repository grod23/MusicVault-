function Home({ goToLogin }) {
  function handleSpotifyConnect() {
    // TODO:
    // Connect this handler to the team's Spotify OAuth backend endpoint
    // once the backend integration is ready.
  }

  return (
    <div className="page">
      <div className="login-card">

        <div className="logo">♫</div>

        <h1>Music Vault</h1>

        <p className="subtitle home-subtitle">
          Discover music beyond the usual recommendations.
        </p>

        <p className="home-description">
          Music Vault helps you explore personalized songs, hidden gems,
          and lesser-known artists based on the music you already enjoy.
        </p>

        <button
          className="spotify-button"
          onClick={handleSpotifyConnect}
        >
          Connect to Spotify
        </button>

        <div className="home-divider">
          <span>or</span>
        </div>

        <button
          className="register-button"
          onClick={goToLogin}
        >
          Continue with Music Vault
        </button>

      </div>
    </div>
  );
}

export default Home;