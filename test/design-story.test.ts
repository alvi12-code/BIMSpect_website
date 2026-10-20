import assert from "node:assert/strict";
import test from "node:test";
import {
  STORY_ELEMENTS,
  STORY_EVENTS,
  STORY_INTERFACE_ELEMENTS,
  STORY_RELEASES,
  STORY_REVIEW,
  STORY_SELECTED_ELEMENT,
  STORY_SOURCES,
  clampStoryRevision,
  getStoryElementHistory,
  getStoryElementProperties,
  getStoryElements,
  getStoryEvent,
  getStoryEvents,
  getStoryReview,
  getStorySummary,
} from "../components/design-story/story-data.ts";

test("the six-release example keeps twelve stable element identities and valid change references", () => {
  assert.equal(STORY_RELEASES.length, 6);
  assert.equal(new Set(STORY_RELEASES.map((release) => release.id)).size, 6);
  const ids = STORY_ELEMENTS.map((element) => element.id).sort();
  assert.equal(ids.length, 12);
  assert.equal(new Set(ids).size, 12);
  assert.equal(STORY_EVENTS.length, 18);
  assert.ok(ids.includes(STORY_SELECTED_ELEMENT));
  assert.deepEqual(STORY_SOURCES.map((source) => source.discipline), ["ARC", "STR", "MEP"]);
  assert.equal(new Set(STORY_SOURCES.map((source) => source.filePrefix)).size, 3);
  assert.deepEqual(STORY_INTERFACE_ELEMENTS, ["ARC-112", "STR-028", "MEP-041"]);
  assert.deepEqual(STORY_INTERFACE_ELEMENTS.map((id) => STORY_ELEMENTS.find((element) => element.id === id)?.discipline), ["ARC", "STR", "MEP"]);
  for (const element of STORY_ELEMENTS) {
    assert.ok(STORY_SOURCES.some((source) => source.discipline === element.discipline));
  }

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
    { events: 0, uniqueChanged: 0, changedNow: 0, repeated: 0, unchanged: 12, disciplines: [0, 0, 0] },
    { events: 5, uniqueChanged: 5, changedNow: 5, repeated: 0, unchanged: 7, disciplines: [2, 1, 2] },
    { events: 10, uniqueChanged: 8, changedNow: 5, repeated: 2, unchanged: 4, disciplines: [4, 3, 3] },
    { events: 14, uniqueChanged: 9, changedNow: 4, repeated: 3, unchanged: 3, disciplines: [5, 4, 5] },
    { events: 16, uniqueChanged: 10, changedNow: 2, repeated: 3, unchanged: 2, disciplines: [6, 4, 6] },
    { events: 18, uniqueChanged: 10, changedNow: 2, repeated: 3, unchanged: 2, disciplines: [6, 5, 7] },
  ];

  for (let revision = 0; revision < expected.length; revision++) {
    const summary = getStorySummary(revision);
    const elements = getStoryElements(revision);
    const recorded = STORY_EVENTS.filter((event) => event.revision <= revision);
    const currentIds = [...new Set(recorded.filter((event) => event.revision === revision).map((event) => event.elementId))].sort();
    const highlightedIds = elements.filter((element) => element.changedNow).map((element) => element.id).sort();

    assert.deepEqual(
      { ...summary, disciplines: summary.disciplines.map((discipline) => discipline.events) },
      { totalTracked: 12, ...expected[revision] },
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
    assert.deepEqual(getStoryEvent(event.elementId, event.revision), event);
    assert.ok(event.propertyChange, `${event.elementId} must explain its information change`);
  }
});

