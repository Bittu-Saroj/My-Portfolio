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

GitHub Pages stages only index.html, CNAME, robots.txt, sitemap.xml, css/, js/,
assets/images/ and assets/videos/ into _site/. PHP, SQL, runtime uploads and
documentation are excluded. CNAME configures the custom domain. Pages displays
fallback content; it cannot run PHP APIs or the admin.

For the editable site deploy public files, index.php and admin/ to a PHP/MySQL
host, and configure the environment and storage described above.
This cleanup does not deploy the site or import a database.

See [project audit](docs/PROJECT_AUDIT.md) for dependencies, cleanup classification
and verification limits, and [change history](docs/CHANGELOG.md) for past work.
