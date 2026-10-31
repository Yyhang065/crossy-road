import { createChicken } from './chicken.js';
import { createLane } from './lanes.js';
import { setupControls } from './controls.js';
import { setupUI } from './ui.js';

const THREE = window.THREE;
const STEP_SIZE = 20;

let score = 0;
let maxLaneReached = 0;
let currentLane = 0;
let currentX = 0;
let gameStarted = false;
let isPaused = false;

const lanes = [];
const vehicles = [];
const floaters = [];
const obstacles = [];

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x90caf9);

// Orthographic Camera Setup
const d = 160;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 2000);

// Camera offsets relative to the chicken position
const cameraPresets = {
  classic: { x: 120, y: 160, z: 120 },
  high: { x: 60, y: 240, z: 80 },
  close: { x: 80, y: 110, z: 80 }
};
let camOffset = { ...cameraPresets.classic };

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const container = document.getElementById('canvas-container') || document.body;
container.innerHTML = '';
container.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.85));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.65);
dirLight.position.set(100, 200, 80);
scene.add(dirLight);

// Chicken Character
const chicken = createChicken();
chicken.position.set(0, 0, 0);
scene.add(chicken);

// Initial camera position centered on chicken
camera.position.set(camOffset.x, camOffset.y, camOffset.z);
camera.lookAt(0, 0, 0);

// Populate 40 starter lanes with all parameters
for (let i = 0; i < 40; i++) {
  lanes.push(createLane(i, STEP_SIZE, scene, vehicles, floaters, obstacles));
}

// Hop Animation State
const jump = {
  isJumping: false,
  startX: 0,
  startZ: 0,
  targetX: 0,
  targetZ: 0,
  duration: 150,
  startTime: 0
};

let smoothCameraZ = 0;
let smoothCameraX = 0;
let activeFloater = null;

function isBlocked(x, z) {
  return obstacles.some(obs => Math.abs(obs.x - x) < 8 && Math.abs(obs.z - z) < 8);
}

function triggerMove(dir) {
  if (!gameStarted || isPaused || jump.isJumping) return;

  let nextLane = currentLane;
  let nextX = currentX;

  if (dir === 'up') {
    nextLane++;
    chicken.rotation.y = 0;
  } else if (dir === 'down' && currentLane > 0) {
    nextLane--;
    chicken.rotation.y = Math.PI;
  } else if (dir === 'left' && currentX > -140) {
    nextX -= STEP_SIZE;
    chicken.rotation.y = Math.PI / 2;
  } else if (dir === 'right' && currentX < 140) {
    nextX += STEP_SIZE;
    chicken.rotation.y = -Math.PI / 2;
  } else {
    return;
  }

  const targetZ = -nextLane * STEP_SIZE;
  if (isBlocked(nextX, targetZ)) return;

  activeFloater = null;
  currentLane = nextLane;
  currentX = nextX;

  jump.startX = chicken.position.x;
  jump.startZ = chicken.position.z;
  jump.targetX = currentX;
  jump.targetZ = targetZ;
  jump.isJumping = true;
  jump.startTime = performance.now();

  if (currentLane > maxLaneReached) {
    maxLaneReached = currentLane;
    score = maxLaneReached;
    const scoreBoard = document.getElementById('score-board');
    if (scoreBoard) scoreBoard.innerText = score;
    lanes.push(createLane(lanes.length, STEP_SIZE, scene, vehicles, floaters, obstacles));
  }
}

function resetRun() {
  currentLane = 0;
  currentX = 0;
  chicken.position.set(0, 0, 0);
  chicken.rotation.y = 0;
  jump.isJumping = false;
  activeFloater = null;
  maxLaneReached = 0;
  score = 0;
  const scoreBoard = document.getElementById('score-board');
  if (scoreBoard) scoreBoard.innerText = score;
  smoothCameraZ = 0;
  smoothCameraX = 0;
  camera.position.set(camOffset.x, camOffset.y, camOffset.z);
  camera.lookAt(0, 0, 0);
}

// Bind UI & Controls
setupControls(triggerMove);
setupUI({
  onStart: () => { gameStarted = true; },
  onPause: () => { isPaused = true; },
  onResume: () => { isPaused = false; },
  onRestart: () => { isPaused = false; resetRun(); },
  onCameraChange: (mode) => {
    if (cameraPresets[mode]) camOffset = { ...cameraPresets[mode] };
  }
});

// Main Loop
function animate(now) {
  requestAnimationFrame(animate);
  if (isPaused) return;

  // Jump animation
  if (jump.isJumping) {
    const elapsed = now - jump.startTime;
    const t = Math.min(elapsed / jump.duration, 1);

    chicken.position.x = THREE.MathUtils.lerp(jump.startX, jump.targetX, t);
    chicken.position.z = THREE.MathUtils.lerp(jump.startZ, jump.targetZ, t);
    chicken.position.y = Math.sin(t * Math.PI) * 7.5;

    const squash = 1 + Math.sin(t * Math.PI) * 0.12;
    chicken.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));

    if (t >= 1) {
      jump.isJumping = false;
      chicken.position.set(jump.targetX, 0, jump.targetZ);
      chicken.scale.set(1, 1, 1);
    }
  } else if (activeFloater && activeFloater.userData.speed) {
    chicken.position.x += activeFloater.userData.speed;
    currentX = chicken.position.x;
    if (chicken.position.x > 180 || chicken.position.x < -180) {
      resetRun();
      return;
    }
  }

  // Smoothly center camera directly on the chicken's current location
  const targetCamZ = -currentLane * STEP_SIZE;
  smoothCameraZ += (targetCamZ - smoothCameraZ) * 0.08;
  smoothCameraX += (chicken.position.x - smoothCameraX) * 0.08;

  camera.position.set(
    smoothCameraX + camOffset.x,
    camOffset.y,
    smoothCameraZ + camOffset.z
  );
  camera.lookAt(smoothCameraX, 0
