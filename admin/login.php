<?php
require_once __DIR__ . '/inc/config.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/csrf.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    csrf_check();
    if ($username && $password){
        $stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        if ($user && password_verify($password, $user['password_hash'])){
            login_user($user['id']);
            header('Location: index.php'); exit;
        }
    }
    $error = 'Invalid username or password';
}
?>
<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin Login</title>
<link rel="stylesheet" href="../css/style.css">
<style>body{background:#050505;color:#fff;padding:40px}form{max-width:420px;margin:0 auto;background:#0d0d0d;padding:20px;border-radius:8px}</style>
</head><body>
  <h1 style="text-align:center">Admin Login</h1>
  <?php if($error):?><p style="color:tomato;text-align:center"><?=e($error)?></p><?php endif;?>
  <form method="post" autocomplete="off">
    <?php echo csrf_field(); ?>
    <label>Username<br><input name="username" required></label><br>
    <label>Password<br><input name="password" type="password" required></label><br><br>
    <div style="text-align:right"><button class="btn btn-primary">Sign in</button></div>
  </form>
</body></html>