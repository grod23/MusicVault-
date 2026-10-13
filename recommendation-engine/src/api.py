
import json
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query

from src.recommender import get_recommendations

app = FastAPI(title="MusicVault Recommendation Engine")

DATASET_PATH = (
    Path(__file__).resolve().parent.parent
    / "tests"
    / "fixtures"
    / "songs.json"
)


def load_songs():
    with open(DATASET_PATH, encoding="utf-8") as file:
        return json.load(file)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/recommendations")
def recommendations(
    genre: str | None = None,
    mood: str | None = None,
    limit: int = Query(default=10, ge=1, le=50),
):
    try:
        songs = load_songs()

        results = get_recommendations(
            songs,
            genre=genre,
            mood=mood,
            limit=limit,
        )

        return {
            "recommendations": results,
            "total": len(results),
        }

    except (OSError, json.JSONDecodeError):
        raise HTTPException(
            status_code=500,
            detail="Recommendation dataset unavailable",
        )
