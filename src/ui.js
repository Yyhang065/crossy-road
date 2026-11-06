import { setupSettings } from './settings.js';

export function setupUI(handlers, videoCallbacks) {
  const get = (id) => document.getElementById(id);

  const homeScreen = get('home-screen');
  const pauseScreen = get('pause-screen');
  const settingsDialog = get('settings-dialog');
  const logDialog = get('log-dialog');

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

  setupSettings(videoCallbacks);
}
