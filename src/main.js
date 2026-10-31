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

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa7d8ff);

const d = 160;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);

const cameraPresets = {
  classic: { x: 200, y: 240, z: 200 },
  high: { x: 120, y: 320, z: 160 },
  close: { x: 140, y: 170, z: 140 }
};
let camOffset = { ...cameraPresets.classic };
camera.position.set(camOffset.x, camOffset.y, camOffset.z);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.75));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(100, 200, 50);
scene.add(dirLight);

// Character
const chicken = createChicken();
scene.add(chicken);

// Populate map
for (let i = 0; i < 35; i++) {
  lanes.push(createLane(i, STEP_SIZE, scene, vehicles));
}

// Hop Animation State
const jump = {
  isJumping: false,
  startX: 0,
  startZ: 0,
  targetX: 0,
  targetZ: 0,
  duration: 170,
  startTime: 0
};

function triggerMove(dir) {
  if (!gameStarted || isPaused || jump.isJumping) return;

  jump.startX = currentX;
  jump.startZ = -currentLane * STEP_SIZE;

  if (dir === 'up') {
    currentLane++;
    chicken.rotation.y = 0;
  } else if (dir === 'down' && currentLane > 0) {
    currentLane--;
    chicken.rotation.y = Math.PI;
  } else if (dir === 'left' && currentX > -140) {
    currentX -= STEP_SIZE;
    chicken.rotation.y = Math.PI / 2;
  } else if (dir === 'right' && currentX < 140) {
    currentX += STEP_SIZE;
    chicken.rotation.y = -Math.PI / 2;
  } else {
    return;
  }

  jump.targetX = currentX;
  jump.targetZ = -currentLane * STEP_SIZE;
  jump.isJumping = true;
  jump.startTime = performance.now();

  if (currentLane > maxLaneReached) {
    maxLaneReached = currentLane;
    score = maxLaneReached;
    document.getElementById('score-board').innerText = score;
    lanes.push(createLane(lanes.length, STEP_SIZE, scene, vehicles));
  }
}

function resetRun() {
  currentLane = 0;
  currentX = 0;
  chicken.position.set(0, 0, 0);
  jump.isJumping = false;
  maxLaneReached = 0;
  score = 0;
  document.getElementById('score-board').innerText = score;
  camera.position.set(camOffset.x, camOffset.y, camOffset.z);
  camera.lookAt(0, 0, 0);
}

// Connect UI & Controls
setupControls(triggerMove);
setupUI({
  onStart: () => { gameStarted = true; },
  onPause: () => { isPaused = true; },
  onResume: () => { isPaused = false; },
  onRestart: () => { isPaused = false; resetRun(); },
  onCameraChange: (mode) => {
    camOffset = { ...cameraPresets[mode] };
  }
});

// Main Loop
function animate(now) {
  requestAnimationFrame(animate);
  if (isPaused) return;

  // Jump animation interpolation
  if (jump.isJumping) {
    const elapsed = now - jump.startTime;
    const t = Math.min(elapsed / jump.duration, 1);

    // Linear horizontal motion
    chicken.position.x = THREE.MathUtils.lerp(jump.startX, jump.targetX, t);
    chicken.position.z = THREE.MathUtils.lerp(jump.startZ, jump.targetZ, t);

    // Parabolic arc (jump height = 9 units)
    chicken.position.y = Math.sin(t * Math.PI) * 9;

    // Subtle squash/stretch
    const squash = 1 + Math.sin(t * Math.PI) * 0.18;
    chicken.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));

    if (t >= 1) {
      jump.isJumping = false;
      chicken.position.set(jump.targetX, 0, jump.targetZ);
      chicken.scale.set(1, 1, 1);
    }
  }

  // Smooth camera follow
  const targetCamZ = chicken.position.z + camOffset.z;
  camera.position.z += (targetCamZ - camera.position.z) * 0.08;
  camera.position.x = camOffset.x;
  camera.position.y = camOffset.y;
  camera.lookAt(0, 0, chicken.position.z);

  // Vehicles & Collisions
  for (let i = vehicles.length - 1; i >= 0; i--) {
    const car = vehicles[i];
    car.position.x += car.userData.lane.speed;

    if (car.position.x > 320) car.position.x = -320;
    if (car.position.x < -320) car.position.x = 320;

    if (
      Math.abs(car.position.z - chicken.position.z) < 10 &&
      Math.abs(car.position.x - chicken.position.x) < 16
    ) {
      resetRun();
    }
  }

  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

// Resize
window.addEventListener('resize', () => {
  const a = window.innerWidth / window.innerHeight;
  camera.left = -d * a;
  camera.right = d * a;
  camera.top = d;
  camera.bottom = -d;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
