const carColors = [0xe74c3c, 0x3498db, 0xf1c40f, 0x9b59b6, 0xe67e22, 0x1abc9c];

function createDetailedTree(x, z, scale = 1) {
  const THREE = window.THREE;
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.BoxGeometry(6 * scale, 10 * scale, 6 * scale),
    new THREE.MeshLambertMaterial({ color: 0x4e342e })
  );
  trunk.position.y = 5 * scale;
  tree.add(trunk);

  const leavesBottom = new THREE.Mesh(
    new THREE.BoxGeometry(18 * scale, 10 * scale, 18 * scale),
    new THREE.MeshLambertMaterial({ color: 0x2e7d32 })
  );
  leavesBottom.position.y = 13 * scale;
  tree.add(leavesBottom);

  const leavesTop = new THREE.Mesh(
    new THREE.BoxGeometry(12 * scale, 8 * scale, 12 * scale),
    new THREE.MeshLambertMaterial({ color: 0x388e3c })
  );
  leavesTop.position.y = 20 * scale;
  tree.add(leavesTop);

  tree.position.set(x, 0, z);
  return tree;
}

function createWaterfallPortal(x, z, direction) {
  const THREE = window.THREE;
  const group = new THREE.Group();

  const cliff = new THREE.Mesh(
    new THREE.BoxGeometry(26, 28, 20),
    new THREE.MeshLambertMaterial({ color: 0x616161 })
  );
  cliff.position.y = 12;
  group.add(cliff);

  const cave = new THREE.Mesh(
    new THREE.BoxGeometry(18, 14, 20.4),
    new THREE.MeshLambertMaterial({ color: 0x1a237e })
  );
  cave.position.y = 5;
  group.add(cave);

  const waterFoam = new THREE.Mesh(
    new THREE.BoxGeometry(18, 2, 4),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  waterFoam.position.set(0, 0.5, direction > 0 ? 8 : -8);
  group.add(waterFoam);

  group.position.set(x, 0, z);
  return group;
}

function spawnDetailedVehicle(lane, startX, scene, vehicles) {
  const THREE = window.THREE;
  const isTruck = Math.random() < 0.35;
  const vehicle = new THREE.Group();

  const width = isTruck ? 46 : 26;
  const height = isTruck ? 14 : 10;
  const depth = 14;

  const bodyColor = lane.vehicleColor || carColors[Math.floor(Math.random() * carColors.length)];
  const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x212121 });
  const windowMat = new THREE.MeshLambertMaterial({ color: 0xdce775 });
  const lightMat = new THREE.MeshLambertMaterial({ color: 0xffeb3b });
  const tailLightMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });

  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bodyMat);
  body.position.y = height / 2 + 2;
  vehicle.add(body);

  if (isTruck) {
    const cargo = new THREE.Mesh(
      new THREE.BoxGeometry(26, height + 4, depth - 1),
      new THREE.MeshLambertMaterial({ color: 0x8d6e63 })
    );
    cargo.position.set(lane.speed > 0 ? -9 : 9, height / 2 + 4, 0);
    vehicle.add(cargo);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(12, height * 0.7, depth * 0.9), windowMat);
    cabin.position.set(lane.speed > 0 ? 13 : -13, height + 2, 0);
    vehicle.add(cabin);
  } else {
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(14, height * 0.75, depth * 0.9), windowMat);
    cabin.position.set(0, height + 1, 0);
    vehicle.add(cabin);
  }

  // Wheels
  const wheelGeom = new THREE.BoxGeometry(5, 4, 2);
  const zOffset = depth / 2 + 0.5;
  const xOffsets = isTruck ? [-14, 0, 14] : [-8, 8];

  xOffsets.forEach(x => {
    const wFront = new THREE.Mesh(wheelGeom, wheelMat);
    wFront.position.set(x, 2, zOffset);
    vehicle.add(wFront);

    const wBack = new THREE.Mesh(wheelGeom, wheelMat);
    wBack.position.set(x, 2, -zOffset);
    vehicle.add(wBack);
  });

  // Lights
  const frontLight = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 3), lightMat);
  frontLight.position.set(lane.speed > 0 ? width / 2 + 0.2 : -width / 2 - 0.2, 5, 3.5);
  vehicle.add(frontLight);

  const frontLight2 = frontLight.clone();
  frontLight2.position.z = -3.5;
  vehicle.add(frontLight2);

  const tailLight = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 3), tailLightMat);
  tailLight.position.set(lane.speed > 0 ? -width / 2 - 0.2 : width / 2 + 0.2, 5, 3.5);
  vehicle.add(tailLight);

  vehicle.position.set(startX, 0, lane.z);
  vehicle.userData = { lane, width, depth, type: 'vehicle' };
  scene.add(vehicle);
  if (Array.isArray(vehicles)) vehicles.push(vehicle);
}

