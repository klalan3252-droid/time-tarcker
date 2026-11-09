const test = require('node:test');
const assert = require('node:assert');
const S = require('../src/storage.js');

function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; },
  };
}

test('loadEntries returns [] when nothing stored', () => {
  assert.deepStrictEqual(S.loadEntries(fakeStorage()), []);
});

test('saveEntries / loadEntries round-trip', () => {
  const st = fakeStorage();
  const entries = [{ id: 'a', description: 'x', startedAt: 1, endedAt: 2 }];
  S.saveEntries(st, entries);
  assert.ok(Object.keys(st.data).length >= 1);
  assert.deepStrictEqual(S.loadEntries(st), entries);
});

test('loadEntries tolerates corrupt JSON and wrong shapes', () => {
  const st = fakeStorage();
  S.saveEntries(st, [{ id: 'a', description: '', startedAt: 1, endedAt: 2 }]);
  const key = Object.keys(st.data)[0];
  st.data[key] = '{not json';
  assert.deepStrictEqual(S.loadEntries(st), []);
  st.data[key] = '{"a":1}';
  assert.deepStrictEqual(S.loadEntries(st), []);
});

test('loadRunning returns null when nothing stored', () => {
  assert.strictEqual(S.loadRunning(fakeStorage()), null);
});

test('saveRunning / loadRunning round-trip and clearRunning', () => {
  const st = fakeStorage();
  const run = { description: 'task', startedAt: 12345 };
  S.saveRunning(st, run);
  assert.deepStrictEqual(S.loadRunning(st), run);
  S.clearRunning(st);
  assert.strictEqual(S.loadRunning(st), null);
});

test('running timer and entries use separate storage', () => {
  const st = fakeStorage();
  S.saveRunning(st, { description: 'r', startedAt: 1 });
  assert.deepStrictEqual(S.loadEntries(st), []);
  S.saveEntries(st, [{ id: 'a', description: '', startedAt: 1, endedAt: 2 }]);
  assert.deepStrictEqual(S.loadRunning(st), { description: 'r', startedAt: 1 });
});

test('loadRunning tolerates corrupt JSON', () => {
  const st = fakeStorage();
  S.saveRunning(st, { description: 'r', startedAt: 1 });
  const key = Object.keys(st.data)[0];
  st.data[key] = 'garbage';
  assert.strictEqual(S.loadRunning(st), null);
});
