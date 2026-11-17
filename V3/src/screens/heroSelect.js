// Экран 3. Выбор героя: 3D-герой стоит в позе ожидания, свайп переключает героев (всего 6).
import { makeScreenRoot } from '../ui.js';
import { setCameraMode } from '../cameraRig.js';
import { state } from '../state.js';
import { HEROES } from '../config.js';

export function createHeroSelectScreen(ctx) {
  const dots = HEROES.map(() => '<span class="dot"></span>').join('');
  const s = makeScreenRoot(`
    <h2 class="title">Выбери героя</h2>
    <div class="spacer"></div>
    <div class="heroName" id="heroName"></div>
    <div class="dots">${dots}</div>
    <div class="row">
      <button class="arrow" id="prev" aria-label="Предыдущий герой">‹</button>
      <button class="btn" id="play">Играть</button>
      <button class="arrow" id="next" aria-label="Следующий герой">›</button>
    </div>
  `, 'overlay');

  let current = null;  // герой, который сейчас стоит на сцене
  let pop = 1;         // 0..1: маленькая анимация «появления» героя

  function show(index) {
    if (current) ctx.scene.remove(current.root);
    state.heroIndex = index;
    current = ctx.heroes[index];
    current.root.position.set(0, 0, 0);
    current.root.rotation.set(0, 0, 0);   // лицом к игроку
    current.setPose('idle');
    ctx.scene.add(current.root);
    pop = 0;
    s.$('#heroName').textContent = current.name;
    s.root.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('on', i === index));
  }
  function change(d) {
    const n = ctx.heroes.length;
    show((state.heroIndex + d + n) % n);
  }

  s.$('#prev').addEventListener('click', () => change(-1));
  s.$('#next').addEventListener('click', () => change(1));
  s.$('#play').addEventListener('click', () => ctx.goTo('section'));

  return {
    enter() {
      ctx.menuStage.show();
      setCameraMode(ctx.camera, 'menu');
      show(state.heroIndex);
      s.show();
      ctx.input.setHandlers({
        swipe: (dir) => change(-dir),  // палец влево — следующий герой
        key: (dir) => change(dir),
      });
    },
    exit() {
      ctx.input.clear();
      if (current) ctx.scene.remove(current.root);
      ctx.menuStage.hide();
      s.hide();
    },
    update(dt) {
      if (!current) return;
      current.mixer.update(dt);
      if (pop < 1) {
        pop = Math.min(1, pop + dt / 0.25);
        const k = 0.85 + 0.15 * (1 - Math.pow(1 - pop, 3));
        current.root.scale.setScalar(k);
      }
    },
  };
}
