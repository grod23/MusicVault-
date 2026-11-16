
def get_recommendations(songs, genre=None, mood=None, limit=10):
    """
    Rank songs based on genre, mood, and discovery potential.

    Genre match: +60 points
    Mood match: +30 points
    Discovery bonus: 0-10 points (lower popularity earns more)

    Popularity is assumed to range from 0 to 100.
    """

    if not isinstance(limit, int) or isinstance(limit, bool):
        raise ValueError("limit must be an integer between 1 and 50")

    if limit < 1 or limit > 50:
        raise ValueError("limit must be an integer between 1 and 50")

    if genre is not None and not isinstance(genre, str):
        raise ValueError("genre must be a string")

    if mood is not None and not isinstance(mood, str):
        raise ValueError("mood must be a string")

    genre = genre.strip().lower() if genre else None
    mood = mood.strip().lower() if mood else None

    ranked = []
    seen_ids = set()

    for song in songs:
        song_id = song["id"]

        # Prevent duplicate songs
        if song_id in seen_ids:
            continue

        seen_ids.add(song_id)

        # Handle missing or NULL database values
        song_genre = (song.get("genre") or "").strip().lower()
        song_mood = (song.get("mood") or "").strip().lower()

        score = 0

        # Prioritize matching musical preferences
        if genre and song_genre == genre:
            score += 60

        if mood and song_mood == mood:
            score += 30

        # Exclude songs that match neither preference
        if (genre or mood) and score == 0:
            continue

        # Discovery bonus rewards lesser-known songs.
        # Missing popularity receives a neutral bonus.
        raw_popularity = song.get("popularity")

        if raw_popularity is None:
            discovery_bonus = 5.0
        else:
            popularity = max(
                0, min(float(raw_popularity), 100)
            )
            discovery_bonus = (100 - popularity) / 10

        score += discovery_bonus

        ranked.append({
            **song,
            "score": round(score, 2)
        })

    # Highest score first, ID used for deterministic ties
    ranked.sort(
        key=lambda song: (-song["score"], str(song["id"]))
    )

    return ranked[:limit]
