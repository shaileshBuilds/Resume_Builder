/* Part 20: Settings. RC.settings holds saved preferences; the page offers theme, defaults, autosave, export settings,
   JSON export/import of resume data, and storage management. Everything stays in this browser (localStorage). */
(function () {
  var U = RC.ui, M = RC.model, S = RC.store, P = RC.pages, e = M.esc, KEY = 'rc-settings';
  var DEFAULTS = { autosave: true, defaultTemplate: '', pageSize: 'A4', exportMargin: 'template' };
  var MARGINS = { template: 'Template default', narrow: 'Narrow (10 mm)', normal: 'Normal (16 mm)', wide: 'Wide (22 mm)' };
  var cache = null, mem = null;

  function clean(o) {
    o = M.isObj(o) ? o : {};
    return {
      autosave: o.autosave !== false,
      defaultTemplate: typeof o.defaultTemplate === 'string' ? o.defaultTemplate.slice(0, 60) : '',
      pageSize: o.pageSize === 'Letter' ? 'Letter' : 'A4',
      exportMargin: MARGINS[o.exportMargin] ? o.exportMargin : 'template'
    };
  }
  function read() {
    var raw = null; try { raw = localStorage.getItem(KEY); } catch (x) { return clean(mem); }
    if (!raw) return clean(mem);
    try { return clean(JSON.parse(raw)); } catch (x) { return clean(null); }   /* damaged value: fall back to defaults */
  }
  function write(o) { mem = o; try { localStorage.setItem(KEY, JSON.stringify(o)); return true; } catch (x) { return false; } }
  RC.settings = {
    DEFAULTS: DEFAULTS, MARGINS: MARGINS,
    get: function () { return cache || (cache = read()); },
    set: function (patch) { var next = clean(Object.assign({}, this.get(), patch)); cache = next; var ok = write(next); document.dispatchEvent(new CustomEvent('rc:settings-changed')); return ok; },
    reset: function () { cache = null; mem = null; try { localStorage.removeItem(KEY); } catch (x) {} document.dispatchEvent(new CustomEvent('rc:settings-changed')); },
    refresh: function () { cache = null; }
  };

  /* ---------- helpers ---------- */
  function lsKeys() { var out = []; try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf('rc-') === 0) out.push(k); } } catch (x) {} return out.sort(); }
  var NAMES = { 'rc-resumes': ['Resumes', 'file-text'], 'rc-letters': ['Cover letters', 'mail'], 'rc-versions': ['Saved versions', 'history'], 'rc-settings': ['Settings', 'sliders-horizontal'], 'rc-theme': ['Theme choice', 'moon'], 'rc-dash-prefs': ['Dashboard view', 'layout-grid'], 'rc-fav-templates': ['Favourite templates', 'heart'], 'rc-ai-ctx': ['Writing helper context', 'sparkles'], 'rc-resumes-corrupt': ['Recovered copy of damaged data', 'life-buoy'] };
  function countItems(k, raw) {
    try { var o = JSON.parse(raw), it = o && o.items ? o.items : o; if (k === 'rc-resumes' || k === 'rc-letters') return Object.keys(it || {}).length; if (k === 'rc-versions') return Object.keys(o).reduce(function (n, id) { return n + (Array.isArray(o[id]) ? o[id].length : 0); }, 0); if (k === 'rc-fav-templates') return Array.isArray(o) ? o.length : 0; } catch (x) {}
    return null;
  }
  function usage() {
    return lsKeys().map(function (k) { var v = ''; try { v = localStorage.getItem(k) || ''; } catch (x) {} var n = NAMES[k] || [k.replace(/^rc-/, ''), 'database']; return { key: k, name: n[0], icon: n[1], chars: k.length + v.length, items: countItems(k, v) }; });
  }
  var kb = function (c) { var b = c * 2; return b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB'; };
  function download(name, text) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  var stamp = function () { return new Date().toISOString().slice(0, 10); };
  function flushOpen() { try { RC.state && RC.state.flush && RC.state.flush(true); } catch (x) {} }

  /* ---------- JSON export / import ---------- */
  function exportAll(ids) {
    flushOpen();
    var rs = S.list().filter(function (r) { return !ids || ids.indexOf(r.id) > -1; });
    if (!rs.length) { U.toast('There are no resumes to export yet.'); return; }
    var data = { app: 'ResumeCraft Studio', type: 'resume-data', version: 1, exportedAt: new Date().toISOString(), settings: RC.settings.get(), resumes: rs };
    download(ids && rs.length === 1 ? (rs[0].name || 'resume').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase().slice(0, 50) + '.json' : 'resumecraft-backup-' + stamp() + '.json', JSON.stringify(data, null, 2));
    U.toast(rs.length === 1 ? 'Resume exported.' : rs.length + ' resumes exported.', 'ok');
  }
  /* Accepts a backup file, a single resume object, or an array of resumes. Returns a summary; never overwrites existing resumes. */
  function importText(text, withSettings) {
    var out = { added: 0, skipped: 0, renamed: 0, failed: 0, settings: false, error: '' }, data;
    if (text.length > 8e6) { out.error = 'That file is larger than 8 MB, which is too big for a resume backup.'; return out; }
    try { data = JSON.parse(text); } catch (x) { out.error = 'That file is not valid JSON. Choose a file that was exported from ResumeCraft Studio.'; return out; }
    var list = Array.isArray(data) ? data : (M.isObj(data) && Array.isArray(data.resumes)) ? data.resumes : M.isObj(data) && (data.personalInfo || data.experience || data.education) ? [data] : null;
    if (!list) { out.error = 'No resume data was found in that file.'; return out; }
    var have = {}; S.list().forEach(function (r) { have[r.id] = 1; });
    list.slice(0, 200).forEach(function (raw) {
      if (!M.isObj(raw) || !(raw.personalInfo || raw.experience || raw.education || raw.skills || raw.name)) { out.skipped++; return; }
      var r = M.normalize(raw);
      if (have[r.id]) { r.id = M.uid(); r.name = M.cleanName((r.name || 'Resume').slice(0, 70) + ' (imported)'); out.renamed++; }
      var res = S.save(r); if (res.ok) { have[r.id] = 1; out.added++; } else { out.failed++; out.error = res.error || out.error; }
    });
    if (list.length > 200) out.skipped += list.length - 200;
    if (withSettings && M.isObj(data) && M.isObj(data.settings)) { RC.settings.set(clean(data.settings)); out.settings = true; }
    return out;
  }
  function clearKeys(keys) { keys.forEach(function (k) { try { localStorage.removeItem(k); } catch (x) {} }); RC.settings.refresh(); try { RC.state && RC.state.discardUnsaved && RC.state.discardUnsaved(); } catch (x) {} }

  /* ---------- page ---------- */
  function themeMode() { var s = null; try { s = localStorage.getItem('rc-theme'); } catch (x) {} return s === 'dark' || s === 'light' ? s : 'system'; }
  function applyTheme(m) {
    if (m === 'system') { try { localStorage.removeItem('rc-theme'); } catch (x) {} document.documentElement.setAttribute('data-theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
    else RC.setTheme(m);
  }

  P.settings = function (el) {
    function draw() {
      var s = RC.settings.get(), tpls = RC.templates ? RC.templates.list() : [], us = usage(), total = us.reduce(function (n, x) { return n + x.chars; }, 0), pctU = Math.min(100, Math.round(total / 5e6 * 100)), rs = S.list(), mode = themeMode();
      var seg = function (id, cur, opts) { return '<div class="chips" id="' + id + '" role="group">' + opts.map(function (o) { return '<button type="button" class="chip' + (o[0] === cur ? ' on' : '') + '" data-v="' + o[0] + '" aria-pressed="' + (o[0] === cur) + '">' + o[1] + '</button>'; }).join('') + '</div>'; };
      el.innerHTML = U.pageHeader('Settings', 'Preferences, backups and storage. Everything here stays in this browser.') + '<div class="wrap pg"><div class="set">' +
        '<section class="set-c"><h2><i data-lucide="sun-moon"></i>Appearance</h2><p>Choose how the site looks. “System” follows your device.</p>' + seg('s-theme', mode, [['light', 'Light'], ['dark', 'Dark'], ['system', 'System']]) + '</section>' +
        '<section class="set-c"><h2><i data-lucide="layout-template"></i>Defaults for new resumes</h2><p>Used when you start a resume without picking a template. Existing resumes are not changed.</p>' +
        '<div class="set-row"><div class="fld"><label for="s-tpl">Default template</label><select id="s-tpl"><option value="">Template picker decides</option>' + tpls.map(function (t) { return '<option value="' + e(t.id) + '"' + (t.id === s.defaultTemplate ? ' selected' : '') + '>' + e(t.name) + '</option>'; }).join('') + '</select></div>' +
        '<div class="fld"><span class="set-l">Default paper size</span>' + seg('s-page', s.pageSize, [['A4', 'A4'], ['Letter', 'US Letter']]) + '</div></div>' + (s.defaultTemplate && RC.templates && RC.templates.get(s.defaultTemplate) ? '<div class="set-pv" id="s-pv">' + RC.templates.preview(M.normalize(RC.sample.experienced), s.defaultTemplate) + '</div>' : '') + '</section>' +
        '<section class="set-c"><h2><i data-lucide="save"></i>Autosave</h2><label class="set-sw"><input type="checkbox" id="s-auto" role="switch"' + (s.autosave ? ' checked' : '') + '><span><b>Save changes automatically</b><small>' + (s.autosave ? 'Your edits are saved a moment after you stop typing.' : 'Autosave is off. Press Save or Ctrl+S in the editor. You will be warned before leaving with unsaved changes.') + '</small></span></label></section>' +
        '<section class="set-c"><h2><i data-lucide="file-down"></i>Export settings</h2><p>The margin the export window starts with. You can still change it for each export.</p><div class="set-row"><div class="fld"><label for="s-margin">Default export margin</label><select id="s-margin">' + Object.keys(MARGINS).map(function (k) { return '<option value="' + k + '"' + (k === s.exportMargin ? ' selected' : '') + '>' + MARGINS[k] + '</option>'; }).join('') + '</select></div></div></section>' +
        '<section class="set-c"><h2><i data-lucide="database-backup"></i>Your data (JSON)</h2><p>Export your resumes as a backup or to move them to another browser. Import adds resumes and never overwrites existing ones.</p>' +
        '<div class="set-btns">' + U.button('Export all resumes', { icon: 'download', attrs: 'id="s-exp"' + (rs.length ? '' : ' disabled') }) + '<span class="set-one"><label class="fm-sr" for="s-one">Resume to export</label><select id="s-one"' + (rs.length ? '' : ' disabled') + '>' + (rs.length ? rs.map(function (r) { return '<option value="' + e(r.id) + '">' + e(r.name) + '</option>'; }).join('') : '<option>No resumes yet</option>') + '</select>' + U.button('Export one', { kind: 'btn-o', attrs: 'id="s-exp1"' + (rs.length ? '' : ' disabled') }) + '</span></div>' +
        '<div class="set-btns" style="margin-top:14px">' + U.button('Import from JSON…', { kind: 'btn-o', icon: 'upload', attrs: 'id="s-imp"' }) + '<label class="set-ck"><input type="checkbox" id="s-imps"> Also restore saved preferences from the file</label><input type="file" id="s-file" accept="application/json,.json" hidden></div><p class="set-note" id="s-res" role="status" aria-live="polite"></p></section>' +
        '<section class="set-c"><h2><i data-lucide="hard-drive"></i>Storage</h2><p>What ResumeCraft Studio keeps in this browser. Sizes are approximate' + (RC.store.status().persistent ? '' : '. <b>Browser storage is unavailable right now, so work lasts only for this session.</b>') + '</p>' +
        '<div class="set-bar" role="img" aria-label="About ' + pctU + ' percent of typical browser storage used"><span style="width:' + Math.max(pctU, total ? 2 : 0) + '%"></span></div><p class="set-note">' + kb(total) + ' used of roughly 5 MB available to this site.</p>' +
        (us.length ? '<ul class="set-st">' + us.map(function (x) { return '<li><i data-lucide="' + x.icon + '"></i><span><b>' + e(x.name) + '</b><small>' + (x.items !== null ? x.items + (x.items === 1 ? ' item · ' : ' items · ') : '') + kb(x.chars) + '</small></span><button type="button" class="btn btn-g btn-sm" data-clr="' + e(x.key) + '" aria-label="Clear ' + e(x.name) + '">Clear</button></li>'; }).join('') + '</ul>' : '<p class="set-note">Nothing is stored yet.</p>') +
        '<div class="set-danger"><div><b>Clear all local data</b><small>Deletes every resume, cover letter, version and preference stored in this browser. This cannot be undone. Export a backup first.</small></div>' + U.button('Clear all data…', { kind: 'btn-d', icon: 'trash-2', attrs: 'id="s-all"' }) + '</div>' +
        '<div style="margin-top:14px">' + U.button('Reset preferences only', { kind: 'btn-o', attrs: 'id="s-rst"' }) + '</div></section></div></div>';
      if (RC.templates) RC.templates.fit(el); U.icons();
    }
    draw();
    var saved = function (ok) { ok === false ? U.toast('Could not save this setting: browser storage is blocked. It applies until you close the tab.') : U.toast('Setting saved.', 'ok'); };
    el.addEventListener('click', function (ev) {
      var t = ev.target, b;
      if ((b = t.closest('#s-theme [data-v]'))) { applyTheme(b.dataset.v); draw(); }
      else if ((b = t.closest('#s-page [data-v]'))) { saved(RC.settings.set({ pageSize: b.dataset.v })); draw(); }
      else if (t.closest('#s-exp')) exportAll();
      else if (t.closest('#s-exp1')) exportAll([el.querySelector('#s-one').value]);
      else if (t.closest('#s-imp')) el.querySelector('#s-file').click();
      else if ((b = t.closest('[data-clr]'))) {
        var k = b.dataset.clr, nm = (NAMES[k] || [k])[0];
        U.confirm({ title: 'Clear “' + e(nm) + '”?', text: 'This removes ' + e(nm.toLowerCase()) + ' from this browser. It cannot be undone.', ok: 'Clear', danger: true }).then(function (y) { if (!y) return; clearKeys([k]); if (k === 'rc-theme') applyTheme('system'); U.toast(nm + ' cleared.', 'ok'); draw(); });
      }
      else if (t.closest('#s-rst')) U.confirm({ title: 'Reset preferences?', text: 'Theme, defaults and autosave return to their original values. Your resumes are not affected.', ok: 'Reset', danger: true }).then(function (y) { if (!y) return; RC.settings.reset(); applyTheme('system'); U.toast('Preferences reset.', 'ok'); draw(); });
      else if (t.closest('#s-all')) {
        var d = U.modal({ title: 'Clear all local data?', body: '<p>This permanently deletes <b>every resume, cover letter, saved version and preference</b> stored in this browser. Export a backup first if you might need anything back.</p><div class="fld" style="margin-top:14px"><label for="s-type">Type DELETE to confirm</label><input id="s-type" type="text" autocomplete="off" spellcheck="false"></div>',
          actions: [{ label: 'Cancel', value: 'no' }, { label: 'Delete everything', kind: 'btn-d', value: 'yes' }],
          onClose: function (v) { if (v !== 'yes') return; clearKeys(lsKeys()); applyTheme('system'); U.toast('All local data cleared.', 'ok'); draw(); } });
        var go = d.querySelector('.m-foot .btn-d'), inp = d.querySelector('#s-type'); go.disabled = true;
        inp.addEventListener('input', function () { go.disabled = inp.value.trim() !== 'DELETE'; }); inp.focus();
      }
    });
    el.addEventListener('change', function (ev) {
      var t = ev.target;
      if (t.id === 's-tpl') { saved(RC.settings.set({ defaultTemplate: t.value })); draw(); }
      else if (t.id === 's-margin') saved(RC.settings.set({ exportMargin: t.value }));
      else if (t.id === 's-auto') { var ok = RC.settings.set({ autosave: t.checked }); if (t.checked) flushOpen(); saved(ok); draw(); }
      else if (t.id === 's-file') {
        var f = t.files && t.files[0]; if (!f) return; var withS = el.querySelector('#s-imps').checked, out = el.querySelector('#s-res');
        if (!/\.json$/i.test(f.name) && f.type !== 'application/json') { out.textContent = 'Please choose a .json file.'; t.value = ''; return; }
        f.text().then(function (txt) {
          var r = importText(txt, withS), msg;
          if (r.error && !r.added) msg = r.error;
          else { msg = r.added + (r.added === 1 ? ' resume' : ' resumes') + ' imported' + (r.renamed ? ' (' + r.renamed + ' renamed to avoid overwriting)' : '') + (r.skipped ? '. ' + r.skipped + ' skipped as unreadable' : '') + (r.failed ? '. ' + r.failed + ' could not be saved' : '') + (r.settings ? '. Preferences restored' : '') + '.'; }
          U.toast(r.added ? 'Import finished.' : 'Nothing was imported.', r.added ? 'ok' : undefined); draw(); el.querySelector('#s-res').textContent = msg;
        }, function () { out.textContent = 'That file could not be read.'; });
        t.value = '';
      }
    });
  };
  RC.dataIO = { exportAll: exportAll, importText: importText, usage: usage };
})();