test("seeking and reading summaries preserves the seed and returns independent model transforms", () => {
  const seedBefore = structuredClone(STORY_ELEMENTS);
  const eventsBefore = structuredClone(STORY_EVENTS);
  const releasesBefore = structuredClone(STORY_RELEASES);
  const sourcesBefore = structuredClone(STORY_SOURCES);
  const reviewBefore = structuredClone(STORY_REVIEW);

  for (const revision of [5, 1, 0, 4, 2, 5, 3]) {
    getStoryElements(revision);
    getStoryEvents(revision);
    getStorySummary(revision);
    getStoryElementHistory(STORY_SELECTED_ELEMENT, revision);
    getStoryElementProperties(STORY_SELECTED_ELEMENT, revision);
    getStoryEvent(STORY_SELECTED_ELEMENT, revision);
    getStoryReview(revision);
  }
  assert.deepEqual(STORY_ELEMENTS, seedBefore);
  assert.deepEqual(STORY_EVENTS, eventsBefore);
  assert.deepEqual(STORY_RELEASES, releasesBefore);

  const returnedModel = getStoryElements(5);
  const expectedModel = structuredClone(returnedModel);
  for (const element of returnedModel) {
    element.position[0] = 999;
    element.size[0] = 999;
    if (element.properties?.[0]) element.properties[0].value = "Changed by a caller";
  }
  assert.deepEqual(getStoryElements(5), expectedModel);

  const returnedEvents = getStoryEvents(5);
  const expectedEvents = structuredClone(returnedEvents);
  const returnedHistory = getStoryElementHistory(STORY_SELECTED_ELEMENT, 5);
  const expectedHistory = structuredClone(returnedHistory);
  const returnedEvent = getStoryEvent(STORY_SELECTED_ELEMENT, 4);
  const expectedEvent = structuredClone(returnedEvent);
  const returnedReview = getStoryReview(5);
  const expectedReview = structuredClone(returnedReview);
  for (const event of [...returnedEvents, ...returnedHistory, ...returnedReview.evidenceEvents, ...returnedReview.laterEvents, ...(returnedEvent ? [returnedEvent] : [])]) {
    event.detail = "Changed by a caller";
    if (event.position) event.position[0] = 999;
    if (event.size) event.size[0] = 999;
    if (event.propertyChange) event.propertyChange.after = "Changed by a caller";
  }
  returnedReview.changedElementIds.length = 0;
  const returnedProperties = getStoryElementProperties(STORY_SELECTED_ELEMENT, 5);
  const expectedProperties = structuredClone(returnedProperties);
  returnedProperties[0].value = "Changed by a caller";

  assert.deepEqual(getStoryEvents(5), expectedEvents);
  assert.deepEqual(getStoryElementHistory(STORY_SELECTED_ELEMENT, 5), expectedHistory);
  assert.deepEqual(getStoryEvent(STORY_SELECTED_ELEMENT, 4), expectedEvent);
  assert.deepEqual(getStoryElementProperties(STORY_SELECTED_ELEMENT, 5), expectedProperties);
  assert.deepEqual(getStoryReview(5), expectedReview);
  assert.deepEqual(STORY_ELEMENTS, seedBefore);
  assert.deepEqual(STORY_EVENTS, eventsBefore);
  assert.deepEqual(STORY_RELEASES, releasesBefore);
  assert.deepEqual(STORY_SOURCES, sourcesBefore);
  assert.deepEqual(STORY_REVIEW, reviewBefore);
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
    assert.deepEqual(getStoryReview(input), getStoryReview(expected));
    for (const { id } of STORY_ELEMENTS) {
      assert.deepEqual(getStoryEvent(id, input), getStoryEvent(id, expected));
      assert.deepEqual(getStoryElementHistory(id, input), getStoryElementHistory(id, expected));
      assert.deepEqual(getStoryElementProperties(id, input), getStoryElementProperties(id, expected));
    }
    for (const { discipline } of STORY_SOURCES) {
      assert.deepEqual(getStorySummary(input, discipline), getStorySummary(expected, discipline));
    }
  }
});

test("exact-release events remain distinct from an element's cumulative history", () => {
  assert.equal(getStoryEvent("ARC-112", 4), undefined, "A past partition change is not a new R05 change");
  assert.deepEqual(getStoryElementHistory("ARC-112", 4).map((event) => event.revision), [1, 2, 3]);
  assert.deepEqual(getStoryElementHistory(STORY_SELECTED_ELEMENT, 5).map((event) => event.kind), ["movement", "geometry", "movement", "information", "movement"]);

  for (const revision of [5, 0, 3, 1, 4, 2]) {
    for (const { id } of STORY_ELEMENTS) {
      const expectedHistory = STORY_EVENTS.filter((event) => event.elementId === id && event.revision <= revision);
      const current = getStoryEvent(id, revision);
      assert.deepEqual(getStoryElementHistory(id, revision), expectedHistory);
      assert.deepEqual(current, expectedHistory.find((event) => event.revision === revision));
      assert.equal(Boolean(current), getStoryElements(revision).find((element) => element.id === id)?.changedNow);
    }
  }
  assert.equal(getStoryEvent("UNKNOWN", 5), undefined);
  assert.deepEqual(getStoryElementHistory("UNKNOWN", 5), []);
  assert.deepEqual(getStoryElementProperties("UNKNOWN", 5), []);
});

test("property evidence matches seed values and reconstructs the selected revision when seeking backwards", () => {
  const informationEvents = STORY_EVENTS.filter((event) => event.kind === "information");
  assert.equal(STORY_EVENTS.filter((event) => event.propertyChange).length, informationEvents.length);

  for (const event of informationEvents) {
    const change = event.propertyChange;
    assert.ok(change);
    assert.notEqual(change.before, change.after);
    const seedProperties = STORY_ELEMENTS.find((element) => element.id === event.elementId)?.properties;
    assert.ok(seedProperties, "Every information change needs baseline properties");
    assert.ok(seedProperties.some((property) => property.key === change.key), "Every information change needs a baseline property");
    assert.equal(new Set(seedProperties.map((property) => property.key)).size, seedProperties.length);

    const before = getStoryElementProperties(event.elementId, event.revision - 1).find((property) => property.key === change.key);
    assert.deepEqual(before, { key: change.key, label: change.label, value: change.before });
    for (const revision of [5, event.revision - 1, event.revision, 0, 5]) {
      const properties = getStoryElementProperties(event.elementId, revision);
      assert.deepEqual(properties.find((property) => property.key === change.key), {
        key: change.key,
        label: change.label,
        value: revision < event.revision ? change.before : change.after,
      });
      assert.deepEqual(getStoryElements(revision).find((element) => element.id === event.elementId)?.properties, properties);
    }
  }
  assert.deepEqual(getStoryElementProperties("ARC-024", 5), []);
});

