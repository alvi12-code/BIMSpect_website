import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { makeDisciplineGeometry, pipePath } from "../components/models/model-geometry.ts";
import { homeContent } from "../content/home.ts";
const disciplines = ["plumbing", "electrical"] as const;
const directory = new URL("../components/models/", import.meta.url);

test("service examples have three meaningful changes with valid bounded instances", () => {
  for (const discipline of disciplines) for (const mobile of [true, false]) {
    const model = makeDisciplineGeometry(discipline, mobile);
    assert.equal(model.changes.length, 3);
    assert.equal(model.changes.filter(c => c.kind === "added").length, 1);
    assert.equal(model.changes.filter(c => c.kind === "changed").length, 2);
    const parts = [...model.normal, ...model.context, ...model.revisedContext, ...model.fixtures,
      ...model.changes.flatMap(c => [...c.before, ...c.after])];
    assert.ok(parts.length < 150);
    for (const p of parts) {
      assert.ok(p.size.every(v => Number.isFinite(v) && v > 0));
      assert.ok(p.position.every(Number.isFinite));
      assert.ok((p.rotation ?? []).every(Number.isFinite));
    }
    for (const c of model.changes) {
      if (c.kind === "added") assert.equal(c.before.length, 0);
      if (c.kind === "changed") assert.notDeepEqual(c.before, c.after);
    }
  }
});

test("rooms have opaque spatial context, real shaft openings and supported services", () => {
  for (const discipline of disciplines) {
    const model = makeDisciplineGeometry(discipline, false);
    assert.ok(model.context.filter(p => p.size[1] >= 3).length >= 4, "walls and columns");
    assert.ok(model.fixtures.length >= 9, "equipment and supports");
    const slabs = model.context.filter(p => p.position[1] < 0);
    for (const slab of slabs) assert.ok(!(Math.abs(slab.position[0] + 2.15) < slab.size[0] / 2 && Math.abs(slab.position[2] + 1.25) < slab.size[2] / 2), "shaft stays open");
    const desktop = model, mobile = makeDisciplineGeometry(discipline, true);
    assert.ok(mobile.fixtures.length < desktop.fixtures.length || mobile.changes[0].after.length < desktop.changes[0].after.length);
  }
  const model = makeDisciplineGeometry("plumbing", false);
  assert.ok(Math.abs(model.changes[0].after[0].position[0] - model.changes[0].before[0].position[0] - 0.4) < 1e-8);
  assert.ok(makeDisciplineGeometry("electrical", false).revisedContext.length > 0);
});

test("pipe cylinder Euler rotations really connect the requested centerline endpoints", () => {
  const points: [number, number, number][] = [[0, 0, 0], [3, 0, 0], [3, 0, 2], [3, 4, 2], [4, 5, 3]];
  pipePath(points).forEach((p, i) => {
    const [rx, , rz] = p.rotation!, length = p.size[1];
    // Unit Y transformed by the renderer's default XYZ Euler convention.
    const vector = [-Math.sin(rz), Math.cos(rz) * Math.cos(rx), Math.cos(rz) * Math.sin(rx)];
    for (let axis = 0; axis < 3; axis++) {
      assert.ok(Math.abs(p.position[axis] - vector[axis] * length / 2 - points[i][axis]) < 1e-8);
      assert.ok(Math.abs(p.position[axis] + vector[axis] * length / 2 - points[i + 1][axis]) < 1e-8);
    }
  });
});

test("secondary scenes share native ScrollTrigger without buttons, pins or idle loops", async () => {
  const files = await readdir(directory);
  assert.ok(!files.includes("ChangeToggle.tsx"));
  const hook = await readFile(new URL("useModelScrollReveal.ts", directory), "utf8");
  assert.match(hook, /ScrollTrigger/);
  assert.match(hook, /prefers-reduced-motion/);
  assert.match(hook, /once: Boolean\(mobile\)/);
  assert.doesNotMatch(hook, /pin:|scrollTo\(|Lenis/);
  const source = await readFile(new URL("DisciplineModel.tsx", directory), "utf8");
  assert.match(source, /ssr: false/);
  assert.match(source, /IntersectionObserver/);
  assert.match(source, /loaded && !failed/);
  assert.match(source, /visibilitychange/);
  assert.doesNotMatch(source, /<button|onToggle|pointermove/);
  const canvas = await readFile(new URL("ModelCanvas.tsx", directory), "utf8");
  assert.match(canvas, /frameloop="demand"/);
  assert.doesNotMatch(canvas, /elapsedTime|gridHelper|wireframe|if \(active && !reduced\)/);
});

test("exactly three experiences are distributed through retained homepage content", async () => {
  const source = await readFile(new URL("../components/home/HomePage.tsx", import.meta.url), "utf8");
  assert.equal((source.match(/<BimspectHero\b/g) ?? []).length, 1);
  assert.equal((source.match(/<DisciplineModel\b/g) ?? []).length, 2);
  assert.doesNotMatch(source, /discipline="architecture"/);
  for (const discipline of disciplines) assert.equal((source.match(new RegExp(`discipline="${discipline}"`, "g")) ?? []).length, 1);
  assert.ok(source.indexOf('aria-labelledby="focus-title"') < source.indexOf('discipline="plumbing"'));
  assert.ok(source.indexOf('discipline="plumbing"') < source.indexOf('id="workflow"'));
  assert.ok(source.indexOf('id="analytics"') < source.indexOf('discipline="electrical"'));
  assert.ok(source.indexOf('discipline="electrical"') < source.indexOf('id="sample-report"'));
  assert.match(source, /bimspect-discipline-analytics-dashboard\.png/);
});

test("both languages describe the same service changes without click instructions", () => {
  for (const locale of ["en", "fi"] as const) for (const discipline of disciplines) {
    const content = homeContent[locale].disciplineModels[discipline];
    assert.equal(content.changes.length, 3);
    assert.ok(content.sceneDescription.length > 100);
    assert.ok(content.environment.length > 10);
    assert.notEqual(content.title, homeContent[locale === "en" ? "fi" : "en"].disciplineModels[discipline].title);
    assert.doesNotMatch(content.sceneDescription, /toggle|painike|click/i);
  }
  assert.equal(homeContent.fi.disciplineModels.controls.changesState, "Versio B");
  assert.equal(homeContent.en.disciplineModels.controls.changesState, "Version B");
});
