"""Experimental admin tests run with an isolated in-memory database and files."""
import io

import bcrypt
import pytest
from fastapi.testclient import TestClient
from PIL import Image
from sqlalchemy import create_engine, text
from sqlalchemy.pool import StaticPool

from backend import admin, app as app_module


@pytest.fixture
def client(monkeypatch, tmp_path):
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
    with engine.begin() as conn:
        conn.execute(text('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password_hash TEXT)'))
        conn.execute(text('CREATE TABLE photos (id INTEGER PRIMARY KEY, title TEXT, alt_text TEXT, category TEXT, caption TEXT, sort_order INTEGER, filename TEXT)'))
        hashed = bcrypt.hashpw(b'a-long-test-password', bcrypt.gensalt()).decode()
        conn.execute(text('INSERT INTO users VALUES (1, :u, :p)'), {'u': 'test', 'p': hashed})
    monkeypatch.setattr(app_module, 'engine', engine)
    monkeypatch.setattr(admin, 'UPLOAD_ROOT', tmp_path)
    admin.attempts.clear()
    with TestClient(app_module.app) as session:
        yield session
    engine.dispose()


def test_authentication_csrf_and_photo_upload(client, tmp_path):
    assert client.get('/api/admin/content/photos').status_code == 401
    token = client.get('/api/admin/session').json()['csrf']
    assert client.post('/api/admin/login', json={'username': 'test', 'password': 'wrong'}, headers={'X-CSRF-Token': token}).status_code == 401
    assert client.post('/api/admin/login', json={'username': 'test', 'password': 'a-long-test-password'}).status_code == 403
    login = client.post('/api/admin/login', json={'username': 'test', 'password': 'a-long-test-password'}, headers={'X-CSRF-Token': token})
    assert login.status_code == 200
    token = login.json()['csrf']
    data = io.BytesIO()
    Image.new('RGB', (4, 4), 'red').save(data, format='PNG')
    result = client.post('/api/admin/content/photos', data={'title': 'Test photo'}, files={'filename': ('test.png', data.getvalue(), 'image/png')}, headers={'X-CSRF-Token': token})
    assert result.status_code == 200
    record = client.get('/api/admin/content/photos').json()[0]
    assert record['title'] == 'Test photo'
    assert (tmp_path / 'photos' / record['filename']).exists()
    bad = client.post('/api/admin/content/photos', data={'title': 'Bad'}, files={'filename': ('bad.png', b'not an image', 'image/png')}, headers={'X-CSRF-Token': token})
    assert bad.status_code == 400
    assert client.post(f"/api/admin/content/photos/{record['id']}/delete", headers={'X-CSRF-Token': token}).status_code == 200
    assert (tmp_path / 'photos' / record['filename']).exists()
