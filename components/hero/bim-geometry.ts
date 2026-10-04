import type { Part, Vector, ChangeKind } from "../models/model-types";
export type { Part, Vector } from "../models/model-types";
export type ArchitecturalChange = { name: string; kind: ChangeKind; before: Part[]; after: Part[] };
const box = (position: Vector, size: Vector): Part => ({ position, size });
export const STOREYS = 5;
export const FLOOR_HEIGHT = 3.25;
const DRAWING_FLOOR_HEIGHT = FLOOR_HEIGHT / 2.5;
export const CHANGE = { wallDisplacement: 0.3 } as const;

/** A five-storey office with a three-storey connected wing. Dimensions are metres.
 * The wing is a deliberate fixed cutaway; no moving section planes or MEP networks.
 */
export function makeBuilding(mobile = false) {
  const slabs: Part[] = [], walls: Part[] = [], columns: Part[] = [], glass: Part[] = [], core: Part[] = [], details: Part[] = [];
  for (let level = 0; level <= STOREYS; level++) {
    slabs.push(box([-1, level * DRAWING_FLOOR_HEIGHT, 0], [4.8, 0.14, 3.6]));
    if (level <= 3) slabs.push(box([2.4, level * DRAWING_FLOOR_HEIGHT, -0.25], [2, 0.14, 3.1]));
  }
  for (let level = 0; level < STOREYS; level++) {
    const y = level * DRAWING_FLOOR_HEIGHT + 0.66;
    walls.push(box([-1, y, -1.72], [4.8, 1.18, 0.12]), box([-3.32, y, 0], [0.12, 1.18, 3.4]));
    // Continuous front sill and lintel; glazing sits in real façade openings.
    walls.push(box(level === 0 ? [0.15, y - 0.47, 1.72] : [-1, y - 0.47, 1.72],
      [level === 0 ? 2.45 : 4.8, 0.23, 0.12]), box([-1, y + 0.5, 1.72], [4.8, 0.18, 0.12]));
    for (const x of [-3.28, -2.12, -0.95, 0.22, 1.28]) columns.push(box([x, y, 1.7], [0.1, 1.18, 0.14]));
    for (const x of [-2.7, -1.55, -0.4, 0.75]) {
      if ((level === 3 && x === -0.4) || (level === 0 && (x === -2.7 || x === -1.55))) continue;
      glass.push(box([x, y + 0.015, 1.72], [1.04, 0.86, 0.06]));
    }
    // Right façade remains solid enough to read as a building, not a wire skeleton.
    if (level >= 3) {
      walls.push(box([1.32, y - 0.47, 0], [0.12, 0.23, 3.4]), box([1.32, y + 0.5, 0], [0.12, 0.18, 3.4]));
      glass.push(box([1.32, y, -0.55], [0.06, 0.86, 2.05]));
      if (level !== 4) glass.push(box([1.32, y, 1.08], [0.06, 0.86, 0.8]));
    }
    core.push(box([-2.7, y, -0.9], [0.12, 1.18, 1.3]), box([-2.08, y, -1.5], [1.3, 1.18, 0.12]));
    if (!mobile) details.push(box([-1.55, y, -0.5], [0.08, 1.18, 2.3]));
  }
  for (let level = 0; level < 3; level++) {
    const y = level * DRAWING_FLOOR_HEIGHT + 0.66;
    walls.push(box([2.4, y, -1.72], [2, 1.18, 0.12]));
    columns.push(box([3.32, y, -1.65], [0.14, 1.18, 0.14]), box([3.32, y, 1.2], [0.14, 1.18, 0.14]));
    // Cutaway exposes just two rooms, including the moved and added partitions.
    if (level === 0) glass.push(box([3.32, y, -0.25], [0.06, 0.88, 2.6]));
  }
  walls.push(box([-1, 6.65, -1.72], [4.8, 0.25, 0.12]), box([-3.32, 6.65, 0], [0.12, 0.25, 3.4]));
  details.push(box([-2.2, 0.58, 1.73], [2.15, 1.0, 0.035])); // Glazed entrance surround.
  const changes: ArchitecturalChange[] = [
    { name: "wall", kind: "changed", before: [box([2.1, 1.96, -0.25], [0.1, 1.18, 2.8])], after: [box([2.4, 1.96, -0.25], [0.1, 1.18, 2.8])] },
    { name: "window", kind: "changed", before: [box([-0.4, 4.56, 1.74], [0.74, 0.72, 0.07])], after: [box([-0.4, 4.56, 1.74], [1.04, 0.86, 0.07])] },
    { name: "door", kind: "changed", before: [box([-2.65, 0.58, 1.78], [0.7, 1.02, 0.07])], after: [box([-1.65, 0.58, 1.78], [0.7, 1.02, 0.07])] },
    { name: "partition", kind: "added", before: [], after: [box([2.4, 3.26, 0.1], [1.8, 1.18, 0.1])] },
    { name: "facade", kind: "added", before: [], after: [box([1.34, 5.86, 1.08], [0.12, 0.92, 0.8])] },
    { name: "canopy", kind: "removed", before: [box([-2.2, 1.22, 2.0], [2.2, 0.09, 0.6])], after: [] }
  ];
  // Work in compact drawing coordinates above, export actual metre dimensions.
  const metres = (p: Part): Part => ({ ...p,
    position: p.position.map(value => value * 2.5) as Vector,
    size: p.size.map(value => value * 2.5) as Vector
  });
  const physicalChanges = changes.map(change => ({ ...change,
    before: change.before.map(metres), after: change.after.map(metres)
  }));
  // A real 300 mm partition relocation, independent of the presentation scale.
  physicalChanges[0].after[0].position[0] = physicalChanges[0].before[0].position[0] + CHANGE.wallDisplacement;
  return {
    slabs: slabs.map(metres), walls: walls.map(metres), columns: columns.map(metres),
    glass: glass.map(metres), core: core.map(metres), details: details.map(metres), changes: physicalChanges
  };
}
