# Project audit — 2026-09-08

## Scope and architecture

Reviewed the 65 tracked files from the repository root, including hidden deployment
configuration, all PHP handlers/helpers, HTML, JavaScript, both stylesheets, SQL,
documentation and asset references. Binary assets were inventoried and hashed;
their visual content was not reviewed. The initial worktree was clean. No
AGENTS.md was found in the project. `.qodo/` contains empty local directories.

The public entry is `index.html`; `index.php` reads it without duplicating markup.
`css/style.css` styles both public and current admin pages. `js/script.js` loads
six read-only `admin/api-*.php` endpoints and provides static fallbacks. Admin
login uses password_verify, regenerated session IDs, and PDO. Authenticated edit
and delete handlers use CSRF tokens and prepared statements. No payment system,
cron jobs, package manager, bundled vendor libraries or separate user accounts
application was found. Contact delivery uses FormSubmit; fonts use Google Fonts
and icons use cdnjs Font Awesome. Remote availability and delivery were not tested.

## Dependency map

| Consumers | Dependency / data |
| --- | --- |
| index.php | index.html |
| index.html and admin pages | css/style.css |
| index.html | js/script.js, assets/images, external fonts/icons, FormSubmit |
| js/script.js | api-settings, api-tools, api-design, api-photos, api-videos, api-process |
| Admin PHP and APIs | admin/inc/config.php → PDO and upload directories |
| Admin management routes | inc/auth.php → config.php; inc/csrf.php for mutations |
| Login | users table; password hashes and sessions |
| Photos / cover / API settings | photos table; assets/uploads/photos |
| Projects / API design | design_projects table; assets/uploads/projects |
| Tools / API tools | technology_tools table; assets/uploads/tools |
| Videos / API videos | videos table; assets/uploads/videos |
| Process / API process | process_steps table |
| Settings / API settings | site_settings table |
| GitHub Pages | explicit static staging directory; CNAME, robots.txt, sitemap.xml |

All seven queried tables are defined in the initialization SQL. No database was
imported, changed or deleted. Live database rows and runtime upload references
were unavailable for verification, so no media files are deletion candidates.

## Classification recorded before cleanup

| Class | Files / evidence |
| --- | --- |
| KEEP | index.html, index.php, CNAME, robots.txt, sitemap.xml, .gitignore, workflow; required entries/configuration |
| KEEP | css/style.css, js/script.js; directly loaded by markup |
| KEEP | admin PHP routes and inc/config.php, auth.php, csrf.php; linked routes, includes, fetches and form actions |
| KEEP | All 19 image assets; HTML metadata, markup, JavaScript fallbacks and APIs reference these assets |
| KEEP | assets/videos/.gitkeep; intentionally preserves optional media directory |
| KEEP (historical) | admin/inc/nav.php and admin/css/admin.css; no active include/link references; retain together in original locations for potential reuse, exclude from Pages |
| MOVE | admin/init.sql → database/init.sql; setup-only, no runtime include, update README |
| MOVE | CHANGELOG.md → docs/CHANGELOG.md; historical documentation, no runtime consumer |
| ARCHIVE | PROJECT_ANALYSIS.md → docs/archive/PROJECT_ANALYSIS.md; stale deployment claims, preserve with warning |
| MERGE | No duplicate application files proved safe to merge; keep static fallback markup for no-JS use |
| DELETE | assets/images/.gitkeep; empty marker in populated tracked directory, no runtime consumer |
| DELETE (code) | unused $base variable in api-photos.php; no reads in endpoint |

SHA-256 comparison found only the two empty .gitkeep files identical. They serve
different directories, so only the populated-directory marker is redundant.
Repeated media-query overrides and duplicate-looking navigation markup are not
automatically dead: CSS cascade and separate desktop/mobile behavior matter.

## Findings and scoped corrections

- Pages uploaded the repository root, including PHP source, SQL and internal docs.
  Stage an explicit static file set instead; retain PHP functionality in source.
- Missing upload directories made realpath return false, producing a root separator
  instead of a valid upload destination. Use absolute paths independent of existence.
