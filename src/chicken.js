export function createChicken() {
  const THREE = window.THREE;
  const chicken = new THREE.Group();

  const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const beakMat = new THREE.MeshLambertMaterial({ color: 0xff7043 });
  const redMat = new THREE.MeshLambertMaterial({ color: 0xe91e63 });
  const eyeMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  const legMat = new THREE.MeshLambertMaterial({ color: 0xff8a65 });

  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(10, 11, 10), whiteMat);
  body.position.y = 8;
  chicken.add(body);

  // Comb on head
  const comb = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 5), redMat);
  comb.position.set(0, 15, -1);
  chicken.add(comb);

  // Beak
  const beak = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 4), beakMat);
  beak.position.set(0, 8.5, -6.5);
  chicken.add(beak);

  // Wattle (under beak)
  const wattle = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 2), redMat);
  wattle.position.set(0, 6, -5.5);
  chicken.add(wattle);

  // Eyes
  const leftEye = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 2), eyeMat);
  leftEye.position.set(-5.1, 9.5, -3);
  chicken.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 2), eyeMat);
  rightEye.position.set(5.1, 9.5, -3);
  chicken.add(rightEye);

  // Wings
  const leftWing = new THREE.Mesh(new THREE.BoxGeometry(1.5, 6, 7), whiteMat);
  leftWing.position.set(-5.8, 7.5, 0.5);
  chicken.add(leftWing);

  const rightWing = new THREE.Mesh(new THREE.BoxGeometry(1.5, 6, 7), whiteMat);
  rightWing.position.set(5.8, 7.5, 0.5);
  chicken.add(rightWing);

  // Tail
  const tail = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 2), whiteMat);
  tail.position.set(0, 8, 5.5);
  chicken.add(tail);

  // Legs & Feet
  const legGeom = new THREE.BoxGeometry(1.5, 4, 1.5);
  const footGeom = new THREE.BoxGeometry(3.5, 1, 4.5);

  const leftLeg = new THREE.Mesh(legGeom, legMat);
  leftLeg.position.set(-2.5, 2, 0);
  chicken.add(leftLeg);

  const leftFoot = new THREE.Mesh(footGeom, legMat);
  leftFoot.position.set(-2.5, 0.5, -1);
  chicken.add(leftFoot);

  const rightLeg = new THREE.Mesh(legGeom, legMat);
  rightLeg.position.set(2.5, 2, 0);
  chicken.add(rightLeg);

  const rightFoot = new THREE.Mesh(footGeom, legMat);
  rightFoot.position.set(2.5, 0.5, -1);
  chicken.add(rightFoot);

  return chicken;
}
