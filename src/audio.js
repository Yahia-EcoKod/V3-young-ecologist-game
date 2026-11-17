// Звук. Телефоны разрешают звук только после касания, поэтому "разбудить" его нужно по нажатию.
// Музыки и звуков пока нет — они появятся на этапе 7. Сейчас здесь только «разблокировка».
let ctx = null;

export function unlockAudio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
  } catch (e) { /* без звука тоже можно играть */ }
}
