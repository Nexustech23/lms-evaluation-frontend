import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const source = fs.readFileSync(new URL("../src/lib/pollBackoff.js", import.meta.url), "utf8");
const { startRecoverablePolling } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

function harness(request) {
  const timers = [];
  const progress = [], done = [], errors = [], reconnects = [];
  const cancel = startRecoverablePolling({ request, onProgress: (v) => progress.push(v),
    onDone: (v) => done.push(v), onError: (v) => errors.push(v), onReconnect: () => reconnects.push(true),
    schedule: (fn, delay) => { const t = { fn, delay }; timers.push(t); return t; },
    unschedule: (timer) => { const i = timers.indexOf(timer); if (i >= 0) timers.splice(i, 1); } });
  return { timers, done, errors, progress, reconnects, cancel,
    tick: async () => { const t = timers.shift(); assert.ok(t); await t.fn(); } };
}

for (const status of [null, 408, 429, 503]) {
  test(`transient ${status ?? "network"} error reconnects to same job and completes`, async () => {
    let calls = 0;
    const h = harness(async () => {
      calls++;
      if (calls === 1) throw status ? { response: { status } } : new Error("offline");
      return { status: "done", result: { success: true } };
    });
    await h.tick();
    assert.equal(h.errors.length, 0); assert.equal(h.reconnects.length, 1);
    await h.tick();
    assert.equal(h.done.length, 1); assert.equal(h.timers.length, 0);
  });
}
for (const status of [401, 403, 404]) {
  test(`permanent ${status} stops status checks`, async () => {
    const h = harness(async () => { throw { response: { status } }; });
    await h.tick(); assert.equal(h.errors.length, 1); assert.equal(h.timers.length, 0);
  });
}
test("failed generation returned as HTTP 500 is terminal", async () => {
  const h = harness(async () => { throw { response: { status: 500, data: { status: "failed" } } }; });
  await h.tick(); assert.equal(h.errors.length, 1); assert.equal(h.timers.length, 0);
});
test("queued then processing then done uses bounded backoff", async () => {
  const states = ["queued", "processing", "done"];
  const h = harness(async () => ({ status: states.shift() }));
  assert.equal(h.timers[0].delay, 1500);
  await h.tick(); assert.equal(h.timers[0].delay, 2250);
  await h.tick(); await h.tick();
  assert.equal(h.progress.length, 2); assert.equal(h.done.length, 1);
});
test("cancel before tick prevents any request", () => {
  const h = harness(async () => assert.fail("request after unmount"));
  h.cancel(); assert.equal(h.timers.length, 0);
});
test("unmount during request aborts it and ignores late success", async () => {
  let finish, signal;
  const h = harness((s) => { signal = s; return new Promise((resolve) => { finish = resolve; }); });
  const pending = h.tick(); h.cancel();
  assert.equal(signal.aborted, true);
  finish({ status: "done" }); await pending;
  assert.equal(h.done.length, 0); assert.equal(h.timers.length, 0);
});