function spawnDetailedLog(lane, startX, scene, floaters) {
  const THREE = window.THREE;
  const isLong = Math.random() < 0.45;
  const width = isLong ? 64 : 44;
  const depth = 13;

  const group = new THREE.Group();

  const bark = new THREE.Mesh(
    new THREE.BoxGeometry(width, 4, depth),
    new THREE.MeshLambertMaterial({ color: 0x5d4037 })
  );
  bark.position.y = 1;
  group.add(bark);

  const endCapMat = new THREE.MeshLambertMaterial({ color: 0xd7ccc8 });
  const endL = new THREE.Mesh(new THREE.BoxGeometry(1, 3.2, depth - 2), endCapMat);
  endL.position.set(-width / 2 - 0.1, 1, 0);
  group.add(endL);

  const endR = endL.clone();
  endR.position.x = width / 2 + 0.1;
  group.add(endR);

  group.position.set(startX, 0, lane.z);
  group.userData = { lane, width, depth, type: 'log', speed: lane.speed };
  scene.add(group);
  if (Array.isArray(floaters)) floaters.push(group);
}

function spawnLilyPad(x, z, scene, floaters) {
  const THREE = window.THREE;
  const group = new THREE.Group();

  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(8, 8, 2, 8),
    new THREE.MeshLambertMaterial({ color: 0x43a047 })
  );
  pad.position.y = 0.5;
  group.add(pad);

  const flower = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, 3),
    new THREE.MeshLambertMaterial({ color: 0xffeb3b })
  );
  flower.position.y = 1.8;
  group.add(flower);

  group.position.set(x, 0, z);
  group.userData = { width: 16, depth: 16, type: 'lily', speed: 0 };
  scene.add(group);
  if (Array.isArray(floaters)) floaters.push(group);
}

export function createLane(index, stepSize, scene, vehicles = [], floaters = [], obstacles = []) {
  const THREE = window.THREE;
  const z = -index * stepSize;

  let type = 'grass';
  if (index > 2) {
    const roll = Math.random();
    if (roll < 0.45) type = 'road';
    else if (roll < 0.75) type = 'water';
    else type = 'grass';
  }

  const laneData = { index, z, type };

  let groundColor = 0x76c043;
  if (type === 'road') groundColor = 0x37474f;
  if (type === 'water') groundColor = 0x0288d1;

  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(1000, 4, stepSize),
    new THREE.MeshLambertMaterial({ color: groundColor })
  );
  ground.position.set(0, type === 'water' ? -3 : -2, z);
  scene.add(ground);

  // Dense boundary forest to the left and right
  const boundarySteps = [-180, -160, -140, -120, 120, 140, 160, 180];
  for (const bx of boundarySteps) {
    const bTree = createDetailedTree(bx + (Math.random() * 4 - 2), z, 1.1);
    scene.add(bTree);
    if (Array.isArray(obstacles)) obstacles.push({ x: bx, z, radius: 9 });
  }

  if (type === 'road') {
    laneData.speed = (Math.random() * 1.0 + 0.8) * (Math.random() < 0.5 ? 1 : -1);
    laneData.vehicleColor = carColors[Math.floor(Math.random() * carColors.length)];

    spawnDetailedVehicle(laneData, -120, scene, vehicles);
    spawnDetailedVehicle(laneData, 10, scene, vehicles);
    spawnDetailedVehicle(laneData, 140, scene, vehicles);

  } else if (type === 'water') {
    laneData.speed = (Math.random() * 0.7 + 0.6) * (Math.random() < 0.5 ? 1 : -1);

    // Waterfall cliff portals at the river edges
    const leftPortal = createWaterfallPortal(-125, z, 1);
    const rightPortal = createWaterfallPortal(125, z, -1);
    scene.add(leftPortal);
    scene.add(rightPortal);
    if (Array.isArray(obstacles)) {
      obstacles.push({ x: -125, z, radius: 12 });
      obstacles.push({ x: 125, z, radius: 12 });
    }

    if (Math.random() < 0.25) {
      for (let x = -70; x <= 70; x += 35) {
        if (Math.random() < 0.85) spawnLilyPad(x, z, scene, floaters);
      }
    } else {
      // 3 to 4 logs spaced across the lane
      spawnDetailedLog(laneData, -90, scene, floaters);
      spawnDetailedLog(laneData, -20, scene, floaters);
      spawnDetailedLog(laneData, 50, scene, floaters);
      spawnDetailedLog(laneData, 120, scene, floaters);
    }

  } else if (type === 'grass' && index > 2) {
    for (let x = -90; x <= 90; x += stepSize) {
      if (Math.random() < 0.26) {
        const tree = createDetailedTree(x, z, 0.9 + Math.random() * 0.2);
        scene.add(tree);
        if (Array.isArray(obstacles)) obstacles.push({ x, z, radius: 8 });
      }
    }
  }

  return laneData;
}
