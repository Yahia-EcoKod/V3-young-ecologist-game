// Камера. У неё два режима: «меню» (герой крупно спереди) и «игра» (вид сзади сверху).
import * as THREE from 'three';

let mode = 'menu';

export function setCameraMode(camera, newMode) {
  mode = newMode;
  applyCamera(camera);
}

export function applyCamera(camera) {
  camera.near = 0.1; camera.far = 120;
  if (mode === 'menu') {
    camera.fov = 40;
    camera.position.set(0, 1.5, 5.4);
    camera.lookAt(0, 0.6, 0);
  } else {
    camera.fov = 70;
    // Расстояние почти одинаковое на всех экранах, чтобы скорость выглядела одинаково
    const tanHalfH = Math.tan(THREE.MathUtils.degToRad(35)) * camera.aspect;
    const dist = THREE.MathUtils.clamp(3.4 / tanHalfH, 10, 11);
    camera.position.set(0, 2.6 + dist * 0.35, dist);
    camera.lookAt(0, 1.0, -6);
  }
  camera.updateProjectionMatrix();
}
