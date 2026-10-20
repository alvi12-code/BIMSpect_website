import type { Part, Vector } from "@/components/models/model-types";

const box = (position: Vector, size: Vector, rotation?: Vector): Part => ({ position, size, rotation });

export const STORY_FLOOR_HEIGHT = 1.2;
export const STORY_FLOORS = 6;

/** Context only. The versioned elements are supplied separately by story-data.
 * The open front and lower wing are deliberate architectural cutaways, so the
 * same structural, partition and service elements remain visible in every view.
 */
export function makeStoryArchitecture(compact = false) {
  const slabs: Part[] = [];
  const fascia: Part[] = [];
  const walls: Part[] = [];
  const columns: Part[] = [];
  const beams: Part[] = [];
  const glass: Part[] = [];
  const frames: Part[] = [];
  const stairs: Part[] = [];
  const rails: Part[] = [];
  const ducts: Part[] = [];
  const services: Part[] = [];
  const plant: Part[] = [];
  const details: Part[] = [];
  const pavers: Part[] = [];
  const floorEdges: Array<[Vector, Vector]> = [];

  const edge = (a: Vector, b: Vector) => floorEdges.push([a, b]);
  const slab = (x: number, y: number, z: number, width: number, depth: number) => {
    slabs.push(box([x, y, z], [width, 0.115, depth]));
    // A thin, bright edge gives the floor plates a convincing layered section.
    fascia.push(box([x, y - 0.025, z + depth / 2 + 0.006], [width, 0.055, 0.023]));
    fascia.push(box([x + width / 2 + 0.006, y - 0.025, z], [0.023, 0.055, depth]));
    const top = y + 0.059;
    edge([x - width / 2, top, z + depth / 2], [x + width / 2, top, z + depth / 2]);
    edge([x + width / 2, top, z - depth / 2], [x + width / 2, top, z + depth / 2]);
  };

  for (let level = 0; level <= STORY_FLOORS; level++) {
    const y = level * STORY_FLOOR_HEIGHT;
    slab(-0.15, y, -0.75, 9.3, 3.8);
    slab(-3.8, y, 2.25, 2, 2.2);
    if (level <= 2) slab(4.25, y, 2.85, 4.5, 3.4);
    if (level === 3) slab(4.25, y, 1.66, 4.5, 1.02);
    if (level === 1 || level === 2) slab(-0.4, y, 2.81, 4.8, 0.94);
    if (level === STORY_FLOORS) continue;

    const middle = y + 0.62;
    const underside = y + 1.04;
    for (const x of [-4.57, -2.4, -0.2, 2.05, 4.28]) {
      for (const z of [-2.44, 0.95]) {
        columns.push(box([x, middle, z], [0.105, 1.08, 0.105]));
      }
      beams.push(box([x, underside, -0.73], [0.095, 0.15, 3.48]));
    }
    beams.push(box([-0.15, underside, 0.95], [8.97, 0.15, 0.095]));
    beams.push(box([-0.15, underside, -2.44], [8.97, 0.15, 0.095]));

    // An intact rear envelope and one glazed return establish the building's
    // real architectural mass. The near central elevation is a section cut.
    walls.push(box([-0.15, y + 0.21, -2.625], [9.22, 0.28, 0.09]));
    walls.push(box([-0.15, y + 1.1, -2.625], [9.22, 0.09, 0.09]));
    for (let bay = 0; bay < 10; bay++) {
      const x = -4.31 + bay * 0.925;
      glass.push(box([x, y + 0.695, -2.645], [0.875, 0.73, 0.035]));
      frames.push(box([x - 0.453, middle, -2.67], [0.028, 1.055, 0.048]));
    }
    frames.push(box([-0.15, y + 0.37, -2.67], [9.26, 0.027, 0.047]));
    frames.push(box([-0.15, y + 1.062, -2.67], [9.26, 0.027, 0.047]));

    // Left wing curtain wall, with a fine-grained mullion rhythm.
    for (let bay = 0; bay < 6; bay++) {
      const z = -2.18 + bay * 0.925;
      glass.push(box([-4.77, y + 0.68, z], [0.034, 0.82, 0.875]));
      frames.push(box([-4.79, middle, z - 0.455], [0.047, 1.06, 0.027]));
    }
    walls.push(box([-4.755, y + 0.17, 0.35], [0.085, 0.2, 5.9]));
    walls.push(box([-4.755, y + 1.1, 0.35], [0.085, 0.085, 5.9]));
    frames.push(box([-4.79, y + 0.32, 0.35], [0.047, 0.025, 5.9]));
    for (const x of [-4.26, -3.31]) {
      glass.push(box([x, y + 0.665, 3.36], [0.87, 0.89, 0.034]));
      frames.push(box([x - 0.46, middle, 3.385], [0.03, 1.055, 0.048]));
    }
    walls.push(box([-3.8, y + 0.16, 3.35], [1.97, 0.19, 0.08]));
    frames.push(box([-3.8, y + 1.08, 3.385], [1.96, 0.03, 0.048]));

    // Two intact front bays make the section opening read as intentional.
    for (const x of [-2.9, 3.58]) {
      glass.push(box([x, y + 0.67, 1.135], [1.52, 0.84, 0.036]));
      walls.push(box([x, y + 0.185, 1.14], [1.63, 0.235, 0.075]));
      frames.push(box([x - 0.81, middle, 1.164], [0.03, 1.07, 0.046]));
      frames.push(box([x, middle, 1.164], [0.026, 1.07, 0.046]));
      frames.push(box([x + 0.8, middle, 1.164], [0.03, 1.07, 0.046]));
    }

    // Pale circulation core; doors are inset in the opaque backing wall.
    walls.push(box([-3.54, middle, -1.72], [1.38, 1.08, 0.095]));
    walls.push(box([-4.2, middle, -1.08], [0.085, 1.08, 1.34]));
    walls.push(box([-2.87, middle, -1.36], [0.085, 1.08, 0.78]));
    frames.push(box([-3.56, y + 0.49, -1.66], [0.44, 0.85, 0.017]));
    details.push(box([-3.56, y + 0.49, -1.644], [0.39, 0.81, 0.018]));
    frames.push(box([-3.56, y + 0.49, -1.63], [0.014, 0.82, 0.009]));

    // Stair flights, intermediate landings and a continuous balustrade in the
    // glazed return remain legible even at the smaller rendering budget.
    for (let step = 0; step < 8; step++) {
      stairs.push(box([-3.47, y + 0.1 + step * 0.075, 1.34 + step * 0.155], [0.61, 0.072, 0.158]));
      stairs.push(box([-4.17, y + 0.68 + step * 0.075, 2.42 - step * 0.155], [0.61, 0.072, 0.158]));
    }
    stairs.push(box([-3.82, y + 0.625, 2.66], [1.33, 0.09, 0.44]));
    rails.push(box([-3.09, y + 0.74, 1.91], [0.019, 0.019, 1.43], [-0.44, 0, 0]));
    rails.push(box([-3.81, y + 1.32, 1.91], [0.019, 0.019, 1.43], [0.44, 0, 0]));
    for (const z of [1.32, 1.95, 2.57]) {
      rails.push(box([-3.09, y + 0.34 + (z - 1.32) * 0.48, z], [0.014, 0.42, 0.014]));
    }

    // Exposed supply and return routes are context, not additional counted
    // changes. Their quiet materials keep the versioned fixture dominant.
    if (level < 5) {
      ducts.push(box([0.68, y + 0.91, -0.34], [6.25, 0.11, 0.2]));
      services.push(box([0.68, y + 0.885, -0.68], [6.25, 0.036, 0.055]));
      for (const x of [-1.55, 0.52, 2.59]) {
        ducts.push(box([x, y + 0.91, 0.26], [0.125, 0.1, 1.13]));
        plant.push(box([x, y + 0.834, 0.83], [0.25, 0.033, 0.25]));
        if (!compact) {
          frames.push(box([x, y + 1.025, -0.34], [0.015, 0.13, 0.015]));
          frames.push(box([x, y + 0.91, -0.34], [0.025, 0.126, 0.217]));
        }
      }
    }
  }

  // Lower laboratory/office wing. Only the rear roof strip is present, exposing
  // the service ceiling and spatial arrangement beneath, without an A/B split.
  for (let level = 0; level < 3; level++) {
    const y = level * STORY_FLOOR_HEIGHT;
    for (const x of [2.17, 4.3, 6.32]) {
      for (const z of [1.35, 4.34]) columns.push(box([x, y + 0.62, z], [0.115, 1.07, 0.115]));
      beams.push(box([x, y + 1.06, 2.85], [0.095, 0.13, 3.1]));
    }
    beams.push(box([4.25, y + 1.06, 4.34], [4.23, 0.13, 0.095]));
    if (level === 0) {
      for (const x of [2.66, 3.72, 4.78, 5.84]) {
        glass.push(box([x, y + 0.635, 4.53], [1.0, 1.0, 0.031]));
        frames.push(box([x - 0.523, y + 0.61, 4.555], [0.029, 1.09, 0.042]));
      }
      frames.push(box([4.25, y + 1.135, 4.555], [4.45, 0.03, 0.042]));
    } else {
      rails.push(box([4.25, y + 0.48, 4.49], [4.45, 0.028, 0.028]));
      for (const x of [2.17, 3.21, 4.25, 5.29, 6.33]) {
        rails.push(box([x, y + 0.28, 4.49], [0.023, 0.41, 0.023]));
      }
    }
    // Translucent side bays provide depth behind the near section.
    for (const z of [1.68, 2.73, 3.78]) {
      glass.push(box([6.47, y + 0.65, z], [0.031, 0.99, 1.0]));
      frames.push(box([6.495, y + 0.61, z - 0.519], [0.042, 1.08, 0.029]));
    }
    ducts.push(box([4.46, y + 0.9, 2.65], [3.59, 0.14, 0.24]));
    ducts.push(box([2.65, y + 0.9, 1.25], [0.24, 0.14, 2.99]));
    services.push(box([4.25, y + 0.855, 2.97], [3.6, 0.04, 0.06]));
    for (const x of [3.22, 5.24]) {
      ducts.push(box([x, y + 0.9, 3.32], [0.13, 0.12, 1.22]));
      plant.push(box([x, y + 0.81, 3.93], [0.28, 0.035, 0.28]));
      if (!compact) {
        details.push(box([x, y + 0.39, 3.53], [1.0, 0.045, 0.49]));
        frames.push(box([x - 0.39, y + 0.215, 3.53], [0.035, 0.33, 0.36]));
        frames.push(box([x + 0.39, y + 0.215, 3.53], [0.035, 0.33, 0.36]));
      }
    }
  }

  // Atrium bridges and transparent balustrades connect the disciplines in one
  // shared building, with a clear void between the tall volume and the wing.
  for (const y of [1.2, 2.4]) {
    for (const z of [2.365, 3.255]) {
      glass.push(box([-0.4, y + 0.29, z], [4.77, 0.43, 0.027]));
      rails.push(box([-0.4, y + 0.535, z], [4.81, 0.024, 0.024]));
      for (const x of [-2.67, -1.15, 0.37, 1.89]) rails.push(box([x, y + 0.3, z], [0.017, 0.47, 0.017]));
    }
  }

  // Flat roof: parapets, service screens, glazed rooflight and visible plant.
  walls.push(box([-0.15, 7.36, -2.59], [9.24, 0.31, 0.095]));
  walls.push(box([-4.735, 7.36, 0.35], [0.095, 0.31, 5.91]));
  walls.push(box([4.43, 7.36, -0.75], [0.095, 0.31, 3.74]));
  walls.push(box([-3.8, 7.36, 3.29], [1.96, 0.31, 0.095]));
  fascia.push(box([-0.15, 7.523, -2.59], [9.26, 0.025, 0.13]));
  fascia.push(box([4.43, 7.523, -0.75], [0.13, 0.025, 3.74]));
  walls.push(box([-3.64, 7.37, -1.1], [1.46, 0.33, 1.76]));
  glass.push(box([-3.64, 7.555, -1.1], [1.38, 0.045, 1.68]));
  for (const z of [-1.67, -1.1, -0.53]) frames.push(box([-3.64, 7.586, z], [1.42, 0.025, 0.025]));
  for (const x of [-0.86, 0.78, 2.42]) {
    plant.push(box([x, 7.42, -1.15], [1.1, 0.39, 0.77]));
    frames.push(box([x, 7.245, -1.15], [1.18, 0.11, 0.86]));
    for (let fin = 0; fin < (compact ? 4 : 7); fin++) {
      const step = compact ? 0.25 : 0.145;
      frames.push(box([x - 0.435 + fin * step, 7.623, -1.15], [0.035, 0.023, 0.62]));
    }
  }
  ducts.push(box([0.8, 7.29, -0.38], [3.74, 0.12, 0.2]));
  ducts.push(box([2.65, 3.77, -0.75], [0.23, 7.08, 0.23]));

  // Entrance canopy, steps, paving and low landscape walls give the model a
  // credible site datum while keeping the drawing intentionally schematic.
  glass.push(box([-0.42, 1.14, 1.83], [2.35, 0.045, 1.32]));
  for (const x of [-1.53, 0.69]) frames.push(box([x, 1.09, 1.83], [0.035, 0.055, 1.4]));
  frames.push(box([-0.42, 1.09, 2.52], [2.3, 0.055, 0.035]));
  for (const z of [4.68, 4.97, 5.26]) {
    pavers.push(box([3.88, -0.12 - (z - 4.68) * 0.21, z], [4.55, 0.08, 0.3]));
  }
  for (let i = 0; i < 6; i++) pavers.push(box([-0.38, -0.224, 3.64 + i * 0.43], [2.0, 0.034, 0.4]));
  walls.push(box([-5.41, -0.01, 1.95], [0.47, 0.42, 2.48]));
  plant.push(box([-5.41, 0.214, 1.95], [0.34, 0.035, 2.33]));
  details.push(box([-5.02, 0.13, 1.95], [0.38, 0.085, 2.2]));

  return { slabs, fascia, walls, columns, beams, glass, frames, stairs, rails, ducts, services, plant, details, pavers, floorEdges };
}

/** Ground drawing is bounded; no infinite helper or recurring render work. */
export function makeStoryGrid(): Array<[Vector, Vector]> {
  const lines: Array<[Vector, Vector]> = [];
  for (let i = -6; i <= 6; i++) {
    const x = i * 1.2 + 0.5;
    lines.push([[x, -0.324, -4.8], [x, -0.324, 7.2]]);
  }
  for (let i = -4; i <= 6; i++) {
    const z = i * 1.2;
    lines.push([[-6.7, -0.324, z], [7.7, -0.324, z]]);
  }
  return lines;
}
