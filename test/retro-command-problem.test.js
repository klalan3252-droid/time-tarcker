const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const file = path.join(__dirname, '..', '.factory', 'decisions', 'command-problem.md');

function read() {
  assert.ok(fs.existsSync(file), 'retro file .factory/decisions/command-problem.md must exist');
  return fs.readFileSync(file, 'utf8');
}

function section(text, name) {
  const re = new RegExp('^#+\\s*' + name + '[^\\n]*\\n([\\s\\S]*?)(?=^#+\\s|(?![\\s\\S]))', 'im');
  const m = text.match(re);
  assert.ok(m, 'missing section: ' + name);
  return m[1];
}

test('AC-1 retro file exists', () => {
  assert.ok(fs.existsSync(file));
});

test('AC-2 has required headed sections', () => {
  const t = read();
  for (const h of ['Summary', 'What happened', 'Outcome', 'Lessons']) {
    assert.match(t, new RegExp('^#+\\s*' + h, 'mi'), 'heading ' + h);
  }
});

test('AC-3 identifies task and request', () => {
  const t = read();
  assert.ok(t.includes('F-1'));
  assert.ok(t.includes('Create a simple browser-based time tracker'));
  assert.ok(t.includes('can you create a simple time tracker application'));
});

test('AC-4 what happened states retries, no_progress, choices in order', () => {
  const s = section(read(), 'What happened');
  assert.match(s, /retried 4 times|×4|x4/i);
  assert.ok(s.includes('no_progress'));
  const r = s.indexOf('retry');
  const o = s.indexOf('take over');
  assert.ok(r >= 0 && o >= 0, 'both choices mentioned');
  assert.ok(s.indexOf('retry', 0) < o, 'retry before take over');
});

test('AC-5 outcome says handed over to a person', () => {
  const s = section(read(), 'Outcome');
  assert.match(s, /handed over to a person/i);
});

test('AC-6 lessons mention no_progress and earlier escalation as suggestion', () => {
  const s = section(read(), 'Lessons');
  assert.ok(s.includes('no_progress'));
  assert.match(s, /escalat/i);
  assert.match(s, /consider|suggest|could|might/i);
});
