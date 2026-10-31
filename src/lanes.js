const carColors = [0xe74c3c, 0x3498db, 0xf1c40f, 0x9b59b6, 0xe67e22];

function createTree(x, z) {
  const THREE = window.THREE;
  const tree = new THREE.Group();

  // Trunk
  const trunk = new THREE.Mesh(
    new THREE.BoxGeometry(6, 12, 6),
    new THREE.MeshLambertMaterial({ color: 0x5d4037 })
  );
  trunk.position.y = 6;
  tree.add(trunk);

  // Foliage
  const leaves = new THREE.Mesh(
    new THREE.BoxGeometry(16, 18, 16),
    new THREE.MeshLambertMaterial({ color: 0x2e7d32 })
  );
  leaves.position.y = 18;
  tree.add(leaves);

  tree.position.set(x, 0, z);
  return tree;
}

function spawnVehicle(lane, startX, scene, vehicles) {
  const THREE = window.THREE;
  const isTruck = Math.random() < 0.35;
  const vehicle = new THREE.Group();

  const width = isTruck ? 44 : 24;
  const height = isTruck ? 14 : 10;
  const depth = 14;

  const bodyMat = new THREE.MeshLambertMaterial({
    color: lane.vehicleColor || carColors[Math.floor(Math.random() * carColors.length)]
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bodyMat);
  body.position.y = height / 2;
  vehicle.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(14, height * 0.7, depth * 0.9),
    new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })
  );
  cabin.position.set(isTruck ? 10 : -2, height + 2, 0);
  vehicle.add(cabin);

  vehicle.position.set(startX, 0, lane.z);
  vehicle.userData = { lane, width, depth, type: 'vehicle' };
  scene.add(vehicle);
  vehicles.push(vehicle);
}

function spawnLog(lane, startX, scene, floaters) {
  const THREE = window.THREE;
  const isLong = Math.random() < 0.4;
  const width = isLong ? 60 : 40;
  const depth = 12;

  const log = new THREE.Mesh(
    new THREE.BoxGeometry(width, 4, depth),
    new THREE.MeshLambertMaterial({ color: 0x795548 })
  );
  log.position.set(startX, 1, lane.z);
  log.userData = { lane, width, depth, type: 'log', speed: lane.speed };
  scene.add(log);
  floaters.push(log);
}

function spawnLilyPad(x, z, scene, floaters) {
  const THREE = window.THREE;
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(8, 8, 2, 8),
    new THREE.MeshLambertMaterial({ color: 0x43a047 })
  );
  pad.position.set(x, 0.5, z);
  pad.userData = { width: 16, depth: 16, type: 'lily', speed: 0 };
  scene.add(pad);
  floaters.push(pad);
}

export function createLane(index, stepSize, scene, vehicles, floaters, obstacles) {
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
  if (type === 'road') groundColor = 0x3e444c;
  if (type === 'water') groundColor = 0x29b6f6;

  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(1000, 4, stepSize),
    new THREE.MeshLambertMaterial({ color: groundColor })
  );
  ground.position.set(0, type === 'water' ? -3 : -2, z);
  scene.add(ground);

  if (type === 'road') {
    laneData.speed = (Math.random() * 1.1 + 0.8) * (Math.random() < 0.5 ? 1 : -1);
    laneData.vehicleColor = carColors[Math.floor(Math.random() * carColors.length)];
    spawnVehicle(laneData, -150, scene, vehicles);
    spawnVehicle(laneData, 150, scene, vehicles);
  } else if (type === 'water') {
    laneData.speed = (Math.random() * 0.9 + 0.6) * (Math.random() < 0.5 ? 1 : -1);
    if (Math.random() < 0.3) {
      // Lily pad lane (stationary platforms)
      for (let x = -100; x <= 100; x += 40) {
        if (Math.random() < 0.7) spawnLilyPad(x, z, scene, floaters);
      }
    } else {
      // Flowing log lane
      spawnLog(laneData, -160, scene, floaters);
      spawn
