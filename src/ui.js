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
    const execute = (e) => {
      e.stopPropagation();
      fn();
    };
    el.addEventListener('pointerup', execute);
    el.addEventListener('click', execute);
  };

  addTap('start-btn', () => {
    if (homeScreen) {
      homeScreen.classList.add('hidden');
      homeScreen.style.display = 'none';
    }
    handlers.onStart();
  });

  addTap('log-btn', () => {
    if (logDialog) {
      logDialog.classList.remove('hidden');
      logDialog.style.display = 'flex';
    }
  });

  addTap('close-log-btn', () => {
    if (logDialog) {
      logDialog.classList.add('hidden');
      logDialog.style.display = 'none';
    }
  });

  const openSettings = () => {
    if (settingsDialog) {
      settingsDialog.classList.remove('hidden');
      settingsDialog.style.display = 'flex';
    }
  };

  addTap('settings-home-btn', openSettings);
  addTap('settings-top-btn', openSettings);
  addTap('settings-pause-btn', openSettings);

  addTap('close-settings-btn', () => {
    if (settingsDialog) {
      settingsDialog.classList.add('hidden');
      settingsDialog.style.display = 'none';
    }
  });

  addTap('pause-top-btn', () => {
    if (pauseScreen) {
      pauseScreen.classList.remove('hidden');
      pauseScreen.style.display = 'flex';
    }
    handlers.onPause();
  });

  addTap('resume-btn', () => {
    if (pauseScreen) {
      pauseScreen.classList.add('hidden');
      pauseScreen.style.display = 'none';
    }
    handlers.onResume();
  });

  addTap('restart-btn', () => {
    if (pauseScreen) {
      pauseScreen.classList.add('hidden');
      pauseScreen.style.display = 'none';
    }
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

  const camSelect = get('camera-select');
  if (camSelect) {
    camSelect.addEventListener('change', (e) => handlers.onCameraChange(e
