# Saroj Pathak Portfolio - Complete Project Analysis

## 1. Scope

This document is the complete top-to-bottom analysis of the repository at the time of review. It covers every project file, its purpose, its relationships, the runtime flow, security controls, deployment behavior, and known placeholder content.

The repository is a PHP 8+, MariaDB/MySQL, Apache, HTML5, CSS3, and ES6 JavaScript portfolio application. The public site remains server-compatible with static hosting because the main page is HTML; the admin and API features require PHP and MariaDB.

## 2. Runtime entry points

| Entry point | Purpose |
| --- | --- |
| `index.php` | PHP-compatible wrapper that serves `index.html`. |
| `index.html` | Public portfolio page structure and content. |
| `admin/login.php` | Admin authentication page. |
| `admin/index.php` | Authenticated admin dashboard. |
| `admin/*.php` | Admin content management pages and actions. |
| `admin/api-*.php` | Public JSON endpoints used by the browser JavaScript. |
| `js/script.js` | Public data loading and interaction layer. |
| `css/style.css` | Public visual system and responsive layout. |
| `admin/css/admin.css` | Admin visual system and responsive layout. |

## 3. Complete file inventory

### Root files

#### `README.md`

Project setup and usage documentation. It describes the static portfolio, asset locations, admin setup, database initialization, public API endpoints, security notes, and hosting limitations. It links to `CHANGELOG.md`.

#### `CHANGELOG.md`

Historical record of the MariaDB recovery, database authentication fix, admin redesign, CRUD synchronization, responsive work, ivory theme, fixed navigation, readability improvements, spacing fixes, deployment, and verification.

#### `PROJECT_ANALYSIS.md`

This document: the complete repository-level file and architecture analysis.

#### `index.html`

The public page markup. It contains:

- Skip navigation link.
- Fixed responsive navigation.
- Hero section and profile area.
- About section and software/technology list.
- Education section.
- Design portfolio section and filters.
- Photography gallery.
- Before/after editing comparison.
- Video and motion section.
- Technology projects section.
- Services section.
- Creative process timeline.
- Contact form and contact information.
- Footer and social links.
- Lightbox container.

Dynamic containers include `#design-grid`, `#photo-grid`, `#video-grid`, and `#process-timeline`. These are populated by `js/script.js`.

#### `index.php`

Minimal PHP entry wrapper. It reads and outputs `index.html`, allowing Apache/PHP deployments to serve the public site at `/` and `/index.php` without rebuilding the existing static page.

#### `CNAME`

Custom domain configuration used by GitHub Pages.

#### `.gitignore`

Excludes local/runtime files and generated or sensitive content from version control.

### Public styling and behavior

#### `css/style.css`

The public design system. It defines:

- Ivory background and white surface tokens.
- Navy text and muted text tokens.
- Gold accent and hover tokens.
- Fixed translucent navigation.
- Responsive container and spacing tokens.
- Hero layout and profile frame.
- Typography hierarchy.
- Buttons, badges, labels, filters, cards, forms, and footer.
- Portfolio grids and media sizing.
- Before/after comparison styling.
- Lightbox presentation.
- Loading and empty states.
- Reveal transitions.
- Desktop, laptop, tablet, mobile, and extra-small responsive rules.
- Reduced-motion behavior.

The current spacing system uses shared variables such as `--space-section` and `--space-grid`. The hero no longer has a forced viewport height, preventing an unnecessary gap before the About section.

#### `js/script.js`

The public interaction and synchronization layer. It handles:

- API requests and fallback behavior.
- Site settings loading.
- Tools/software rendering.
- Design project rendering and filtering.
- Photography rendering.
- Video rendering.
- Creative process rendering.
- Responsive navigation drawer.
- Scroll-aware header behavior.
- Scroll reveal behavior.
- Before/after slider interaction.
- Image lightbox behavior.
- Contact form validation and feedback.
- Loading and empty states.

The script preserves local fallback content when an API is unavailable, while successful empty API responses clear managed content so deleted records do not remain visible.

### GitHub Pages and repository configuration

#### `.github/workflows/deploy-pages.yml`

GitHub Actions workflow for deploying the static public portfolio to GitHub Pages. PHP admin functionality cannot execute on GitHub Pages and requires an Apache/PHP/MariaDB host.

### Admin shared infrastructure

#### `admin/css/admin.css`

Shared admin design system. It defines:

