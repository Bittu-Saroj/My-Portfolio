"""Read-only FastAPI replacement for the portfolio's public PHP endpoints.

The PHP administration pages are not migrated yet. Do not deploy both servers
to the same path without a reverse proxy explicitly routing the admin pages.
"""
import logging
import os
from pathlib import Path
from urllib.parse import quote

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import URL, create_engine, text
from sqlalchemy.exc import SQLAlchemyError

ROOT = Path(__file__).resolve().parent.parent
logger = logging.getLogger(__name__)
app = FastAPI(title="Saroj Pathak Portfolio", docs_url=None, redoc_url=None)
url = URL.create(
    "mysql+pymysql",
    username=os.getenv("DB_USER", "portfolio"),
    password=os.getenv("DB_PASS", ""),
    host=os.getenv("DB_HOST", "127.0.0.1"),
    port=int(os.getenv("DB_PORT", "3306")),
    database=os.getenv("DB_NAME", "saroj_portfolio"),
    query={"charset": "utf8mb4"},
)
engine = create_engine(url, pool_pre_ping=True)


def rows(sql: str) -> list[dict]:
    try:
        with engine.connect() as connection:
            return [dict(row) for row in connection.execute(text(sql)).mappings()]
    except SQLAlchemyError:
        logger.exception("Portfolio database request failed")
        raise HTTPException(status_code=503, detail="Portfolio data is temporarily unavailable")


def media(folder: str, name: str | None) -> str:
    return f"assets/uploads/{folder}/{quote(name, safe='')}" if name else ""


@app.get("/admin/api-settings.php")
def settings():
    result = {row["setting_key"]: row["setting_value"] for row in rows("SELECT setting_key, setting_value FROM site_settings")}
    cover = rows("SELECT filename FROM photos WHERE category = 'cover' ORDER BY created_at DESC LIMIT 1")
    if cover:
        result["cover_image"] = media("photos", cover[0]["filename"])
    return result


@app.get("/admin/api-design.php")
def design():
    result = rows("SELECT id, title, category, filename, tools, description FROM design_projects ORDER BY created_at DESC")
    return [{"id": r["id"], "title": r["title"], "category": r["category"], "image": media("projects", r["filename"]) or "assets/images/design/social-01.svg", "tools": r["tools"], "description": r["description"]} for r in result]


@app.get("/admin/api-photos.php")
def photos():
    result = rows("SELECT id, filename, title, alt_text, category FROM photos WHERE category IS NULL OR category = '' OR category <> 'cover' ORDER BY sort_order DESC, created_at DESC")
    return [{"id": r["id"], "image": media("photos", r["filename"]), "title": r["title"], "alt": r["alt_text"], "category": r["category"]} for r in result]


@app.get("/admin/api-tools.php")
def tools():
    result = rows("SELECT id, title, description, image FROM technology_tools ORDER BY sort_order ASC, created_at ASC")
    for row in result:
        row["image"] = media("tools", row["image"])
    return result


@app.get("/admin/api-videos.php")
def videos():
    result = rows("SELECT id, filename, title, description, thumb, external_url FROM videos ORDER BY sort_order DESC, created_at DESC")
    return [{"id": r["id"], "title": r["title"], "description": r["description"], "thumb": media("videos", r["thumb"]), "video": media("videos", r["filename"]), "url": r["external_url"]} for r in result]


@app.get("/admin/api-process.php")
def process():
    return rows("SELECT id, step_index, title, description FROM process_steps ORDER BY step_index ASC")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/", include_in_schema=False)
def home():
    return FileResponse(ROOT / "index.html")


for directory in ("assets", "css", "js"):
    app.mount(f"/{directory}", StaticFiles(directory=ROOT / directory), name=directory)
