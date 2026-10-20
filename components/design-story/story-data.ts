/**
 * Synthetic, deterministic marketing example. This is not a customer project,
 * a Design Buzz score, or an engineering assessment. Every visible count and
 * tracked model highlight is derived from this same twelve-element history.
 */
export type StoryDiscipline = "ARC" | "STR" | "MEP";
export type StoryChangeKind = "geometry" | "movement" | "information";
export type StoryLocale = "en" | "fi";

export interface StoryElement {
  id: string;
  discipline: StoryDiscipline;
  zone: string;
  label: string;
  position: [number, number, number];
  size: [number, number, number];
  kind: "panel" | "partition" | "beam" | "duct";
  revisionCount: number;
  changedNow: boolean;
}

export const STORY_RELEASES = [
  { id: "R01", date: "04.02", label: "Initial coordination" },
  { id: "R02", date: "18.02", label: "Layout development" },
  { id: "R03", date: "04.03", label: "Discipline coordination" },
  { id: "R04", date: "18.03", label: "Service route review" },
  { id: "R05", date: "01.04", label: "Coordination update" },
  { id: "R06", date: "15.04", label: "Latest review issue" },
] as const;

type ElementSeed = Omit<StoryElement, "revisionCount" | "changedNow">;
export interface StoryEvent {
  revision: number;
  elementId: string;
  kind: StoryChangeKind;
  detail: string;
  position?: [number, number, number];
  size?: [number, number, number];
}

export const STORY_ELEMENTS: readonly ElementSeed[] = [
  { id: "MEP-041", discipline: "MEP", zone: "L03 · East wing", label: "East-wing supply route", kind: "duct", position: [3.35, 3.15, 2.45], size: [4.6, 0.22, 0.3] },
  { id: "ARC-112", discipline: "ARC", zone: "L03 · East wing", label: "Meeting-room partition", kind: "partition", position: [3.6, 2.98, 2.25], size: [0.12, 1.05, 2.1] },
  { id: "STR-028", discipline: "STR", zone: "L03 · East wing", label: "East-wing transfer beam", kind: "beam", position: [3.8, 3.42, 2.7], size: [4.5, 0.28, 0.2] },
  { id: "ARC-056", discipline: "ARC", zone: "L02 · Atrium", label: "Atrium edge partition", kind: "partition", position: [-1.2, 1.83, 0.65], size: [2.1, 1.02, 0.12] },
  { id: "ARC-087", discipline: "ARC", zone: "L04 · South elevation", label: "South facade panel", kind: "panel", position: [1.65, 4.22, 1.17], size: [1.45, 1.02, 0.08] },
  { id: "ARC-091", discipline: "ARC", zone: "L05 · South elevation", label: "Upper facade panel", kind: "panel", position: [3.22, 5.42, 1.17], size: [1.45, 1.02, 0.08] },
  { id: "STR-014", discipline: "STR", zone: "L02 · West wing", label: "West-wing edge beam", kind: "beam", position: [-3.8, 2.25, 1.85], size: [0.24, 0.25, 2.8] },
  { id: "STR-063", discipline: "STR", zone: "L05 · North wing", label: "Upper floor beam", kind: "beam", position: [0.8, 5.84, -0.9], size: [4.5, 0.25, 0.25] },
  { id: "MEP-022", discipline: "MEP", zone: "L02 · West wing", label: "West-wing return route", kind: "duct", position: [-3.7, 2.08, 0.7], size: [0.22, 0.2, 3.8] },
  { id: "MEP-063", discipline: "MEP", zone: "L04 · North wing", label: "North-wing service route", kind: "duct", position: [-0.35, 4.28, -0.55], size: [5.4, 0.2, 0.24] },
  { id: "ARC-024", discipline: "ARC", zone: "L01 · Entrance", label: "Entrance screen", kind: "panel", position: [-0.9, 0.61, 1.22], size: [1.6, 1.02, 0.1] },
  { id: "STR-009", discipline: "STR", zone: "L01 · Entrance", label: "Entrance edge beam", kind: "beam", position: [-0.9, 1.06, 1.05], size: [3.1, 0.2, 0.22] },
];

