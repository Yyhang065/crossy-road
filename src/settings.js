import { setLanguage } from './i18n.js';

export function setupSettings() {
  const get = (id) => document.getElementById(id);
  const controlsContainer = get('controls-container');

  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach((btn) => {
    btn.onclick = (e) => {
      e.preventDefault();
      const target = btn.dataset.tab;
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const content = get(target);
      if (content) content.classList.add('active');
    };
  });

  // Controls auto-detect and layout logic
  let controlMode = 'auto';
  let touchLayout = 'auto';

  const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  function refreshControlsDisplay() {
    if (!controlsContainer) return;

    if (controlMode === 'keyboard' || (controlMode === 'auto' && !isTouchDevice())) {
      controlsContainer.classList.add('layout-hidden');
      return;
    }

    controlsContainer.classList.remove('layout-hidden');

    if (touchLayout === 'auto') {
      const isPortrait = window.innerHeight > window.innerWidth;
      controlsContainer.className = isPortrait ? 'layout-cluster' : 'layout-split';
    } else {
      controlsContainer.className = touchLayout === 'cluster' ? 'layout-cluster' : 'layout-split';
    }
  }

  const modeSelect = get('controls-mode-select');
  if (modeSelect) {
    modeSelect.onchange = (e) => {
      controlMode = e.target.value;
      refreshControlsDisplay();
    };
  }

  const layoutSelect = get('touch-layout-select');
  if (layoutSelect) {
    layoutSelect.onchange = (e) => {
      touchLayout = e.target.value;
      refreshControlsDisplay();
    };
  }

  const opacitySelect = get('opacity-select');
  if (opacitySelect) {
    opacitySelect.onchange = (e) => {
      if (controlsContainer) controlsContainer.style.opacity = e.target.value;
    };
  }

  const langSelect = get('language-select');
  if (langSelect) {
    langSelect.onchange = (e) => setLanguage(e.target.value);
  }

  window.addEventListener('resize', refreshControlsDisplay);
  window.addEventListener('orientationchange', refreshControlsDisplay);
  refreshControlsDisplay();
}
