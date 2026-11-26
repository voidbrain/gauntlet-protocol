// Draws the committed pass and fail fixture images for the image-generation-v1 grader (F-021-T04):
//   node test/fixtures/image-generation-v1/draw.mjs
// Every image is drawn by this code from flat shapes and a 5x7 block font: no generated image is committed (the Qwen
// Research License allows evaluation only). Each pack case gets a pass image a correct judge accepts and a fail image
// that passes the structural checks but answers at least one checklist question the other way; blank.png is uniform and
// fails structurally. The images are written next to this file under images/.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateSync } from 'node:zlib';

const here = join(dirname(fileURLToPath(import.meta.url)), 'images');

function canvas(width, height, colour) {
  const px = new Uint8Array(width * height * 3);
  for (let i = 0; i < width * height; i++) px.set(colour, i * 3);
  return { width, height, px };
}
const put = (c, x, y, colour) => {
  if (x >= 0 && y >= 0 && x < c.width && y < c.height) c.px.set(colour, (y * c.width + x) * 3);
};
function rect(c, x0, y0, x1, y1, colour) {
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) put(c, x, y, colour);
}
function circle(c, cx, cy, r, colour) {
  for (let y = cy - r; y <= cy + r; y++)
    for (let x = cx - r; x <= cx + r; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) put(c, x, y, colour);
}
// Even-odd fill of a polygon, sampled at pixel centres.
function polygon(c, points, colour) {
  const xs = points.map((p) => p[0]),
    ys = points.map((p) => p[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++)
    for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [xi, yi] = points[i],
          [xj, yj] = points[j];
        if (yi > y + 0.5 !== yj > y + 0.5 && x + 0.5 < ((xj - xi) * (y + 0.5 - yi)) / (yj - yi) + xi) inside = !inside;
      }
      if (inside) put(c, x, y, colour);
    }
}
const glyphs = {
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
};
function text(c, word, cx, cy, scale, colour) {
  const width = word.length * 6 * scale - scale;
  let x = Math.round(cx - width / 2);
  const y = Math.round(cy - (7 * scale) / 2);
  for (const letter of word) {
    glyphs[letter].forEach((row, r) =>
      [...row].forEach((bit, k) => {
        if (bit === '1') rect(c, x + k * scale, y + r * scale, x + (k + 1) * scale, y + (r + 1) * scale, colour);
      }),
    );
    x += 6 * scale;
  }
}
// An isometric cube with a lit top and two shaded sides; `top` is its upper vertex.
function cube(c, [tx, ty], s, [light, mid, dark]) {
  const dx = Math.round(0.866 * s),
    dy = Math.round(s / 2);
  polygon(
    c,
    [
      [tx, ty],
      [tx + dx, ty + dy],
      [tx, ty + 2 * dy],
      [tx - dx, ty + dy],
    ],
    light,
  );
  polygon(
    c,
    [
      [tx - dx, ty + dy],
      [tx, ty + 2 * dy],
      [tx, ty + 2 * dy + s],
      [tx - dx, ty + dy + s],
    ],
    mid,
  );
  polygon(
    c,
    [
      [tx, ty + 2 * dy],
      [tx + dx, ty + dy],
      [tx + dx, ty + dy + s],
      [tx, ty + 2 * dy + s],
    ],
    dark,
  );
}
function ball(c, cx, cy, r) {
  circle(c, cx, cy, r, [235, 200, 30]);
  circle(c, cx - Math.round(r / 3), cy - Math.round(r / 3), Math.round(r / 4), [250, 235, 140]);
}

function encode({ width, height, px }) {
  const chunk = (type, data) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 2, 0, 0, 0], 8);
  const raw = Buffer.alloc(height * (width * 3 + 1));
  for (let y = 0; y < height; y++) raw.set(px.subarray(y * width * 3, (y + 1) * width * 3), y * (width * 3 + 1) + 1);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const red = [
  [230, 60, 60],
  [190, 30, 30],
  [140, 20, 20],
];
const white = [255, 255, 255],
  black = [0, 0, 0];
function tableScene() {
  const c = canvas(512, 512, [215, 215, 215]);
  rect(c, 0, 330, 512, 512, [248, 248, 248]);
  return c;
}
function sign(word) {
  const c = canvas(512, 512, [150, 150, 150]);
  rect(c, 88, 168, 424, 344, [40, 40, 40]);
  rect(c, 96, 176, 416, 336, white);
  text(c, word, 256, 256, 10, black);
  return c;
}
function board(cell) {
  const c = canvas(512, 512, white);
  for (let y = 0; y < 512; y++)
    for (let x = 0; x < 512; x++) if (cell(Math.floor(x / 64), Math.floor(y / 64))) put(c, x, y, black);
  return c;
}
function triangleAndSquare(triangleOnTop) {
  const c = canvas(512, 512, white);
  const [t, s] = triangleOnTop ? [60, 276] : [286, 60];
  polygon(
    c,
    [
      [256, t],
      [166, t + 170],
      [346, t + 170],
    ],
    [40, 170, 60],
  );
  rect(c, 181, s, 331, s + 170, [220, 40, 40]);
  return c;
}
const scenes = {
  'red-cube-regression.pass': () => {
    const c = tableScene();
    cube(c, [256, 170], 120, red);
    return c;
  },
  'red-cube-regression.fail': () => {
    const c = tableScene();
    cube(c, [150, 200], 100, red);
    cube(c, [362, 200], 100, red);
    return c;
  },
  'open-sign-regression.pass': () => sign('OPEN'),
  'open-sign-regression.fail': () => sign('SHUT'),
  'checkerboard-regression.pass': () => board((x, y) => (x + y) % 2 === 1),
  'checkerboard-regression.fail': () => board((x) => x % 2 === 1),
  'yellow-balls-holdout.pass': () => {
    const c = canvas(768, 512, [20, 30, 100]);
    for (const x of [192, 384, 576]) ball(c, x, 256, 80);
    return c;
  },
  'yellow-balls-holdout.fail': () => {
    const c = canvas(768, 512, [20, 30, 100]);
    for (const x of [256, 512]) ball(c, x, 256, 80);
    return c;
  },
  'triangle-above-square-holdout.pass': () => triangleAndSquare(true),
  'triangle-above-square-holdout.fail': () => triangleAndSquare(false),
  'blue-circles-holdout.pass': () => {
    const c = canvas(512, 512, white);
    for (const x of [150, 362]) circle(c, x, 256, 80, [40, 80, 220]);
    return c;
  },
  'blue-circles-holdout.fail': () => {
    const c = canvas(512, 512, white);
    for (const x of [96, 256, 416]) circle(c, x, 256, 64, [40, 80, 220]);
    return c;
  },
  blank: () => canvas(512, 512, white),
};

mkdirSync(here, { recursive: true });
for (const [name, draw] of Object.entries(scenes)) writeFileSync(join(here, name + '.png'), encode(draw()));
process.stdout.write(Object.keys(scenes).length + ' images in ' + here + '\n');
