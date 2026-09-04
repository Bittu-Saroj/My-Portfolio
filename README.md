Saroj Pathak — Portfolio (Starter)

Overview
--------
This is a modern, responsive, accessible portfolio starter for Saroj Pathak. It uses plain HTML, CSS and JavaScript and is designed so content (images, projects, videos, text) can be replaced easily.

How to open
-----------
1. Open C:/Portofilo/saroj-portfolio/index.html in a browser (Chrome/Edge/Firefox).
2. No build step required. Files are static.

Where to place your assets
-------------------------
Place your images and videos into the assets folder (paths below are referenced by the site):

- Profile photo: assets/images/profile.png
- Favicon: assets/images/favicon.ico

Design images (placeholders in code):
- assets/images/design/social-01.jpg
- assets/images/design/social-02.jpg
- assets/images/design/poster-01.jpg
- assets/images/design/branding-01.jpg
- assets/images/design/ad-01.jpg

Photography:
- assets/images/photography/portrait-01.jpg
- assets/images/photography/landscape-01.jpg
- assets/images/photography/event-01.jpg
- assets/images/photography/product-01.jpg

Editing (before/after):
- assets/images/editing/before-01.jpg
- assets/images/editing/after-01.jpg

Projects screenshots:
- assets/images/projects/project-placeholder.jpg

Videos (optional):
- assets/videos/project-01.mp4
- assets/videos/reel-01.mp4

Notes & customization
---------------------
- All image paths are local and intentionally placeholders. Replace with your real images.
- Project data is inlined in js/script.js as simple arrays (designProjects, photos). Edit these arrays to add new projects and thumbnails.
- Contact form submissions are delivered to `bittu.ov2@gmail.com` through FormSubmit. FormSubmit requires one-time email activation before the first message is delivered.
- Replace [College Name], [Location], [Year] in the Education section with your details.
- Social links in the footer are placeholders. Add real URLs when available.

Accessibility & performance
---------------------------
- Semantic HTML used for headings and landmarks.
- Images should include descriptive alt text. Update alt attributes when adding real images.
- Transitions respect prefers-reduced-motion.

If you want me to:
- Add a backend script (PHP) for contact email delivery
- Convert this to a small PHP site with templating (header/footer include)
- Add image optimization and webp fallbacks

Admin & dynamic content (PHP + MySQL)
-------------------------------------
An admin area has been added at /admin to manage photos, videos, and the creative process. To set it up:

1. Create a MySQL database and user.
2. Edit admin/inc/config.php and set DB credentials (or set DB_HOST, DB_NAME, DB_USER and DB_PASS environment variables on the host).
3. Run the SQL file admin/init.sql in your database (phpMyAdmin or MySQL CLI) to create tables.
4. Create an admin user by generating a password hash in PHP and inserting it into the `users` table. Example (run in PHP):

   <?php
   echo password_hash('yourpassword', PASSWORD_DEFAULT);
   ?>

   Then run (replace <hash> with the output):
   INSERT INTO users (username, password_hash, email) VALUES ('admin', '<hash>', 'you@example.com');

5. Ensure the uploads directories are writable: assets/uploads/photos and assets/uploads/videos.
6. Open https://www.sarojpathak7.com.np/admin/login.php and sign in.

Public API endpoints
--------------------
- /admin/api-photos.php  -> returns JSON list of photos to be consumed by the public site.
- /admin/api-design.php  -> returns JSON list of design projects (used by the "Selected Design Work" gallery).

Notes
-----
- The admin area uses secure practices: prepared statements, CSRF tokens, password hashing, file validation. Review and lock down admin access and consider using HTTPS and limiting access by IP if needed.
- Design projects uploaded via the admin are stored in assets/uploads/projects and served by the front-end. If you prefer to use assets/images/design (committed images), you can add items manually to the DB with that path in filename or update the API logic.

Tell me if you want the admin protected behind Basic Auth, an extra .htaccess layer, or if you want me to implement the contact form sending via PHP next.

Tell me what to do next and I'll proceed.

Hosting
-------
GitHub Pages serves the static portfolio at https://www.sarojpathak7.com.np/, but it cannot execute the PHP admin area or connect to MySQL. For the complete editable site, deploy this repository to a PHP/MySQL host and set `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASS` as environment variables. Never commit production credentials.
