export function setupControls(onMove) {
  // Touch directional buttons
  const bindTouch = (id, direction) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('touchstart', (e) => {
      e.preventDefault();
      onMove(direction);
    });
    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      onMove(direction);
    });
  };

  bindTouch('btn-up', 'up');
  bindTouch('btn-down', 'down');
  bindTouch('btn-left', 'left');
  bindTouch('btn-right', 'right');

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w') onMove('up');
    if (e.key === 'ArrowDown' || e.key === 's') onMove('down');
    if (e.key === 'ArrowLeft' || e.key === 'a') onMove('left');
    if (e.key === 'ArrowRight' || e.key === 'd') onMove('right');
  });
}
