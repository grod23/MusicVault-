import { useEffect, useState } from "react";
import { Heart, Music2, X } from "lucide-react";
import "./SongList.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"
).replace(/\/$/, "");

const PAGE_SIZE = 20;

function SongList({ mode }) {
  const isTop = mode === "top";
  const prefix = isTop ? "top" : "browse";

  const [songs, setSongs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [likedIds, setLikedIds] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  // Load the catalog or Global Top 100 from the backend.
  useEffect(() => {
    const controller = new AbortController();

    const endpoint = isTop
      ? `${API_BASE_URL}/api/v1/songs/top100`
      : `${API_BASE_URL}/api/v1/songs?page=${page}&limit=${PAGE_SIZE}`;

    async function loadSongs() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(endpoint, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Song request failed (HTTP ${response.status})`
          );
        }

        const data = await response.json();

        if (controller.signal.aborted) return;

        setSongs(data.songs || []);
        setTotal(
          isTop ? data.total : data.pagination?.total ?? 0
        );
        setTotalPages(
          isTop
            ? 1
            : Math.max(data.pagination?.totalPages || 1, 1)
        );
      } catch (err) {
        if (!controller.signal.aborted) {
          setSongs([]);
          setError(err.message || "Unable to load songs.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadSongs();

    return () => controller.abort();
  }, [isTop, page]);

  // Load individual song details when a title is clicked.
  useEffect(() => {
    if (selectedId === null) return;

    const controller = new AbortController();

    async function loadDetails() {
      setSelectedSong(null);
      setDetailsError("");
      setDetailsLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/songs/${selectedId}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(
            `Song details failed (HTTP ${response.status})`
          );
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setSelectedSong(data.song);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setDetailsError(
            err.message || "Unable to load song details."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailsLoading(false);
        }
      }
    }

    loadDetails();

    return () => controller.abort();
  }, [selectedId]);

  // Allow the details popup to close with Escape.
  useEffect(() => {
    if (selectedId === null) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedId(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedId]);

  // Temporary visual likes, not yet saved to Supabase.
  const toggleLike = (id) => {
    setLikedIds((previous) =>
      previous.includes(id)
        ? previous.filter((songId) => songId !== id)
        : [...previous, id]
    );
  };

  return (
    <section className={`${prefix}-page`}>
      <div className={`${prefix}-heading`}>
        <h1>
          {isTop ? "Global Top 100" : "Browse Music Catalog"}
        </h1>
        <span>{total} tracks</span>
      </div>

      {loading && (
        <p className="songlist-message">Loading songs...</p>
      )}

      {!loading && error && (
        <p className="songlist-error" role="alert">
          {error}. Check that the backend is running on port 3001.
        </p>
      )}

      {!loading && !error && songs.length === 0 && (
        <p className="songlist-message">No songs found.</p>
      )}

      {!loading && !error && songs.length > 0 && (
        <div className={`${prefix}-list`}>
          {songs.map((track, index) => {
            const id = String(track.id);
            const isLiked = likedIds.includes(id);

            const rank = isTop
              ? track.rank
              : (page - 1) * PAGE_SIZE + index + 1;

            return (
              <div className={`${prefix}-track`} key={id}>
                <span className={`${prefix}-number`}>
                  {rank}
                </span>

                <div
                  className={`${prefix}-cover`}
                  role="img"
                  aria-label={`${track.title} album artwork`}
                  style={{
                    backgroundImage: track.cover_url
                      ? `url(${JSON.stringify(track.cover_url)}), linear-gradient(135deg, #254c51, #0e222b)`
                      : "linear-gradient(135deg, #254c51, #0e222b)",
                  }}
                />

                <button
                  type="button"
                  className={`${prefix}-info songlist-details-link`}
                  onClick={() => setSelectedId(id)}
                  aria-label={`View details for ${track.title}`}
                >
                  <span className={`${prefix}-title`}>
                    {track.title}
                  </span>

                  <span className={`${prefix}-artist`}>
                    {track.artist}
                    {track.album ? ` · ${track.album}` : ""}
                  </span>
                </button>

                <span className={`${prefix}-duration`}>
                  {track.tempo
                    ? `${track.tempo} BPM`
                    : track.genre || "—"}
                </span>

                <button
                  type="button"
                  className={`${prefix}-like`}
                  onClick={() => toggleLike(id)}
                  title="Preview like (not saved to account)"
                  aria-label={`${isLiked ? "Unlike" : "Like"
                    } ${track.title}`}
                  aria-pressed={isLiked}
                >
                  <Heart
                    size={20}
                    fill={isLiked ? "currentColor" : "none"}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination for the full catalog */}
      {!isTop && !loading && !error && totalPages > 1 && (
        <div className="songlist-pagination">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Individual song details popup */}
      {selectedId !== null && (
        <div
          className="songlist-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedId(null);
            }
          }}
        >
          <div
            className="songlist-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Song details"
          >
            <button
              type="button"
              className="songlist-close"
              onClick={() => setSelectedId(null)}
              aria-label="Close song details"
            >
              <X size={22} />
            </button>

            {detailsLoading && (
              <p>Loading song details...</p>
            )}

            {detailsError && (
              <p role="alert">{detailsError}</p>
            )}

            {selectedSong && (
              <>
                <div className="songlist-modal-heading">
                  <div className="songlist-modal-cover">
                    {selectedSong.cover_url ? (
                      <img
                        src={selectedSong.cover_url}
                        alt={`${selectedSong.title} cover`}
                      />
                    ) : (
                      <Music2 size={38} />
                    )}
                  </div>

                  <div>
                    <h2>{selectedSong.title}</h2>
                    <p>{selectedSong.artist}</p>
                  </div>
                </div>

                <dl className="songlist-metadata">
                  <dt>Album</dt>
                  <dd>{selectedSong.album || "—"}</dd>

                  <dt>Genre</dt>
                  <dd>{selectedSong.genre || "—"}</dd>

                  <dt>Mood</dt>
                  <dd>{selectedSong.mood || "—"}</dd>

                  <dt>Tempo</dt>
                  <dd>
                    {selectedSong.tempo
                      ? `${selectedSong.tempo} BPM`
                      : "—"}
                  </dd>

                  <dt>Playback</dt>
                  <dd>
                    {selectedSong.audio_url
                      ? "Audio available"
                      : "Catalog only"}
                  </dd>
                </dl>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default SongList;