test("discipline scopes reconcile with the full history without borrowing counts from other models", () => {
  const expectedLatest = {
    ARC: { totalTracked: 5, uniqueChanged: 4, events: 6, changedNow: 0, repeated: 1, unchanged: 1, disciplines: [6, 0, 0] },
    STR: { totalTracked: 4, uniqueChanged: 3, events: 5, changedNow: 1, repeated: 1, unchanged: 1, disciplines: [0, 5, 0] },
    MEP: { totalTracked: 3, uniqueChanged: 3, events: 7, changedNow: 1, repeated: 1, unchanged: 0, disciplines: [0, 0, 7] },
  };
  for (let revision = 0; revision < STORY_RELEASES.length; revision++) {
    const all = getStorySummary(revision);
    assert.deepEqual(getStorySummary(revision, "all"), all);
    const scopes = STORY_SOURCES.map(({ discipline }) => {
      const summary = getStorySummary(revision, discipline);
      const elements = getStoryElements(revision).filter((element) => element.discipline === discipline);
      const ids = new Set(elements.map((element) => element.id));
      const recorded = STORY_EVENTS.filter((event) => event.revision <= revision && ids.has(event.elementId));
      assert.equal(summary.totalTracked, elements.length);
      assert.equal(summary.events, recorded.length);
      assert.equal(summary.uniqueChanged, new Set(recorded.map((event) => event.elementId)).size);
      assert.equal(summary.uniqueChanged + summary.unchanged, summary.totalTracked);
      assert.equal(summary.changedNow, elements.filter((element) => element.changedNow).length);
      assert.equal(summary.disciplines.reduce((total, bucket) => total + bucket.events, 0), summary.events);
      assert.ok(summary.disciplines.every((bucket) => bucket.discipline === discipline || bucket.events === 0));
      if (revision === 5) {
        assert.deepEqual({ ...summary, disciplines: summary.disciplines.map((bucket) => bucket.events) }, expectedLatest[discipline]);
      }
      return summary;
    });
    for (const key of ["totalTracked", "uniqueChanged", "events", "changedNow", "repeated", "unchanged"] as const) {
      assert.equal(scopes.reduce((total, summary) => total + summary[key], 0), all[key], `${key} in R0${revision + 1}`);
    }
  }
});

test("the R04 review freezes its source evidence and flags later changes without changing its open status", () => {
  const eventKeys = (events: typeof STORY_EVENTS) => events.map((event) => `${event.revision}:${event.elementId}`);
  assert.equal(STORY_REVIEW.createdRevision, 3);
  assert.deepEqual(STORY_REVIEW.elementIds, STORY_INTERFACE_ELEMENTS);

  for (const revision of [0, 1, 2]) {
    assert.deepEqual(getStoryReview(revision), { available: false, evidenceEvents: [], laterEvents: [], changedElementIds: [] });
  }

  const created = getStoryReview(3);
  assert.equal(created.available, true);
  assert.deepEqual(eventKeys(created.evidenceEvents), [
    "1:MEP-041", "1:ARC-112",
    "2:MEP-041", "2:ARC-112", "2:STR-028",
    "3:MEP-041", "3:ARC-112", "3:STR-028",
  ]);
  assert.deepEqual(created.laterEvents, []);
  assert.deepEqual(created.changedElementIds, []);

  const following = getStoryReview(4);
  assert.deepEqual(following.evidenceEvents, created.evidenceEvents);
  assert.deepEqual(eventKeys(following.laterEvents), ["4:MEP-041"]);
  assert.deepEqual(following.changedElementIds, ["MEP-041"]);

  const latest = getStoryReview(5);
  assert.deepEqual(latest.evidenceEvents, created.evidenceEvents);
  assert.deepEqual(eventKeys(latest.laterEvents), ["4:MEP-041", "5:MEP-041", "5:STR-028"]);
  assert.deepEqual(latest.changedElementIds, ["STR-028", "MEP-041"]);
  for (const revision of [5, 3, 4, 2, 5]) {
    getStoryReview(revision);
    assert.equal(STORY_REVIEW.status, "Open", "Later model changes do not decide the review status");
  }
  assert.deepEqual(getStoryReview(3), created, "Seeking back must remove later evidence flags");
  assert.deepEqual(getStoryReview(4), following);
});