- Sidebar and active navigation state.
- Top bar and content shell.
- KPI cards.
- Dashboard cards.
- Tables and responsive table wrappers.
- Forms and controls.
- Buttons and status badges.
- Mobile drawer behavior.
- Responsive breakpoints.
- Light premium SaaS styling.

#### `admin/inc/nav.php`

Reusable authenticated admin sidebar and navigation. It highlights the current page and exposes links for dashboard, settings, cover, projects, photos, tools, videos, process, and logout.

#### `admin/inc/config.php`

Database connection configuration. It reads environment variables when available and uses local fallback values for the restored XAMPP environment. It creates the PDO connection with exception mode and safe fetch settings.

Production deployments should use environment variables and should not commit credentials.

#### `admin/inc/auth.php`

Authentication helper. It starts the session when necessary and protects admin pages by requiring a logged-in user.

#### `admin/inc/csrf.php`

CSRF helper. It creates/reuses a session token and validates submitted tokens for state-changing admin operations.

### Admin API files

#### `admin/api-settings.php`

Returns public site settings as JSON for the public JavaScript layer.

#### `admin/api-tools.php`

Returns managed tools/software records as JSON.

#### `admin/api-design.php`

Returns managed design project records as JSON.

#### `admin/api-photos.php`

Returns managed photography records as JSON.

#### `admin/api-videos.php`

Returns managed video records as JSON.

#### `admin/api-process.php`

Returns managed creative process records as JSON.

All public API files are read-only endpoints from the browser perspective. Admin changes are made through authenticated admin pages and POST actions.

### Admin dashboard and pages

#### `admin/index.php`

Authenticated dashboard. It presents:

- Overview KPIs.
- Content growth or summary visualization.
- Recent activity.
- Quick actions.
- Responsive admin shell and navigation.

#### `admin/login.php`

Admin login form. It validates credentials against the users table using password hashing and starts the authenticated session.

#### `admin/logout.php`

Destroys the admin session and returns the user to the login page.

#### `admin/settings.php`

Site settings management page. It manages public-facing text/contact/social configuration and uses the shared admin form styles.

#### `admin/cover.php`

Cover/profile image management page. It handles the homepage profile asset and provides the admin interface for viewing or changing it.

#### `admin/photos.php`

Photography list page. It displays existing records and exposes Add, Edit, and Delete actions.

#### `admin/photo-edit.php`

Photography create/edit form. It validates submitted fields and uploads or updates photo records.

#### `admin/photo-delete.php`

Authenticated photo deletion action using POST and CSRF validation.

#### `admin/projects.php`

Design project list page with Add, Edit, Delete, filtering/list presentation, and shared admin layout.

#### `admin/project-edit.php`

Design project create/edit form. It handles project metadata, categories, links, and uploaded project images.

#### `admin/project-delete.php`

Authenticated project deletion action using POST and CSRF validation.

#### `admin/tools.php`

Tools/software list page with Add, Edit, and Delete operations.

#### `admin/tool-edit.php`

Tools/software create/edit form.

#### `admin/tool-delete.php`

Authenticated tool deletion action using POST and CSRF validation.

#### `admin/videos.php`

Video list page with Add, Edit, and Delete operations.

#### `admin/video-edit.php`

Video create/edit form for titles, descriptions, media paths, and related metadata.

#### `admin/video-delete.php`

Authenticated video deletion action using POST and CSRF validation.

#### `admin/process.php`

Creative process list page with Add, Edit, and Delete operations.

#### `admin/process-edit.php`

Creative process create/edit form.

#### `admin/process-delete.php`

Authenticated process-step deletion action using POST and CSRF validation.

### Database

#### `admin/init.sql`

Database initialization script. It creates the application tables required by the admin and public APIs, including users, settings, projects, photos, tools, videos, and process content as defined by the current schema.

The script includes setup guidance for generating password hashes. It does not contain a production password.

### Asset directories

#### `assets/images/.gitkeep`

Keeps the base image directory in version control.

#### `assets/videos/.gitkeep`

Keeps the base video directory in version control.

#### `assets/images/profile.svg`

Placeholder profile image used when a real profile image has not been uploaded.

#### `assets/images/design/ad-01.svg`

Placeholder advertisement design asset.

#### `assets/images/design/branding-01.svg`

Placeholder branding design asset.

#### `assets/images/design/poster-01.svg`

Placeholder poster design asset.

#### `assets/images/design/social-01.svg`

