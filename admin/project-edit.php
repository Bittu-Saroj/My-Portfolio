<?php
require_once __DIR__ . '/inc/config.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/csrf.php';
require_login();

$id = intval($_GET['id'] ?? 0);
$editing = $id > 0;
$proj = null;
if ($editing){
    $stmt = $pdo->prepare('SELECT * FROM design_projects WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $proj = $stmt->fetch();
}
$errors = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    csrf_check();
    $title = trim($_POST['title'] ?? '');
    $category = trim($_POST['category'] ?? '');
    $tools = trim($_POST['tools'] ?? '');
    $desc = trim($_POST['description'] ?? '');
    $filename = $proj['filename'] ?? null;
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK){
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($_FILES['image']['tmp_name']);
        $allowed = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp','image/svg+xml'=>'svg'];
        if (!isset($allowed[$mime])){
            $errors[] = 'Invalid image type';
        } else {
            $ext = $allowed[$mime];
            $basename = bin2hex(random_bytes(8));
            $newName = $basename . '.' . $ext;
            $target = UPLOAD_DIR_PROJECTS . $newName;
            if (!move_uploaded_file($_FILES['image']['tmp_name'], $target)){
                $errors[] = 'Failed to move uploaded file';
            } else {
                if ($filename && file_exists(UPLOAD_DIR_PROJECTS . $filename)) @unlink(UPLOAD_DIR_PROJECTS . $filename);
                $filename = $newName;
            }
        }
    }
    if (empty($errors)){
        if ($editing){
            $stmt = $pdo->prepare('UPDATE design_projects SET title=?, category=?, filename=?, tools=?, description=? WHERE id=?');
            $stmt->execute([$title, $category, $filename, $tools, $desc, $id]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO design_projects (title, category, filename, tools, description) VALUES (?,?,?,?,?)');
            $stmt->execute([$title, $category, $filename, $tools, $desc]);
            $id = $pdo->lastInsertId();
        }
        header('Location: projects.php'); exit;
    }
}
?>
<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title><?= $editing ? 'Edit' : 'Add' ?> Design Project</title>
<link rel="stylesheet" href="../css/style.css"></head><body>
<nav style="padding:1rem;background:#0b0b0b;color:#fff"><a href="index.php" style="color:#fff;margin-right:1rem">Dashboard</a><a href="projects.php" style="color:#fff;margin-right:1rem">Design</a><a href="logout.php" style="float:right;color:#fff">Logout</a></nav>
<main class="container">
  <h1><?= $editing ? 'Edit' : 'Add' ?> Project</h1>
  <?php if($errors):?><div style="color:tomato"><?php foreach($errors as $err) echo '<p>'.e($err).'</p>'; ?></div><?php endif; ?>
  <form method="post" enctype="multipart/form-data">
    <?php echo csrf_field(); ?>
    <label>Title<br><input name="title" value="<?=e($proj['title'] ?? '')?>" required></label>
    <label>Category<br><input name="category" value="<?=e($proj['category'] ?? '')?>"></label>
    <label>Tools (comma separated)<br><input name="tools" value="<?=e($proj['tools'] ?? '')?>"></label>
    <label>Description<br><textarea name="description"><?=e($proj['description'] ?? '')?></textarea></label>
    <label>Image (cover) - leave empty to keep existing<br><input type="file" name="image" accept="image/*"></label>
    <?php if(!empty($proj['filename'])): ?><p>Current: <img src="../assets/uploads/projects/<?=e($proj['filename'])?>" style="height:90px;object-fit:cover;border-radius:6px"></p><?php endif; ?>
    <div style="margin-top:1rem"><button class="btn btn-primary" type="submit"><?= $editing ? 'Save' : 'Add' ?></button></div>
  </form>
</main>
</body></html>