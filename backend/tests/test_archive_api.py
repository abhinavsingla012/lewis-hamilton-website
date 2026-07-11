import os

import pytest
import requests


# Archive API regression tests for Hamilton stats, seasons/tracks, and victory records
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")


@pytest.fixture(scope="session")
def api_base_url():
    if not BASE_URL:
        pytest.skip("REACT_APP_BACKEND_URL not set; skipping external API tests")
    return BASE_URL.rstrip("/")


@pytest.fixture(scope="session")
def archive_payload(api_base_url):
    response = requests.get(f"{api_base_url}/api/archive", timeout=30)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    return data


def test_api_root_health_message(api_base_url):
    response = requests.get(f"{api_base_url}/api/", timeout=20)
    assert response.status_code == 200
    payload = response.json()
    assert payload["message"] == "Still We Rise archive online"


def test_archive_response_structure(archive_payload):
    for key in ["source", "cutoff_season", "updated_at", "stats", "seasons", "tracks", "victories"]:
        assert key in archive_payload


def test_archive_hero_stat_values(archive_payload):
    stats = archive_payload["stats"]
    assert stats["wins"] == 105
    assert stats["titles"] == 7
    assert stats["poles"] == 104
    assert stats["podiums"] == 202


def test_archive_seasons_include_latest_finished_season(archive_payload):
    seasons = archive_payload["seasons"]
    assert isinstance(seasons, list)
    assert any(item["year"] == 2025 for item in seasons)


def test_archive_tracks_include_silverstone_record(archive_payload):
    tracks = archive_payload["tracks"]
    silverstone = next((t for t in tracks if t["circuit"] == "Silverstone Circuit"), None)
    assert silverstone is not None
    assert silverstone["wins"] == 9
    assert silverstone["podiums"] == 15


def test_archive_victories_total_count(archive_payload):
    victories = archive_payload["victories"]
    assert isinstance(victories, list)
    assert len(victories) == 105
