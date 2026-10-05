// Optional browser regression suite: Playwright is a QA tool, not an app dependency.
// PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node test/model-browser-qa.mjs
// Add EDGE_CDP_URL=http://127.0.0.1:9224 to test a normally-launched native Edge.
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const { chromium, webkit } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=process.env.QA_OUTPUT_DIR || join(tmpdir(),'bimspect-model-qa')+'/'; fs.mkdirSync(root,{recursive:true}); const results=[];
for (const engine of ['chrome','webkit', ...(process.env.EDGE_CDP_URL ? ['edge'] : [])]) {
 const browser=engine==='edge'?await chromium.connectOverCDP(process.env.EDGE_CDP_URL,{noDefaults:true}):engine==='chrome'?await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}):await webkit.launch({headless:true});
 for(const [width,height] of (engine === "edge" ? [[1440,900]] : [[1440,900],[390,844],[430,932]])) {
  const errors=[], warnings=[], page=engine==='edge'?await browser.contexts()[0].newPage():await browser.newPage({viewport:{width,height},hasTouch:width<600,isMobile:width<600});
  if(engine==='edge'){await page.setViewportSize({width,height});await page.bringToFront();const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setFocusEmulationEnabled',{enabled:true})}
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(['warning','error'].includes(m.type()))warnings.push(m.text())});
  await page.goto(process.env.BASE_URL || 'http://localhost:3000'); await page.locator('[data-scene-ready="true"]').waitFor({timeout:20000});
  const hero=page.locator('[data-scene-ready]'), heroFrames=[];
  if(width>=1000){
   for(const p of [0,.31,.5,.73,.95]) {
    await page.evaluate(p=>scrollTo({top:60+innerHeight*2.2*p,behavior:'instant'}),p); await page.waitForTimeout(900);
    const data=await hero.evaluate(el=>({...el.dataset,version:getComputedStyle(el).getPropertyValue('--version-progress'),reveal:getComputedStyle(el).getPropertyValue('--reveal')}));
    heroFrames.push({at:p,...data}); await page.screenshot({path:`${root}after-${engine}-${width}-hero-${p}.png`});
   }
   assert.equal(heroFrames[1].version,'0');assert.equal(heroFrames[1].reveal,'0');assert.equal(heroFrames[3].version,'1');assert.equal(heroFrames[3].reveal,'1');assert.equal(heroFrames[1].modelProgress,'0.000');assert.equal(heroFrames[1].heroStage,'version-a');assert.equal(heroFrames[3].modelProgress,'1.000');assert.equal(heroFrames[3].heroStage,'comparison');
   assert.equal(await page.locator('.pin-spacer').count(),1);
  }else {
   assert.equal(await page.locator('.pin-spacer').count(),0);
   await page.locator('[data-bim-viewport]').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-(innerHeight-el.clientHeight)/2,behavior:'instant'}));
   const begin=Date.now();
   for(const target of [250,600,1300,2000,3900]) {
    await page.waitForTimeout(Math.max(0,target-(Date.now()-begin)));
    heroFrames.push({at:Date.now()-begin,...await hero.evaluate(el=>({...el.dataset}))});
    await page.screenshot({path:`${root}after-${engine}-${width}-hero-${target}.png`});
   }
   assert.equal(heroFrames[0].modelProgress,'0.000');assert.equal(heroFrames.at(-1).modelProgress,'1.000');assert.equal(heroFrames.at(-1).heroStage,'comparison');
  }
  const models=[];
  for(const name of ['plumbing','electrical']) {
   const model=page.locator(`[data-discipline-model=${name}]`);
   await model.locator('[data-model-viewport]').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-(innerHeight-el.clientHeight)/2,behavior:'instant'}));
   await model.locator(':scope[data-model-ready="true"]').waitFor({timeout:20000});
   const frames=[],begin=Date.now();
   for(const target of [250,750,1400,2400,3700]) {
    await page.waitForTimeout(Math.max(0,target-(Date.now()-begin)));
    frames.push({at:Date.now()-begin,...await model.evaluate(el=>({...el.dataset,annotation:getComputedStyle(el).getPropertyValue('--annotation')}))});
    await page.screenshot({path:`${root}after-${engine}-${width}-${name}-${target}.png`});
   }
   assert.equal(frames[0].annotation,'0');assert.equal(frames[0].modelProgress,'0.000');assert.equal(frames.at(-1).modelProgress,'1.000');assert.equal(frames.at(-1).modelState,'comparison');assert.equal(frames.at(-1).annotation,'1');
   models.push({name,frames});
  }
  assert.equal(errors.length,0,JSON.stringify(errors));
  const unexpected=warnings.filter(s=>!s.includes('THREE.Clock: This module has been deprecated'));
  assert.equal(unexpected.length,0,JSON.stringify(unexpected));
  const dpr=await page.locator('canvas').evaluateAll(list=>list.map(c=>({width:c.width,clientWidth:c.clientWidth,dpr:c.width/c.clientWidth})));
  if(width<600)for(const c of dpr)assert.ok(Math.abs(c.dpr-1)<.02);
  results.push({engine,width,height,heroFrames,models,dpr,errors,warnings});console.log(`PASS ${engine} ${width}×${height}`);
  await page.close();
 }
 await browser.close();
}
fs.writeFileSync(root+'qa.json',JSON.stringify(results,null,2));
