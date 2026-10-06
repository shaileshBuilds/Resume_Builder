/* Resume storage: create, save, load, update, delete, duplicate, rename, list.
   Uses localStorage when available, otherwise keeps data in memory for the session.
   Corrupted data is set aside (not thrown away) and never crashes the app. */
RC.store = (function () {
  var M = RC.model, KEY = 'rc-resumes', mem = null, ls = null, failed = false, recovered = 0;

  function hasLS() {
    if (ls !== null) return ls;
    try { localStorage.setItem('__rc', '1'); localStorage.removeItem('__rc'); ls = true; } catch (e) { ls = false; }
    return ls;
  }
  function readAll() {
    if (mem && (failed || !hasLS())) return mem;
    if (!hasLS()) return (mem = {});
    var raw = null, map = {};
    try { raw = localStorage.getItem(KEY); } catch (e) { return (mem = mem || {}); }
    if (!raw) return map;
    try {
      var d = JSON.parse(raw);
      if (!M.isObj(d) || !M.isObj(d.items)) throw new Error('bad shape');
      Object.keys(d.items).forEach(function (k) {
        if (!M.isObj(d.items[k])) { recovered++; return; }
        var r = M.normalize(d.items[k]); map[r.id] = r;
      });
    } catch (e) {
      recovered++;
      map = salvage(raw);                                                  /* keep every resume that can still be read */
      var backed = false;
      try { localStorage.setItem(KEY + '-corrupt', raw); backed = true; } catch (_) {}   /* keep a copy for recovery */
      if (backed) {
        try { if (Object.keys(map).length) localStorage.setItem(KEY, JSON.stringify({ v: 1, items: map })); else localStorage.removeItem(KEY); } catch (_) {}
      } else { mem = map; failed = true; }                                 /* could not back up: leave the original untouched */
    }
    return map;
  }
  /* Recover whole resumes from damaged storage text (for example a write that was cut off). */
  function endOfObj(t, st) {
    var d = 0, q = false, esc = false, c;
    for (var j = st; j < t.length; j++) {
      c = t.charAt(j);
      if (q) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') q = false; }
      else if (c === '"') q = true; else if (c === '{') d++; else if (c === '}') { d--; if (d === 0) return j; }
    }
    return -1;
  }
  function salvage(raw) {
    var out = {}, i = typeof raw === 'string' ? raw.indexOf('"items"') : -1; if (i < 0) return out;
    i = raw.indexOf('{', i); if (i < 0) return out; i++;
    for (;;) {
      var m = /\s*,?\s*"(?:[^"\\]|\\.)*"\s*:\s*(?=\{)/g; m.lastIndex = i; var h = m.exec(raw);
      if (!h || h.index !== i) break;
      var st = h.index + h[0].length, en = endOfObj(raw, st); if (en < 0) break;
      try { var o = JSON.parse(raw.slice(st, en + 1)); if (M.isObj(o)) { var r = M.normalize(o); out[r.id] = r; } } catch (_) {}
      i = en + 1;
    }
    return out;
  }
  function writeAll(map) {
    mem = map;
    if (!hasLS()) return { ok: true, persisted: false };
    try { localStorage.setItem(KEY, JSON.stringify({ v: 1, items: map })); failed = false; }
    catch (e) { failed = true; return { ok: false, persisted: false, error: 'Browser storage is full or blocked. Changes will last only until you close this tab.' }; }
    return { ok: true, persisted: true };
  }
  function changed() { try { document.dispatchEvent(new CustomEvent('rc:resumes-changed')); } catch (e) {} }
  function done(res, resume) { res.resume = resume; if (res.ok || failed) changed(); return res; }
  var NOT_FOUND = { ok: false, error: 'That resume no longer exists.' };

  function save(resume) {
    var map = readAll(), r = M.normalize(resume);
    r.updatedAt = M.now();
    if (map[r.id]) r.createdAt = map[r.id].createdAt;
    map[r.id] = r;
    return done(writeAll(map), r);
  }
  function create(o) {
    o = o || {};
    var base = M.isObj(o.data) ? JSON.parse(JSON.stringify(o.data)) : {};
    delete base.label; delete base.id;
    base.name = o.name || base.name; if (o.templateId) base.templateId = o.templateId;
    var cfg = RC.settings && RC.settings.get();                         /* Settings: default template and paper size for new resumes */
    if (cfg) {
      if (!base.templateId && cfg.defaultTemplate && RC.templates && RC.templates.get(cfg.defaultTemplate)) base.templateId = cfg.defaultTemplate;
      if (!M.isObj(base.designSettings)) base.designSettings = {};
      if (!base.designSettings.pageSize) base.designSettings.pageSize = cfg.pageSize;
    }
    var t = M.now(), r = M.normalize(base); r.createdAt = t;
    return save(r);
  }
  return {
    create: create,
    createSample: function (key) { var s = RC.sample[key]; return s ? create({ data: s }) : { ok: false, error: 'Unknown sample.' }; },
    save: save,
    load: function (id) { var r = readAll()[id]; return r ? M.normalize(r) : null; },
    update: function (id, patch) {
      var r = this.load(id); if (!r) return NOT_FOUND;
      patch = M.isObj(patch) ? patch : {};
      var next = JSON.parse(JSON.stringify(r));
      Object.keys(patch).forEach(function (k) {
        if (k === 'id' || k === 'createdAt') return;
        next[k] = ['personalInfo', 'designSettings', 'visibilitySettings'].indexOf(k) > -1 && M.isObj(patch[k]) ? Object.assign(next[k], patch[k]) : patch[k];
      });
      return save(next);
    },
    remove: function (id) {
      var map = readAll(); if (!map[id]) return NOT_FOUND;
      delete map[id]; var res = writeAll(map); changed(); return res;
    },
    duplicate: function (id) {
      var r = this.load(id); if (!r) return NOT_FOUND;
      r.id = M.uid(); r.name = M.cleanName(r.name.slice(0, 73) + ' (copy)'); r.createdAt = M.now();
      return save(r);
    },
    rename: function (id, name) { return this.update(id, { name: M.cleanName(name) }); },
    list: function () {
      var m = readAll();
      return Object.keys(m).map(function (k) { return M.normalize(m[k]); }).sort(function (a, b) { return Date.parse(b.updatedAt) - Date.parse(a.updatedAt); });
    },
    exists: function (id) { return !!readAll()[id]; },
    salvage: salvage,
    status: function () { return { persistent: hasLS() && !failed, recovered: recovered }; }
  };
})();
RC.store.delete = RC.store.remove;
