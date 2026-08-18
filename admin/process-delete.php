<?php
require_once __DIR__ . '/inc/config.php';
require_once __DIR__ . '/inc/auth.php';
require_login();
$id = intval($_GET['id'] ?? 0);
if ($id){
    $stmt = $pdo->prepare('DELETE FROM process_steps WHERE id = ?');
    $stmt->execute([$id]);
}
header('Location: process.php');
exit;