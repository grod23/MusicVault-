
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
