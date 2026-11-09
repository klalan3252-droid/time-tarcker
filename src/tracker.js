(function (root) {
  'use strict';

  var counter = 0;

  function computeDuration(startMs, endMs) {
    return Math.max(0, endMs - startMs);
  }

  // Takes whole or fractional seconds; fractions are truncated.
  function formatDuration(seconds) {
    var total = Math.max(0, Math.floor(seconds));
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };
    return pad(h) + ':' + pad(m) + ':' + pad(s);
  }

  function isSameLocalDay(ts, now) {
    var a = new Date(ts);
    var b = new Date(now);
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function totalForToday(entries, now) {
    return entries.reduce(function (sum, e) {
      return isSameLocalDay(e.startedAt, now)
        ? sum + computeDuration(e.startedAt, e.endedAt)
        : sum;
    }, 0);
  }

  function updateDescription(entries, id, description) {
    return entries.map(function (e) {
      return e.id === id ? Object.assign({}, e, { description: description }) : e;
    });
  }

  function removeEntry(entries, id) {
    return entries.filter(function (e) { return e.id !== id; });
  }

  function stopTimer(running, nowMs) {
    counter += 1;
    return {
      id: nowMs.toString(36) + '-' + counter + '-' + Math.random().toString(36).slice(2, 8),
      description: running.description,
      startedAt: running.startedAt,
      endedAt: nowMs
    };
  }

  var api = {
    computeDuration: computeDuration,
    formatDuration: formatDuration,
    isSameLocalDay: isSameLocalDay,
    totalForToday: totalForToday,
    updateDescription: updateDescription,
    removeEntry: removeEntry,
    stopTimer: stopTimer
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Tracker = api;
})(typeof window !== 'undefined' ? window : globalThis);
