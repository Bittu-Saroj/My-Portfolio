<?php
require_once __DIR__ . '/inc/config.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/csrf.php';
require_login();
$stmt = $pdo->query('SELECT * FROM process_steps ORDER BY step_index ASC');
$steps = $stmt->fetchAll();
?>
<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin - Process</title>
<link rel="stylesheet" href="../css/style.css"></head><body>
<nav style="padding:1rem;background:#0b0b0b;color:#fff"><a href="index.php" style="color:#fff;margin-right:1rem">Dashboard</a><a href="process.php" style="color:#fff;margin-right:1rem">Process</a><a href="process-edit.php" style="color:#fff">Add Step</a> <a href="logout.php" style="float:right;color:#fff">Logout</a></nav>
<main class="container">
  <h1>Process Steps</h1>
  <table>
    <thead><tr><th>Index</th><th>Title</th><th>Description</th><th></th></tr></thead>
    <tbody>
    <?php foreach($steps as $s): ?>
      <tr>
        <td><?=e($s['step_index'])?></td>
        <td><?=e($s['title'])?></td>
        <td><?=e($s['description'])?></td>
        <td style="white-space:nowrap"><a href="process-edit.php?id=<?=e($s['id'])?>" class="btn">Edit</a>
        <form method="post" action="process-delete.php" style="display:inline" onsubmit="return confirm('Delete this step?')"><?php echo csrf_field(); ?><input type="hidden" name="id" value="<?=e($s['id'])?>"><button class="btn btn-outline" type="submit">Delete</button></form></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</main>
</body></html>
