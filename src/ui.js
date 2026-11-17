// Помощник для экранов: создаёт слой на странице, который можно показать или спрятать.
export function makeScreenRoot(html, extraClass = '') {
  const root = document.createElement('div');
  root.className = 'screen ' + extraClass;
  root.innerHTML = html;
  root.style.display = 'none';
  document.getElementById('ui').appendChild(root);
  return {
    root,
    show() { root.style.display = 'flex'; },
    hide() { root.style.display = 'none'; },
    $: (sel) => root.querySelector(sel),
  };
}
