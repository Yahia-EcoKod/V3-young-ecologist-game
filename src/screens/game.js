// Экран 5. Игра: бег по дороге, семена, ограждения, дыры, сердца и очки.
// Вопросы (ворота) появятся на этапе 4, лес и настоящий конец игры — на этапе 5.
import * as THREE from 'three';
import { makeScreenRoot } from '../ui.js';
import { setCameraMode } from '../cameraRig.js';
import { state } from '../state.js';
import { LANES, SPEED_START, SPEED_MAX, SPEED_GROWTH, LIVES, INVULN_TIME, SEED_POINTS } from '../config.js';
import { createTrack } from '../obstacles.js';

const HEART_PATH = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';
const heart = `<svg class="heart" viewBox="0 0 24 24" style="width:clamp(30px,9vw,42px);height:auto;margin-left:4px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))"><path d="${HEART_PATH}" fill="#e53935"/></svg>`;

export function createGameScreen(ctx) {
  const s = makeScreenRoot(`
    <div style="position:absolute;top:max(12px,env(safe-area-inset-top));left:14px;right:14px;display:flex;justify-content:space-between;align-items:center;pointer-events:none;">
      <div id="score" style="font-size:clamp(24px,7vw,36px);font-weight:800;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,.5);">Очки: 0</div>
      <div id="hearts" style="display:flex;">${heart.repeat(LIVES)}</div>
    </div>
    <div class="spacer"></div>
    <p class="hint" id="hint">Свайп влево/вправо<br>или касание левой/правой половины</p>
    <div class="row"><button class="btn secondary small" id="home">Главная</button></div>
  `, 'overlay');

  // Временное окно конца игры. Настоящий экран конца игры будет на этапе 5.
  const over = makeScreenRoot(`
    <h2 class="title">Сердца закончились</h2>
    <h2 class="title" id="finalScore"></h2>
    <div class="spacer"></div>
    <div class="row">
      <button class="btn" id="again">Ещё раз</button>
      <button class="btn secondary" id="home2">Главная</button>
    </div>
  `, 'overlay');

  const track = createTrack(ctx.scene);
  let hero = null;
  let laneIndex = 1, heroX = 0, speed = SPEED_START, hintTimer = 0;
  let lives = LIVES, score = 0, invuln = 0, finished = false;

  function renderHud() {
    s.$('#score').textContent = 'Очки: ' + score;
    s.root.querySelectorAll('.heart path').forEach((p, i) => {
      p.setAttribute('fill', i < lives ? '#e53935' : '#9e9e9e');   // потерянное сердце серое
    });
  }

  function endRun() {
    finished = true;
    hero.root.visible = true;
    hero.mixer.timeScale = 1;
    hero.setPose('idle');
    over.$('#finalScore').textContent = 'Очки: ' + score;
    over.show();
  }

  function loseHeart() {
    if (finished || invuln > 0) return;   // во время мерцания сердце не теряется
    lives--;
    invuln = INVULN_TIME;
    renderHud();
    if (lives <= 0) endRun();
  }

  function startRun() {
    finished = false; lives = LIVES; score = 0; invuln = 0;
    laneIndex = 1; heroX = 0; speed = SPEED_START; hintTimer = 0;
    hero.root.visible = true;
    hero.root.position.set(0, 0, 0);
    hero.root.scale.setScalar(1);
    hero.root.rotation.set(0, Math.PI, 0);   // спиной к камере
    hero.setPose('run');
    ctx.world.show();
    track.reset();
    over.hide();
    s.$('#hint').style.opacity = '1';
    renderHud();
  }

  function moveLane(dir) {
    if (finished) return;
    laneIndex = THREE.MathUtils.clamp(laneIndex + dir, 0, 2);
    s.$('#hint').style.opacity = '0';
  }

  s.$('#home').addEventListener('click', () => ctx.goTo('hero'));
  over.$('#home2').addEventListener('click', () => ctx.goTo('hero'));
  over.$('#again').addEventListener('click', () => startRun());

  const events = {
    onSeed() { score += SEED_POINTS; renderHud(); },
    onHit() { loseHeart(); },
  };

  return {
    enter() {
      setCameraMode(ctx.camera, 'game');
      hero = ctx.heroes[state.heroIndex];
      ctx.scene.add(hero.root);
      startRun();
      s.show();
      ctx.input.setHandlers({
        swipe: (dir) => moveLane(dir),
        tap: (side) => moveLane(side),
        key: (dir) => moveLane(dir),
      });
    },
    exit() {
      ctx.input.clear();
      track.clear();
      if (hero) { ctx.scene.remove(hero.root); hero.root.visible = true; hero.mixer.timeScale = 1; }
      ctx.world.hide();
      over.hide();
      s.hide();
    },
    update(dt) {
      if (finished) { hero.mixer.update(dt); return; }   // дорога стоит, герой в ожидании

      hintTimer += dt;
      if (hintTimer > 8) s.$('#hint').style.opacity = '0';

      speed = Math.min(SPEED_MAX, speed + SPEED_GROWTH * dt);
      ctx.world.update(dt, speed);

      // Плавный переход между дорожками
      const diff = LANES[laneIndex] - heroX;
      heroX += diff * Math.min(1, 12 * dt);
      hero.root.position.x = heroX;
      hero.root.rotation.y = Math.PI - diff * 0.25;
      hero.root.rotation.z = -diff * 0.06;

      track.update(dt, speed, heroX, events);

      // Мерцание после удара
      if (invuln > 0) {
        invuln -= dt;
        hero.root.visible = invuln <= 0 ? true : Math.floor(invuln / 0.08) % 2 === 0;
      }

      hero.mixer.timeScale = speed / 10;
      hero.mixer.update(dt);
    },
  };
}
