import { createChicken } from './chicken.js';
import { createLane, GRID_SIZE, MIN_COL, MAX_COL } from './lanes.js';
import { setupControls } from './controls.js';
import { setupUI } from './ui.js';

function init() {
  const THREE = window.THREE;
  if (!THREE) {
    throw new Error('Three.js failed to load.');
  }

  let score = 0;
  let maxRowReached = 0;
  let currentRow = 0;
  let currentCol = 0;
  let gameStarted = false;
  let isPaused = false;

  // Video Settings state
  let renderDistanceLanes = 55;
  let maxFps = 0; // 0 = uncapped
  let lastFrameTime = 0;

  const lanes = [];
  const vehicles = [];
  const floaters = [];
  const gridOccupancy = new Map();

  const scene = new THREE.Scene();
  const skyColor = 0x81d4fa;
  scene.background = new THREE.Color(skyColor);

  // Fog Setting
  scene.fog = new THREE.Fog(skyColor, 260, 480);

  // Orthographic Camera
  const d = 110;
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 2500);
  const camOffset = { x: 95, y: 135, z: 95 };

  // Renderer with Hardware Anti-Aliasing (MSAA)
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  function updatePixelRatio(mode = 'auto') {
    if (mode === 'auto') {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } else {
      renderer.setPixelRatio(parseFloat(mode));
    }
  }
  updatePixelRatio();

  const container = document.getElementById('canvas-container') || document.body;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 0.7);
  sunLight.position.set(110, 240, 90);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 600;
  sunLight.shadow.camera.left = -200;
  sunLight.shadow.camera.right = 200;
  sunLight.shadow.camera.top = 200;
  sunLight.shadow.camera.bottom = -200;
  scene.add(sunLight);

  // Chicken
  const chicken = createChicken();
  chicken.position.set(0, 0, 0);
  chicken.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(chicken);

  camera.position.set(camOffset.x, camOffset.y, camOffset.z);
  camera.lookAt(0, 0, 0);

  // Initial Lane Generation
  for (let r = 0; r < renderDistanceLanes; r++) {
    lanes.push(createLane(r, scene, vehicles, floaters, gridOccupancy));
  }

  const jump = {
    isJumping: false,
    startX: 0,
    startZ: 0,
    targetX: 0,
    targetZ: 0,
    duration: 135,
    startTime: 0
  };

  let smoothCameraZ = 0;
  let smoothCameraX = 0;
  let activeFloater = null;

  // Strict Grid Spatial Query
  function isCellBlocked(col, row) {
    if (col < MIN_COL || col > MAX_COL) return true;
    return gridOccupancy.has(`${col},${row}`);
  }

  function triggerMove(dir) {
    if (!gameStarted || isPaused || jump.isJumping) return;

    let targetCol = currentCol;
    let targetRow = currentRow;

    if (dir === 'up') {
      targetRow++;
      chicken.rotation.y = 0;
    } else if (dir === 'down' && currentRow > 0) {
      targetRow--;
      chicken.rotation.y = Math.PI;
    } else if (dir === 'left') {
      targetCol--;
      chicken.rotation.y = Math.PI / 2;
    } else if (dir === 'right') {
      targetCol++;
      chicken.rotation.y = -Math.PI / 2;
    } else {
      return;
    }

    // Grid collision pre-flight check
    if (isCellBlocked(targetCol, targetRow)) return;

    activeFloater = null;
    currentCol = targetCol;
    currentRow = targetRow;

    jump.startX = chicken.position.x;
    jump.startZ = chicken.position.z;
    jump.targetX = currentCol * GRID_SIZE;
    jump.targetZ = -currentRow * GRID_SIZE;
    jump.isJumping = true;
    jump.startTime = performance.now();

    if (currentRow > maxRowReached) {
      maxRowReached = currentRow;
      score = maxRowReached;
      const scoreBoard = document.getElementById('score-board');
      if (scoreBoard) scoreBoard.innerText = score;

      // Maintain buffer
      while (lanes.length < currentRow + renderDistanceLanes) {
        lanes.push(createLane(lanes.length, scene, vehicles, floaters, gridOccupancy));
      }
    }
  }

  function resetRun() {
    currentRow = 0;
    currentCol = 0;
    chicken.position.set(0, 0, 0);
    chicken.rotation.y = 0;
    jump.isJumping = false;
    activeFloater = null;
    maxRowReached = 0;
    score = 0;
    const scoreBoard = document.getElementById('score-board');
    if (scoreBoard) scoreBoard.innerText = score;
    smoothCameraZ = 0;
    smoothCameraX = 0;
    camera.position.set(camOffset.x, camOffset.y, camOffset.z);
    camera.lookAt(0, 0, 0);
  }

  setupControls(triggerMove);

  // UI & Video Settings hooks
  setupUI(
    {
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
    },
    {
      onShadowChange: (enabled) => {
        sunLight.castShadow = enabled;
        renderer.shadowMap.enabled = enabled;
      },
      onFogChange: (enabled) => {
        scene.fog = enabled ? new THREE.Fog(skyColor, 260, 480) : null;
      },
      onDistanceChange: (dist) => {
        renderDistanceLanes = dist;
        while (lanes.length < currentRow + renderDistanceLanes) {
          lanes.push(createLane(lanes.length, scene, vehicles, floaters, gridOccupancy));
        }
      },
      onFpsChange: (fps) => {
        maxFps = fps;
      },
      onDensityChange: (density) => {
        updatePixelRatio(density);
      }
    }
  );

  function animate(now) {
    requestAnimationFrame(animate);
    if (isPaused) return;

    // Framerate Throttle
    if (maxFps > 0) {
      const interval = 1000 / maxFps;
      const delta = now - lastFrameTime;
      if (delta < interval) return;
      lastFrameTime = now - (delta % interval);
    }

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
      // Snap grid column tracking
      currentCol = Math.round(chicken.position.x / GRID_SIZE);

      if (chicken.position.x > 125 || chicken.position.x < -125) {
        resetRun();
        return;
      }
    }

    // Camera follow
    const targetCamZ = -currentRow * GRID_SIZE - 20;
    smoothCameraZ += (targetCamZ - smoothCameraZ) * 0.08;
    smoothCameraX += (chicken.position.x - smoothCameraX) * 0.08;

    camera.position.set(
      smoothCameraX + camOffset.x,
      camOffset.y,
      smoothCameraZ + camOffset.z
    );
    camera.lookAt(smoothCameraX, 0, smoothCameraZ + 20);

    // Keep sunlight moving with player for shadow stability
    sunLight.position.set(smoothCameraX + 110, 240, smoothCameraZ + 90);
    sunLight.target.position.set(smoothCameraX, 0, smoothCameraZ);
    sunLight.target.updateMatrixWorld();

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

    // Floaters
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
      const lane = lanes[currentRow];
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
