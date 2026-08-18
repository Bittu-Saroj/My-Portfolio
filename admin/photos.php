<?php
require_once __DIR__ . '/inc/config.php';
require_once __DIR__ . '/inc/auth.php';
require_login();

// Fetch photos
$stmt = $pdo->query("SELECT * FROM photos WHERE category IS NULL OR category = '' OR category <> 'cover' ORDER BY sort_order DESC, created_at DESC");
$photos = $stmt->fetchAll();
?>
<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin - Photos</title>
<link rel="stylesheet" href="../css/style.css"><style>table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid rgba(255,255,255,0.03)}</style>
</head><body>
<nav style="padding:1rem;background:#0b0b0b;color:#fff"><a href="index.php" style="color:#fff;margin-right:1rem">Dashboard</a><a href="cover.php" style="color:#fff;margin-right:1rem">Cover / Profile</a><a href="photos.php" style="color:#fff;margin-right:1rem">Through My Lens</a><a href="photo-edit.php" style="color:#fff">Add Photo</a> <a href="logout.php" style="float:right;color:#fff">Logout</a></nav>
<main class="container">
  <h1>Through My Lens</h1><p>These images appear in the public photography gallery. Cover/profile images are managed separately.</p>
  <table>
    <thead><tr><th>Preview</th><th>Title</th><th>Category</th><th>Created</th><th></th></tr></thead>
    <tbody>
    <?php foreach($photos as $p): ?>
      <tr>
        <td style="width:140px"><img src="../assets/uploads/photos/<?=e($p['filename'])?>" alt="" style="height:80px;object-fit:cover;border-radius:6px"></td>
        <td><?=e($p['title'])?></td>
        <td><?=e($p['category'])?></td>
        <td><?=e($p['created_at'])?></td>
        <td style="white-space:nowrap"><a href="photo-edit.php?id=<?=e($p['id'])?>" class="btn">Edit</a>
        <a href="photo-delete.php?id=<?=e($p['id'])?>" class="btn btn-outline" onclick="return confirm('Delete this photo?')">Delete</a></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</main>
</body></html>
