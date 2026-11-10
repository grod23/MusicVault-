
import { useState } from "react";
import "./DiscoverMusic.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3001";

function DiscoverMusic() {
  const [genre, setGenre] = useState("rock");
  const [mood, setMood] = useState("energetic");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  async function generateRecommendations() {
    setLoading(true);
    setError("");
    setRecommendations([]);
    setHasSearched(false);

    try {
      const params = new URLSearchParams({
        genre,
        mood,
        limit: "10",
      });

      const response = await fetch(
        `${API_BASE_URL}/api/v1/recommendations?${params}`
      );

      if (!response.ok) {
        throw new Error(
          `Recommendation request failed (${response.status})`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data.recommendations)) {
        throw new Error("Invalid recommendation response");
      }

      setRecommendations(data.recommendations);
      setHasSearched(true);
    } catch (err) {
      setError(err.message || "Unable to load recommendations.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="discover-container">
      <p className="discover-description">
        Explore music based on your favorite genres and moods.
        MusicVault prioritizes relevant songs while giving
        lesser-known tracks an opportunity to shine.
      </p>

      <div className="discover-controls">
        <div className="discover-field">
          <label htmlFor="discover-genre">Genre</label>
          <select
            id="discover-genre"
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
          >
            <option value="rock">Rock</option>
            <option value="pop">Pop</option>
            <option value="jazz">Jazz</option>
            <option value="hip-hop">Hip-Hop</option>
            <option value="classical">Classical</option>
          </select>
        </div>

        <div className="discover-field">
          <label htmlFor="discover-mood">Mood</label>
          <select
            id="discover-mood"
            value={mood}
            onChange={(event) => setMood(event.target.value)}
          >
            <option value="energetic">Energetic</option>
            <option value="calm">Calm</option>
            <option value="happy">Happy</option>
            <option value="sad">Sad</option>
          </select>
        </div>

        <button
          type="button"
          className="discover-button"
          onClick={generateRecommendations}
          disabled={loading}
        >
          {loading
            ? "Generating..."
            : "Generate Recommendations"}
        </button>
      </div>

      {loading && (
        <p role="status">Finding music for you...</p>
      )}

      {error && (
        <p className="discover-error" role="alert">
          {error}
        </p>
      )}

      {hasSearched && recommendations.length === 0 && (
        <p role="status">
          No matching songs found. Try another genre or mood.
        </p>
      )}

      {recommendations.length > 0 && (
        <div className="discover-results">
          <h2>Recommended For You</h2>

          <p>
            {recommendations.length} recommendations found
          </p>

          <div className="recommendation-grid">
            {recommendations.map((song) => (
              <article
                key={song.id}
                className="recommendation-card"
              >
                <div className="recommendation-artwork">
                  ♫
                </div>

                <h3>{song.title}</h3>
                <p className="recommendation-artist">
                  {song.artist}
                </p>

                <div className="recommendation-details">
                  <span>Genre: {song.genre || "Unknown"}</span>
                  <span>Mood: {song.mood || "Unknown"}</span>
                  <span>
                    Popularity: {song.popularity ?? "N/A"}
                  </span>
                  <span>
                    Discovery Score: {song.score}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default DiscoverMusic;
