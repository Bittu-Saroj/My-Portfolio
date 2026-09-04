<?php
$admin_page = basename($_SERVER['PHP_SELF']);
$admin_links = [
    'index.php' => ['Dashboard', 'Overview', '⌂'],
    'photos.php' => ['Through My Lens', 'Photography', '▣'],
    'projects.php' => ['Design Projects', 'Design', '◆'],
    'tools.php' => ['Technology', 'Technology', '◈'],
    'videos.php' => ['Videos', 'Content', '▶'],
    'process.php' => ['Process', 'Workflow', '◎'],
    'settings.php' => ['Site Settings', 'Configuration', '⚙'],
];
?>
<aside class="admin-sidebar" id="admin-sidebar">
  <div class="admin-brand"><span class="brand-mark">S</span><span><strong>Studio Admin</strong><small>Portfolio workspace</small></span></div>
  <nav class="admin-nav" aria-label="Admin navigation">
    <p class="admin-nav-label">Workspace</p>
    <?php foreach ($admin_links as $href => $item): ?>
      <a class="admin-nav-link<?= $admin_page === $href ? ' is-active' : '' ?>" href="<?=e($href)?>"><span class="nav-icon" aria-hidden="true"><?=e($item[2])?></span><span><?=e($item[0])?></span></a>
    <?php endforeach; ?>
  </nav>
  <div class="admin-sidebar-footer"><a href="../index.php" class="admin-view-link">↗ View live site</a><a href="logout.php" class="admin-logout">Log out <span>→</span></a></div>
</aside>
<div class="admin-overlay" data-sidebar-close></div>
<script>
(function () {
  var sidebar = document.getElementById('admin-sidebar');
  var overlay = document.querySelector('[data-sidebar-close]');
  var toggle = document.querySelector('[data-sidebar-toggle]');
  if (!sidebar || !overlay || !toggle) return;
  function close() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    document.body.classList.remove('sidebar-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', function (event) {
    event.stopImmediatePropagation();
    var open = sidebar.classList.toggle('is-open');
    overlay.classList.toggle('is-visible', open);
    document.body.classList.toggle('sidebar-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  overlay.addEventListener('click', close);
  sidebar.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', close); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
})();
</script>
