"""Smoke tests for the public FastAPI responses; no production data required."""
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.app import app


def test_home_and_health():
    with TestClient(app) as client:
        assert client.get('/health').json() == {'status': 'ok'}
        assert client.get('/').status_code == 200


def test_public_media_mapping():
    records = [{'id': 1, 'title': 'Example', 'category': 'design',
                'filename': 'hello world.jpg', 'tools': '', 'description': ''}]
    with patch('backend.app.rows', return_value=records), TestClient(app) as client:
        result = client.get('/admin/api-design.php')
        assert result.status_code == 200
        assert result.json()[0]['image'] == 'assets/uploads/projects/hello%20world.jpg'


def test_database_error_does_not_expose_credentials():
    with TestClient(app) as client:
        response = client.get('/admin/api-settings.php')
        assert response.status_code == 503
        assert response.json() == {'detail': 'Portfolio data is temporarily unavailable'}
