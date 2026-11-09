(function (root) {
  'use strict';

  var ENTRIES_KEY = 'timetracker.entries';
  var RUNNING_KEY = 'timetracker.running';

  function readJson(storage, key) {
    try {
      var raw = storage.getItem(key);
      return raw === null || raw === undefined ? null : JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  function loadEntries(storage) {
    var data = readJson(storage, ENTRIES_KEY);
    return Array.isArray(data) ? data : [];
  }

  function saveEntries(storage, entries) {
    storage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }

  function loadRunning(storage) {
    var data = readJson(storage, RUNNING_KEY);
    return data && typeof data === 'object' && typeof data.startedAt === 'number' ? data : null;
  }

  function saveRunning(storage, running) {
    storage.setItem(RUNNING_KEY, JSON.stringify(running));
  }

  function clearRunning(storage) {
    storage.removeItem(RUNNING_KEY);
  }

  var api = {
    loadEntries: loadEntries,
    saveEntries: saveEntries,
    loadRunning: loadRunning,
    saveRunning: saveRunning,
    clearRunning: clearRunning
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.TrackerStorage = api;
})(typeof window !== 'undefined' ? window : globalThis);
