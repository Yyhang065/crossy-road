export function setupControls(onMove) {
  const bind = (id, dir) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('touchstart', (e) => { e.preventDefault(); onMove(dir); });
    el.addEventListener('mousedown', (e) => { e.preventDefault(); onMove(dir); });
  };

  bind('btn-up', 'up');
  bind('btn-down', 'down');
  bind('btn-left', 'left');
  bind('btn-right', 'right');

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w') onMove('up');
    if (e.key === 'ArrowDown' || e.key === 's') onMove('down');
    if (e.key === 'ArrowLeft' || e.key === 'a') onMove('left');
    if (e.key === 'ArrowRight' || e.key === 'd') onMove('right');
  });
}
