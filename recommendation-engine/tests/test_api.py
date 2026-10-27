
from fastapi.testclient import TestClient

from src.api import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_recommendations_success():
    response = client.get(
        "/recommendations",
        params={
            "genre": "rock",
            "mood": "energetic",
            "limit": 5,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "recommendations" in data
    assert "total" in data
    assert data["total"] == len(data["recommendations"])
    assert data["total"] <= 5


def test_invalid_limit():
    response = client.get(
        "/recommendations",
        params={"limit": 51},
    )

    assert response.status_code == 422


def test_empty_results():
    response = client.get(
        "/recommendations",
        params={"genre": "classical"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "recommendations": [],
        "total": 0,
    }

def test_rank_recommendations_success():
    payload = {
        "songs": [
            {
                "id": 1,
                "title": "Believer",
                "artist": "Imagine Dragons",
                "genre": "rock",
                "mood": "energetic",
                "popularity": 90,
            },
            {
                "id": 2,
                "title": "Yellow",
                "artist": "Coldplay",
                "genre": "rock",
                "mood": "calm",
                "popularity": 85,
            },
        ],
        "genre": "rock",
        "mood": "energetic",
        "limit": 5,
    }

    response = client.post("/rank", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 2
    assert data["recommendations"][0]["title"] == "Believer"
    assert data["recommendations"][0]["score"] == 99.0
    assert data["recommendations"][1]["score"] == 68.5


def test_rank_recommendations_empty_songs():
    response = client.post(
        "/rank",
        json={"songs": []},
    )

    assert response.status_code == 200
    assert response.json() == {
        "recommendations": [],
        "total": 0,
    }


def test_rank_recommendations_invalid_limit():
    response = client.post(
        "/rank",
        json={
            "songs": [],
            "limit": 51,
        },
    )

    assert response.status_code == 422