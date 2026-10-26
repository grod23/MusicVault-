
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

    assert results[0]["id"] == "song_001"
    assert results[1]["id"] == "song_002"
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


@pytest.mark.parametrize("limit", [0, 51, -1, 2.5, "abc", True])
def test_invalid_limits(songs, limit):
    with pytest.raises(ValueError):
        get_recommendations(songs, limit=limit)
