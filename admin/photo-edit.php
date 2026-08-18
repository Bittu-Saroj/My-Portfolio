<?php
require_once __DIR__ . '/inc/config.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/csrf.php';
require_login();

$id = intval($_GET['id'] ?? 0);
$cover_mode = isset($_GET['cover']);
$editing = $id > 0;
$photo = null;
if ($editing){
    $stmt = $pdo->prepare('SELECT * FROM photos WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $photo = $stmt->fetch();
    if ($photo && $photo['category'] === 'cover') $cover_mode = true;
}

$errors = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    csrf_check();
    $title = trim($_POST['title'] ?? '');
    $alt = trim($_POST['alt_text'] ?? '');
    $category = $cover_mode ? 'cover' : trim($_POST['category'] ?? '');

    // Handle upload
    $filename = $photo['filename'] ?? null;
    if (!empty($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK){
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($_FILES['photo']['tmp_name']);
        $allowed = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp','image/svg+xml'=>'svg'];
        if (!isset($allowed[$mime])){
            $errors[] = 'Invalid image type';
        } else {
            $ext = $allowed[$mime];
            $basename = bin2hex(random_bytes(8));
            $newName = $basename . '.' . $ext;
            $target = UPLOAD_DIR_PHOTOS . $newName;
            if (!move_uploaded_file($_FILES['photo']['tmp_name'], $target)){
                $errors[] = 'Failed to move uploaded file';
            } else {
                // remove old file if editing
                if ($filename && file_exists(UPLOAD_DIR_PHOTOS . $filename)) @unlink(UPLOAD_DIR_PHOTOS . $filename);
                $filename = $newName;
            }
        }
    }

    if (empty($errors)){
        if ($editing){
            $stmt = $pdo->prepare('UPDATE photos SET filename=?, title=?, alt_text=?, category=? WHERE id=?');
            $stmt->execute([$filename, $title, $alt, $category, $id]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO photos (filename, title, alt_text, category) VALUES (?,?,?,?)');
            $stmt->execute([$filename, $title, $alt, $category]);
            $id = $pdo->lastInsertId();
        }
        header('Location: photos.php'); exit;
    }
}
?>
<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title><?= $editing ? 'Edit' : 'Add' ?> Photo</title>
<link rel="stylesheet" href="../css/style.css">
</head><body>
<nav style="padding:1rem;background:#0b0b0b;color:#fff"><a href="index.php" style="color:#fff;margin-right:1rem">Dashboard</a><a href="photos.php" style="color:#fff;margin-right:1rem">Photos</a><a href="logout.php" style="float:right;color:#fff">Logout</a></nav>
<main class="container">
  <h1><?= $editing ? 'Edit' : 'Add' ?> Photo</h1>
  <?php if($errors):?><div style="color:tomato"><?php foreach($errors as $err) echo '<p>'.e($err).'</p>'; ?></div><?php endif; ?>
  <form method="post" enctype="multipart/form-data">
    <?php echo csrf_field(); ?>
    <label>Title<br><input name="title" value="<?=e($photo['title'] ?? '')?>"></label>
    <label>Alt text<br><input name="alt_text" value="<?=e($photo['alt_text'] ?? '')?>"></label>
    <?php if($cover_mode): ?><input type="hidden" name="category" value="cover"><p><strong>Cover / Profile image</strong><br><small>This image is used only for the homepage profile image, not the Through My Lens gallery.</small></p><?php else: ?><label>Category<br><input name="category" value="<?=e($photo['category'] ?? '')?>" placeholder="portrait, landscape, event"><small style="display:block;color:#888;margin-top:.25rem">For the homepage profile image, use the separate Cover / Profile page.</small></label><?php endif; ?>
    <label>Photo file (leave empty to keep existing)<br><input type="file" name="photo" accept="image/*"></label>
    <?php if(!empty($photo['filename'])): ?><p>Current: <img src="../assets/uploads/photos/<?=e($photo['filename'])?>" style="height:90px;object-fit:cover;border-radius:6px"></p><?php endif; ?>
    <div style="margin-top:1rem"><button class="btn btn-primary" type="submit"><?= $editing ? 'Save' : 'Upload' ?></button></div>
  </form>
</main>
</body></html>
