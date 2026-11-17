// Все настройки игры в одном месте. Числа можно менять.

export const LANES = [-1.7, 0, 1.7];   // положение трёх дорожек по ширине
export const TILE_LEN = 24;            // длина одного куска дороги
export const TILE_COUNT = 5;           // сколько кусков дороги одновременно
export const ROAD_HALF = 2.7;          // половина ширины дороги
export const FENCE_X = 2.95;           // где стоят заборы
export const HERO_HEIGHT = 1.7;        // рост героя в мире игры
export const SPEED_START = 9;          // стартовая скорость
export const SPEED_MAX = 16;           // максимальная скорость
export const SPEED_GROWTH = 0.12;      // на сколько растёт скорость за секунду
export const SKY = 0xbfe6f5;           // цвет неба

// Этап 3: препятствия, семена, сердца
export const LIVES = 3;                // сколько сердец у игрока
export const INVULN_TIME = 1.2;        // сколько секунд герой мерцает после удара (в это время сердце не теряется)
export const SEED_POINTS = 10;         // очков за одно семя
export const SPAWN_Z = -70;            // где вдалеке появляются предметы
export const REMOVE_Z = 9;             // где предметы исчезают (уже позади героя)
export const ROW_GAP = 15;             // расстояние между «рядами» предметов на дороге
export const HIT_DX = 0.8;             // насколько близко по ширине герой должен быть к предмету

// Ширина игрового окна не больше 62% его высоты (на ноутбуке игра идёт узкой колонкой по центру)
export const MAX_FRAME_ASPECT = 0.62;

// Герои: имя файла в assets/models/heroes и имя на экране (имена можно менять здесь)
export const HEROES = [
  { file: 'Ranger',       name: 'Яша' },
  { file: 'Knight',       name: 'Игорь' },
  { file: 'Mage',         name: 'Женя' },
  { file: 'Barbarian',    name: 'Давид' },
  { file: 'Rogue',        name: 'Катя' },
  { file: 'Rogue_Hooded', name: 'Даша' },
];

// Разделы по классам
export const SECTIONS = [
  { id: '1-4',  title: '1-4 классы' },
  { id: '5-8',  title: '5-8 классы' },
  { id: '9-11', title: '9-11 классы' },
];
