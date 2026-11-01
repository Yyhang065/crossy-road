export function setupUI(handlers) {
  const get = (id) => document.getElementById(id);

  const homeScreen = get('home-screen');
  const pauseScreen = get('pause-screen');
  const settingsDialog = get('settings-dialog');
  const logDialog = get('log-dialog');
  const controlsContainer = get('controls-container');

  const addTap = (id, fn) => {
    const el = get(id);
    if (!el) return;
    el.onclick = (e) => {
      e.preventDefault();
      fn();
    };
  };

  addTap('start-btn', () => {
    if (homeScreen) homeScreen.classList.add('hidden');
    handlers.onStart();
  });

  addTap('log-btn', () => logDialog && logDialog.classList.remove('hidden'));
  addTap('close-log-btn', () => logDialog && logDialog.classList.add('hidden'));

  const openSettings = () => settingsDialog && settingsDialog.classList.remove('hidden');
  addTap('settings-home-btn', openSettings);
  addTap('settings-top-btn', openSettings);
  addTap('settings-pause-btn', openSettings);
  addTap('close-settings-btn', () => settingsDialog && settingsDialog.classList.add('hidden'));

  addTap('pause-top-btn', () => {
    if (pauseScreen) pauseScreen.classList.remove('hidden');
    handlers.onPause();
  });

  addTap('resume-btn', () => {
    if (pauseScreen) pauseScreen.classList.add('hidden');
    handlers.onResume();
  });

  addTap('restart-btn', () => {
    if (pauseScreen) pauseScreen.classList.add('hidden');
    handlers.onRestart();
  });

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

  const opSelect = get('opacity-select');
  if (opSelect) {
    opSelect.addEventListener('change', (e) => {
      if (controlsContainer) controlsContainer.style.opacity = e.target.value;
    });
  }
}
