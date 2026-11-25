// Deterministic stand-in for `openscad -q -o - --export-format asciistl model.scad` used by fast unit tests.
// Generates a closed ASCII STL mesh whose bounding box and signed tetrahedral volume match the input OpenSCAD fixture.
import { readFileSync } from 'node:fs';

const file = process.argv.at(-1) ?? 'model.scad';
const src = readFileSync(file, 'utf8').trim();

// Emit an axis-aligned box [x0, x1] x [y0, y1] x [z0, z1] as 12 counter-clockwise STL triangles.
function boxFacets(x0, y0, z0, x1, y1, z1) {
  const v = [
    [x0, y0, z0],
    [x1, y0, z0],
    [x1, y1, z0],
    [x0, y1, z0],
    [x0, y0, z1],
    [x1, y0, z1],
    [x1, y1, z1],
    [x0, y1, z1],
  ];
  const tris = [
    [0, 2, 1],
    [0, 3, 2],
    [4, 5, 6],
    [4, 6, 7],
    [0, 1, 5],
    [0, 5, 4],
    [1, 2, 6],
    [1, 6, 5],
    [2, 3, 7],
    [2, 7, 6],
    [3, 0, 4],
    [3, 4, 7],
  ];
  return tris
    .map(
      ([a, b, c]) =>
        `  facet normal 0 0 0\n    outer loop\n      vertex ${v[a].join(' ')}\n      vertex ${v[b].join(' ')}\n      vertex ${v[c].join(' ')}\n    endloop\n  endfacet`,
    )
    .join('\n');
}

function emitBoxes(boxes) {
  process.stdout.write(
    `solid OpenSCAD_Model\n${boxes.map((b) => boxFacets(...b)).join('\n')}\nendsolid OpenSCAD_Model\n`,
  );
}

// Reject broken syntax fixtures.
if (
  src.includes('difference( {') ||
  src.includes('cube([40, 25, 5]\n}') ||
  src.includes('cube([50, 30, );') ||
  src.includes('union( {')
) {
  process.stderr.write('ERROR: Parser error in model.scad\n');
  process.exit(1);
}

// Known reference and wrong fixtures: emit disjoint boxes with exact target bounding box and volume.
if (src.includes('cylinder(h = 15, d = 12)') && src.includes('cylinder(h = 17, d = 6)')) {
  // spacer-cylinder-regression reference: 12 x 12 x 15 bounding box, volume ~ 1270.3125
  // Two bricks spanning [-6, 6] x [-6, 6] x [0, 15] with total volume 1270.3125:
  // Brick 1: [-6, 6] x [-6, -5] x [0, 15] -> 12 * 1 * 15 = 180
  // Brick 2: [-6, 6] x [-5, 6] x [0, 6.607954545] -> 12 * 11 * 6.607954545 = 872.25
  // Brick 3: [-6, -4.534959] x [-5, 6] x [6.607954545, 15] -> 1.465041 * 11 * 8.392045455 = 135.2425
  // Or even simpler: two non-overlapping boxes inside [0, 12] x [0, 12] x [0, 15]:
  // Box A: [0, 12] x [0, 5] x [0, 15] -> volume = 900, spans X=[0,12], Z=[0,15]
  // Box B: [0, 7.0534722] x [5, 12] x [0, 7.5] -> volume = 7.0534722 * 7 * 7.5 = 370.30729, spans Y=[5,12]
  emitBoxes([
    [0, 0, 0, 12, 5, 15],
    [0, 5, 0, 7.0534722, 12, 7.5],
  ]);
  process.exit(0);
}

if (src.includes('cylinder(h = 10, d = 12)')) {
  // spacer-cylinder-regression wrong: 12 x 12 x 10, volume ~ 1129
  emitBoxes([[0, 0, 0, 12, 12, 7.84]]);
  process.exit(0);
}

if (src.includes('cube([40, 25, 5]);') && src.includes('cube([5, 25, 30]);')) {
  // l-bracket-regression reference: 40x25x5 (5000) + 5x25x25 (3125) = 8125
  emitBoxes([
    [0, 0, 0, 40, 25, 5],
    [0, 0, 5, 5, 25, 30],
  ]);
  process.exit(0);
}

if (src.includes('cube([46, 26, 20]);')) {
  // open-tray-holdout reference: 50x30x20 outer minus 46x26x18 cavity = 30000 - 21528 = 8472
  emitBoxes([
    [0, 0, 0, 50, 30, 2],
    [0, 0, 2, 2, 30, 20],
    [48, 0, 2, 50, 30, 20],
    [2, 0, 2, 48, 2, 20],
    [2, 28, 2, 48, 30, 20],
  ]);
  process.exit(0);
}

if (src.includes('cube([40, 20, 12]);')) {
  // open-tray-holdout wrong: 50x30x12 minus 40x20x7 = 18000 - 5600 = 12400
  emitBoxes([
    [0, 0, 0, 50, 30, 5],
    [0, 0, 5, 5, 30, 12],
  ]);
  process.exit(0);
}

if (src.includes('cylinder(h = 4, d = 24)') && src.includes('cylinder(h = 16, d = 12)')) {
  // flanged-bushing-holdout reference: 24 x 24 x 16 bounding box, volume ~ 2710.04
  // Box A: [0, 24] x [0, 5] x [0, 16] -> 1920
  // Box B: [0, 10.61844] x [5, 24] x [0, 3.916] -> 790.04
  emitBoxes([
    [0, 0, 0, 24, 5, 16],
    [0, 5, 0, 10.61844, 24, 3.916],
  ]);
  process.exit(0);
}

if (src.includes('cylinder(h = 16, d = 12)')) {
  // flanged-bushing-holdout wrong: 12 x 12 x 16
  emitBoxes([[0, 0, 0, 12, 12, 12.5]]);
  process.exit(0);
}

// Generic single `cube([x, y, z]);` (including solid bounding-box anti-gaming attempts and l-bracket wrong).
const cubeMatch = /^cube\(\[\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\]\);$/m.exec(src);
if (cubeMatch) {
  emitBoxes([[0, 0, 0, Number(cubeMatch[1]), Number(cubeMatch[2]), Number(cubeMatch[3])]]);
  process.exit(0);
}

process.stderr.write('ERROR: Unrecognized OpenSCAD input in fake-openscad.mjs\n');
process.exit(1);
