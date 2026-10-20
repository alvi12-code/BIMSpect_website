import assert from "node:assert/strict";
import test from "node:test";
import {
  STORY_ELEMENTS,
  STORY_EVENTS,
  STORY_RELEASES,
  STORY_SELECTED_ELEMENT,
  clampStoryRevision,
  getStoryElements,
  getStoryEvents,
  getStorySummary,
} from "../components/design-story/story-data.ts";

test("the six-release example keeps twelve stable element identities and valid change references", () => {
  assert.equal(STORY_RELEASES.length, 6);
  assert.equal(new Set(STORY_RELEASES.map((release) => release.id)).size, 6);
  const ids = STORY_ELEMENTS.map((element) => element.id).sort();
  assert.equal(ids.length, 12);
  assert.equal(new Set(ids).size, 12);
  assert.ok(ids.includes(STORY_SELECTED_ELEMENT));

  for (let revision = 0; revision < STORY_RELEASES.length; revision++) {
    assert.deepEqual(getStoryElements(revision).map((element) => element.id).sort(), ids);
  }

  const elementRevisions = new Set<string>();
  for (const event of STORY_EVENTS) {
    assert.ok(ids.includes(event.elementId), `Unknown element ${event.elementId}`);
    assert.ok(Number.isInteger(event.revision) && event.revision > 0 && event.revision < STORY_RELEASES.length);
    const key = `${event.elementId}:${event.revision}`;
    assert.equal(elementRevisions.has(key), false, `${key} must not count the same changed revision twice`);
    elementRevisions.add(key);
  }
});

test("the selected route applies only transforms recorded through the chosen revision", () => {
  const expected = [
    { position: [3.35, 3.15, 2.45], size: [4.6, 0.22, 0.3] },
    { position: [3.35, 3.15, 2.8], size: [4.6, 0.22, 0.3] },
    { position: [3.35, 3.15, 2.8], size: [4.6, 0.3, 0.38] },
    { position: [3.35, 2.99, 2.8], size: [4.6, 0.3, 0.38] },
    { position: [3.35, 2.99, 2.8], size: [4.6, 0.3, 0.38] },
    { position: [3.35, 2.99, 3.15], size: [4.6, 0.3, 0.38] },
  ];

  // Seeking backwards must reconstruct that revision without leaking later changes.
  for (const revision of [5, 0, 3, 1, 4, 2]) {
    const route = getStoryElements(revision).find((element) => element.id === STORY_SELECTED_ELEMENT);
    assert.ok(route);
    assert.deepEqual(route.position, expected[revision].position, `Route position in R0${revision + 1}`);
    assert.deepEqual(route.size, expected[revision].size, `Route size in R0${revision + 1}`);
    assert.equal(route.revisionCount, revision);
  }
});

test("chapter counts and discipline plots agree with recorded events and highlighted elements", () => {
  const expected = [
    { events: 0, changedNow: 0, repeated: 0, unchanged: 12, disciplines: [0, 0, 0] },
    { events: 5, changedNow: 5, repeated: 0, unchanged: 7, disciplines: [2, 1, 2] },
    { events: 10, changedNow: 5, repeated: 2, unchanged: 4, disciplines: [4, 3, 3] },
    { events: 14, changedNow: 4, repeated: 3, unchanged: 3, disciplines: [5, 4, 5] },
    { events: 16, changedNow: 2, repeated: 3, unchanged: 2, disciplines: [6, 4, 6] },
    { events: 18, changedNow: 2, repeated: 3, unchanged: 2, disciplines: [6, 5, 7] },
  ];

  for (let revision = 0; revision < expected.length; revision++) {
    const summary = getStorySummary(revision);
    const elements = getStoryElements(revision);
    const recorded = STORY_EVENTS.filter((event) => event.revision <= revision);
    const currentIds = [...new Set(recorded.filter((event) => event.revision === revision).map((event) => event.elementId))].sort();
    const highlightedIds = elements.filter((element) => element.changedNow).map((element) => element.id).sort();

    assert.deepEqual(
      { ...summary, disciplines: summary.disciplines.map((discipline) => discipline.events) },
      expected[revision],
      `Summary in R0${revision + 1}`,
    );
    assert.deepEqual(getStoryEvents(revision), recorded);
    assert.equal(summary.events, recorded.length);
    assert.deepEqual(highlightedIds, currentIds);
    assert.equal(summary.changedNow, currentIds.length);
    assert.deepEqual(summary.disciplines.map((entry) => entry.discipline), ["ARC", "STR", "MEP"]);
    assert.equal(summary.disciplines.reduce((total, entry) => total + entry.events, 0), summary.events);
  }
});

