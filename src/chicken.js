/* global THREE */

export function createChicken() {
  const chicken = new THREE.Group();

  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const beakMat = new THREE.MeshLambertMaterial({ color: 0xff9900 });
  const combMat = new THREE.MeshLambertMaterial({ color: 0xee2222 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(12, 14, 12), bodyMat);
  body.position.y = 8;
  chicken.add(body);

  // Comb
  const comb = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 8), combMat);
  comb.position.set(0, 16, 0);
  chicken.add(comb);

  // Beak
  const beak = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 4), beakMat);
  beak.position.set(0, 8, -7);
  chicken.add(beak);

  // Eyes
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 1), eyeMat);
  eyeL.position.set(4, 10, -6.2);
  const eyeR = eyeL.clone();
  eyeR.position.x = -4;

  chicken.add(eyeL);
  chicken.add(eyeR);

  chicken.position.set(0, 0, 0);
  return chicken;
}
