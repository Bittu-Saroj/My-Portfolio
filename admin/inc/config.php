<?php
// admin/inc/config.php
// Copy this file to admin/inc/config.php and update DB credentials or set env variables.

// Use environment variables in production; fall back to these placeholders.
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_name = getenv('DB_NAME') ?: 'saroj_portfolio';
$db_user = getenv('DB_USER') ?: 'dbuser';
$db_pass = getenv('DB_PASS') ?: 'CHANGE_ME';

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
];

try {
    $pdo = new PDO("mysql:host={$db_host};dbname={$db_name};charset=utf8mb4", $db_user, $db_pass, $options);
} catch (Exception $e) {
    http_response_code(500);
    echo "Database connection failed: " . htmlspecialchars($e->getMessage());
    exit;
}

// Paths - adjust if you move files
define('UPLOAD_DIR_PHOTOS', realpath(__DIR__ . '/../../assets/uploads/photos') . DIRECTORY_SEPARATOR);
define('UPLOAD_DIR_VIDEOS', realpath(__DIR__ . '/../../assets/uploads/videos') . DIRECTORY_SEPARATOR);
define('UPLOAD_DIR_PROJECTS', realpath(__DIR__ . '/../../assets/uploads/projects') . DIRECTORY_SEPARATOR);
define('UPLOAD_DIR_TOOLS', realpath(__DIR__ . '/../../assets/uploads/tools') . DIRECTORY_SEPARATOR);

// Ensure directories exist
if (!is_dir(UPLOAD_DIR_PHOTOS)) mkdir(UPLOAD_DIR_PHOTOS, 0755, true);
if (!is_dir(UPLOAD_DIR_VIDEOS)) mkdir(UPLOAD_DIR_VIDEOS, 0755, true);
if (!is_dir(UPLOAD_DIR_PROJECTS)) mkdir(UPLOAD_DIR_PROJECTS, 0755, true);
if (!is_dir(UPLOAD_DIR_TOOLS)) mkdir(UPLOAD_DIR_TOOLS, 0755, true);

// Session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Basic site settings
define('SITE_TITLE', 'Saroj Pathak Portfolio');

// Helper to escape output
function e($s){return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');}
?>
