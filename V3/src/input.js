// Управление: свайп, касание половины экрана, стрелки и A/D.
// Экран сам решает, что делать: ему достаточно передать функции в setHandlers().
//   swipe(dir)  — dir = -1 (влево) или 1 (вправо)
//   tap(side)   — side = -1 (левая половина) или 1 (правая)
//   key(dir)    — стрелки и A/D
const SWIPE_MIN = 24; // сколько пикселей пальцу пройти, чтобы это считалось свайпом

export function createInput(canvas) {
  let h = {};
  let startX = 0, startY = 0, swiped = false, down = false;

  canvas.addEventListener('pointerdown', (e) => {
    down = true; swiped = false; startX = e.clientX; startY = e.clientY;
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!down || swiped) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dx) > SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) {
      swiped = true;
      if (h.swipe) h.swipe(dx > 0 ? 1 : -1);
    }
  });
  const end = (e) => {
    if (!down) return;
    down = false;
    if (!swiped && e.type === 'pointerup') {
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) < SWIPE_MIN && Math.abs(dy) < SWIPE_MIN && h.tap) {
        const r = canvas.getBoundingClientRect();
        h.tap(e.clientX < r.left + r.width / 2 ? -1 : 1);
      }
    }
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  window.addEventListener('keydown', (e) => {
    let dir = 0;
    if (e.key === 'ArrowLeft' || e.code === 'KeyA') dir = -1;
    else if (e.key === 'ArrowRight' || e.code === 'KeyD') dir = 1;
    if (!dir) return;
    e.preventDefault();
    if (h.key) h.key(dir);
  });

  // Запрет прокрутки и увеличения во время игры (особенно для iPhone)
  const stop = (e) => e.preventDefault();
  document.addEventListener('touchmove', stop, { passive: false });
  document.addEventListener('gesturestart', stop);
  document.addEventListener('gesturechange', stop);
  document.addEventListener('dblclick', stop);
  document.addEventListener('contextmenu', stop);

  return {
    setHandlers(handlers) { h = handlers || {}; },
    clear() { h = {}; },
  };
}
