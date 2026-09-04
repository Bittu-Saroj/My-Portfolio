<?php
require_once __DIR__ . '/inc/config.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/csrf.php';
require_login();
$id = $_SERVER['REQUEST_METHOD'] === 'POST' ? intval($_POST['id'] ?? 0) : 0;
csrf_check();
if ($id){
    $stmt = $pdo->prepare('DELETE FROM process_steps WHERE id = ?');
    $stmt->execute([$id]);
}
header('Location: process.php');
exit;
