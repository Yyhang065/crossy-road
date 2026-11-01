import { createChicken } from './chicken.js';
import { createLane } from './lanes.js';
import { setupControls } from './controls.js';
import { setupUI } from './ui.js';

function init() {
  const THREE = window.THREE;
  if (!THREE) {
    throw new Error('Three.js failed to load.');
  }

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

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x81d4fa);

  // Orthographic Camera locked to lower-third authentic perspective
  const d = 110;
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 2000);

  // Fixed camera POV offset
  const camOffset = { x: 95, y: 135, z: 95 };

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const container = document.getElementById('canvas-container') || document.body;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const sunLight = new THREE.DirectionalLight(0xffffff, 0.7);
  sunLight.position.set(110, 220, 90);
  scene.add(sunLight);

  // Chicken
  const chicken = createChicken();
  chicken.position.set(0, 0, 0);
  scene.add(chicken);

  camera.position.set(camOffset.x, camOffset.y, camOffset.z);
  camera.lookAt(0, 0, 0);

  for (let i = 0; i < 40; i++) {
    lanes.push(createLane(i, STEP_SIZE, scene, vehicles, floaters, obstacles));
  }

  const jump = {
    isJumping: false,
    startX: 0,
    startZ: 0,
    targetX: 0,
    targetZ: 0,
    duration: 140,
    startTime: 0
  };

  let smoothCameraZ = 0;
  let smoothCameraX = 0;
  let activeFloater = null;

  function isBlocked(x, z) {
    return obstacles.some(obs => Math.abs(obs.x - x) < 9 && Math.abs(obs.z - z) < 9);
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
    } else if (dir === 'left') {
      nextX -= STEP_SIZE;
      chicken.rotation.y = Math.PI / 2;
    } else if (dir === 'right') {
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

  setupControls(triggerMove);
  setupUI({
    onStart: () => {
      gameStarted = true;
      isPaused = false;
    },
    onPause: () => { isPaused = true; },
    onResume: () => { isPaused = false; },
    onRestart: () => {
      isPaused = false;
      resetRun();
    }
  });

  function animate(now) {
    requestAnimationFrame(animate);
    if (isPaused) return;

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
      if (chicken.position.x > 130 || chicken.position.x < -130) {
        resetRun();
        return;
      }
    }

    // Camera framed on lower third of viewport
    const targetCamZ = -currentLane * STEP_SIZE - 20;
    smoothCameraZ += (targetCamZ - smoothCameraZ) * 0.08;
    smoothCameraX += (chicken.position.x - smoothCameraX) * 0.08;

    camera.position.set(
      smoothCameraX + camOffset.x,
      camOffset.y,
      smoothCameraZ + camOffset.z
    );
    camera.lookAt(smoothCameraX, 0, smoothCameraZ + 20);

    // Vehicles
    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      v.position.x += v.userData.lane.speed;
      if (v.position.x > 260) v.position.x = -260;
      if (v.position.x < -260) v.position.x = 260;

      if (
        Math.abs(v.position.z - chicken.position.z) < 9 &&
        Math.abs(v.position.x - chicken.position.x) < (v.userData.width / 2 + 4.5)
      ) {
        resetRun();
        return;
      }
    }

    // Floating platforms
    let onFloater = false;
    for (let i = 0; i < floaters.length; i++) {
      const f = floaters[i];
      if (f.userData.speed) {
        f.position.x += f.userData.speed;
        if (f.position.x > 180) f.position.x = -180;
        if (f.position.x < -180) f.position.x = 180;
      }

      if (
        !jump.isJumping &&
        Math.abs(f.position.z - chicken.position.z) < 8.5 &&
        Math.abs(f.position.x - chicken.position.x) < (f.userData.width / 2 + 4)
      ) {
        onFloater = true;
        activeFloater = f;
      }
    }

    // Water collision
    if (!jump.isJumping) {
      const lane = lanes[currentLane];
      if (lane && lane.type === 'water' && !onFloater) {
        resetRun();
        return;
      }
    }

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);

  window.addEventListener('resize', () => {
    const a = window.innerWidth / window.innerHeight;
    camera.left = -d * a;
    camera.right = d * a;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
