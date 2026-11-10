
import json
from pathlib import Path

import pytest

from src.recommender import get_recommendations


@pytest.fixture
def songs():
    fixture_path = (
        Path(__file__).parent / "fixtures" / "songs.json"
    )

    with open(fixture_path, encoding="utf-8") as file:
        return json.load(file)


def test_genre_and_mood_ranking(songs):
    results = get_recommendations(
        songs,
        genre="rock",
        mood="energetic"
    )

    assert results[0]["id"] == "song_002"
    assert results[1]["id"] == "song_001"
    assert results[2]["id"] == "song_005"


def test_results_sorted_by_score(songs):
    results = get_recommendations(
        songs,
        genre="rock"
    )

    scores = [song["score"] for song in results]

    assert scores == sorted(scores, reverse=True)


def test_no_duplicate_songs(songs):
    duplicate_songs = songs + [songs[0]]

    results = get_recommendations(duplicate_songs)

    ids = [song["id"] for song in results]

    assert len(ids) == len(set(ids))


def test_limit_respected(songs):
    results = get_recommendations(songs, limit=2)

    assert len(results) == 2


def test_empty_dataset():
    assert get_recommendations([]) == []


def test_no_matching_songs(songs):
    results = get_recommendations(
        songs,
        genre="classical"
    )

    assert results == []


def test_deterministic_results(songs):
    first = get_recommendations(songs, genre="rock")
    second = get_recommendations(songs, genre="rock")

    assert first == second


@pytest.mark.parametrize(
    "limit",
    [0, 51, -1, 2.5, "abc", True]
)
def test_invalid_limits(songs, limit):
    with pytest.raises(ValueError):
        get_recommendations(songs, limit=limit)


def test_lesser_known_songs_rank_higher():
    songs = [
        {
            "id": "popular",
            "genre": "rock",
            "mood": "energetic",
            "popularity": 95,
        },
        {
            "id": "undiscovered",
            "genre": "rock",
            "mood": "energetic",
            "popularity": 20,
        },
    ]

    results = get_recommendations(
        songs,
        genre="rock",
        mood="energetic"
    )

    assert results[0]["id"] == "undiscovered"
    assert results[1]["id"] == "popular"
    assert results[0]["score"] > results[1]["score"]


def test_discovery_bonus_scores():
    songs = [
        {
            "id": "low_popularity",
            "genre": "rock",
            "mood": "energetic",
            "popularity": 20,
        },
        {
            "id": "high_popularity",
            "genre": "rock",
            "mood": "energetic",
            "popularity": 90,
        },
    ]

    results = get_recommendations(
        songs,
        genre="rock",
        mood="energetic"
    )

    assert results[0]["score"] == 98.0
    assert results[1]["score"] == 91.0


def test_missing_popularity():
    songs = [
        {
            "id": "unknown",
            "genre": "rock",
            "mood": "energetic",
        }
    ]

    results = get_recommendations(
        songs,
        genre="rock",
        mood="energetic"
    )

    assert results[0]["score"] == 95.0


def test_popularity_clamped():
    songs = [
        {
            "id": "too_high",
            "genre": "rock",
            "popularity": 150,
        },
        {
            "id": "too_low",
            "genre": "rock",
            "popularity": -10,
        },
    ]

    results = get_recommendations(
        songs,
        genre="rock"
    )

    assert results[0]["id"] == "too_low"
    assert results[0]["score"] == 70.0
    assert results[1]["score"] == 60.0


def test_genre_match_prioritized_over_obscurity():
    songs = [
        {
            "id": "relevant",
            "genre": "rock",
            "mood": "calm",
            "popularity": 95,
        },
        {
            "id": "irrelevant",
            "genre": "jazz",
            "mood": "calm",
            "popularity": 5,
        },
    ]

    results = get_recommendations(
        songs,
        genre="rock",
        mood="calm"
    )

    assert results[0]["id"] == "relevant"
    assert results[1]["id"] == "irrelevant"
