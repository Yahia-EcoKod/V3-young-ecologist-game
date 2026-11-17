// Дорога из простых фигур: кусок дороги, разметка, заборы, деревья по бокам.
// Дорога «едет» навстречу герою — на самом деле двигается сама дорога, а не герой.
import * as THREE from 'three';
import { TILE_LEN, TILE_COUNT, ROAD_HALF, FENCE_X } from './config.js';

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 6);
const coneGeo = new THREE.ConeGeometry(1, 1, 6);
const lambert = (c) => new THREE.MeshLambertMaterial({ color: c, flatShading: true });

const matRoad = lambert(0xd9bd8a);
const matGrass = lambert(0x7cc45a);
const matDash = lambert(0xfff4d6);
const matWood = lambert(0x9a6a40);
const matTrunk = lambert(0x7a5230);
const matCrown = lambert(0xffffff); // цвет задаётся для каждого дерева отдельно

// Много одинаковых предметов рисуются «одним махом» — так телефону легче
function instanced(geometry, material, items) {
  const mesh = new THREE.InstancedMesh(geometry, material, items.length);
  const d = new THREE.Object3D();
  items.forEach((it, i) => {
    d.position.set(it.x, it.y, it.z);
    d.scale.set(it.sx, it.sy, it.sz);
    d.updateMatrix();
    mesh.setMatrixAt(i, d.matrix);
    if (it.color) mesh.setColorAt(i, new THREE.Color(it.color));
  });
  mesh.frustumCulled = false;
  return mesh;
}

function buildTile() {
  const g = new THREE.Group(); // кусок занимает z от -TILE_LEN до 0
  const road = new THREE.Mesh(boxGeo, matRoad);
  road.scale.set(ROAD_HALF * 2, 0.2, TILE_LEN);
  road.position.set(0, -0.1, -TILE_LEN / 2);
  g.add(road);

  const grass = new THREE.Mesh(boxGeo, matGrass);
  grass.scale.set(70, 0.2, TILE_LEN);
  grass.position.set(0, -0.14, -TILE_LEN / 2);
  g.add(grass);

  const dashes = [], posts = [], rails = [], trunks = [], crowns = [];
  for (let k = 0; k < 6; k++) {
    const z = -2 - 4 * k;
    for (const x of [-0.85, 0.85]) dashes.push({ x, y: 0.01, z, sx: 0.12, sy: 0.02, sz: 2 });
    for (const x of [-FENCE_X, FENCE_X]) posts.push({ x, y: 0.45, z, sx: 0.25, sy: 0.9, sz: 0.25 });
  }
  for (const x of [-FENCE_X, FENCE_X]) {
    for (const y of [0.65, 0.3]) rails.push({ x, y, z: -TILE_LEN / 2, sx: 0.1, sy: 0.12, sz: TILE_LEN });
  }
  const crownColors = [0x3f9e4a, 0x55b85a, 0x2f8a52];
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const x = side * (5 + Math.random() * 5);
      const z = -2 - Math.random() * (TILE_LEN - 4);
      const s = 0.8 + Math.random() * 0.8;
      const h = 1.2 * s;
      trunks.push({ x, y: h / 2, z, sx: 0.25 * s, sy: h, sz: 0.25 * s });
      crowns.push({ x, y: h + 1.2 * s, z, sx: 1.2 * s, sy: 2.6 * s, sz: 1.2 * s,
                    color: crownColors[Math.floor(Math.random() * crownColors.length)] });
    }
  }
  g.add(instanced(boxGeo, matDash, dashes));
  g.add(instanced(boxGeo, matWood, posts));
  g.add(instanced(boxGeo, matWood, rails));
  g.add(instanced(cylGeo, matTrunk, trunks));
  g.add(instanced(coneGeo, matCrown, crowns));
  return g;
}

export function createWorld(scene) {
  const group = new THREE.Group();
  const tiles = [];
  for (let i = 0; i < TILE_COUNT; i++) {
    const t = buildTile();
    group.add(t);
    tiles.push(t);
  }
  group.visible = false;
  scene.add(group);

  function reset() {
    tiles.forEach((t, i) => { t.position.z = -i * TILE_LEN + TILE_LEN; });
  }
  reset();

  return {
    show() { reset(); group.visible = true; },
    hide() { group.visible = false; },
    update(dt, speed) {
      const wrap = TILE_COUNT * TILE_LEN;
      for (const t of tiles) {
        t.position.z += speed * dt;
        if (t.position.z - TILE_LEN > 14) t.position.z -= wrap;
      }
    },
  };
}
