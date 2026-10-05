import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { HERO_TIMING, SECONDARY_SECONDS, heroStage, createModelReveal, FINAL_COMPARISON } from "../components/models/comparison-motion.ts";
import { CHANGE_PALETTE } from "../components/models/change-palette.ts";
const source = async (path: string) => readFile(new URL(`../components/${path}`, import.meta.url), "utf8");

test("four hero stages leave 40% stable before geometry and 35% after", () => {
  assert.equal(HERO_TIMING.scrollVh, 220);
  assert.equal(heroStage(0), "normal");
  assert.equal(heroStage(0.219), "normal");
  assert.equal(heroStage(0.22), "version-a");
  assert.equal(heroStage(0.399), "version-a");
  assert.equal(heroStage(0.4), "transition");
  assert.equal(heroStage(0.649), "transition");
  assert.equal(heroStage(0.65), "comparison");
  assert.equal(heroStage(1), "comparison");
  assert.equal(SECONDARY_SECONDS, 3.2);
});

test("revision channels are independent and final comparison has no idle emphasis", () => {
  const a = createModelReveal(), b = createModelReveal();
  a.ghost = 1;
  assert.equal(a.progress, 0);
  assert.equal(b.ghost, 0);
  assert.deepEqual(FINAL_COMPARISON, { progress: 1, ghost: 1, highlight: 1, added: 1, emphasis: 0 });
});

test("shared semantic colors use red, cyan and amber with non-color edges", async () => {
  assert.equal(CHANGE_PALETTE.changed, "#ff3b30");
  assert.equal(CHANGE_PALETTE.added, "#00aeef");
  assert.equal(CHANGE_PALETTE.removed, "#ff9500");
  const edges = await source("models/ComparisonEdges.tsx");
  assert.match(edges, /lineDashedMaterial/);
  assert.match(edges, /kind === "removed" \? 0.12/);
  assert.match(edges, /geometry.dispose/);
});

test("automatic stories observe actual viewport, pause, resume and fully clean up", async () => {
  const lifecycle = await source("models/animation-lifecycle.ts");
  assert.match(lifecycle, /intersectionRatio >= 0.45/);
  assert.match(lifecycle, /qualified && !document.hidden/);
  assert.match(lifecycle, /timeline.resume\(\)/);
  assert.match(lifecycle, /timeline.pause\(\)/);
  assert.match(lifecycle, /observer.disconnect\(\)/);
  assert.match(lifecycle, /removeEventListener\("visibilitychange"/);
  assert.match(lifecycle, /timeline.kill\(\)/);
  const refresh = await source("models/useSceneLayoutRefresh.ts");
  assert.match(refresh, /document.fonts\?\.ready/);
  assert.match(refresh, /ScrollTrigger.refresh\(true\)/);
  assert.match(refresh, /120/);
  assert.match(refresh, /cancelAnimationFrame/);
  const secondary = await source("models/useModelScrollReveal.ts");
  for (const marker of ["0.5", "1.1", "1.7", "2.2"]) assert.ok(secondary.includes(marker));
  assert.doesNotMatch(secondary, /scrub:|pin:/);
});

test("touch budget and reduced-motion cameras do not depend on desktop width alone", async () => {
  const budget = await source("models/useRenderBudget.ts");
  assert.match(budget, /pointer: coarse/);
  assert.match(budget, /hover: none/);
  for (const file of ["hero/BimScene.tsx", "models/ModelCanvas.tsx"]) {
    const scene = await source(file);
    assert.match(scene, /compact \? 1 : \[1, 1.5\]/);
    assert.match(scene, /reduced \? 0/);
    assert.match(scene, /frameloop="demand"/);
    // R3F renders its Canvas fallback as DOM canvas children even on healthy GL.
    assert.doesNotMatch(scene, /fallback=\{<SceneUnavailable/);
    assert.doesNotMatch(scene, /EffectComposer|SSAO|Bloom/);
  }
});


test("HTML story channels cannot be reinitialized from pin-cached CSS snapshots", async () => {
  for (const file of ["hero/useHeroAnimation.ts", "models/useModelScrollReveal.ts"]) {
    const hook = await source(file);
    assert.match(hook, /Object.entries\(ui\)/);
    assert.match(hook, /\.to\(ui, /);
    assert.doesNotMatch(hook, /\.to\(element, /);
    assert.match(hook, /revision !== lastRevision/);
  }
  const css = await source("hero/hero.module.css");
  assert.match(css, /--reveal: 1/);
  assert.match(css, /--scene-opacity: 1/);
  const secondary = await source("models/models.module.css");
  assert.match(secondary, /--annotation: 1/);
});
