<?php
require_once __DIR__ . '/inc/config.php';
require_once __DIR__ . '/inc/auth.php';
require_login();
$id = intval($_GET['id'] ?? 0);
if ($id){
    $stmt = $pdo->prepare('SELECT filename, thumb FROM videos WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $v = $stmt->fetch();
    if ($v){
        if (!empty($v['filename']) && file_exists(UPLOAD_DIR_VIDEOS . $v['filename'])) @unlink(UPLOAD_DIR_VIDEOS . $v['filename']);
        if (!empty($v['thumb']) && file_exists(UPLOAD_DIR_VIDEOS . $v['thumb'])) @unlink(UPLOAD_DIR_VIDEOS . $v['thumb']);
        $stmt = $pdo->prepare('DELETE FROM videos WHERE id = ?');
        $stmt->execute([$id]);
    }
}
header('Location: videos.php');
exit;