(function () {
  'use strict';

  var T = window.Tracker;
  var S = window.TrackerStorage;
  var store = window.localStorage;

  var form = document.getElementById('timer-form');
  var input = document.getElementById('description');
  var toggle = document.getElementById('toggle');
  var elapsedEl = document.getElementById('elapsed');
  var sweep = document.getElementById('sweep');
  var totalEl = document.getElementById('today-total');
  var listEl = document.getElementById('entries');
  var emptyEl = document.getElementById('empty');

  var entries = S.loadEntries(store);
  var running = S.loadRunning(store);
  var editingId = null;
  var ticker = null;

  function secs(ms) { return ms / 1000; }

  function renderTimer() {
    var now = Date.now();
    var ms = running ? T.computeDuration(running.startedAt, now) : 0;
    elapsedEl.textContent = T.formatDuration(secs(ms));
    sweep.style.width = (running ? ((ms % 60000) / 600) : 0) + '%';
  }

  function renderTotal() {
    var now = Date.now();
    var total = T.totalForToday(entries, now);
    totalEl.textContent = T.formatDuration(secs(total));
  }

  function renderControls() {
    document.body.classList.toggle('is-running', !!running);
    toggle.textContent = running ? 'Stop' : 'Start';
    if (running) input.value = running.description;
  }

  function sortedEntries() {
    return entries.slice().sort(function (a, b) { return b.startedAt - a.startedAt; });
  }

  function button(label, cls, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.textContent = label;
    b.addEventListener('click', onClick);
    return b;
  }

  function renderEntries() {
    listEl.textContent = '';
    emptyEl.hidden = entries.length > 0;
    sortedEntries().forEach(function (e) {
      var li = document.createElement('li');
      li.className = 'entry';

      var main = document.createElement('div');
      main.className = 'entry-main';

      if (editingId === e.id) {
        var edit = document.createElement('input');
        edit.type = 'text';
        edit.value = e.description;
        edit.maxLength = 200;
        edit.setAttribute('aria-label', 'Edit description');
        var commit = function () {
          entries = T.updateDescription(entries, e.id, edit.value.trim());
          S.saveEntries(store, entries);
          editingId = null;
          render();
        };
        edit.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter') commit();
          if (ev.key === 'Escape') { editingId = null; render(); }
        });
        main.appendChild(edit);
        li.appendChild(main);
        var actions = document.createElement('div');
        actions.className = 'entry-actions';
        actions.appendChild(button('Save', 'link', commit));
        actions.appendChild(button('Cancel', 'link', function () { editingId = null; render(); }));
        li.appendChild(actions);
        listEl.appendChild(li);
        setTimeout(function () { edit.focus(); edit.select(); }, 0);
        return;
      }

      var desc = document.createElement('span');
      desc.className = e.description ? 'desc' : 'desc placeholder';
      desc.textContent = e.description || '(no description)';
      var started = document.createElement('time');
      started.className = 'started';
      started.dateTime = new Date(e.startedAt).toISOString();
      started.textContent = new Date(e.startedAt).toLocaleString([], {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      main.appendChild(desc);
      main.appendChild(started);

      var dur = document.createElement('span');
      dur.className = 'duration';
      dur.textContent = T.formatDuration(secs(T.computeDuration(e.startedAt, e.endedAt)));

      var acts = document.createElement('div');
      acts.className = 'entry-actions';
      acts.appendChild(button('Edit', 'link', function () { editingId = e.id; render(); }));
      acts.appendChild(button('Delete', 'link danger', function () {
        entries = T.removeEntry(entries, e.id);
        S.saveEntries(store, entries);
        render();
      }));

      li.appendChild(main);
      li.appendChild(dur);
      li.appendChild(acts);
      listEl.appendChild(li);
    });
  }

  function render() {
    renderControls();
    renderTimer();
    renderTotal();
    renderEntries();
  }

  function startTicking() {
    stopTicking();
    ticker = setInterval(function () { renderTimer(); renderTotal(); }, 1000);
  }

  function stopTicking() {
    if (ticker !== null) { clearInterval(ticker); ticker = null; }
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (running) {
      var entry = T.stopTimer(running, Date.now());
      entries = entries.concat(entry);
      S.saveEntries(store, entries);
      S.clearRunning(store);
      running = null;
      input.value = '';
      stopTicking();
    } else {
      running = { description: input.value.trim(), startedAt: Date.now() };
      S.saveRunning(store, running);
      startTicking();
    }
    render();
  });

  render();
  if (running) startTicking();
})();
