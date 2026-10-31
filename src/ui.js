export function setupUI(handlers) {
  const get = (id) => document.getElementById(id);

  const homeScreen = get('home-screen');
  const pauseScreen = get('pause-screen');
  const settingsDialog = get('settings-dialog');
  const logDialog = get('log-dialog');
  const controlsContainer = get('controls-container');

  const addClick = (id, fn) => {
    const el = get(id);
    if (!el) return;
    el.addEventListener('click', fn);
    el.addEventListener('touchstart', (e) => { e.preventDefault(); fn(); });
  };

  addClick('start-btn', () => {
    if (homeScreen) homeScreen.classList.add('hidden');
    handlers.onStart();
  });

  addClick('log-btn', () => logDialog && logDialog.classList.remove('hidden'));
  addClick('close-log-btn', () => logDialog && logDialog.classList.add('hidden'));

  const openSettings = () => settingsDialog && settingsDialog.classList.remove('hidden');
  addClick('settings-home-btn', openSettings);
  addClick('settings-top-btn', openSettings);
  addClick('settings-pause-btn', openSettings);
  addClick('close-settings-btn', () => settingsDialog && settingsDialog.classList.add('hidden'));

  addClick('pause-top-btn', () => {
    if (pauseScreen) pauseScreen.classList.remove('hidden');
    handlers.onPause();
  });

  addClick('resume-btn', () => {
    if (pauseScreen) pauseScreen.classList.add('hidden');
    handlers.onResume();
  });

  addClick('restart-btn', () => {
    if (pauseScreen) pauseScreen.classList.add('hidden');
    handlers.onRestart();
  });

  // Dynamic orientation layout
  let layoutMode = 'auto';
  function updateLayout() {
    if (!controlsContainer) return;
    if (layoutMode === 'auto') {
      const isPortrait = window.innerHeight > window.innerWidth;
      controlsContainer.className = isPortrait ? 'layout-cluster' : 'layout-split';
    } else {
      controlsContainer.className = layoutMode === 'cluster' ? 'layout-cluster' : 'layout-split';
    }
  }

  const layoutSelect = get('layout-select');
  if (layoutSelect) {
    layoutSelect.addEventListener('change', (e) => {
      layoutMode = e.target.value;
      updateLayout();
    });
  }

  window.addEventListener('resize', updateLayout);
  window.addEventListener('orientationchange', updateLayout);
  updateLayout();

  const camSelect = get('camera-select');
  if (camSelect) {
    camSelect.addEventListener('change', (e) => handlers.onCameraChange(e.target.value));
  }

  const opSelect = get('opacity-select');
  if (opSelect) {
    opSelect.addEventListener('change', (e) => {
      if (controlsContainer) controlsContainer.style.opacity = e.target.value;
    });
  }
}
