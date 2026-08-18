<?php
require_once __DIR__ . '/inc/config.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/csrf.php';
require_login();

$id = intval($_GET['id'] ?? 0);
$editing = $id > 0;
$video = null;
if ($editing){
    $stmt = $pdo->prepare('SELECT * FROM videos WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $video = $stmt->fetch();
}
$errors = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    csrf_check();
    $title = trim($_POST['title'] ?? '');
    $desc = trim($_POST['description'] ?? '');
    $external = trim($_POST['external_url'] ?? '');
    $filename = $video['filename'] ?? null;
    $thumb = $video['thumb'] ?? null;
    // handle video file upload
    if (!empty($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK){
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($_FILES['video']['tmp_name']);
        $allowed = ['video/mp4'=>'mp4','video/webm'=>'webm'];
        if (!isset($allowed[$mime])) $errors[] = 'Invalid video type';
        else {
            $ext = $allowed[$mime];
            $basename = bin2hex(random_bytes(8));
            $newName = $basename . '.' . $ext;
            $target = UPLOAD_DIR_VIDEOS . $newName;
            if (!move_uploaded_file($_FILES['video']['tmp_name'], $target)) $errors[] = 'Failed to move uploaded video';
            else { if ($filename && file_exists(UPLOAD_DIR_VIDEOS . $filename)) @unlink(UPLOAD_DIR_VIDEOS . $filename); $filename = $newName; }
        }
    }
    // optional thumb upload
    if (!empty($_FILES['thumb']) && $_FILES['thumb']['error'] === UPLOAD_ERR_OK){
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($_FILES['thumb']['tmp_name']);
        $allowed = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp','image/svg+xml'=>'svg'];
        if (!isset($allowed[$mime])) $errors[] = 'Invalid thumb type';
        else {
            $ext = $allowed[$mime];
            $basename = bin2hex(random_bytes(8));
            $newName = $basename . '.' . $ext;
            $target = UPLOAD_DIR_VIDEOS . $newName;
            if (!move_uploaded_file($_FILES['thumb']['tmp_name'], $target)) $errors[] = 'Failed to move thumb';
            else { if ($thumb && file_exists(UPLOAD_DIR_VIDEOS . $thumb)) @unlink(UPLOAD_DIR_VIDEOS . $thumb); $thumb = $newName; }
        }
    }
    if (empty($errors)){
        if ($editing){
            $stmt = $pdo->prepare('UPDATE videos SET filename=?, title=?, description=?, thumb=?, external_url=? WHERE id=?');
            $stmt->execute([$filename, $title, $desc, $thumb, $external, $id]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO videos (filename, title, description, thumb, external_url) VALUES (?,?,?,?,?)');
            $stmt->execute([$filename, $title, $desc, $thumb, $external]);
            $id = $pdo->lastInsertId();
        }
        header('Location: videos.php'); exit;
    }
}
?>
<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title><?= $editing ? 'Edit' : 'Add' ?> Video</title>
<link rel="stylesheet" href="../css/style.css"></head><body>
<nav style="padding:1rem;background:#0b0b0b;color:#fff"><a href="index.php" style="color:#fff;margin-right:1rem">Dashboard</a><a href="videos.php" style="color:#fff;margin-right:1rem">Videos</a><a href="logout.php" style="float:right;color:#fff">Logout</a></nav>
<main class="container">
  <h1><?= $editing ? 'Edit' : 'Add' ?> Video</h1>
  <?php if($errors):?><div style="color:tomato"><?php foreach($errors as $err) echo '<p>'.e($err).'</p>'; ?></div><?php endif; ?>
  <form method="post" enctype="multipart/form-data">
    <?php echo csrf_field(); ?>
    <label>Title<br><input name="title" value="<?=e($video['title'] ?? '')?>"></label>
    <label>Description<br><textarea name="description"><?=e($video['description'] ?? '')?></textarea></label>
    <label>External URL (YouTube/Vimeo) - optional<br><input name="external_url" value="<?=e($video['external_url'] ?? '')?>"></label>
    <label>Video file (mp4/webm) - leave empty to keep existing<br><input type="file" name="video" accept="video/*"></label>
    <label>Thumb image (optional)<br><input type="file" name="thumb" accept="image/*"></label>
    <?php if(!empty($video['filename'])): ?><p>Current file: <?=e($video['filename'])?></p><?php endif; ?>
    <div style="margin-top:1rem"><button class="btn btn-primary" type="submit"><?= $editing ? 'Save' : 'Add' ?></button></div>
  </form>
</main>
</body></html>