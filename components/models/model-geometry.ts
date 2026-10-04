import type { ChangeKind, Discipline, Part, Vector } from "./model-types";
export type ModelChange = { kind: ChangeKind; before: Part[]; after: Part[] };
export type DisciplineGeometry = {
  normal: Part[]; context: Part[]; revisedContext: Part[]; fixtures: Part[];
  changes: ModelChange[]; centerY: number; shape: "box" | "pipe";
};
const part = (position: Vector, size: Vector, rotation?: Vector): Part => ({ position, size, rotation });
const box = (x: number, y: number, z: number, w: number, h: number, d: number) => part([x, y, z], [w, h, d]);
/** Each segment terminates at the next elbow/tee centerline. Dimensions are metres. */
export function pipePath(points: Vector[], radius = 0.065): Part[] {
  return points.slice(1).map((end, i) => {
    const start = points[i];
    const dx = end[0] - start[0], dy = end[1] - start[1], dz = end[2] - start[2];
    const length = Math.hypot(dx, dy, dz);
    return part([(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2],
      [radius, length, radius], [Math.atan2(dz, dy), 0, Math.atan2(-dx, Math.hypot(dy, dz))]);
  });
}
/** Axis-aligned horizontal tray bed and continuous side rails, with fewer ties on phones. */
export function trayPath(points: Vector[], mobile: boolean): Part[] {
  const parts: Part[] = [];
  points.slice(1).forEach((end, i) => {
    const start = points[i], dx = end[0] - start[0], dz = end[2] - start[2];
    const length = Math.hypot(dx, dz), alongX = Math.abs(dx) > Math.abs(dz);
    const x = (start[0] + end[0]) / 2, y = start[1], z = (start[2] + end[2]) / 2;
    parts.push(box(x, y, z, alongX ? length : 0.3, 0.035, alongX ? 0.3 : length));
    for (const side of [-1, 1]) parts.push(box(x + (alongX ? 0 : side * 0.15), y + 0.05, z + (alongX ? side * 0.15 : 0),
      alongX ? length : 0.025, 0.09, alongX ? 0.025 : length));
    if (!mobile) for (let tie = 0; tie < Math.floor(length / 0.75); tie++) {
      const t = (tie + 0.5) / Math.floor(length / 0.75);
      parts.push(box(start[0] + dx * t, y + 0.025, start[2] + dz * t, alongX ? 0.025 : 0.3, 0.035, alongX ? 0.3 : 0.025));
    }
  });
  return parts;
}
function room(shape: DisciplineGeometry["shape"]): DisciplineGeometry {
  return { shape, centerY: 1.7, normal: [], fixtures: [], revisedContext: [], changes: [], context: [
    // Slab pieces leave an actual open shaft: x -3..-1.5, z -1.7..-0.4.
    box(0.75, -0.08, 0, 4.5, 0.16, 4), box(-2.25, -0.08, 0.8, 1.5, 0.16, 2.4), box(-2.25, -0.08, -1.85, 1.5, 0.16, 0.3),
    box(0, 1.6, -2.08, 6, 3.2, 0.16), box(-3.08, 1.6, 0, 0.16, 3.2, 4),
    // Shaft enclosure is deliberately open on the viewing side.
    box(-1.48, 0.7, -1.5, 0.12, 1.4, 1.0),
    box(2.8, 1.6, -1.8, 0.25, 3.2, 0.25), box(-2.85, 1.6, -1.82, 0.25, 3.2, 0.25),
    box(0, 3.25, -1.25, 6, 0.16, 0.22)
  ] };
}
export function plumbingGeometry(mobile: boolean): DisciplineGeometry {
  const model = room("pipe");
  // Drainage and domestic-water risers through the open service shaft.
  model.normal.push(...pipePath([[-2.65, -0.2, -0.6], [-2.65, 3.5, -0.6]], 0.105),
    ...pipePath([[-2.65, 0.45, -0.6], [-2.65, 0.45, 0.6], [0.8, 0.45, 0.6], [0.8, 0.45, 0.8]], 0.09),
    ...pipePath([[-2.6, -0.2, -1.4], [-2.6, 3.5, -1.4]], 0.045),
    ...pipePath([[-2.6, 1.2, -1.4], [0.8, 1.2, -1.4], [0.8, 1.2, 0.8], [0.8, 0.75, 0.8]], 0.045),
    ...pipePath([[0.8, 0.75, 0.8], [1.5, 0.75, 0.8]], 0.055));
  model.fixtures.push(box(1.15, 0.1, 0.8, 1.5, 0.2, 0.9), box(0.8, 0.6, 0.8, 0.3, 0.6, 0.28),
    box(1.5, 0.45, 0.8, 0.6, 0.55, 0.45), box(1.5, 0.65, 0.8, 0.16, 0.18, 0.16),
    box(0.2, 0.8, 0.2, 0.18, 0.2, 0.18)); // Pump/manifold and capped future branch valve.
  for (const x of [-0.2, 0.8]) model.fixtures.push(box(x, 2.83, -1.25, 0.035, 0.7, 0.035), box(x, 2.32, -1.25, 0.24, 0.04, 0.22));
  for (const y of [0.9, 2.0]) model.fixtures.push(box(-2.78, y, -0.6, 0.45, 0.045, 0.22));
  if (!mobile) for (const y of [0.6, 1.0]) model.fixtures.push(box(0.8, y, 0.8, 0.16, 0.09, 0.18), box(0.8, y, 0.96, 0.25, 0.04, 0.05));
  model.changes = [
    { kind: "changed", before: pipePath([[-2.15, -0.2, -1.25], [-2.15, 3.5, -1.25]], 0.075), after: pipePath([[-1.75, -0.2, -1.25], [-1.75, 3.5, -1.25]], 0.075) },
    { kind: "changed", before: pipePath([[-2.15, 2.4, -1.25], [1.5, 2.4, -1.25], [1.5, 2.4, 0.8], [1.5, 0.75, 0.8]]),
      after: pipePath([[-1.75, 2.4, -1.25], [1.08, 2.4, -1.25], [1.08, 2.4, 0.8], [1.5, 2.4, 0.8], [1.5, 0.75, 0.8]]) },
    { kind: "added", before: [], after: pipePath([[0.2, 2.4, -1.25], [0.2, 2.4, 0.2], [0.2, 0.9, 0.2]], 0.045) }
  ];
  return model;
}
export function electricalGeometry(mobile: boolean): DisciplineGeometry {
  const model = room("box");
  // Partial ceiling and beams explain mounting without hiding the tray comparison.
  model.context.push(box(0.75, 3.35, -1.8, 4.5, 0.12, 0.4),
    box(-0.8, 3.3, -0.85, 0.12, 0.12, 2.1), box(2.5, 3.3, -0.85, 0.12, 0.12, 2.1));
  // New partition obstructs the old route, but ends before the replacement centerline.
  model.revisedContext.push(box(0.4, 1.5, -1.2, 0.14, 3.0, 1.2));
  model.fixtures.push(box(-2.1, 1.1, -1.82, 1.4, 1.4, 0.3), box(-2.1, 1.1, -1.65, 1.25, 1.23, 0.04),
    box(-1.65, 1.1, -1.6, 0.04, 0.17, 0.04), box(2, 2.45, 1.5, 0.35, 0.3, 0.3));
  for (const x of [-0.8, 2.5]) for (const z of [-1.5, -0.3]) model.fixtures.push(box(x, 2.98, z, 0.025, 0.6, 0.025), box(x, 2.57, z, 0.44, 0.035, 0.05));
  model.normal.push(...trayPath([[2.5, 2.6, 1.3], [3.3, 2.6, 1.3]], mobile));
  // Wall aperture at the continuation to the adjacent office zone.
  model.context.push(box(3.08, 1.2, 1.3, 0.16, 2.4, 0.5), box(3.08, 3.02, 1.3, 0.16, 0.36, 0.5));
  const riser = (x: number): Part[] => [box(x, 2.65, -1.5, 0.3, 1.7, 0.04), box(x - 0.15, 2.65, -1.46, 0.025, 1.7, 0.12), box(x + 0.15, 2.65, -1.46, 0.025, 1.7, 0.12)];
  model.changes = [
    { kind: "changed", before: trayPath([[-2.3, 2.6, -1.5], [2.5, 2.6, -1.5], [2.5, 2.6, 1.3]], mobile),
      after: trayPath([[-1.9, 2.6, -1.5], [-0.25, 2.6, -1.5], [-0.25, 2.6, -0.3], [2.5, 2.6, -0.3], [2.5, 2.6, 1.3]], mobile) },
    { kind: "added", before: [], after: trayPath([[1.2, 2.6, -0.3], [1.2, 2.6, 1.5], [2, 2.6, 1.5]], mobile) },
    { kind: "changed", before: riser(-2.3), after: riser(-1.9) }
  ];
  return model;
}
export function makeDisciplineGeometry(discipline: Discipline, mobile: boolean) {
  return discipline === "plumbing" ? plumbingGeometry(mobile) : electricalGeometry(mobile);
}
