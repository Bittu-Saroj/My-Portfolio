<?php
require_once __DIR__ . '/inc/config.php'; require_once __DIR__ . '/inc/auth.php'; require_once __DIR__ . '/inc/csrf.php'; require_login();
csrf_check();
$id=$_SERVER['REQUEST_METHOD']==='POST' ? (int)($_POST['id']??0) : 0; if($id){$s=$pdo->prepare('SELECT image FROM technology_tools WHERE id=?');$s->execute([$id]);$image=$s->fetchColumn();$s=$pdo->prepare('DELETE FROM technology_tools WHERE id=?');$s->execute([$id]);if($image&&file_exists(UPLOAD_DIR_TOOLS.$image))@unlink(UPLOAD_DIR_TOOLS.$image);} header('Location: tools.php');
