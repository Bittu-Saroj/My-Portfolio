"""FastAPI administration endpoints using the existing portfolio schema."""
import hmac
import io
import secrets
import time
from collections import defaultdict, deque
from pathlib import Path
from urllib.parse import urlparse

import bcrypt
from fastapi import APIRouter, HTTPException, Request
from starlette.datastructures import UploadFile
from PIL import Image, UnidentifiedImageError
from sqlalchemy import text

router = APIRouter(prefix='/api/admin')
attempts = defaultdict(deque)
FIELDS = {
    'photos': ('photos', ('title', 'alt_text', 'category', 'caption', 'sort_order'), {'filename': 'photos'}),
    'projects': ('design_projects', ('title', 'category', 'tools', 'description'), {'filename': 'projects'}),
    'videos': ('videos', ('title', 'description', 'external_url', 'sort_order'), {'filename': 'videos', 'thumb': 'videos'}),
    'tools': ('technology_tools', ('title', 'description', 'sort_order'), {'image': 'tools'}),
    'process': ('process_steps', ('step_index', 'title', 'description'), {}),
}
SETTING_KEYS = {'site_name','hero_eyebrow','hero_title','hero_sub','hero_intro','about_text','education_title','education_text','design_intro','photo_intro','before_title','before_intro','before_image','after_image','video_intro','projects_intro','contact_title','contact_intro','email','phone','instagram_url','instagram_label','facebook_url','facebook_label','github_url','linkedin_url'}
UPLOAD_ROOT = Path(__file__).resolve().parent.parent / 'assets' / 'uploads'
IMAGE_FORMATS = {'JPEG': 'jpg', 'PNG': 'png', 'WEBP': 'webp'}


async def save_upload(upload: UploadFile, folder: str, is_video: bool) -> str:
    limit = 100 * 1024 * 1024 if is_video else 10 * 1024 * 1024
    content = await upload.read(limit + 1)
    if not content or len(content) > limit:
        raise HTTPException(400, 'File is empty or exceeds the upload limit')
    if is_video:
        if len(content) >= 12 and content[4:8] == b'ftyp':
            extension = 'mp4'
        elif content.startswith(b'\x1a\x45\xdf\xa3'):
            extension = 'webm'
        else:
            raise HTTPException(400, 'Only MP4 or WebM videos are supported')
    else:
        try:
            with Image.open(io.BytesIO(content)) as image:
                extension = IMAGE_FORMATS.get(image.format)
                if not extension or image.width * image.height > 40_000_000:
                    raise HTTPException(400, 'Invalid or excessively large image')
                image.verify()
        except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
            raise HTTPException(400, 'Invalid image file')
    directory = UPLOAD_ROOT / folder
    directory.mkdir(parents=True, exist_ok=True)
    name = secrets.token_hex(16) + '.' + extension
    # Exclusive creation prevents overwriting any pre-existing media.
    with (directory / name).open('xb') as target:
        target.write(content)
    return name


def db():
    from .app import engine
    return engine


def require_user(request: Request):
    user_id = request.session.get('user_id')
    if not user_id:
        raise HTTPException(401, 'Sign in required')
    with db().connect() as conn:
        if conn.execute(text('SELECT id FROM users WHERE id=:id'), {'id': user_id}).first() is None:
            request.session.clear()
            raise HTTPException(401, 'Session unavailable')


def csrf(request: Request):
    expected = request.session.get('csrf', '')
    supplied = request.headers.get('x-csrf-token', '')
    if not expected or not hmac.compare_digest(expected, supplied):
        raise HTTPException(403, 'Invalid security token')


@router.get('/session')
def session(request: Request):
    token = request.session.setdefault('csrf', secrets.token_urlsafe(32))
    return {'authenticated': bool(request.session.get('user_id')), 'csrf': token}


@router.post('/login')
async def login(request: Request):
    csrf(request)
    client = request.client.host if request.client else 'unknown'
    bucket = attempts[client]
    now = time.monotonic()
    while bucket and bucket[0] < now - 900:
        bucket.popleft()
    if len(bucket) >= 10:
        raise HTTPException(429, 'Too many attempts. Try again later.')
    bucket.append(now)
    data = await request.json()
    username, password = str(data.get('username', ''))[:100], str(data.get('password', ''))
    with db().connect() as conn:
        user = conn.execute(text('SELECT id, password_hash FROM users WHERE username=:name'), {'name': username}).mappings().first()
    try:
        valid = bool(user and len(password.encode()) <= 72 and bcrypt.checkpw(password.encode(), user['password_hash'].encode().replace(b'$2y$', b'$2b$', 1)))
    except ValueError:
        valid = False
    if not valid:
        raise HTTPException(401, 'Invalid username or password')
    bucket.clear()
    request.session.clear()
    request.session.update({'user_id': user['id'], 'csrf': secrets.token_urlsafe(32)})
    return {'ok': True, 'csrf': request.session['csrf']}


