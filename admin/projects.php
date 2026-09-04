<?php
require_once __DIR__ . '/inc/config.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/csrf.php';
require_login();

$stmt = $pdo->query('SELECT * FROM design_projects ORDER BY created_at DESC');
$projects = $stmt->fetchAll();
?>
<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin - Design Projects</title>
<link rel="stylesheet" href="../css/style.css"><style>table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid rgba(255,255,255,0.03)}</style>
</head><body>
<nav style="padding:1rem;background:#0b0b0b;color:#fff"><a href="index.php" style="color:#fff;margin-right:1rem">Dashboard</a><a href="projects.php" style="color:#fff;margin-right:1rem">Design</a><a href="project-edit.php" style="color:#fff">Add Project</a> <a href="logout.php" style="float:right;color:#fff">Logout</a></nav>
<main class="container">
  <h1>Design Projects</h1>
  <table>
    <thead><tr><th>Preview</th><th>Title</th><th>Category</th><th>Tools</th><th>Created</th><th></th></tr></thead>
    <tbody>
    <?php foreach($projects as $p): ?>
      <tr>
        <td style="width:140px">
          <?php if(!empty($p['filename'])): ?><img src="../assets/uploads/projects/<?=e($p['filename'])?>" alt="" style="height:80px;object-fit:cover;border-radius:6px"><?php else: ?><div style="height:80px;width:140px;background:#111;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#777">No Image</div><?php endif; ?>
        </td>
        <td><?=e($p['title'])?></td>
        <td><?=e($p['category'])?></td>
        <td><?=e($p['tools'])?></td>
        <td><?=e($p['created_at'])?></td>
        <td style="white-space:nowrap"><a href="project-edit.php?id=<?=e($p['id'])?>" class="btn">Edit</a>
        <form method="post" action="project-delete.php" style="display:inline" onsubmit="return confirm('Delete this project?')"><?php echo csrf_field(); ?><input type="hidden" name="id" value="<?=e($p['id'])?>"><button class="btn btn-outline" type="submit">Delete</button></form></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</main>
</body></html>
