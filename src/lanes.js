const carColors = [0xe74c3c, 0x3498db, 0xf1c40f, 0x9b59b6, 0x1abc9c];

function spawnCar(lane, startX, scene, vehicles) {
  const THREE = window.THREE;
  const car = new THREE.Group();

  const carBody = new THREE.Mesh(
    new THREE.BoxGeometry(24, 10, 14),
    new THREE.MeshLambertMaterial({ color: lane.carColor })
  );
  carBody.position.y = 6;
  car.add(carBody);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(14, 7, 12),
    new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })
  );
  cabin.position.set(-2, 13, 0);
  car.add(cabin);

  car.position.set(startX, 0, lane.z);
  car.userData = { lane };
  scene.add(car);
  vehicles.push(car);
}

export function createLane(index, stepSize, scene, vehicles) {
  const THREE = window.THREE;
  const z = -index * stepSize;
  const type = index <= 2 ? 'grass' : (Math.random() < 0.65 ? 'road' : 'grass');

  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(1000, 4, stepSize),
    new THREE.MeshLambertMaterial({ color: type === 'grass' ? 0x76c043 : 0x3e444c })
  );
  ground.position.set(0, -2, z);
  scene.add(ground);

  const laneData = { index, z, type };
  if (type === 'road') {
    laneData.speed = (Math.random() * 1.2 + 0.8) * (Math.random() < 0.5 ? 1 : -1);
    laneData.carColor = carColors[Math.floor(Math.random() * carColors.length)];
    spawnCar(laneData, (Math.random() - 0.5) * 300, scene, vehicles);
  }
  return laneData;
}
