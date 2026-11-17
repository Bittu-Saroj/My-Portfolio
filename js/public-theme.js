(() => {
  const button = document.querySelector('.theme-toggle');
  if (!button) return;

  function updateButton() {
    const dark = document.documentElement.dataset.theme === 'dark';
    const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.setAttribute('aria-pressed', String(dark));
  }

  updateButton();
  button.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('portfolio-theme', theme); } catch (_) { /* Keep the choice for this page. */ }
    updateButton();
  });

  window.addEventListener('storage', event => {
    if (event.key !== 'portfolio-theme' || !['light', 'dark'].includes(event.newValue)) return;
    document.documentElement.dataset.theme = event.newValue;
    updateButton();
  });
})();
