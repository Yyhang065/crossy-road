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

  // Touch & Click bindings for directional buttons
  const bindButton = (id, direction) => {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      onMove(direction);
    });
  };

  bindButton('btn-up', 'up');
  bindButton('btn-down', 'down');
  bindButton('btn-left', 'left');
  bindButton('btn-right', 'right');
}
