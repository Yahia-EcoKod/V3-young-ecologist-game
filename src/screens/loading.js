// Экран 1. Заставка и загрузка: логотип и полоска «Загрузка…».
import { makeScreenRoot } from '../ui.js';

export function createLoadingScreen() {
  const s = makeScreenRoot(`
    <img src="assets/logo/logo-round.png" alt="Экотоп" style="width:min(50vw,230px);height:auto;border-radius:50%;margin-bottom:14px;">
    <h1 class="logo">Юный Эколог</h1>
    <p class="big" id="loadText">Загрузка…</p>
    <div class="bar"><div class="barFill" id="barFill"></div></div>
  `, 'solid green');
  s.show();

  return {
    setProgress(p) {
      s.$('#barFill').style.width = Math.round(p * 100) + '%';
    },
    showError(text) {
      s.root.classList.remove('green');
      s.root.classList.add('red');
      s.root.innerHTML = `<h1 class="logo">Ой, не загрузилось</h1><p class="big">${text}</p>`;
    },
    hide() { s.hide(); },
  };
}