- Database connection errors disclosed exception details. Return a generic error.
- index.html referenced a nonexistent favicon.ico. Reuse the existing profile SVG.
- The video API renderer expected #video-grid but markup lacked that ID. Add it.
- Remove the confirmed unused API variable and redundant image directory marker.
- Correct README asset extensions, setup paths, hosting instructions and stale claims.

## Remaining security and quality findings

- No concrete production secret found in current tracked files; DB_PASS contains a
  placeholder. This is not a Git-history or deployed-server secret audit.
- SVG uploads are accepted without sanitization; direct navigation can execute
  active SVG content on the site origin. Sanitize or isolate uploads before production.
- Upload replacement unlinks old media before successful database writes; failed
  writes can orphan uploads or lose the previous file. Use transactional staging.
- Application-level upload size/error validation is incomplete; a new photo with
  no valid upload can attempt a NULL insert into a NOT NULL filename column.
- Login lacks rate limiting; session cookie flags depend on host PHP configuration;
  logout is a GET action. Review host settings and use CSRF-protected POST logout.
- Settings JavaScript contains unsafe innerHTML interpolation for legacy contact
  selectors, and social/video URLs lack protocol validation. Current contact-list
  selectors match no markup, but should be replaced with safe DOM rendering.
- Cover deletion still links via GET to a POST-only handler, so that control is
  ineffective. It needs a CSRF-protected form; retained as an existing functional
  issue outside the minimal file-organization changes.
- Settings selectors drifted: About targets the role paragraph; contact settings
  target old markup; before/after settings update data attributes after images are
  built. These require a focused behavior correction and browser regression checks.
- Two scroll handlers compete to assign active navigation. Responsive CSS contains
  accumulated overrides; removal needs viewport testing, not reference counting.
- Fallback tool image names do not align with labels; verify image contents before
  relabeling. Empty tool API responses still display fallback tools.
- A video with a thumbnail but no external URL does not get a playable control.
- CDN resources have no integrity pin; contact delivery requires external setup.
- For PHP hosting, exclude docs, database, dotfiles and local files from the public
  document root (or deny HTTP access in host configuration). Moving a directory
  alone does not prevent web access. Pages staging excludes these directories.

## Final structure

```text
index.html / index.php / CNAME / robots.txt / sitemap.xml / README.md
css/                       shared active styles
js/                        public behavior
assets/images/             tracked public images and placeholders
assets/videos/             optional static videos
assets/uploads/            ignored runtime media, created by PHP
admin/                     existing routes, APIs and shared helpers
database/init.sql          setup schema, not public deployment content
docs/PROJECT_AUDIT.md       current audit and verification
docs/CHANGELOG.md           historical change log
docs/archive/              prior analysis with historical-path warning
.github/workflows/         static deployment staging
```

## Verification

- All 31 PHP files passed PHP 8.2 syntax validation; JavaScript parsed successfully.
- Checked 177 local reference occurrences (literal includes, markup paths, fetch
  endpoints and fallback images). The retained sidebar's relative links were
  evaluated in its intended admin-page include context. No missing local file
  targets remained in these checks. Dynamic database filenames remain unverified.
- Homepage fragment targets exist, IDs are unique, and #video-grid now exists.
- Local HTTP smoke checks returned 200 for /, /index.php, both public code assets
  and the SVG favicon. All six APIs returned 500 because the local test environment
  has no working database configuration; successful JSON/CRUD is not claimed.
- Evaluated all four upload-directory definitions in isolation: each resolves
  beneath this checkout's assets/uploads directory even before it exists.
- Reproduced static staging locally: 26 files, all byte-identical to their source;
  no PHP, SQL or Markdown files and no admin directory. Temporary staging removed.
- git diff --check passed. Re-scanned the remaining file inventory and retained
  all 19 images. No application routes or runtime data were deleted.
- Browser setup returned no available browser and discovery returned an empty
  list. Visual/responsive checks, JavaScript interactions and API fallback rendering
  could not be verified in a browser. No external form submission was made.
- No GitHub deployment was triggered. The workflow was inspected and its file-copy
  result verified locally; it was not run on a GitHub Actions runner.

Runtime CRUD, authentication, uploads and external delivery still require a
configured test database and browser. This cleanup is not a claim that the
pre-existing functional and security findings above have been resolved.
