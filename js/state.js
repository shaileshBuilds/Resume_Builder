/* Part 12 + 14: the ONE central state object for the resume that is currently open.
   The form (Part 10) and the visual editor (Part 11) both read and write this same object, so a change made in
   either one shows up in the other and in the live preview straight away. Saving goes through RC.store.
   Part 14 adds, for both editors at once: undo / redo (bounded, text edits grouped), autosave with a visible status
   (saving / saved / error, with automatic retries), manual save, restore of the last saved copy, reset, keyboard
   shortcuts and an unsaved-changes warning. Nothing here ever throws on bad data: snapshots are re-validated on use. */
RC.state = (function () {
  var S = RC.store, M = RC.model, cur = null, subs = [], timer = null, dirty = false;
  var MAX = 100, TYPE_MS = 500, SAVE_MS = 600, RETRY = [3000, 8000, 20000];
  var hist = [], hp = -1, histT = null, retryT = null, tries = 0, failed = false, lastAt = null, lastMsg = '', sstate = 'saved', opened = false, told = false;

  function emit(ev) { subs.slice().forEach(function (f) { try { f(ev); } catch (e) { if (window.console) console.error(e); } }); }
  function subscribe(fn) { subs.push(fn); return function () { var i = subs.indexOf(fn); if (i > -1) subs.splice(i, 1); }; }
  function wipe(o) { Object.keys(o).forEach(function (k) { delete o[k]; }); }
  function toast(m, t) { try { RC.ui && RC.ui.toast && RC.ui.toast(m, t); } catch (e) {} }

  /* ---------- history (what undo / redo move through) ---------- */
  function snap(R) { var c = {}; Object.keys(R).forEach(function (k) { if (k !== 'updatedAt') c[k] = R[k]; }); return JSON.stringify(c); }
  function resetHist() { hist = cur ? [snap(cur)] : []; hp = cur ? 0 : -1; clearTimeout(histT); histT = null; emit({ type: 'history' }); }
  /* Record the current content as one history step (does nothing when nothing changed). */
  function commit() {
    clearTimeout(histT); histT = null; if (!cur) return false;
    var j = snap(cur); if (j === hist[hp]) return false;
    hist = hist.slice(0, hp + 1); hist.push(j); hp++;
    while (hist.length > MAX) { hist.shift(); hp--; }
    emit({ type: 'history' }); return true;
  }
  function canUndo() { return !!cur && (hp > 0 || (!!histT && snap(cur) !== hist[hp])); }
  function canRedo() { return !!cur && !histT && hp < hist.length - 1; }

  /* Open a resume. The same object is reused (and refreshed in place) when the id is already open. */
  function open(id) {
    flush();
    var fresh = S.load(id); if (!fresh) return null;
    var same = cur && cur.id === id, keep = same && hist.length && snap(cur) === hist[hp];
    if (same) { wipe(cur); Object.assign(cur, fresh); } else cur = fresh;
    if (!keep || snap(cur) !== hist[hp]) resetHist();
    opened = true; dirty = false; failed = false; sstate = 'saved'; tries = 0; clearTimeout(retryT);
    return cur;
  }
  function get() { return cur; }
  /* Replace the content with another snapshot while keeping the same object (and id). */
  function replace(next) {
    if (!cur) return; var id = cur.id, ca = cur.createdAt;
    wipe(cur); Object.assign(cur, JSON.parse(JSON.stringify(next))); cur.id = id; cur.createdAt = cur.createdAt || ca;
  }
  /* Autosave can be switched off in Settings; manual save (Save button / Ctrl+S) always works. */
  function autoOn() { return !(RC.settings && RC.settings.get().autosave === false); }
  function queueSave() { dirty = true; clearTimeout(timer); if (!autoOn()) { timer = null; sstate = 'unsaved'; return; } timer = setTimeout(flush, SAVE_MS); sstate = 'saving'; }
  /* Anyone who edits the object calls change(source, now). `now` = a structural edit (add / delete / reorder / template):
     it becomes its own undo step at once. Typing (no `now`) is grouped and recorded after a short pause. */
  function change(source, now) {
    if (!cur) return; queueSave();
    if (now) commit(); else { clearTimeout(histT); histT = setTimeout(commit, TYPE_MS); }
    emit({ type: 'change', source: source || '' }); emit({ type: autoOn() ? 'saving' : 'unsaved' });
  }

  /* ---------- saving ---------- */
  function scheduleRetry() { clearTimeout(retryT); var d = RETRY[Math.min(tries, RETRY.length - 1)]; tries++; retryT = setTimeout(function () { flush(true); }, d); }
  function flush(force) {
    if (!force && !autoOn()) return null;                                  /* autosave off: only an explicit save writes */
    clearTimeout(timer); timer = null; clearTimeout(retryT); retryT = null;
    if (!cur || (!dirty && !force)) return null;
    if (histT) commit();
    var gone = opened && !S.exists(cur.id), r;                          /* deleted elsewhere? we keep the user's work */
    try { r = S.save(cur); } catch (e) { r = { ok: false, error: 'Something went wrong while saving.' }; }
    if (r && r.ok) {
      dirty = false; failed = false; tries = 0; sstate = 'saved'; lastAt = new Date(); lastMsg = '';
      if (r.resume) cur.updatedAt = r.resume.updatedAt;
      emit({ type: 'saved', persisted: r.persisted !== false, at: lastAt });
      if (gone) { emit({ type: 'recreated' }); toast('This resume was removed in another tab. Your copy has been saved again.'); }
    } else {
      dirty = true; failed = true; sstate = 'error'; lastMsg = (r && r.error) || 'Could not save.';
      emit({ type: 'error', message: lastMsg }); scheduleRetry();      /* keep trying quietly; the data stays in memory */
    }
    return r;
  }
  function manualSave() {
    if (!cur) return { ok: false, error: 'There is no resume open to save.' };
    sstate = 'saving'; emit({ type: 'saving' });
    return flush(true);
  }
  function hasUnsaved() { return !!cur && dirty; }
  function info() { return { state: sstate, dirty: dirty, failed: failed, message: lastMsg, at: lastAt, canUndo: canUndo(), canRedo: canRedo(), steps: hist.length, position: hp }; }
  function differsFromSaved() { if (!cur) return false; var s = S.load(cur.id); return !s || snap(s) !== snap(cur); }

  /* ---------- undo / redo / restore / reset ---------- */
  function applied(op, record) {            /* after the content was swapped by undo, redo, restore or reset */
    queueSave(); if (record) commit();
    emit({ type: 'change', source: 'history' }); emit({ type: 'history', op: op }); emit({ type: 'saving' });
  }
  function go(i, op) {
    var next; try { next = M.normalize(JSON.parse(hist[i])); } catch (e) { hist.splice(i, 1); if (i < hp) hp--; emit({ type: 'history' }); return false; }   /* skip a damaged step */
    hp = i; replace(next); applied(op, false); return true;
  }
  function undo() { if (!cur) return false; commit(); return hp > 0 ? go(hp - 1, 'undo') : false; }
  function redo() { if (!cur) return false; if (histT) commit(); return hp < hist.length - 1 ? go(hp + 1, 'redo') : false; }
  /* Bring back the copy that is stored right now (for example after a failed save or an accidental edit). Undo returns. */
  function restoreSaved() {
    if (!cur) return { ok: false, error: 'There is no resume open.' };
    var saved = S.load(cur.id); if (!saved) return { ok: false, error: 'No saved copy was found. This resume may have been deleted.' };
    commit(); replace(saved); applied('restore', true); return { ok: true };
  }
  /* Clear the content but keep the name, template and design. The previous content stays one Undo away. */
  function reset() {
    if (!cur) return { ok: false, error: 'There is no resume open.' };
    commit(); var before = JSON.parse(JSON.stringify(cur));
    replace(M.blank({ name: cur.name, templateId: cur.templateId, designSettings: JSON.parse(JSON.stringify(cur.designSettings)) }));
    applied('reset', true); return { ok: true, before: before };
  }

  /* ---------- section order, copies ---------- */
  function order(R) {
    var T = RC.templates, d = T && (T.get(R.templateId) || T.get(T.DEFAULT_ID)), isDef = R.sectionOrder.join() === M.SECTIONS.join();
    return isDef && d && d.order ? d.order.concat(M.SECTIONS.filter(function (k) { return d.order.indexOf(k) < 0; })) : R.sectionOrder.slice();
  }
  function reorder(key, target, below, R) {
    R = R || cur; if (!R || !key || !target || key === target) return false;
    var o = order(R), i = o.indexOf(key); if (i < 0 || o.indexOf(target) < 0) return false;
    o.splice(i, 1); var j = o.indexOf(target); o.splice(below ? j + 1 : j, 0, key); R.sectionOrder = o; return true;
  }
  function reid(o) {
    if (Array.isArray(o)) o.forEach(reid);
    else if (o && typeof o === 'object') { if (o.id) o.id = M.uid(); Object.keys(o).forEach(function (k) { if (o[k] && typeof o[k] === 'object') reid(o[k]); }); }
    return o;
  }

  /* ---------- storage problems, keyboard, leaving the page ---------- */
  function notifyRecovery() {
    var st = S.status(); if (st.recovered && !told) { told = true; toast('Some saved data was damaged. Every resume that could be read was recovered, and a backup copy was kept.'); }
  }
  function route() { return location.hash.replace(/^#\/?/, '').split('?')[0].replace(/\/$/, ''); }
  function saveToast(r) { if (r && r.ok) toast(r.persisted === false ? 'Saved for this session only. Browser storage is unavailable.' : 'Saved.', r.persisted === false ? '' : 'ok'); else toast((r && r.error) || 'Save failed.'); }
  document.addEventListener('keydown', function (e) {
    var p = route(); if (!cur || (p !== 'editor' && p !== 'resume-builder')) return;
    var mod = e.ctrlKey || e.metaKey, k = (e.key || '').toLowerCase(); if (!mod || e.altKey) return;
    var t = e.target || {}, inField = /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable;
    if (k === 's') { e.preventDefault(); saveToast(manualSave()); return; }
    if (inField) return;                                                    /* inside a text box the browser's own undo handles typing */
    if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); redo(); }
  });
  addEventListener('beforeunload', function (e) {
    if (!cur) return; if (dirty) flush();
    if (dirty) { e.preventDefault(); e.returnValue = ''; return ''; }       /* still unsaved: ask before the tab closes */
  });
  addEventListener('pagehide', function () { flush(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) flush(); });
  addEventListener('storage', function (e) {
    if (e.key === 'rc-resumes' && cur && opened && !S.exists(cur.id)) { emit({ type: 'missing' }); toast('This resume was removed in another tab. Keep editing and it will be saved again.'); }
  });

  return {
    open: open, get: get, replace: replace, change: change, flush: flush, subscribe: subscribe, order: order, reorder: reorder, reid: reid,
    commit: commit, undo: undo, redo: redo, canUndo: canUndo, canRedo: canRedo, info: info, manualSave: manualSave, hasUnsaved: hasUnsaved,
    restoreSaved: restoreSaved, restoreLatest: restoreSaved, differsFromSaved: differsFromSaved, reset: reset, notifyRecovery: notifyRecovery,
    saveToast: saveToast, limits: { history: MAX, typingMs: TYPE_MS, saveMs: SAVE_MS }
  };
})();
