// Препятствия и семена. Они появляются вдали и «едут» навстречу герою вместе с дорогой.
// Правило: в одном ряду всегда остаётся хотя бы одна свободная дорожка.
import * as THREE from 'three';
import { LANES, SPAWN_Z, REMOVE_Z, ROW_GAP, HIT_DX } from './config.js';

const lambert = (c, extra = {}) => new THREE.MeshLambertMaterial({ color: c, flatShading: true, ...extra });
const box = new THREE.BoxGeometry(1, 1, 1);
const seedGeo = new THREE.SphereGeometry(0.28, 8, 6);

const M = {
  red: lambert(0xe0574f), white: lambert(0xf7f3e8), wood: lambert(0x9a6a40),
  rim: lambert(0x8a6a45), hole: lambert(0x2a2118),
  seed: lambert(0xf2b632, { emissive: 0x6b4a00 }),
};

function part(mat, sx, sy, sz, x, y, z) {
  const m = new THREE.Mesh(box, mat);
  m.scale.set(sx, sy, sz); m.position.set(x, y, z);
  return m;
}

function makeFence() {            // дорожное ограждение
  const g = new THREE.Group();
  g.add(part(M.wood, 0.15, 0.9, 0.15, -0.7, 0.45, 0));
  g.add(part(M.wood, 0.15, 0.9, 0.15, 0.7, 0.45, 0));
  g.add(part(M.red, 1.7, 0.3, 0.2, 0, 0.78, 0));
  g.add(part(M.white, 1.7, 0.3, 0.2, 0, 0.42, 0));
  return g;
}
function makeHole() {             // дыра в дороге
  const g = new THREE.Group();
  g.add(part(M.rim, 1.95, 0.05, 2.75, 0, 0.03, 0));
  g.add(part(M.hole, 1.6, 0.05, 2.4, 0, 0.06, 0));
  return g;
}
function makeSeed() {             // семя
  const m = new THREE.Mesh(seedGeo, M.seed);
  m.scale.set(0.75, 1.1, 0.75);
  return m;
}

// half — «половина глубины»: насколько близко по z к герою предмет считается задетым
const TYPES = {
  fence: { make: makeFence, half: 0.35 },
  hole:  { make: makeHole,  half: 0.9 },
  seed:  { make: makeSeed,  half: 0.6 },
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function createTrack(scene) {
  const root = new THREE.Group();
  scene.add(root);
  const pool = { fence: [], hole: [], seed: [] };
  let items = [];
  let travel = 0, time = 0, lastFree = null;

  function add(type, lane, z) {
    const mesh = pool[type].pop() || TYPES[type].make();
    mesh.visible = true;
    mesh.position.set(LANES[lane], type === 'seed' ? 0.7 : 0, z);
    root.add(mesh);
    items.push({ type, mesh, lane, x: LANES[lane], z, done: false });
  }
  function release(it) {
    root.remove(it.mesh);
    pool[it.type].push(it.mesh);
  }
  function seedLine(lane, z, count) {
    for (let i = 0; i < count; i++) add('seed', lane, z - i * 1.6);
  }

  function spawnRow(z, safeOnly) {
    if (safeOnly || Math.random() < 0.45) {       // ряд только с семенами
      seedLine(pick([0, 1, 2]), z, 6);
      lastFree = null;
      return;
    }
    const blocks = Math.random() < 0.3 ? 2 : 1;
    let free;
    if (blocks === 2) {
      // Свободная дорожка должна быть недалеко от прошлой свободной, чтобы успеть перебежать
      const ok = [0, 1, 2].filter((f) => !lastFree || lastFree.every((p) => Math.abs(f - p) <= 1));
      free = [pick(ok)];
    } else {
      const blocked = pick([0, 1, 2]);
      free = [0, 1, 2].filter((l) => l !== blocked);
    }
    for (const lane of [0, 1, 2]) {
      if (!free.includes(lane)) add(pick(['fence', 'hole']), lane, z);
    }
    if (Math.random() < 0.6) seedLine(pick(free), z, 4);
    lastFree = free;
  }

  function clear() {
    items.forEach(release);
    items = [];
  }

  return {
    reset() {
      clear();
      travel = 0; lastFree = null;
      spawnRow(-35, true);   // первый ряд безопасный: только семена
    },
    clear,
    // cb.onSeed() — семя собрано; cb.onHit(type) — задели ограждение или упали в дыру
    update(dt, speed, heroX, cb) {
      time += dt;
      const move = speed * dt;
      travel += move;
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.z += move;
        it.mesh.position.z = it.z;
        if (it.type === 'seed') {
          it.mesh.position.y = 0.7 + Math.sin(time * 4 + it.z) * 0.08;
          it.mesh.rotation.y = time * 3;
        }
        if (!it.done && Math.abs(it.z) < TYPES[it.type].half && Math.abs(it.x - heroX) < HIT_DX) {
          it.done = true;
          if (it.type === 'seed') cb.onSeed(); else cb.onHit(it.type);
        }
        if (it.z > REMOVE_Z || (it.type === 'seed' && it.done)) {
          release(it);
          items.splice(i, 1);
        }
      }
      while (travel >= ROW_GAP) {
        spawnRow(SPAWN_Z + (travel - ROW_GAP), false);
        travel -= ROW_GAP;
      }
    },
  };
}
