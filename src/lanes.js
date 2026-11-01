const carColors = [0x558b2f, 0x0288d1, 0xef6c00, 0x8e24aa, 0xc62828, 0x00897b];

// Authentic cuboid trees matching official Crossy Road
function createCuboidTree(x, z, heightMult = 1) {
  const THREE = window.THREE;
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 7, 4.5),
    new THREE.MeshLambertMaterial({ color: 0x4e342e })
  );
  trunk.position.y = 3.5;
  group.add(trunk);

  const foliageH = 14 * heightMult;
  const leaves = new THREE.Mesh(
    new THREE.BoxGeometry(11, foliageH, 11),
    new THREE.MeshLambertMaterial({ color: 0x96cf28 })
  );
  leaves.position.y = 7 + foliageH / 2;
  group.add(leaves);

  group.position.set(x, 0, z);
  return group;
}

// Stepped lavender-grey rocks
function createRock(x, z) {
  const THREE = window.THREE;
  const group = new THREE.Group();
  const rockMat = new THREE.MeshLambertMaterial({ color: 0x9a8eb5 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(11, 4, 11), rockMat);
  base.position.y = 2;
  group.add(base);

  const top = new THREE.Mesh(new THREE.BoxGeometry(7, 3, 7), rockMat);
  top.position.y = 5.5;
  group.add(top);

  group.position.set(x, 0, z);
  return group;
}

function spawnVehicle(lane, startX, scene, vehicles) {
  const THREE = window.THREE;
  const isTruck = Math.random() < 0.3;
  const vehicle = new THREE.Group();

  const width = isTruck ? 44 : 26;
  const height = 11;
  const depth = 13;

  const bodyMat = new THREE.MeshLambertMaterial({ color: lane.vehicleColor });
  const roofMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const windowMat = new THREE.MeshLambertMaterial({ color: 0x263238 });
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x212121 });

  // Chassis
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, 6, depth), bodyMat);
  body.position.y = 4.5;
  vehicle.add(body);

  // Cabin
  const cabinW = isTruck ? 14 : 16;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(cabinW, 6, depth - 1.5), windowMat);
  cabin.position.set(isTruck ? (lane.speed > 0 ? 11 : -11) : 0, 9.5, 0);
  vehicle.add(cabin);

  // White roof cap
  const roof = new THREE.Mesh(new THREE.BoxGeometry(cabinW + 0.5, 1.2, depth - 1), roofMat);
  roof.position.set(isTruck ? (lane.speed > 0 ? 11 : -11) : 0, 13, 0);
  vehicle.add(roof);

  // Wheels
  const xOffsets = isTruck ? [-14, 0, 14] : [-8, 8];
  xOffsets.forEach(ox => {
    const w1 = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.5, 1.5), wheelMat);
    w1.position.set(ox, 1.75, depth / 2);
    vehicle.add(w1);

    const w2 = w1.clone();
    w2.position.z = -depth / 2;
    vehicle.add(w2);
  });

  vehicle.position.set(startX, 0, lane.z);
  vehicle.userData = { lane, width, depth };
  scene.add(vehicle);
  if (Array.isArray(vehicles)) vehicles.push(vehicle);
}

function spawnLog(lane, startX, scene, floaters) {
  const THREE = window.THREE;
  const width = Math.random() < 0.4 ? 60 : 42;
  const depth = 12;
  const group = new THREE.Group();

  const bark = new THREE.Mesh(
    new THREE.BoxGeometry(width, 4, depth),
    new THREE.MeshLambertMaterial({ color: 0x6d4c41 })
  );
  bark.position.y = 1;
  group.add(bark);

  const endMat = new THREE.MeshLambertMaterial({ color: 0xbcaaa4 });
  const capL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.2, depth - 2), endMat);
  capL.position.set(-width / 2 - 0.2, 1, 0);
  group.add(capL);

  const capR = capL.clone();
  capR.position.x = width / 2 + 0.2;
  group.add(capR);

  group.position.set(startX, 0, lane.z);
  group.userData = { lane, width, depth, speed: lane.speed };
  scene.add(group);
  if (Array.isArray(floaters)) floaters.push(group);
}

export function createLane(index, stepSize, scene, vehicles = [], floaters = [], obstacles = []) {
  const THREE = window.THREE;
  const z = -index * stepSize;

  let type = 'grass';
  if (index > 2) {
    const roll = Math.random();
    if (roll < 0.46) type = 'road';
    else if (roll < 0.74) type = 'water';
    else type = 'grass';
  }

  const laneData = { index, z, type };

  let groundColor = 0x8cd635;
  if (type === 'road') groundColor = 0x424651;
  if (type === 'water') groundColor = 0x56c5f0;

  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(800, 4, stepSize),
    new THREE.MeshLambertMaterial({ color: groundColor })
  );
  ground.position.set(0, type === 'water' ? -3 : -2, z);
  scene.add(ground);

  // Stepped boundary forest
  const boundaries = [-160, -140, -120, 120, 140, 160];
  boundaries.forEach(bx => {
    const h = 0.8 + Math.random() * 0.5;
    const t = createCuboidTree(bx + (Math.random() * 4 - 2), z, h);
    scene.add(t);
    if (Array.isArray(obstacles)) obstacles.push({ x: bx, z });
  });

  if (type === 'road') {
    laneData.speed = (Math.random() * 0.9 + 0.8) * (Math.random() < 0.5 ? 1 : -1);
    laneData.vehicleColor = carColors[Math.floor(Math.random() * carColors.length)];

    spawnVehicle(laneData, -110, scene, vehicles);
    spawnVehicle(laneData, 15, scene, vehicles);
    spawnVehicle(laneData, 140, scene, vehicles);

  } else if (type === 'water') {
    laneData.speed = (Math.random() * 0.6 + 0.5) * (Math.random() < 0.5 ? 1 : -1);

    spawnLog(laneData, -100, scene, floaters);
    spawnLog(laneData, -30, scene, floaters);
    spawnLog(laneData, 45, scene, floaters);
    spawnLog(laneData, 115, scene, floaters);

  } else if (type === 'grass' && index > 2) {
    for (let x = -85; x <= 85; x += stepSize) {
      const roll = Math.random();
      if (roll < 0.18) {
        const tree = createCuboidTree(x, z, 0.9 + Math.random() * 0.4);
        scene.add(tree);
        if (Array.isArray(obstacles)) obstacles.push({ x, z });
      } else if (roll < 0.25) {
        const rock = createRock(x, z);
        scene.add(rock);
        if (Array.isArray(obstacles)) obstacles.push({ x, z });
      }
    }
  }

  return laneData;
}
