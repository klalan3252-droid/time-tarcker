const test = require('node:test');
const assert = require('node:assert');
const T = require('../src/tracker.js');

const d = (y, m, day, h = 0, mi = 0, s = 0) => new Date(y, m, day, h, mi, s).getTime();

test('computeDuration returns ms between timestamps', () => {
  assert.strictEqual(T.computeDuration(1000, 4500), 3500);
  assert.strictEqual(T.computeDuration(1000, 1000), 0);
});

test('computeDuration never returns negative', () => {
  assert.strictEqual(T.computeDuration(5000, 1000), 0);
});

test('formatDuration formats seconds as HH:MM:SS', () => {
  assert.strictEqual(T.formatDuration(0), '00:00:00');
  assert.strictEqual(T.formatDuration(59), '00:00:59');
  assert.strictEqual(T.formatDuration(60), '00:01:00');
  assert.strictEqual(T.formatDuration(3661), '01:01:01');
  assert.strictEqual(T.formatDuration(86399), '23:59:59');
});

test('formatDuration handles more than 99 hours', () => {
  assert.strictEqual(T.formatDuration(100 * 3600 + 5), '100:00:05');
});

test('formatDuration truncates fractional seconds', () => {
  assert.strictEqual(T.formatDuration(61.9), '00:01:01');
});

test('isSameLocalDay compares local calendar day', () => {
  const now = d(2024, 5, 10, 15);
  assert.strictEqual(T.isSameLocalDay(d(2024, 5, 10, 0, 0, 1), now), true);
  assert.strictEqual(T.isSameLocalDay(d(2024, 5, 10, 23, 59, 59), now), true);
  assert.strictEqual(T.isSameLocalDay(d(2024, 5, 9, 23, 59, 59), now), false);
  assert.strictEqual(T.isSameLocalDay(d(2024, 5, 11, 0, 0, 0), now), false);
  assert.strictEqual(T.isSameLocalDay(d(2023, 5, 10, 12), now), false);
});

test('totalForToday sums ms of entries started today only', () => {
  const now = d(2024, 5, 10, 15);
  const entries = [
    { id: 'a', description: 'x', startedAt: d(2024, 5, 10, 9), endedAt: d(2024, 5, 10, 10) },
    { id: 'b', description: 'y', startedAt: d(2024, 5, 10, 11), endedAt: d(2024, 5, 10, 11, 30) },
    { id: 'c', description: 'old', startedAt: d(2024, 5, 9, 9), endedAt: d(2024, 5, 9, 12) },
  ];
  assert.strictEqual(T.totalForToday(entries, now), 90 * 60 * 1000);
  assert.strictEqual(T.totalForToday([], now), 0);
});

test('totalForToday counts by start time, not end time', () => {
  const now = d(2024, 5, 10, 15);
  const entries = [
    { id: 'a', description: '', startedAt: d(2024, 5, 9, 23), endedAt: d(2024, 5, 10, 1) },
  ];
  assert.strictEqual(T.totalForToday(entries, now), 2 * 3600 * 1000);
  assert.strictEqual(T.totalForToday(entries, d(2024, 5, 9, 23, 30)), 2 * 3600 * 1000);
});

test('updateDescription changes only the matching entry, immutably', () => {
  const entries = [
    { id: 'a', description: 'one', startedAt: 1, endedAt: 2 },
    { id: 'b', description: 'two', startedAt: 3, endedAt: 4 },
  ];
  const snapshot = JSON.parse(JSON.stringify(entries));
  const out = T.updateDescription(entries, 'b', 'new');
  assert.deepStrictEqual(entries, snapshot);
  assert.notStrictEqual(out, entries);
  assert.strictEqual(out[0].description, 'one');
  assert.strictEqual(out[1].description, 'new');
  assert.strictEqual(out[1].startedAt, 3);
  assert.strictEqual(out[1].endedAt, 4);
});

test('removeEntry removes by id, immutably', () => {
  const entries = [
    { id: 'a', description: 'one', startedAt: 1, endedAt: 2 },
    { id: 'b', description: 'two', startedAt: 3, endedAt: 4 },
  ];
  const out = T.removeEntry(entries, 'a');
  assert.strictEqual(entries.length, 2);
  assert.deepStrictEqual(out.map((e) => e.id), ['b']);
  assert.deepStrictEqual(T.removeEntry(entries, 'zzz').map((e) => e.id), ['a', 'b']);
});

test('stopTimer builds a completed entry from the running timer', () => {
  const e = T.stopTimer({ description: 'write docs', startedAt: 1000 }, 61000);
  assert.strictEqual(e.description, 'write docs');
  assert.strictEqual(e.startedAt, 1000);
  assert.strictEqual(e.endedAt, 61000);
  assert.ok(e.id !== undefined && e.id !== null && e.id !== '');
});

test('stopTimer gives distinct ids and tolerates blank description', () => {
  const a = T.stopTimer({ description: '', startedAt: 1 }, 2);
  const b = T.stopTimer({ description: '', startedAt: 1 }, 2);
  assert.strictEqual(a.description, '');
  assert.notStrictEqual(a.id, b.id);
});
