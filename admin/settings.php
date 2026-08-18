<?php
require_once __DIR__ . '/inc/config.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/csrf.php';
require_login();

$keys = [
  'site_name'=>'Site name','hero_eyebrow'=>'Hero greeting','hero_title'=>'Hero title (one line per line)','hero_sub'=>'Hero subtitle','hero_intro'=>'Hero introduction',
  'about_text'=>'About me','education_title'=>'Education title','education_text'=>'Education details','design_intro'=>'Design section description','photo_intro'=>'Photography section description',
  'before_title'=>'Before/after title','before_intro'=>'Before/after description','before_image'=>'Before image URL','after_image'=>'After image URL',
  'video_intro'=>'Video section description','projects_intro'=>'Code & technology description','contact_title'=>'Contact heading','contact_intro'=>'Contact description',
  'email'=>'Email','phone'=>'Contact / WhatsApp number','instagram_url'=>'Instagram URL','instagram_label'=>'Instagram label','facebook_url'=>'Facebook URL','facebook_label'=>'Facebook label','github_url'=>'GitHub URL','linkedin_url'=>'LinkedIn URL'
];
$values = [];
foreach ($pdo->query('SELECT setting_key, setting_value FROM site_settings')->fetchAll() as $row) $values[$row['setting_key']] = $row['setting_value'];
$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_check();
  $stmt = $pdo->prepare('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)');
  foreach ($keys as $key => $_label) {
    $value = trim((string)($_POST[$key] ?? ''));
    $stmt->execute([$key, $value]); $values[$key] = $value;
  }
  $message = 'Settings saved. Refresh your public portfolio to see the changes.';
}
function field_type($key) { return in_array($key, ['about_text','hero_intro','hero_sub','education_text','design_intro','photo_intro','before_intro','video_intro','projects_intro','contact_intro'], true) ? 'textarea' : 'input'; }
?>
<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin - Site Settings</title><link rel="stylesheet" href="../css/style.css"><style>.settings{max-width:900px;margin:2rem auto}.field{margin:1rem 0}.field label{display:block;font-weight:600;margin-bottom:.35rem}.field input,.field textarea{width:100%;box-sizing:border-box;padding:.7rem;background:#111;color:#fff;border:1px solid #333;border-radius:5px}.field textarea{min-height:90px}.notice{padding:.8rem;background:#173d22;color:#b9f5c8;border-radius:5px}</style></head><body>
<nav style="padding:1rem;background:#0b0b0b;color:#fff"><a href="index.php" style="color:#fff;margin-right:1rem">Dashboard</a><a href="settings.php" style="color:#fff;margin-right:1rem">Site Settings</a><a href="photos.php" style="color:#fff;margin-right:1rem">Photos</a><a href="projects.php" style="color:#fff;margin-right:1rem">Design</a><a href="videos.php" style="color:#fff;margin-right:1rem">Videos</a><a href="process.php" style="color:#fff;margin-right:1rem">Process</a><a href="logout.php" style="float:right;color:#fff">Logout</a></nav>
<main class="settings"><h1>Site content</h1><p>Update the text, contact details and social links shown on the portfolio. To change the cover image, upload a photo with category <code>cover</code> in Photos; the newest cover photo is used.</p><?php if($message): ?><p class="notice"><?=e($message)?></p><?php endif; ?><form method="post"><?php echo csrf_field(); ?>
<?php foreach ($keys as $key=>$label): ?><div class="field"><label for="<?=e($key)?>"><?=e($label)?></label><?php if(field_type($key)==='textarea'): ?><textarea id="<?=e($key)?>" name="<?=e($key)?>"><?=e($values[$key]??'')?></textarea><?php else: ?><input id="<?=e($key)?>" name="<?=e($key)?>" value="<?=e($values[$key]??'')?>"><?php endif; ?></div><?php endforeach; ?><button class="btn btn-primary" type="submit">Save settings</button></form></main></body></html>
