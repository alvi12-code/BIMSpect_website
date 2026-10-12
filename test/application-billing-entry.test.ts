import test from "node:test";
import assert from "node:assert/strict";
import { applicationPurchaseEntry, marketingPurchaseAction } from "../lib/payment/application-entry.ts";
const env = { CHECKOUT_ENABLED: "true", PAYMENT_PROVIDER: "bimspect", BIMSPECT_APP_ORIGIN: "https://app.bimspect.com", NODE_ENV: "production" };
test("marketing purchases go directly to lightweight auth/purchase, never billing", () => {
  assert.equal(applicationPurchaseEntry(env,"individual"),"https://app.bimspect.com/purchase/individual");
  assert.equal(applicationPurchaseEntry(env,"project"),"https://app.bimspect.com/purchase/project");
  assert.deepEqual(marketingPurchaseAction(env,"Individual"),{href:"https://app.bimspect.com/purchase/individual",label:"Get started",offerId:"individual"});
  assert.deepEqual(marketingPurchaseAction(env,"Project"),{href:"https://app.bimspect.com/purchase/project",label:"Buy Project",offerId:"project"});
});
test("Enterprise always uses contact sales, including disabled checkout", () => {
  assert.deepEqual(marketingPurchaseAction(env,"Enterprise"),{href:"#contact",label:"Contact sales"});
  assert.deepEqual(marketingPurchaseAction({...env,CHECKOUT_ENABLED:"false"},"Enterprise"),{href:"#contact",label:"Contact sales"});
});
test("disabled and unsafe configuration fail closed without preserving price/payment input", () => {
  for (const patch of [{CHECKOUT_ENABLED:"false"},{PAYMENT_PROVIDER:"mock"},{BIMSPECT_APP_ORIGIN:""},{BIMSPECT_APP_ORIGIN:"http://app.bimspect.com"},{BIMSPECT_APP_ORIGIN:"https://user:secret@app.bimspect.com"},{BIMSPECT_APP_ORIGIN:"https://app.bimspect.com/path"},{BIMSPECT_APP_ORIGIN:"https://app.bimspect.com?price=price_evil"}]) assert.equal(applicationPurchaseEntry({...env,...patch},"individual"),null);
  assert.equal(applicationPurchaseEntry(env,"enterprise" as "individual"),null);
});
test("production-style local Docker requires explicit loopback-only sandbox preview", () => {
  assert.equal(applicationPurchaseEntry({...env,BIMSPECT_APP_ORIGIN:"http://localhost:5173"},"project"),null);
  assert.equal(applicationPurchaseEntry({...env,BIMSPECT_APP_ORIGIN:"http://localhost:5173",BIMSPECT_LOCAL_SANDBOX:"true"},"project"),"http://localhost:5173/purchase/project");
  assert.equal(applicationPurchaseEntry({...env,BIMSPECT_APP_ORIGIN:"http://app.bimspect.com",BIMSPECT_LOCAL_SANDBOX:"true"},"project"),null);
});
