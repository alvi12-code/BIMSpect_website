import type { Part, Vector } from "@/components/models/model-types";
import { getStoryElements, type StoryDiscipline, type StoryElement } from "./story-data";
import { makeStoryArchitecture, makeStoryGrid } from "./story-geometry";
import { getStoryContextTreatment, getStoryElementTreatment, getStoryPreviousGeometry, isStoryInterfaceContext, resolveStoryRenderState, STORY_CONTEXT_LAYERS, type StoryRendererControls, type StoryRenderState, type StorySurface } from "./story-rendering";
import styles from "./design-story.module.css";

type Surface = StorySurface;
type Face = {
  id: string;
  vertices: Vector[];
  normal: Vector;
  depth: number;
  surface: Surface;
  discipline: StoryDiscipline | null;
  inInterface: boolean;
  tracked?: StoryElement;
};

const palette: Record<Surface, string> = {
  concrete: "#d7d1c6", porcelain: "#eee9df", fascia: "#f6f0e6",
  structure: "#68777f", frame: "#75858d", glass: "#aac4cf",
  duct: "#91acaf", service: "#8297a3", plant: "#b9c1ba",
  detail: "#cfc4b1", site: "#e5e7df",
};

const dot = (a: Vector, b: Vector) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const normalized = (v: Vector): Vector => {
  const length = Math.hypot(...v);
  return v.map(value => value / length) as Vector;
};
const view = normalized([1.23, 0.8, 1.65]);
const right = normalized([view[2], 0, -view[0]]);
const up: Vector = [view[1] * right[2], view[2] * right[0] - view[0] * right[2], -view[1] * right[0]];
const light = normalized([-0.7, 1.8, 1.2]);

// Three's default XYZ Euler order, implemented directly to keep this fallback
// independent of WebGL and the Three bundle, including rotated stair rails.
function rotate(point: Vector, rotation: Vector = [0, 0, 0]): Vector {
  const [rx, ry, rz] = rotation;
  const x = point[0] * Math.cos(rz) - point[1] * Math.sin(rz);
  const y = point[0] * Math.sin(rz) + point[1] * Math.cos(rz);
  const xx = x * Math.cos(ry) + point[2] * Math.sin(ry);
  const z = -x * Math.sin(ry) + point[2] * Math.cos(ry);
  return [xx, y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)];
}

const boxFaces: { normal: Vector; vertices: Vector[] }[] = [
  { normal: [1, 0, 0], vertices: [[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5],[.5,-.5,.5]] },
  { normal: [-1, 0, 0], vertices: [[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5],[-.5,-.5,-.5]] },
  { normal: [0, 1, 0], vertices: [[-.5,.5,-.5],[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5]] },
  { normal: [0, -1, 0], vertices: [[-.5,-.5,.5],[.5,-.5,.5],[.5,-.5,-.5],[-.5,-.5,-.5]] },
  { normal: [0, 0, 1], vertices: [[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]] },
  { normal: [0, 0, -1], vertices: [[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]] },
];

/** Sortable face fragments avoid the long-slab occlusion errors of sorting
 * whole boxes. Subdivision changes only drawing order, never model geometry.
 */
function facesForPart(part: Part, id: string, surface: Surface, discipline: StoryDiscipline | null, tracked?: StoryElement): Face[] {
  const result: Face[] = [];
  for (const [index, face] of boxFaces.entries()) {
    const normal = rotate(face.normal, part.rotation);
    if (dot(normal, view) <= 0) continue;
    const vertices = face.vertices.map(vertex => {
      const rotated = rotate(vertex.map((value, axis) => value * part.size[axis]) as Vector, part.rotation);
      return rotated.map((value, axis) => value + part.position[axis]) as Vector;
    });
    const a = vertices[0];
    const u = vertices[1].map((value, axis) => value - a[axis]) as Vector;
    const v = vertices[3].map((value, axis) => value - a[axis]) as Vector;
    const columns = Math.max(1, Math.ceil(Math.hypot(...u) / 1.35));
    const rows = Math.max(1, Math.ceil(Math.hypot(...v) / 1.35));
    const point = (across: number, down: number): Vector => a.map((value, axis) => value + u[axis] * across + v[axis] * down) as Vector;
    for (let column = 0; column < columns; column++) for (let row = 0; row < rows; row++) {
      const fragment = [
        point(column / columns, row / rows),
        point((column + 1) / columns, row / rows),
        point((column + 1) / columns, (row + 1) / rows),
        point(column / columns, (row + 1) / rows),
      ];
      result.push({ id: `${id}-${index}-${column}-${row}`, vertices: fragment, normal, surface, discipline, tracked, inInterface: isStoryInterfaceContext(part),
        depth: fragment.reduce((sum, vertex) => sum + dot(vertex, view), 0) / 4 });
    }
  }
  return result;
}

const architecture = makeStoryArchitecture(true);
const contextFaces = STORY_CONTEXT_LAYERS.flatMap(({ key, surface, discipline }) => architecture[key].flatMap((part, index) => facesForPart(part, `${key}-${index}`, surface, discipline)));
const podium = facesForPart({ position: [.55,-.26,1.05], size: [13.4,.115,9.6] }, "podium", "site", null).sort((a, b) => a.depth - b.depth);
const groundTop: Vector[] = [[-6.15,-.201,-3.75],[7.25,-.201,-3.75],[7.25,-.201,5.85],[-6.15,-.201,5.85]];
const projectedBounds = [...contextFaces, ...podium].flatMap(face => face.vertices).map(point => [dot(point, right), dot(point, up)]);
const minX = Math.min(...projectedBounds.map(point => point[0]));
const maxX = Math.max(...projectedBounds.map(point => point[0]));
const minY = Math.min(...projectedBounds.map(point => point[1]));
const maxY = Math.max(...projectedBounds.map(point => point[1]));
const scale = Math.min(764 / (maxX - minX), 488 / (maxY - minY));
const centerX = (minX + maxX) / 2;
const project = (point: Vector) => [410 + (dot(point, right) - centerX) * scale, 62 + (maxY - dot(point, up)) * scale];
const polygonPoints = (vertices: Vector[]) => vertices.map(vertex => project(vertex).map(value => value.toFixed(2)).join(",")).join(" ");

