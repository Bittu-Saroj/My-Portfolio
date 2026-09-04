<?php
require_once __DIR__ . '/inc/config.php';
header('Content-Type: application/json; charset=utf-8');
$rows = $pdo->query('SELECT id, filename, title, description, thumb, external_url FROM videos ORDER BY sort_order DESC, created_at DESC')->fetchAll();
$out = [];
foreach ($rows as $row) {
    $out[] = [
        'id' => (int)$row['id'],
        'title' => $row['title'],
        'description' => $row['description'],
        'thumb' => $row['thumb'] ? 'assets/uploads/videos/' . rawurlencode($row['thumb']) : '',
        'video' => $row['filename'] ? 'assets/uploads/videos/' . rawurlencode($row['filename']) : '',
        'url' => $row['external_url']
    ];
}
echo json_encode($out, JSON_UNESCAPED_SLASHES);
