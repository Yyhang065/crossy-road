/* global THREE */
import { createCar } from './vehicles.js';

export function createLane(index, stepSize, scene, vehicles) {
  const z = -index * stepSize;
  const type = index <= 2 ? 'grass' : (Math.random() < 0.65 ? 'road' : 'grass');

  const groundGeo = new THREE.BoxGeometry(1000, 4, stepSize);
  const groundMat = new THREE.MeshLambertMaterial({
    color: type === 'grass' ? 0x76c043 : 0x3e444c
  });

  const laneMesh = new THREE.Mesh(groundGeo, groundMat);
  laneMesh.position.set(0, -2, z);
  scene.add(laneMesh);

  const laneData = { index, z, type };

  if (type === 'road') {
    laneData.speed = (Math.random() * 1.2 + 0.8) * (Math.random() < 0.5 ? 1 : -1);
    const car = createCar(laneData, (Math.random() - 0.5) * 300);
    scene.add(car);
    vehicles.push(car);
  }

  return laneData;
}
