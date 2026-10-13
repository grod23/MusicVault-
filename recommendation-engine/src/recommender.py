
def get_recommendations(songs, genre=None, mood=None, limit=10):
    """
    Rank songs based on genre, mood, and popularity.

    Genre match: +60 points
    Mood match: +30 points
    Popularity: 0-10 points
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

        if song_id in seen_ids:
            continue

        seen_ids.add(song_id)

        song_genre = song["genre"].strip().lower()
        song_mood = song["mood"].strip().lower()
        popularity = song["popularity"]

        score = 0

        if genre and song_genre == genre:
            score += 60

        if mood and song_mood == mood:
            score += 30

        # Exclude songs that match neither preference.
        if (genre or mood) and score == 0:
            continue

        score += popularity / 10

        ranked.append({
            **song,
            "score": round(score, 2)
        })

    ranked.sort(
        key=lambda song: (-song["score"], str(song["id"]))
    )

    return ranked[:limit]
