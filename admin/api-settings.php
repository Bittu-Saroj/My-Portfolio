<?php
require_once __DIR__ . '/inc/config.php';
header('Content-Type: application/json; charset=utf-8');

$settings = [];
$rows = $pdo->query('SELECT setting_key, setting_value FROM site_settings')->fetchAll();
foreach ($rows as $row) $settings[$row['setting_key']] = $row['setting_value'];

// A photo tagged "cover" is the homepage profile/cover image.
$cover = $pdo->query("SELECT filename FROM photos WHERE category = 'cover' ORDER BY created_at DESC LIMIT 1")->fetchColumn();
if ($cover) $settings['cover_image'] = 'assets/uploads/photos/' . rawurlencode($cover);

echo json_encode($settings, JSON_UNESCAPED_SLASHES);