test("the initial release is a baseline with no changes, repeated elements or active highlights", () => {
  assert.deepEqual(getStoryEvents(0), []);
  const baseline = getStoryElements(0);
  assert.deepEqual(baseline.map(({ revisionCount, changedNow, ...element }) => {
    assert.equal(revisionCount, 0);
    assert.equal(changedNow, false);
    return element;
  }), STORY_ELEMENTS);
  assert.equal(getStorySummary(0).unchanged, 12);
});

test("repeated means more than one changed revision, not simply a change in the current release", () => {
  const repeatedIds = (revision: number) => getStoryElements(revision)
    .filter((element) => element.revisionCount > 1)
    .map((element) => element.id)
    .sort();

  assert.deepEqual(repeatedIds(1), []);
  assert.deepEqual(repeatedIds(2), ["ARC-112", "MEP-041"]);
  assert.deepEqual(repeatedIds(5), ["ARC-112", "MEP-041", "STR-028"]);
  const latest = getStoryElements(5);
  const partition = latest.find((element) => element.id === "ARC-112");
  assert.ok(partition);
  assert.equal(partition.revisionCount, 3);
  assert.equal(partition.changedNow, false);
  assert.equal(getStorySummary(5).repeated, 3);
  assert.equal(getStorySummary(5).changedNow, 2);
});

test("information changes count and highlight the element without moving or resizing it", () => {
  const informationEvents = STORY_EVENTS.filter((event) => event.kind === "information");
  assert.equal(informationEvents.length, 5);

  for (const event of informationEvents) {
    const before = getStoryElements(event.revision - 1).find((element) => element.id === event.elementId);
    const after = getStoryElements(event.revision).find((element) => element.id === event.elementId);
    assert.ok(before && after);
    assert.deepEqual(after.position, before.position, `${event.elementId} information change position`);
    assert.deepEqual(after.size, before.size, `${event.elementId} information change size`);
    assert.equal(after.revisionCount, before.revisionCount + 1);
    assert.equal(after.changedNow, true);
    assert.ok(getStoryEvents(event.revision).includes(event));
  }
});

test("seeking and reading summaries preserves the seed and returns independent model transforms", () => {
  const seedBefore = structuredClone(STORY_ELEMENTS);
  const eventsBefore = structuredClone(STORY_EVENTS);
  const releasesBefore = structuredClone(STORY_RELEASES);

  for (const revision of [5, 1, 0, 4, 2, 5, 3]) {
    getStoryElements(revision);
    getStoryEvents(revision);
    getStorySummary(revision);
  }
  assert.deepEqual(STORY_ELEMENTS, seedBefore);
  assert.deepEqual(STORY_EVENTS, eventsBefore);
  assert.deepEqual(STORY_RELEASES, releasesBefore);

  const returnedModel = getStoryElements(5);
  const expectedModel = structuredClone(returnedModel);
  for (const element of returnedModel) {
    element.position[0] = 999;
    element.size[0] = 999;
  }
  assert.deepEqual(getStoryElements(5), expectedModel);
  assert.deepEqual(STORY_ELEMENTS, seedBefore);
  assert.deepEqual(STORY_EVENTS, eventsBefore);
});

test("invalid revision inputs resolve consistently to a safe release", () => {
  const cases = [
    { input: -10, expected: 0 },
    { input: -0.5, expected: 0 },
    { input: 2.9, expected: 2 },
    { input: 5, expected: 5 },
    { input: 99, expected: 5 },
    { input: Number.NaN, expected: 0 },
    { input: Number.POSITIVE_INFINITY, expected: 0 },
    { input: Number.NEGATIVE_INFINITY, expected: 0 },
  ];
  for (const { input, expected } of cases) {
    assert.equal(clampStoryRevision(input), expected, String(input));
    assert.deepEqual(getStoryElements(input), getStoryElements(expected));
    assert.deepEqual(getStoryEvents(input), getStoryEvents(expected));
    assert.deepEqual(getStorySummary(input), getStorySummary(expected));
  }
});
