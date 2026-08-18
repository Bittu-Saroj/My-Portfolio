<?php
// admin/inc/auth.php
require_once __DIR__ . '/config.php';

function is_logged_in(){
    return !empty($_SESSION['admin_id']);
}

function require_login(){
    if (!is_logged_in()){
        header('Location: login.php'); exit;
    }
}

function login_user($user_id){
    session_regenerate_id(true);
    $_SESSION['admin_id'] = $user_id;
}

function logout_user(){
    $_SESSION = [];
    if (ini_get('session.use_cookies')){
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time()-42000,
            $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
}
?>