// Загрузка 6 героев и их анимаций (ожидание и бег).
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HEROES, HERO_HEIGHT } from './config.js';

export async function loadHeroes(onProgress) {
  const loader = new GLTFLoader();
  const total = HEROES.length + 2;
  let done = 0;
  const load = (url) => new Promise((resolve, reject) => {
    loader.load(url, (g) => { done++; onProgress(done / total); resolve(g); }, undefined,
      () => reject(new Error('Не удалось загрузить ' + url)));
  });

  const [general, movement, ...gltfs] = await Promise.all([
    load('assets/models/anim/Rig_Medium_General.glb'),
    load('assets/models/anim/Rig_Medium_MovementBasic.glb'),
    ...HEROES.map((h) => load(`assets/models/heroes/${h.file}.glb`)),
  ]);

  const clips = [...general.animations, ...movement.animations];
  const findClip = (name) => {
    const c = clips.find((x) => x.name === name);
    if (!c) throw new Error('Нет анимации ' + name);
    return c;
  };
  const idleClip = findClip('Idle_A');
  const runClip = findClip('Running_A');

  return gltfs.map((gltf, i) => {
    const model = gltf.scene;
    model.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });

    // Приводим героя к нужному росту и ставим ногами на землю
    const box = new THREE.Box3().setFromObject(model);
    const h = box.max.y - box.min.y;
    const k = h > 0.1 ? HERO_HEIGHT / h : 1;
    model.scale.setScalar(k);
    model.position.y = -box.min.y * k;

    const root = new THREE.Group(); // за этот «контейнер» двигаем и поворачиваем героя
    root.add(model);

    const mixer = new THREE.AnimationMixer(model);
    const actions = { idle: mixer.clipAction(idleClip), run: mixer.clipAction(runClip) };
    let current = null;

    return {
      name: HEROES[i].name,
      root,
      mixer,
      // Включить позу: 'idle' (ожидание) или 'run' (бег)
      setPose(pose) {
        const next = actions[pose];
        if (current === next) return;
        next.reset().fadeIn(0.2).play();
        if (current) current.fadeOut(0.2);
        current = next;
      },
    };
  });
}