@router.post('/logout')
def logout(request: Request):
    require_user(request)
    csrf(request)
    request.session.clear()
    return {'ok': True}


@router.get('/settings')
def get_settings(request: Request):
    require_user(request)
    with db().connect() as conn:
        return {r['setting_key']: r['setting_value'] for r in conn.execute(text('SELECT setting_key, setting_value FROM site_settings')).mappings()}


@router.put('/settings')
async def save_settings(request: Request):
    require_user(request)
    csrf(request)
    data = await request.json()
    if not isinstance(data, dict) or not set(data).issubset(SETTING_KEYS):
        raise HTTPException(400, 'Invalid settings')
    with db().begin() as conn:
        for key, value in data.items():
            if not isinstance(value, str) or len(value) > 10000:
                raise HTTPException(400, 'Invalid setting value')
            conn.execute(text('INSERT INTO site_settings (setting_key, setting_value) VALUES (:key, :value) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)'), {'key': key, 'value': value})
    return {'ok': True}


def config(kind: str):
    if kind not in FIELDS:
        raise HTTPException(404, 'Unknown content type')
    return FIELDS[kind]


@router.get('/content/{kind}')
def list_content(kind: str, request: Request):
    require_user(request)
    table, fields, files = config(kind)
    columns = ', '.join(('id', *fields, *files))
    with db().connect() as conn:
        return [dict(row) for row in conn.execute(text(f'SELECT {columns} FROM {table} ORDER BY id DESC')).mappings()]


@router.post('/content/{kind}')
@router.post('/content/{kind}/{item_id}')
async def save_content(kind: str, request: Request, item_id: int | None = None):
    require_user(request)
    csrf(request)
    table, fields, files = config(kind)
    form = await request.form()
    values = {}
    for field in fields:
        value = str(form.get(field, '')).strip()
        if len(value) > 10000:
            raise HTTPException(400, 'Value too long')
        if field in ('sort_order', 'step_index'):
            try:
                value = int(value or 0)
            except ValueError:
                raise HTTPException(400, 'Invalid number')
        if field == 'external_url' and value and urlparse(value).scheme not in ('http', 'https'):
            raise HTTPException(400, 'Invalid video URL')
        values[field] = value
    created = []
    try:
        for field, folder in files.items():
            upload = form.get(field)
            if isinstance(upload, UploadFile) and upload.filename:
                name = await save_upload(upload, folder, kind == 'videos' and field == 'filename')
                values[field] = name
                created.append(UPLOAD_ROOT / folder / name)
        if item_id is None and kind == 'photos' and 'filename' not in values:
            raise HTTPException(400, 'Choose a photo to upload')
        with db().begin() as conn:
            if item_id is not None:
                result = conn.execute(text(f"UPDATE {table} SET " + ', '.join(f'{field}=:{field}' for field in values) + ' WHERE id=:id'), {**values, 'id': item_id})
                if result.rowcount == 0 and not conn.execute(text(f'SELECT id FROM {table} WHERE id=:id'), {'id': item_id}).first():
                    raise HTTPException(404, 'Record not found')
            else:
                conn.execute(text(f"INSERT INTO {table} (" + ', '.join(values) + ') VALUES (' + ', '.join(':' + f for f in values) + ')'), values)
    except Exception:
        for path in created:
            path.unlink(missing_ok=True)
        raise
    return {'ok': True}


@router.post('/content/{kind}/{item_id}/delete')
def delete_content(kind: str, item_id: int, request: Request):
    require_user(request)
    csrf(request)
    table, _, _ = config(kind)
    with db().begin() as conn:
        result = conn.execute(text(f'DELETE FROM {table} WHERE id=:id'), {'id': item_id})
        if not result.rowcount:
            raise HTTPException(404, 'Record not found')
    # Leave uploaded files in place; deleting a row must not destroy media.
    return {'ok': True}
