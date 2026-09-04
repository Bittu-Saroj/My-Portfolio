<?php
require_once __DIR__ . '/inc/config.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/csrf.php';
require_login();
$stmt = $pdo->query('SELECT * FROM videos ORDER BY sort_order DESC, created_at DESC');
$videos = $stmt->fetchAll();
?>
<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin - Videos</title>
<link rel="stylesheet" href="../css/style.css"></head><body>
<nav style="padding:1rem;background:#0b0b0b;color:#fff"><a href="index.php" style="color:#fff;margin-right:1rem">Dashboard</a><a href="videos.php" style="color:#fff;margin-right:1rem">Videos</a><a href="video-edit.php" style="color:#fff">Add Video</a> <a href="logout.php" style="float:right;color:#fff">Logout</a></nav>
<main class="container">
  <h1>Videos</h1>
  <table>
    <thead><tr><th>Thumb</th><th>Title</th><th>Source</th><th>Created</th><th></th></tr></thead>
    <tbody>
    <?php foreach($videos as $v): ?>
      <tr>
        <td style="width:160px">
          <?php if(!empty($v['thumb'])): ?><img src="../assets/uploads/videos/<?=e($v['thumb'])?>" style="height:80px;object-fit:cover;border-radius:6px"><?php else: ?><div style="height:80px;width:140px;background:#111;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#777">No Thumb</div><?php endif; ?>
        </td>
        <td><?=e($v['title'])?></td>
        <td><?=e($v['external_url'] ?: $v['filename'])?></td>
        <td><?=e($v['created_at'])?></td>
        <td style="white-space:nowrap"><a href="video-edit.php?id=<?=e($v['id'])?>" class="btn">Edit</a>
        <form method="post" action="video-delete.php" style="display:inline" onsubmit="return confirm('Delete this video?')"><?php echo csrf_field(); ?><input type="hidden" name="id" value="<?=e($v['id'])?>"><button class="btn btn-outline" type="submit">Delete</button></form></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</main>
</body></html>
