/* global THREE */

const carColors = [0xe74c3c, 0x3498db, 0xf1c40f, 0x9b59b6, 0x1abc9c];

export function createCar(lane, startX) {
  const car = new THREE.Group();

  const bodyMat = new THREE.MeshLambertMaterial({
    color: carColors[Math.floor(Math.random() * carColors.length)]
  });
  const cabinMat = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85
  });

  const carBody = new THREE.Mesh(new THREE.BoxGeometry(24, 10, 14), bodyMat);
  carBody.position.y = 6;
  car.add(carBody);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(14, 7, 12), cabinMat);
  cabin.position.set(-2, 13, 0);
  car.add(cabin);

  car.position.set(startX, 0, lane.z);
  car.userData = { lane };
  return car;
}