export const STORY_EVENTS: readonly StoryEvent[] = [
  { revision: 1, elementId: "MEP-041", kind: "movement", detail: "Route shifted towards the facade.", position: [3.35, 3.15, 2.8] },
  { revision: 1, elementId: "ARC-112", kind: "movement", detail: "Meeting-room layout moved east.", position: [3.9, 2.98, 2.25] },
  { revision: 1, elementId: "ARC-056", kind: "geometry", detail: "Atrium partition extended.", size: [2.7, 1.02, 0.12] },
  { revision: 1, elementId: "STR-014", kind: "geometry", detail: "Edge beam depth revised.", size: [0.24, 0.34, 2.8] },
  { revision: 1, elementId: "MEP-022", kind: "movement", detail: "Return route offset revised.", position: [-3.45, 2.08, 0.7] },
  { revision: 2, elementId: "MEP-041", kind: "geometry", detail: "Duct section increased.", size: [4.6, 0.3, 0.38] },
  { revision: 2, elementId: "ARC-112", kind: "geometry", detail: "Partition length adjusted.", size: [0.12, 1.05, 2.35] },
  { revision: 2, elementId: "STR-028", kind: "geometry", detail: "Transfer beam depth revised.", size: [4.5, 0.36, 0.2] },
  { revision: 2, elementId: "ARC-087", kind: "information", detail: "Facade panel type updated." },
  { revision: 2, elementId: "STR-063", kind: "information", detail: "Structural classification updated." },
  { revision: 3, elementId: "MEP-041", kind: "movement", detail: "Route lowered at the beam interface.", position: [3.35, 2.99, 2.8] },
  { revision: 3, elementId: "ARC-112", kind: "movement", detail: "Room boundary adjusted again.", position: [4.15, 2.98, 2.25] },
  { revision: 3, elementId: "STR-028", kind: "movement", detail: "Beam alignment adjusted.", position: [3.8, 3.42, 2.95] },
  { revision: 3, elementId: "MEP-063", kind: "movement", detail: "Service route moved north.", position: [-0.35, 4.28, -0.85] },
  { revision: 4, elementId: "MEP-041", kind: "information", detail: "System designation updated." },
  { revision: 4, elementId: "ARC-091", kind: "information", detail: "Facade material information revised." },
  { revision: 5, elementId: "MEP-041", kind: "movement", detail: "Route offset revised for the latest review.", position: [3.35, 2.99, 3.15] },
  { revision: 5, elementId: "STR-028", kind: "information", detail: "Beam specification updated." },
];

export const STORY_SELECTED_ELEMENT = "MEP-041";

export function clampStoryRevision(revision: number): number {
  if (!Number.isFinite(revision)) return 0;
  return Math.max(0, Math.min(STORY_RELEASES.length - 1, Math.trunc(revision)));
}

export function getStoryEvents(revision: number): StoryEvent[] {
  return STORY_EVENTS.filter((event) => event.revision <= clampStoryRevision(revision));
}

export function getStoryElements(revision: number): StoryElement[] {
  const selected = clampStoryRevision(revision);
  return STORY_ELEMENTS.map((seed) => {
    const history = STORY_EVENTS.filter((event) => event.elementId === seed.id && event.revision <= selected);
    const resolved: StoryElement = { ...seed, position: [...seed.position], size: [...seed.size], revisionCount: history.length, changedNow: history.some((event) => event.revision === selected) };
    for (const event of history) {
      if (event.position) resolved.position = [...event.position];
      if (event.size) resolved.size = [...event.size];
    }
    return resolved;
  });
}

export function getStorySummary(revision: number) {
  const elements = getStoryElements(revision);
  const events = getStoryEvents(revision);
  return {
    events: events.length,
    changedNow: elements.filter((element) => element.changedNow).length,
    repeated: elements.filter((element) => element.revisionCount > 1).length,
    unchanged: elements.filter((element) => element.revisionCount === 0).length,
    disciplines: (["ARC", "STR", "MEP"] as const).map((discipline) => ({
      discipline,
      events: events.filter((event) => elements.find((element) => element.id === event.elementId)?.discipline === discipline).length,
    })),
  };
}
