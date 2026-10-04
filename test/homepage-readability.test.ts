import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("font aliases resolve on the body where both locale layouts supply next/font variables", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /body\s*\{[\s\S]*?--f-body: var\(--font-dm-sans, system-ui\)/);
  assert.match(css, /body\s*\{[\s\S]*?--f-mono: var\(--font-dm-mono, monospace\)/);
  for (const locale of ["en", "fi"]) {
    const source = await readFile(new URL(`../app/(${locale})/layout.tsx`, import.meta.url), "utf8");
    assert.match(source, /<body className=\{`\$\{dmSans.variable\} \$\{dmMono.variable\}`\}/);
  }
});

test("comparison annotations stay outside WebGL and hero headline transitions cannot overlap", async () => {
  const css = await readFile(new URL("../components/hero/hero.module.css", import.meta.url), "utf8");
  assert.match(css, /opacity: max\(0, calc\(1 - var\(--message\) \* 2\)\)/);
  assert.match(css, /opacity: max\(0, calc\(\(var\(--message\) - 0\.5\) \* 2\)\)/);
  const secondary = await readFile(new URL("../components/models/DisciplineModel.tsx", import.meta.url), "utf8");
  assert.match(secondary, /changes.slice\(0, 2\)/);
  assert.match(secondary, /role="img" aria-label=\{content.sceneDescription\}/);
  assert.match(secondary, /<ul className="sr-only">/);
});
