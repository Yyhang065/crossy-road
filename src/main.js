/* global THREE */
import { createChicken } from './chicken.js';
import { createLane } from './lanes.js';
import { setupControls } from './controls.js';

const STEP_SIZE = 20;
let score = 0;
let maxLaneReached = 0;
let currentLane = 0;
let currentX = 0;

const lanes = [];
const vehicles = [];

// Scene & Camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa7d8ff);

const d = 160;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
camera.position.set(200, 240, 200);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(100, 200, 50);
scene.add(dirLight);

// Spawn Chicken
const chicken = createChicken();
scene.add(chicken);

// Populate initial field
for (let i = 0; i < 35; i++) {
  lanes.push(createLane(i, STEP_SIZE, scene, vehicles));
}

// Player Movement Logic
function handleMove(dir) {
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
  }

  chicken.position.x = currentX;
  chicken.position.z = -currentLane * STEP_SIZE;

  camera.position.z = chicken.position.z + 200;
  camera.lookAt(0, 0, chicken.position.z);

  if (currentLane > maxLaneReached) {
    maxLaneReached = currentLane;
    score = maxLaneReached;
    document.getElementById('score-board').innerText = score;
    lanes.push(createLane(lanes.length, STEP_SIZE, scene, vehicles));
  }
}

setupControls(handleMove);

// Game Loop
function animate() {
  requestAnimationFrame(animate);

  for (let i = vehicles.length - 1; i >= 0; i--) {
    const car = vehicles[i];
    car.position.x += car.userData.lane.speed;

    if (car.position.x > 320) car.position.x = -320;
    if (car.position.x < -320) car.position.x = 320;

    // Collision check
    if (
      Math.abs(car.position.z - chicken.position.z) < 10 &&
      Math.abs(car.position.x - chicken.position.x) < 16
    ) {
      currentLane = 0;
      currentX = 0;
      chicken.position.set(0, 0, 0);
      camera.position.z = 200;
      camera.lookAt(0, 0, 0);
      maxLaneReached = 0;
      score = 0;
      document.getElementById('score-board').innerText = score;
    }
  }

  renderer.render(scene, camera);
}
animate();

// Resize handling
window.addEventListener('resize', () => {
  const a = window.innerWidth / window.innerHeight;
  camera.left = -d * a;
  camera.right = d * a;
  camera.top = d;
  camera.bottom = -d;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
