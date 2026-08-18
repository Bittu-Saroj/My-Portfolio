<?php
require_once __DIR__ . '/inc/config.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/csrf.php';
require_login();
// Simple dashboard
$stmt = $pdo->query('SELECT (SELECT COUNT(*) FROM photos) AS photos, (SELECT COUNT(*) FROM design_projects) AS projects, (SELECT COUNT(*) FROM videos) AS videos, (SELECT COUNT(*) FROM technology_tools) AS tools');
$stats = $stmt->fetch();
?>
<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin - Dashboard</title>
<link rel="stylesheet" href="../css/style.css">
<style>.dash{max-width:1100px;margin:1.5rem auto}</style>
</head><body>
  <nav style="display:flex;justify-content:space-between;align-items:center;padding:1rem 2rem;background:#0b0b0b;color:#fff"><div>Admin</div><div><a href="settings.php" style="color:#fff;margin-right:1rem">Site Settings</a><a href="cover.php" style="color:#fff;margin-right:1rem">Cover</a><a href="photos.php" style="color:#fff;margin-right:1rem">Through My Lens</a><a href="projects.php" style="color:#fff;margin-right:1rem">Design</a><a href="tools.php" style="color:#fff;margin-right:1rem">Technology</a><a href="videos.php" style="color:#fff;margin-right:1rem">Videos</a><a href="process.php" style="color:#fff;margin-right:1rem">Process</a><a href="logout.php" style="color:#fff">Logout</a></div></nav>
  <main class="dash">
    <h1>Dashboard</h1>
    <p>Quick links to manage your portfolio.</p>
    <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:1rem">
      <div style="background:#111;padding:1rem;border-radius:8px;min-width:200px">Photos<br><strong><?php echo isset($stats['photos'])?e($stats['photos']):'0'?></strong></div>
      <div style="background:#111;padding:1rem;border-radius:8px;min-width:200px">Design Projects<br><strong><?php echo isset($stats['projects'])?e($stats['projects']):'0'?></strong></div>
      <div style="background:#111;padding:1rem;border-radius:8px;min-width:200px">Videos<br><strong><?php echo isset($stats['videos'])?e($stats['videos']):'0'?></strong></div>
      <div style="background:#111;padding:1rem;border-radius:8px;min-width:200px">Technology Tools<br><strong><?php echo isset($stats['tools'])?e($stats['tools']):'0'?></strong></div>
    </div>
  </main>
</body></html>
