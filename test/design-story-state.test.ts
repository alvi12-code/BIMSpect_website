import assert from "node:assert/strict";
import test from "node:test";
import { INITIAL_STORY_SELECTION, storyReducer } from "../components/design-story/story-state.ts";
import { STORY_ELEMENTS, getStorySummary } from "../components/design-story/story-data.ts";

test("moving from an earlier investigation into a review preserves its element and release", () => {
  const inspected = storyReducer(INITIAL_STORY_SELECTION, { type: "inspect", elementId: "STR-028", revision: 2 });
  const review = storyReducer(inspected, { type: "chapter", chapter: 4 });
  assert.equal(review.revision, 2);
  assert.equal(review.selectedElementId, "STR-028");
  assert.equal(getStorySummary(review.revision).events, 10);
  const history = storyReducer(review, { type: "chapter", chapter: 2 });
  assert.equal(history.revision, 2);
  assert.equal(history.viewMode, "history");
  assert.equal(history.selectedElementId, "STR-028");
});

test("a discipline filter cannot leave an incompatible selected element in the model", () => {
  let selection = storyReducer(INITIAL_STORY_SELECTION, { type: "inspect", elementId: "MEP-041" });
  for (const discipline of ["ARC", "STR", "MEP"] as const) {
    selection = storyReducer(selection, { type: "discipline", discipline });
    assert.equal(STORY_ELEMENTS.find((element) => element.id === selection.selectedElementId)?.discipline, discipline);
    assert.equal(selection.revision, 5);
  }
});

test("opening related evidence restores its scope without leaking a later release", () => {
  const architecture = storyReducer(INITIAL_STORY_SELECTION, { type: "discipline", discipline: "ARC" });
  const inspected = storyReducer(architecture, { type: "inspect", elementId: "MEP-041", revision: 1 });
  assert.equal(inspected.discipline, "all");
  assert.equal(inspected.selectedElementId, "MEP-041");
  assert.equal(inspected.revision, 1);
  const mode = storyReducer(inspected, { type: "mode", mode: "history" });
  assert.equal(mode.revision, 1);
  assert.equal(mode.selectedElementId, inspected.selectedElementId);
  assert.equal(getStorySummary(mode.revision).repeated, 0);
});

test("returning to the shared interface clears selection but preserves the chosen history", () => {
  const inspected = storyReducer(INITIAL_STORY_SELECTION, { type: "inspect", elementId: "ARC-112", revision: 0 });
  const context = storyReducer(inspected, { type: "context" });
  assert.equal(context.selectedElementId, null);
  assert.equal(context.discipline, "all");
  assert.equal(context.modelView, "interface");
  assert.equal(context.revision, 0);
  assert.equal(getStorySummary(context.revision).events, 0);
});

test("unknown elements and invalid chapter requests cannot corrupt the story selection", () => {
  assert.equal(storyReducer(INITIAL_STORY_SELECTION, { type: "inspect", elementId: "missing" }), INITIAL_STORY_SELECTION);
  assert.equal(storyReducer(INITIAL_STORY_SELECTION, { type: "chapter", chapter: 20 }), INITIAL_STORY_SELECTION);
  assert.equal(storyReducer(INITIAL_STORY_SELECTION, { type: "revision", revision: Number.NaN }).revision, 0);
  assert.equal(storyReducer(INITIAL_STORY_SELECTION, { type: "revision", revision: 99 }).revision, 5);
});

test("an explicit interface focus cannot hide a selected element elsewhere in the building", () => {
  const facade = storyReducer(INITIAL_STORY_SELECTION, { type: "inspect", elementId: "ARC-087", revision: 2 });
  assert.equal(facade.modelView, "building");
  const next = storyReducer(facade, { type: "chapter", chapter: 4 });
  assert.equal(next.selectedElementId, "ARC-087");
  assert.equal(next.modelView, "building");
  const interfaceView = storyReducer(next, { type: "view", view: "interface" });
  assert.equal(interfaceView.selectedElementId, null);
  assert.equal(interfaceView.revision, 2);
});
