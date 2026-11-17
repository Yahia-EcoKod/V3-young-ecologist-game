// Юный Эколог — точка входа. Здесь собирается сцена и переключаются экраны.
// Каждый экран лежит в своём файле в папке screens.
import * as THREE from 'three';
import { SKY, MAX_FRAME_ASPECT } from './config.js';
import { applyCamera } from './cameraRig.js';
import { createInput } from './input.js';
import { createWorld } from './world.js';
import { createMenuStage } from './menuStage.js';
import { loadHeroes } from './heroes.js';
import { createLoadingScreen } from './screens/loading.js';
import { createTapScreen } from './screens/tap.js';
import { createHeroSelectScreen } from './screens/heroSelect.js';
import { createSectionSelectScreen } from './screens/sectionSelect.js';
import { createGameScreen } from './screens/game.js';

const params = new URLSearchParams(location.search);
const SHOW_DEBUG = params.get('debug') !== '0'; // ?debug=0 скрывает счётчик FPS

const frame = document.getElementById('frame');
const canvas = document.getElementById('game');
const debugEl = document.getElementById('debug');
if (!SHOW_DEBUG) debugEl.style.display = 'none';

// ---------- Сцена ----------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75)); // ограничение разрешения
renderer.shadowMap.enabled = false;                                    // настоящих теней нет

const scene = new THREE.Scene();
scene.background = new THREE.Color(SKY);
scene.fog = new THREE.Fog(SKY, 35, 95);
scene.add(new THREE.HemisphereLight(0xffffff, 0x8fbf7a, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 1.4);
sun.position.set(-4, 10, 6);
scene.add(sun);

const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 120);

// Игровое окно: на телефоне занимает весь экран, на широком экране — узкая колонка по центру
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  const fw = Math.min(w, Math.round(h * MAX_FRAME_ASPECT));
  frame.style.width = fw + 'px';
  frame.style.height = h + 'px';
  renderer.setSize(fw, h, false);
  camera.aspect = fw / h;
  applyCamera(camera);
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 200));
resize();

// ---------- Общие части для экранов ----------
const ctx = {
  scene, camera,
  world: createWorld(scene),
  menuStage: createMenuStage(scene),
  input: createInput(canvas),
  heroes: [],
  goTo: (name) => goTo(name),
};

const loading = createLoadingScreen();
const screens = {};
let active = null;

function goTo(name) {
  if (active) active.exit();
  active = screens[name];
  active.enter();
}

// ---------- Главный цикл ----------
const clock = new THREE.Clock();
let fpsTime = 0, fpsFrames = 0;

function frameLoop() {
  requestAnimationFrame(frameLoop);
  const dt = Math.min(clock.getDelta(), 0.1); // защита от «скачка» после паузы
  if (active && active.update) active.update(dt);
  renderer.render(scene, camera);

  if (SHOW_DEBUG) {
    fpsTime += dt; fpsFrames++;
    if (fpsTime >= 0.5) {
      debugEl.textContent = `FPS ${Math.round(fpsFrames / fpsTime)}`;
      fpsTime = 0; fpsFrames = 0;
    }
  }
}

// ---------- Запуск ----------
async function start() {
  if (location.protocol === 'file:') {
    loading.showError('Откройте игру по ссылке (из интернета), а не двойным щелчком по файлу.');
    return;
  }
  try {
    ctx.heroes = await loadHeroes((p) => loading.setProgress(p));
  } catch (err) {
    console.error(err);
    loading.showError('Проверьте интернет и обновите страницу.');
    return;
  }
  screens.tap = createTapScreen(ctx);
  screens.hero = createHeroSelectScreen(ctx);
  screens.section = createSectionSelectScreen(ctx);
  screens.game = createGameScreen(ctx);

  loading.hide();
  clock.getDelta();
  frameLoop();
  goTo('tap');
}
start();
