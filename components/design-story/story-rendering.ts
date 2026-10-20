import type { Part } from "@/components/models/model-types";
import { clampStoryRevision, getStoryElements, getStoryEvent, type StoryDiscipline, type StoryElement } from "./story-data.ts";

/** Shared presentation rules keep the SVG and WebGL stories equivalent. */
export type StoryRendererControls = {
  discipline?: "all" | StoryDiscipline;
  viewMode?: "release" | "history";
  modelView?: "building" | "interface";
  showPrevious?: boolean;
  onSelectElement?: (id: string) => void;
};

export type StoryRenderState = {
  discipline: "all" | StoryDiscipline;
  viewMode: "release" | "history";
  modelView: "building" | "interface";
  selectedElementId: string | null;
  onlySelected: boolean;
};

export type StorySurface = "concrete" | "porcelain" | "fascia" | "structure" | "frame" | "glass" | "duct" | "service" | "plant" | "detail" | "site";

export const STORY_CONTEXT_LAYERS = [
  { key: "slabs", surface: "concrete", discipline: "STR", name: "six-storey-l-shaped-slabs" },
  { key: "fascia", surface: "fascia", discipline: "ARC", name: "slab-section-fascias" },
  { key: "walls", surface: "porcelain", discipline: "ARC", name: "envelope-and-circulation-core" },
  { key: "columns", surface: "structure", discipline: "STR", name: "structural-column-grid" },
  { key: "beams", surface: "structure", discipline: "STR", name: "structural-floor-beams" },
  { key: "frames", surface: "frame", discipline: "ARC", name: "facade-mullions-and-roof-details" },
  { key: "stairs", surface: "porcelain", discipline: "ARC", name: "switchback-stair-flights" },
  { key: "rails", surface: "frame", discipline: "ARC", name: "atrium-and-stair-balustrades" },
  { key: "ducts", surface: "duct", discipline: "MEP", name: "context-supply-and-return-ducts" },
  { key: "services", surface: "service", discipline: "MEP", name: "context-service-routes" },
  { key: "plant", surface: "plant", discipline: "MEP", name: "rooftop-plant-and-diffusers" },
  { key: "details", surface: "detail", discipline: "ARC", name: "interior-and-entrance-details" },
  { key: "glass", surface: "glass", discipline: "ARC", name: "glazed-envelope-and-atrium" },
  { key: "pavers", surface: "porcelain", discipline: null, name: "site-paving-and-entrance-steps" },
] as const;

export function resolveStoryRenderState(chapter: number, selectedElementId: string | null, controls: StoryRendererControls): StoryRenderState {
  return {
    discipline: controls.discipline ?? "all",
    viewMode: controls.viewMode ?? (chapter === 2 || chapter === 4 ? "history" : "release"),
    modelView: controls.modelView ?? (chapter === 3 ? "interface" : "building"),
    selectedElementId,
    // Legacy callers retain their selected-only chapter. An explicit mode is
    // independent of chapter and can highlight other relevant elements too.
    onlySelected: chapter === 3 && controls.viewMode === undefined,
  };
}

export function isStoryInterfaceContext(part: Part) {
  return part.position[0] + part.size[0] / 2 >= 1.6 &&
    part.position[2] + part.size[2] / 2 >= 1.17 &&
    part.position[1] - part.size[1] / 2 >= 1.1 &&
    part.position[1] + part.size[1] / 2 <= 3.85;
}

export function getStoryContextTreatment(discipline: StoryDiscipline | null, surface: StorySurface, inInterface: boolean, state: StoryRenderState) {
  let muted = state.onlySelected ? .5 : state.viewMode === "history" ? .2 : 0;
  let opacity = surface === "glass" ? .42 : 1;
  if (discipline && state.discipline !== "all") {
    if (state.discipline === discipline) muted = .02;
    else {
      muted = .8;
      opacity = surface === "glass" ? .07 : .16;
    }
  }
  if (state.modelView === "interface" && discipline) {
    if (!inInterface) {
      muted = Math.max(muted, .76);
      opacity = Math.min(opacity, .12);
    } else {
      if (state.discipline === "all" || state.discipline === discipline) muted = .2;
      if (surface === "glass") opacity = Math.min(opacity, .16);
    }
  }
  return { muted, opacity };
}

export function getStoryElementTreatment(element: StoryElement, state: StoryRenderState) {
  const selected = element.id === state.selectedElementId;
  const matches = state.discipline === "all" || state.discipline === element.discipline;
  const emphasized = selected || (matches && !state.onlySelected && (
    state.viewMode === "history" ? element.revisionCount > 1 : element.changedNow
  ));
  const highlight = selected ? "selected" : emphasized ? state.viewMode === "history" ? "repeated" : "current" : null;
  const muted = !selected && (!matches || state.onlySelected || state.modelView === "interface" && !isStoryInterfaceContext(element));
  return { selected, matches, emphasized, highlight, muted };
}

export function getStoryPreviousGeometry(revision: number, selectedElementId: string | null, showPrevious = false): StoryElement | null {
  const currentRevision = clampStoryRevision(revision);
  if (!showPrevious || !selectedElementId || currentRevision === 0) return null;
  const event = getStoryEvent(selectedElementId, currentRevision);
  if (!event || event.kind !== "movement" && event.kind !== "geometry") return null;
  const previous = getStoryElements(currentRevision - 1).find(element => element.id === selectedElementId);
  const current = getStoryElements(currentRevision).find(element => element.id === selectedElementId);
  if (!previous || !current || previous.position.every((value, axis) => value === current.position[axis]) && previous.size.every((value, axis) => value === current.size[axis])) return null;
  return previous;
}
