<?php
require_once __DIR__ . '/inc/config.php';
require_once __DIR__ . '/inc/auth.php';
require_login();
$id = intval($_GET['id'] ?? 0);
if ($id){
    $stmt = $pdo->prepare('SELECT filename FROM photos WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $p = $stmt->fetch();
    if ($p){
        if (!empty($p['filename']) && file_exists(UPLOAD_DIR_PHOTOS . $p['filename'])){
            @unlink(UPLOAD_DIR_PHOTOS . $p['filename']);
        }
        $stmt = $pdo->prepare('DELETE FROM photos WHERE id = ?');
        $stmt->execute([$id]);
    }
}
header('Location: photos.php');
exit;