<?php
// admin/inc/csrf.php
function csrf_token(){
    if (empty($_SESSION['csrf_token'])){
        $_SESSION['csrf_token'] = bin2hex(random_bytes(24));
    }
    return $_SESSION['csrf_token'];
}
function csrf_field(){
    $t = csrf_token();
    return '<input type="hidden" name="csrf_token" value="'.htmlspecialchars($t,ENT_QUOTES).'">';
}
function csrf_check(){
    if ($_SERVER['REQUEST_METHOD'] === 'POST'){
        $token = $_POST['csrf_token'] ?? '';
        if (!$token || !hash_equals($_SESSION['csrf_token'] ?? '', $token)){
            http_response_code(403);
            echo 'Invalid CSRF token';
            exit;
        }
    }
}
?>