function mix(hex: string, target: string, amount: number) {
  const channels = [1, 3, 5].map(index => {
    const from = Number.parseInt(hex.slice(index, index + 2), 16);
    const to = Number.parseInt(target.slice(index, index + 2), 16);
    return Math.round(from + (to - from) * amount).toString(16).padStart(2, "0");
  });
  return `#${channels.join("")}`;
}

function appearance(face: Face, state: StoryRenderState) {
  const element = face.tracked;
  let color = palette[face.surface];
  let opacity = 1;
  if (element) {
    const treatment = getStoryElementTreatment(element, state);
    if (treatment.highlight === "selected" || treatment.highlight === "current") color = "#a184e1";
    else if (treatment.highlight === "repeated") color = element.revisionCount >= 3 ? "#d4a155" : "#dec08a";
    else if (treatment.muted || state.viewMode === "history") color = "#c6ceca";
    opacity = treatment.muted ? .18 : face.surface === "glass" && !treatment.emphasized ? .58 : 1;
  } else {
    const treatment = getStoryContextTreatment(face.discipline, face.surface, face.inInterface, state);
    color = mix(color, "#e5e4db", treatment.muted);
    opacity = treatment.opacity;
  }
  const shade = Math.max(0, dot(face.normal, light));
  color = shade > .5 ? mix(color, "#ffffff", (shade - .5) * .24) : mix(color, "#637077", (.5 - shade) * .3);
  return { color, opacity };
}

const outlineEdges = [[0,1],[0,2],[0,4],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]];

function elementOutline(element: StoryElement) {
  const vertices: Vector[] = [];
  for (const x of [-.5,.5]) for (const y of [-.5,.5]) for (const z of [-.5,.5]) {
    vertices.push([element.position[0] + element.size[0] * x, element.position[1] + element.size[1] * y, element.position[2] + element.size[2] * z]);
  }
  return outlineEdges.map(([from, to]) => polygonPoints([vertices[from], vertices[to]]));
}

export function StoryFallback({ revision, chapter, selectedElementId, ...controls }: StoryRendererControls & {
  revision: number;
  chapter: number;
  selectedElementId: string | null;
}) {
  const state = resolveStoryRenderState(chapter, selectedElementId, controls);
  const elements = getStoryElements(revision);
  const selected = elements.find(element => element.id === selectedElementId);
  const previous = getStoryPreviousGeometry(revision, selectedElementId, controls.showPrevious);
  const tracked = getStoryElements(revision).flatMap(element => facesForPart(element, element.id,
    element.kind === "panel" ? "glass" : element.kind === "partition" ? "porcelain" : element.kind === "beam" ? "structure" : "duct", element.discipline, element));
  const faces = [...contextFaces, ...tracked].sort((a, b) => a.depth - b.depth);
  const shadow = project([.55, -.38, 1.05]);
  const focus = project([3.45, 2.8, 2.6]);
  const viewBox = state.modelView === "interface" ? `${focus[0] - 240} ${focus[1] - 167} 480 334` : "0 0 820 570";
  return <svg className={styles.fallbackDrawing} viewBox={viewBox} aria-hidden="true" focusable="false" data-model-view={state.modelView} data-discipline={state.discipline} data-view-mode={state.viewMode}>
    <defs>
      <radialGradient id="story-detailed-shadow"><stop stopColor="#75847e" stopOpacity=".2" /><stop offset="1" stopColor="#75847e" stopOpacity="0" /></radialGradient>
      <clipPath id="story-detailed-ground"><polygon points={polygonPoints(groundTop)} /></clipPath>
    </defs>
    <ellipse cx={shadow[0]} cy={shadow[1] + 8} rx="335" ry="109" fill="url(#story-detailed-shadow)" />
    {podium.map(face => {
      const material = appearance(face, state);
      return <polygon key={face.id} points={polygonPoints(face.vertices)} fill={material.color} />;
    })}
    <g clipPath="url(#story-detailed-ground)" fill="none" stroke="#7f928b" strokeWidth=".65" opacity=".2">
      {makeStoryGrid().map((line, index) => {
        const a = project([line[0][0], -.195, line[0][2]]), b = project([line[1][0], -.195, line[1][2]]);
        return <line key={index} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
      })}
    </g>
    {faces.map(face => {
      const material = appearance(face, state);
      return <polygon key={face.id} points={polygonPoints(face.vertices)} fill={material.color} opacity={material.opacity} data-story-element={face.tracked?.id} />;
    })}
    {previous ? <g data-previous-element={previous.id} fill="none" stroke="#655384" opacity=".9" strokeWidth="1.05" strokeDasharray="4 3">
      {elementOutline(previous).map((points, index) => <polyline key={index} points={points} vectorEffect="non-scaling-stroke" />)}
    </g> : null}
    {selected ? <g data-selected-outline={selected.id} fill="none" stroke="#7555ae" opacity=".85" strokeWidth=".75">
      {elementOutline(selected).map((points, index) => <polyline key={index} points={points} vectorEffect="non-scaling-stroke" />)}
    </g> : null}
  </svg>;
}
