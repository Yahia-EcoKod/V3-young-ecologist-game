// Сцена для меню: зелёная полянка с площадкой для героя и несколькими деревьями.
import * as THREE from 'three';

const lambert = (c) => new THREE.MeshLambertMaterial({ color: c, flatShading: true });

export function createMenuStage(scene) {
  const group = new THREE.Group();

  const ground = new THREE.Mesh(new THREE.BoxGeometry(80, 0.2, 80), lambert(0x7cc45a));
  ground.position.y = -0.14;
  group.add(ground);

  const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.2, 24), lambert(0xd9bd8a));
  platform.position.y = -0.1;
  group.add(platform);

  const trunkMat = lambert(0x7a5230);
  const crownMats = [lambert(0x3f9e4a), lambert(0x55b85a), lambert(0x2f8a52)];
  const spots = [[-4, -3, 1.2], [4.5, -4, 1.4], [-7, -8, 1.6], [7, -9, 1.5], [0, -12, 1.8], [-3, -16, 1.5], [3.5, -15, 1.3]];
  spots.forEach(([x, z, s], i) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * s, 0.3 * s, 1.4 * s, 6), trunkMat);
    trunk.position.set(x, 0.7 * s, z);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(1.3 * s, 3 * s, 6), crownMats[i % 3]);
    crown.position.set(x, 1.4 * s + 1.4 * s, z);
    group.add(trunk, crown);
  });

  group.visible = false;
  scene.add(group);
  return { show() { group.visible = true; }, hide() { group.visible = false; } };
}
