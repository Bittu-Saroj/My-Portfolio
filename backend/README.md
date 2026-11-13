# FastAPI migration: first phase

The FastAPI app serves the existing public portfolio and implements the six public
JSON endpoints against the existing MySQL schema. It does not yet replace the PHP
admin login, management screens, file uploads, or database setup. Keep the existing
site and database backed up and do not use this app as a full production replacement.

An experimental admin can be enabled locally with `ENABLE_EXPERIMENTAL_ADMIN=true`,
`SESSION_SECRET` (at least 32 random characters), and `COOKIE_SECURE=false` for
localhost. Open `/manage`. It supports the existing PHP bcrypt password hashes,
editing settings and content, and uploading JPG, PNG, WebP, MP4, and WebM files.
It remains disabled by default: complete MySQL integration, migration, security,
and browser tests are required before using it with real data or on the internet.
Uploaded files are never removed when a record is replaced or deleted.
The isolated admin test uses an in-memory SQLite database and temporary files;
it is not a substitute for verifying the existing MySQL schema and media backup.

From the project root, install Python 3.10 or newer, install dependencies with
`pip install -r backend/requirements.txt`, configure `DB_HOST`, `DB_PORT`,
`DB_NAME`, `DB_USER` and `DB_PASS` in your environment, then run
`uvicorn backend.app:app --host 127.0.0.1 --port 8000`.

Go to http://127.0.0.1:8000/. The content APIs return HTTP 503 when MySQL is
unavailable; the existing frontend fallback content remains available. Do not put
database credentials in version control. Copy the existing uploads alongside the
database when migrating; this phase does not write to either.

## Free Render test (public preview only)

`render.yaml` describes a free Render web service for testing. Import the
repository as a Render Blueprint after the changes have been pushed to GitHub.
Provide separate test-only MySQL settings when prompted; never use production
credentials to experiment. Without a database, the page can still show the
frontend's fallback content, but its content API requests return 503. The
FastAPI admin and uploads are not ready and are not included in this preview.
Render's free service has ephemeral local storage and must not be used to store
uploaded media. Do not change your existing domain to point to the test service.
