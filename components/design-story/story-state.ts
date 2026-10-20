import {
  STORY_ELEMENTS,
  STORY_INTERFACE_ELEMENTS,
  STORY_RELEASES,
  STORY_SELECTED_ELEMENT,
  clampStoryRevision,
  type StoryDisciplineFilter,
  type StoryViewMode,
} from "./story-data.ts";

export type StoryModelView = "building" | "interface";
export interface StorySelection {
  chapter: number;
  revision: number;
  discipline: StoryDisciplineFilter;
  selectedElementId: string | null;
  viewMode: StoryViewMode;
  modelView: StoryModelView;
  showPrevious: boolean;
}

export const INITIAL_STORY_SELECTION: StorySelection = {
  chapter: 0,
  revision: STORY_RELEASES.length - 1,
  discipline: "all",
  selectedElementId: null,
  viewMode: "release",
  modelView: "building",
  showPrevious: true,
};

export type StoryAction =
  | { type: "chapter"; chapter: number }
  | { type: "revision"; revision: number }
  | { type: "discipline"; discipline: StoryDisciplineFilter }
  | { type: "mode"; mode: StoryViewMode }
  | { type: "view"; view: StoryModelView }
  | { type: "previous"; show: boolean }
  | { type: "inspect"; elementId: string; revision?: number }
  | { type: "context" };

function preferredElement(discipline: StoryDisciplineFilter) {
  if (discipline === "all") return STORY_SELECTED_ELEMENT;
  return STORY_ELEMENTS.find((element) =>
    element.discipline === discipline && STORY_INTERFACE_ELEMENTS.some((id) => id === element.id),
  )?.id ?? null;
}

/** One selection drives the model, history, properties, review and report. */
export function storyReducer(state: StorySelection, action: StoryAction): StorySelection {
  switch (action.type) {
    case "chapter": {
      if (!Number.isInteger(action.chapter) || action.chapter < 0 || action.chapter > 4) return state;
      return {
        ...state,
        chapter: action.chapter,
        viewMode: action.chapter === 1 ? "release" : action.chapter === 2 ? "history" : state.viewMode,
        modelView: action.chapter >= 3 && (!state.selectedElementId || STORY_INTERFACE_ELEMENTS.some((id) => id === state.selectedElementId)) ? "interface" : "building",
        selectedElementId: action.chapter === 3 && !state.selectedElementId
          ? preferredElement(state.discipline) : state.selectedElementId,
      };
    }
    case "revision": return { ...state, revision: clampStoryRevision(action.revision) };
    case "discipline": {
      const current = STORY_ELEMENTS.find((element) => element.id === state.selectedElementId);
      return {
        ...state,
        discipline: action.discipline,
        selectedElementId: current && action.discipline !== "all" && current.discipline !== action.discipline
          ? preferredElement(action.discipline) : state.selectedElementId,
      };
    }
    case "mode": return { ...state, viewMode: action.mode };
    case "view": return {
      ...state,
      modelView: action.view,
      selectedElementId: action.view === "interface" && state.selectedElementId && !STORY_INTERFACE_ELEMENTS.some((id) => id === state.selectedElementId)
        ? null : state.selectedElementId,
    };
    case "previous": return { ...state, showPrevious: action.show };
    case "context": return { ...state, selectedElementId: null, discipline: "all", modelView: "interface" };
    case "inspect": {
      const element = STORY_ELEMENTS.find((item) => item.id === action.elementId);
      if (!element) return state;
      return {
        ...state,
        chapter: 3,
        selectedElementId: element.id,
        discipline: state.discipline === "all" || state.discipline === element.discipline ? state.discipline : "all",
        revision: action.revision === undefined ? state.revision : clampStoryRevision(action.revision),
        modelView: STORY_INTERFACE_ELEMENTS.some((id) => id === element.id) ? "interface" : "building",
        showPrevious: true,
      };
    }
  }
}
