<?php
require_once __DIR__ . '/inc/config.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/csrf.php';
require_login();

$id = intval($_GET['id'] ?? 0);
$editing = $id > 0;
$step = null;
if ($editing){
    $stmt = $pdo->prepare('SELECT * FROM process_steps WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $step = $stmt->fetch();
}
$errors = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    csrf_check();
    $index = intval($_POST['step_index'] ?? 0);
    $title = trim($_POST['title'] ?? '');
    $desc = trim($_POST['description'] ?? '');
    if ($editing){
        $stmt = $pdo->prepare('UPDATE process_steps SET step_index=?, title=?, description=? WHERE id=?');
        $stmt->execute([$index, $title, $desc, $id]);
    } else {
        $stmt = $pdo->prepare('INSERT INTO process_steps (step_index, title, description) VALUES (?,?,?)');
        $stmt->execute([$index, $title, $desc]);
    }
    header('Location: process.php'); exit;
}
?>
<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title><?= $editing ? 'Edit' : 'Add' ?> Step</title>
<link rel="stylesheet" href="../css/style.css"></head><body>
<nav style="padding:1rem;background:#0b0b0b;color:#fff"><a href="index.php" style="color:#fff;margin-right:1rem">Dashboard</a><a href="process.php" style="color:#fff;margin-right:1rem">Process</a><a href="logout.php" style="float:right;color:#fff">Logout</a></nav>
<main class="container">
  <h1><?= $editing ? 'Edit' : 'Add' ?> Process Step</h1>
  <form method="post">
    <?php echo csrf_field(); ?>
    <label>Index (order)<br><input name="step_index" value="<?=e($step['step_index'] ?? '')?>" type="number"></label>
    <label>Title<br><input name="title" value="<?=e($step['title'] ?? '')?>"></label>
    <label>Description<br><textarea name="description"><?=e($step['description'] ?? '')?></textarea></label>
    <div style="margin-top:1rem"><button class="btn btn-primary" type="submit"><?= $editing ? 'Save' : 'Add' ?></button></div>
  </form>
</main>
</body></html>