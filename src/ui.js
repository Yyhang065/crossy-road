export function setupUI(handlers) {
  const homeScreen = document.getElementById('home-screen');
  const pauseScreen = document.getElementById('pause-screen');
  const settingsDialog = document.getElementById('settings-dialog');
  const logDialog = document.getElementById('log-dialog');

  // Home controls
  document.getElementById('start-btn').addEventListener('click', () => {
    homeScreen.classList.add('hidden');
    handlers.onStart();
  });

  document.getElementById('log-btn').addEventListener('click', () => {
    logDialog.classList.remove('hidden');
  });

  document.getElementById('close-log-btn').addEventListener('click', () => {
    logDialog.classList.add('hidden');
  });

  // Settings
  const openSettings = () => settingsDialog.classList.remove('hidden');
  document.getElementById('settings-home-btn').addEventListener('click', openSettings);
  document.getElementById('settings-top-btn').addEventListener('click', openSettings);
  document.getElementById('settings-pause-btn').addEventListener('click', openSettings);

  document.getElementById('close-settings-btn').addEventListener('click', () => {
    settingsDialog.classList.add('hidden');
  });

  // Pause
  document.getElementById('pause-top-btn').addEventListener('click', () => {
    pauseScreen.classList.remove('hidden');
    handlers.onPause();
  });

  document.getElementById('resume-btn').addEventListener('click', () => {
    pauseScreen.classList.add('hidden');
    handlers.onResume();
  });

  document.getElementById('restart-btn').addEventListener('click', () => {
    pauseScreen.classList.add('hidden');
    handlers.onRestart();
  });

  // Dropdown adjustments
  document.getElementById('camera-select').addEventListener('change', (e) => {
    handlers.onCameraChange(e.target.value);
  });

  document.getElementById('opacity-select').addEventListener('change', (e) => {
    document.getElementById('controls').style.opacity = e.target.value;
  });
}