Placeholder social media design asset.

#### `assets/images/photography/event-01.svg`

Placeholder event photography asset.

#### `assets/images/photography/landscape-01.svg`

Placeholder landscape photography asset.

#### `assets/images/photography/portrait-01.svg`

Placeholder portrait photography asset.

#### `assets/images/photography/product-01.svg`

Placeholder product photography asset.

#### `assets/images/editing/before-01.svg`

Placeholder before image for the before/after comparison.

#### `assets/images/editing/after-01.svg`

Placeholder after image for the before/after comparison.

#### `assets/images/projects/project-placeholder.svg`

Placeholder project screenshot used by the technology project cards.

## 4. Application data flow

### Public page load

1. Apache serves `index.php` or `index.html`.
2. `index.html` loads the public stylesheet and deferred JavaScript.
3. `js/script.js` initializes navigation, visual interactions, and data loading.
4. JavaScript requests public `admin/api-*.php` endpoints.
5. JSON records are rendered into the relevant section containers.
6. If an endpoint is unavailable, local fallback content or an empty state is rendered.

### Admin content update

1. User opens an admin page.
2. `auth.php` requires an authenticated session.
3. The page loads records through PDO.
4. The user submits a form with a CSRF token.
5. The edit/create handler validates fields and files.
6. Prepared SQL statements write the database change.
7. The public API returns the changed records on the next public page load.

### Admin deletion

1. User clicks Delete.
2. The page asks for confirmation.
3. A POST request includes the CSRF token and record identifier.
4. The delete action validates the session and token.
5. The record is removed using a prepared statement.
6. The public API returns the updated list, including an empty list when all records are deleted.

## 5. Security review summary

Implemented protections:

- Password hashing through PHP password APIs.
- PDO prepared statements.
- Exception-based database errors.
- Session-based admin authentication.
- CSRF tokens for state-changing actions.
- Server-side admin route protection.
- File handling validation in upload forms.
- No production credentials in the repository.

Operational recommendations:

- Set database credentials through environment variables in production.
- Use HTTPS.
- Restrict access to the admin path when appropriate.
- Configure upload directory permissions carefully.
- Add server-side upload size and MIME restrictions appropriate to hosting.
- Replace placeholder contact/social values before publishing.

## 6. Known placeholders requiring content replacement

- Profile image placeholder.
- Design gallery placeholder assets.
- Photography placeholder assets.
- Before/after placeholder assets.
- Technology project screenshot placeholders.
- College name, location, and year.
- Instagram and Facebook placeholder links.
- Optional GitHub and live-demo project links.
- Video placeholder state when no managed videos exist.

## 7. Deployment layout

The local XAMPP deployment is:

```text
C:\xampp\htdocs\saroj_portfolio
```

The active local runtime uses:

- Apache from XAMPP.
- PHP 8.2.x.
- MariaDB on port `3306`.
- Database: `saroj_portfolio`.
- Application database user: `dbuser`.

The source worktree is:

```text
C:\Portofilo.worktrees\mariadb-clean-reset-and-rebuild
```

## 8. Recovery records

The MariaDB reset preserved recovery copies before rebuilding:

- `C:\xampp\mysql\data-recovery-copy-20260904-1150`
- `C:\xampp\mysql\data-pre-reset-20260904-1200`

The active database was recreated and imported from the preserved recovery data. Old local databases are not active unless restored later.

## 9. Verification history

- PHP syntax validation passed for the admin PHP files.
- Public homepage returned HTTP 200.
- Admin routes were checked through local Apache.
- PDO connectivity was verified after the credential correction.
- Public API-backed sections were checked after CRUD synchronization.
- Fixed navigation was verified while scrolling.
- Ivory theme colors were verified in the browser.
- Responsive layouts were checked at desktop, laptop, tablet, and mobile widths.
- Horizontal overflow checks passed at tested widths.
- Readability changes were deployed and checked.
- Spacing changes were deployed and checked.
- `git diff --check` passed during the documentation update.

## 10. Recommended maintenance order

1. Replace placeholder images with optimized WebP/JPEG assets.
2. Replace placeholder contact and social links.
3. Replace education placeholders.
4. Set production database values through environment variables.
5. Review upload limits and permissions.
6. Configure HTTPS and admin access restrictions.
7. Keep public API responses read-only and authenticated mutation routes protected.
8. Re-run responsive checks after replacing media assets.

