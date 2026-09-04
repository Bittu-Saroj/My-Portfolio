<?php
require_once __DIR__ . '/inc/config.php';
header('Content-Type: application/json; charset=utf-8');
$rows = $pdo->query('SELECT id, step_index, title, description FROM process_steps ORDER BY step_index ASC')->fetchAll();
foreach ($rows as &$row) $row['step_index'] = (int)$row['step_index'];
echo json_encode($rows, JSON_UNESCAPED_SLASHES);
