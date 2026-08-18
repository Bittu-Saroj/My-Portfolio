<?php
// admin/api-photos.php - public JSON endpoint for photos
require_once __DIR__ . '/inc/config.php';
header('Content-Type: application/json; charset=utf-8');
$stmt = $pdo->query("SELECT id, filename, title, alt_text, category FROM photos WHERE category IS NULL OR category = '' OR category <> 'cover' ORDER BY sort_order DESC, created_at DESC");
$rows = $stmt->fetchAll();
$base = dirname(__DIR__);
$out = [];
foreach($rows as $r){
    $out[] = [
        'id' => (int)$r['id'],
        'image' => 'assets/uploads/photos/' . rawurlencode($r['filename']),
        'title' => $r['title'],
        'alt' => $r['alt_text'],
        'category' => $r['category']
    ];
}
echo json_encode($out, JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);
exit;
