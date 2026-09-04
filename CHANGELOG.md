# Saroj Pathak Portfolio - Change History

This document records the database recovery, admin improvements, public-site updates, responsive work, and visual refinements completed for the portfolio application.

## 2026-09-04 - Readability and spacing refinement

- Increased small supporting text sizes across navigation, labels, buttons, cards, filters, forms, footer links, and empty states.
- Improved contrast for gold text on the ivory background.
- Improved button text contrast and form-label visibility.
- Added shared spacing tokens for consistent section and grid spacing.
- Normalized gaps between cards, lists, headings, and content blocks.
- Reduced unnecessary mobile whitespace.
- Removed the hero section's forced full-viewport height, which caused a large empty area before the About section.
- Changed the hero to use content-based height with consistent responsive padding.
- Verified the homepage returned HTTP 200 and had no horizontal overflow.

## Public website modernization

- Preserved the existing HTML, PHP wrapper, JavaScript behavior, routes, content, and API-driven sections.
- Added a premium warm ivory visual system:
  - Ivory page background: `#F7F5F0`
  - White surfaces: `#FFFFFF`
  - Soft surface: `#F1EEE7`
  - Navy primary text: `#172033`
  - Slate secondary text: `#5F6673`
  - Gold accent: `#F4C542`
  - Gold hover accent: `#E8B82F`
- Replaced dark page and card styling with light surfaces, subtle borders, and soft shadows.
- Added a subtle radial gold highlight to the hero background.
- Updated the profile frame and card presentation for the light theme.
- Updated navigation, active states, links, icons, buttons, badges, and section dividers.
- Made the header fixed and visible while scrolling.
- Added translucent header styling, blur, border, and scroll shadow behavior.
- Added top content spacing so the fixed header does not cover page content.
- Refined typography hierarchy using responsive sizing and the existing font system.
- Improved button hover, card hover, image hover, focus, and active states.
- Improved mobile navigation behavior with a compact drawer layout.
- Added responsive behavior for desktop, laptop, tablet, mobile, and extra-small screens.
- Improved responsive grids, forms, cards, tables, charts, modals, and footer layout.
- Preserved `prefers-reduced-motion` support.
- Preserved semantic landmarks, skip navigation, labels, alt text, and live feedback areas.

## Admin dashboard and management

- Added a shared admin design system in `admin/css/admin.css`.
- Added reusable admin navigation in `admin/inc/nav.php`.
- Redesigned the admin dashboard with:
  - Responsive sidebar
  - Mobile navigation drawer
  - Top navigation bar
  - KPI cards
  - Growth and activity sections
  - Quick actions
  - Responsive tables
  - Consistent cards, forms, buttons, badges, and modal styling
- Updated admin login and management pages to use the shared admin design.
- Added visible Add controls for:
  - Photos
  - Design projects
  - Tools
  - Videos
  - Creative process steps
- Preserved existing Edit and Delete operations.
- Preserved CSRF protection, prepared statements, authentication, and confirmation prompts.
- Improved the Site Settings page styling and long-page scrolling behavior.
- Updated admin pages for responsive desktop, tablet, and mobile layouts.

## Public CRUD synchronization

- Added database-backed public loading for managed portfolio content.
- Added `admin/api-videos.php`.
- Added `admin/api-process.php`.
- Kept existing photo and design APIs connected to the public site.
- Updated public JavaScript to load:
  - Tools
  - Design projects
  - Photos
  - Videos
  - Process steps
- Ensured empty API responses clear deleted content from the public site.
- Preserved existing frontend filtering, lightbox, forms, navigation, and interactions.

## Database and MariaDB recovery

- Preserved recovery copies before rebuilding MariaDB.
- Created recovery exports for the `saroj_portfolio` database.
- Rebuilt the active MariaDB data directory.
- Recreated and imported the `saroj_portfolio` database.
- Verified the portfolio tables and admin user.
- Restored the `dbuser` account and corrected the local password mismatch.
- Updated the PHP database configuration fallback to use the working local credentials.
- Verified PDO connectivity and direct database access.
- Made no database schema changes.

Recovery copies retained:

- `C:\xampp\mysql\data-recovery-copy-20260904-1150`
- `C:\xampp\mysql\data-pre-reset-20260904-1200`

## Routing and deployment fixes

- Added `index.php` as a PHP entry wrapper for the existing `index.html`.
- Fixed the public-site 404 at `/saroj_portfolio/index.php`.
- Deployed the updated source files to:
  - `C:\xampp\htdocs\saroj_portfolio`
- Verified the public homepage and admin routes through the local Apache server.

## Main files changed

### Created

- `CHANGELOG.md`
- `index.php`
- `admin/css/admin.css`
- `admin/inc/nav.php`
- `admin/api-videos.php`
- `admin/api-process.php`

### Updated

- `README.md`
- `index.html`
- `css/style.css`
- `js/script.js`
- `admin/index.php`
- `admin/login.php`
- `admin/cover.php`
- `admin/photos.php`
- `admin/photo-edit.php`
- `admin/projects.php`
- `admin/project-edit.php`
- `admin/tools.php`
- `admin/tool-edit.php`
- `admin/videos.php`
- `admin/video-edit.php`
- `admin/process.php`
- `admin/process-edit.php`
- `admin/settings.php`
- `admin/inc/config.php`

## Verification completed

- PHP syntax validation passed for the admin PHP files.
- Public homepage returned HTTP 200.
- Admin login and management routes were checked locally.
- Responsive layouts were checked at desktop, laptop, tablet, and mobile widths.
- Horizontal overflow checks passed at the tested viewport sizes.
- Fixed navigation behavior was verified during scrolling.
- Warm ivory colors were verified in the live browser.
- Readability and spacing updates were deployed and verified.

## Current application structure

- Public site: `index.html` served through `index.php`
- Public interactions: `js/script.js`
- Public styling: `css/style.css`
- Admin area: `admin/`
- Admin styling: `admin/css/admin.css`
- Database configuration: `admin/inc/config.php`
- Public content APIs: `admin/api-*.php`
- Database: MariaDB database `saroj_portfolio`

## Important operational notes

- The application is designed for PHP, MySQL/MariaDB, Apache, HTML, CSS, and JavaScript.
- Production database credentials must be stored in environment variables or server configuration and must not be committed.
- The current local XAMPP deployment uses the restored MariaDB service on port `3306`.
- Old local databases are not active after the clean reset unless restored from the preserved recovery copies.
