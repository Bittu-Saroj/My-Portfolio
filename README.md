# Saroj Pathak portfolio

Static HTML/CSS/JavaScript portfolio with optional PHP/MySQL content management.
Run `php -S 127.0.0.1:8000 -t .` from the root and visit localhost:8000.
No frontend build or package installation is required.

## Admin setup

1. Install PHP with PDO MySQL and Fileinfo, and MySQL/MariaDB.
2. Create a database and dedicated user. Set DB_HOST, DB_NAME, DB_USER and DB_PASS
   in the PHP process environment. The source password is a placeholder.
   Local .env files are not automatically loaded.
3. Import [database/init.sql](database/init.sql).
4. Generate a hash with PHP password_hash and insert an admin into users using
   the SQL file's instructions.
5. Make assets/uploads writable by PHP. Its photos, projects, videos and tools
   directories are created automatically. Back up uploads with the database.
6. Open /admin/login.php on your configured PHP host.

Review [security findings and known issues](docs/PROJECT_AUDIT.md) before production.
Keep docs, schema setup, dotfiles and local configuration out of HTTP access.
Configure HTTPS, session cookies, login throttling and upload restrictions.
Never commit credentials or database exports.

## Organization

- index.html: public content, metadata and contact form; index.php serves that HTML.
- css/style.css: public and current admin styles.
- js/script.js: navigation, galleries, API loading, fallbacks and form validation.
- assets/images/profile.png: portrait; profile.svg: metadata and favicon.
- assets/images/design, photography, editing, projects: SVG placeholders.
- assets/images/tools: JPG, PNG and WebP tool images.
- assets/videos: optional static videos; adding a file alone does not publish it.
- assets/uploads: ignored runtime media referenced by database records.
- admin: management routes and public APIs. The unused sidebar and admin-specific
  CSS remain for historical reference; active pages use inline navigation.
- database: schema setup. docs: audit, history and archived analysis.

The six public endpoints are admin/api-settings.php, admin/api-tools.php,
admin/api-design.php, admin/api-photos.php, admin/api-videos.php and
admin/api-process.php. All read the database on the same origin; JavaScript
falls back to static content when APIs are unavailable.

Contact submissions use the FormSubmit address in index.html and depend on
external activation. Changing the public email setting does not change the form
delivery address. Google Fonts and cdnjs supply fonts and icons.

## Deployment

GitHub Pages stages index.html, CNAME, robots.txt, sitemap.xml, css/, js/,
content/, studio/, assets/images/ and assets/videos/ into _site/. PHP, SQL,
runtime uploads and documentation are excluded. CNAME configures the custom
domain. Pages cannot run PHP APIs or the original PHP admin.

### GitHub Pages Portfolio Studio

The static website includes `/studio/`, an owner-only GitHub-backed editor for
photos and videos. It reads and writes `content/portfolio.json` and stores new
files under `assets/images/studio/` or `assets/videos/studio/`. GitHub Pages
publishes each change through the existing workflow. The editor's HTML is public;
write access is enforced by GitHub, and the interface accepts only the
`Bittu-Saroj` account. The owner connects using a fine-grained GitHub token with
access limited to `My-Portfolio` and repository Contents read/write permission.
The token can modify repository contents; it is kept only in page memory and is
sent only to GitHub. Never commit it or share it in chat.

Photos support JPG, PNG and WebP files up to 8 MB. Videos support MP4 and WebM
files up to 20 MB, or an HTTPS link for larger videos. Removing a record hides it
from the site but retains uploaded files in GitHub for recovery. Git history also
retains earlier uploads; repository storage grows as media is added. GitHub Pages
may take several minutes to publish updates. The PHP APIs, when available on a
separate PHP host, still take precedence over the static content file.

The original PHP admin requires a PHP/MySQL host and the security and storage
work described above; it is not served by GitHub Pages.
This cleanup does not deploy the site or import a database.

See [project audit](docs/PROJECT_AUDIT.md) for dependencies, cleanup classification
and verification limits, and [change history](docs/CHANGELOG.md) for past work.
