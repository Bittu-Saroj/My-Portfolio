<?php
// admin/api-design.php - public JSON endpoint for design projects
require_once __DIR__ . '/inc/config.php';
header('Content-Type: application/json; charset=utf-8');
$stmt = $pdo->query('SELECT id, title, category, filename, tools, description FROM design_projects ORDER BY created_at DESC');
$rows = $stmt->fetchAll();
$out = [];
foreach($rows as $r){
    $img = $r['filename'] ? 'assets/uploads/projects/' . rawurlencode($r['filename']) : 'assets/images/design/social-01.svg';
    $out[] = [
        'id' => (int)$r['id'],
        'title' => $r['title'],
        'category' => $r['category'],
        'image' => $img,
        'tools' => $r['tools'],
        'description' => $r['description']
    ];
}
echo json_encode($out, JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);
exit;
