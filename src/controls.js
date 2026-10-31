export function setupControls(onMove) {
  // Keyboard
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        onMove('up');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        onMove('down');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        onMove('left');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        onMove('right');
        break;
    }
  });

  // Touch button bindings
  const bindButton = (id, direction) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    const trigger = (e) => {
      e.preventDefault();
      onMove(direction);
    };
    btn.addEventListener('touchstart', trigger, { passive: false });
    btn.addEventListener('click', trigger);
  };

  bindButton('btn-up', 'up');
  bindButton('btn-down', 'down');
  bindButton('btn-left', 'left');
  bindButton('btn-right', 'right');
}
