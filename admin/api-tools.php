<?php
require_once __DIR__ . '/inc/config.php';
header('Content-Type: application/json; charset=utf-8');
$rows = $pdo->query('SELECT id, title, description, image FROM technology_tools ORDER BY sort_order ASC, created_at ASC')->fetchAll();
foreach ($rows as &$row) {
  $row['id'] = (int)$row['id'];
  $row['image'] = $row['image'] ? 'assets/uploads/tools/' . rawurlencode($row['image']) : '';
}
echo json_encode($rows, JSON_UNESCAPED_SLASHES);
