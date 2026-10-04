import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { CHANGE, FLOOR_HEIGHT, STOREYS, makeBuilding } from "../components/hero/bim-geometry.ts";
import { changeProgress, smoothRange } from "../components/hero/hero-motion.ts";

test("architectural office has five storeys, a three-storey wing and no MEP batches", () => {
  const model = makeBuilding();
  assert.equal(STOREYS, 5);
  assert.equal(model.slabs.filter(p => p.position[0] === -2.5).length, 6);
  assert.equal(model.slabs.filter(p => p.position[0] === 6).length, 4);
  assert.equal(Math.max(...model.slabs.map(p => p.position[1])), FLOOR_HEIGHT * 5);
  for (const key of ["walls", "columns", "core", "glass"]) assert.ok(key in model);
  for (const key of ["hvac", "plumbing", "electrical", "beams", "plant"]) assert.ok(!(key in model));
});

test("six visible architectural changes match the sample statistics", () => {
  const model = makeBuilding();
  assert.deepEqual(model.changes.map(c => c.name), ["wall", "window", "door", "partition", "facade", "canopy"]);
  assert.equal(model.changes.filter(c => c.kind === "added").length, 2);
  assert.equal(model.changes.filter(c => c.kind === "changed").length, 3);
  assert.equal(model.changes.filter(c => c.kind === "removed").length, 1);
  const wall = model.changes[0];
  assert.ok(Math.abs(wall.after[0].position[0] - wall.before[0].position[0] - CHANGE.wallDisplacement) < 1e-8);
  assert.ok(model.changes[1].after[0].size[0] > model.changes[1].before[0].size[0]);
});

test("architecture is finite, bounded and cheaper on mobile without losing the comparison", () => {
  for (const mobile of [false, true]) {
    const { changes, ...batches } = makeBuilding(mobile);
    const parts = [...Object.values(batches).flat(), ...changes.flatMap(c => [...c.before, ...c.after])];
    assert.ok(parts.length < 180);
    for (const p of parts) {
      assert.ok(p.position.every(Number.isFinite));
      assert.ok(p.size.every(value => Number.isFinite(value) && value > 0));
    }
  }
  assert.ok(makeBuilding(true).details.length < makeBuilding().details.length);
  assert.deepEqual(makeBuilding(true).changes, makeBuilding().changes);
});

test("hero changes reveal monotonically in a three-stage story", () => {
  assert.equal(changeProgress(0), 0);
  assert.equal(changeProgress(0.2), 0);
  assert.equal(changeProgress(0.49), 1);
  assert.equal(changeProgress(1), 1);
  for (let i = 0; i <= 100; i++) assert.ok(changeProgress(i / 100) <= changeProgress((i + 1) / 100));
  assert.equal(smoothRange(0.5, 0, 1), 0.5);
});

test("only hero pins, for 140vh, and there is no idle render/rotation loop", async () => {
  const hook = await readFile(new URL("../components/hero/useHeroAnimation.ts", import.meta.url), "utf8");
  assert.match(hook, /innerHeight \* 1\.4/);
  assert.match(hook, /pin: desktop/);
  const scene = await readFile(new URL("../components/hero/BimScene.tsx", import.meta.url), "utf8");
  const building = await readFile(new URL("../components/hero/BimBuilding.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(building, /elapsedTime|rotation\.y|gridHelper|CylinderGeometry/);
  assert.doesNotMatch(scene, /if \(active && !reduced\) invalidate/);
});
