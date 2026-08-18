<?php
require_once __DIR__ . '/inc/config.php';
require_once __DIR__ . '/inc/auth.php';
require_login();
$id = intval($_GET['id'] ?? 0);
if ($id){
    $stmt = $pdo->prepare('SELECT filename FROM design_projects WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $p = $stmt->fetch();
    if ($p){
        if (!empty($p['filename']) && file_exists(UPLOAD_DIR_PROJECTS . $p['filename'])){
            @unlink(UPLOAD_DIR_PROJECTS . $p['filename']);
        }
        $stmt = $pdo->prepare('DELETE FROM design_projects WHERE id = ?');
        $stmt->execute([$id]);
    }
}
header('Location: projects.php');
exit;