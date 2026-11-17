// Экран 4. Выбор раздела: три карточки по классам и кнопка «Главная».
import { makeScreenRoot } from '../ui.js';
import { setCameraMode } from '../cameraRig.js';
import { state } from '../state.js';
import { SECTIONS } from '../config.js';

export function createSectionSelectScreen(ctx) {
  const cards = SECTIONS.map((sec) =>
    `<button class="card" data-id="${sec.id}">${sec.title}</button>`).join('');
  const s = makeScreenRoot(`
    <h2 class="title">Выбери свой класс</h2>
    <div class="cards">${cards}</div>
    <div class="row"><button class="btn secondary" id="home">Главная</button></div>
  `, 'overlay');

  s.root.querySelectorAll('.card').forEach((el) => {
    el.addEventListener('click', () => {
      state.section = el.dataset.id;
      ctx.goTo('game');
    });
  });
  s.$('#home').addEventListener('click', () => ctx.goTo('hero'));

  return {
    enter() {
      ctx.menuStage.show();
      setCameraMode(ctx.camera, 'menu');
      s.show();
    },
    exit() { ctx.menuStage.hide(); s.hide(); },
    update() {},
  };
}
