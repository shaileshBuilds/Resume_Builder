/* Part 11: Canva-style visual editor. Route: #/editor?id=<resume id>.
   The page is the real template HTML (RC.templates.renderResume). Every edit changes the one central resume
   object (RC.model shape), re-renders the page, and auto-saves through RC.store. Part 10's form stays at #/resume-builder. */
(function () {
  var U = RC.ui, S = RC.store, M = RC.model, T = RC.templates, esc = M.esc;
  var PAGES = { A4: { w: 794, h: 1123, label: 'A4' }, Letter: { w: 816, h: 1056, label: 'US Letter' } };
  var TABS = [['templates', 'layout-template', 'Templates'], ['content', 'type', 'Content'], ['sections', 'layers', 'Sections'], ['upload', 'upload', 'Upload'], ['design', 'palette', 'Design'], ['versions', 'history', 'Versions']];
  var PERSONAL = [['fullName', 'Full name'], ['jobTitle', 'Job title'], ['email', 'Email'], ['phone', 'Phone'], ['location', 'Location'], ['website', 'Website'], ['linkedin', 'LinkedIn'], ['github', 'GitHub']];
  var FONTS = [['', 'Template default'], ["'Inter',system-ui,sans-serif", 'Inter'], ["'DM Sans',system-ui,sans-serif", 'DM Sans'], ["'Poppins',system-ui,sans-serif", 'Poppins'], ["'Source Sans 3','Segoe UI',sans-serif", 'Source Sans'], ["'Space Grotesk',system-ui,sans-serif", 'Space Grotesk'], ["'Lora',Georgia,serif", 'Lora'], ["'Merriweather',Georgia,serif", 'Merriweather'], ["'Libre Baskerville',Georgia,serif", 'Libre Baskerville'], ["Georgia,'Times New Roman',serif", 'Georgia'], ["Arial,Helvetica,sans-serif", 'Arial']];
  var COLORS = ['#1f3a5f', '#0f766e', '#2563eb', '#7c3aed', '#be185d', '#dc2626', '#ea580c', '#ca8a04', '#15803d', '#334155'];
  var LABEL = { startDate: 'Start date', endDate: 'End date', jobTitle: 'Job title', credentialUrl: 'Credential URL', achievements: 'Achievements (one per line)', technologies: 'Technologies (comma separated)', current: 'I currently work here', subheading: 'Subheading', profilePhoto: 'Photo' };
  var ITEM_NAME = { experience: 'Experience item', education: 'Education item', skills: 'Skill', projects: 'Project', certifications: 'Certification', languages: 'Language', awards: 'Award', volunteer: 'Volunteer item', publications: 'Publication', customSections: 'Custom item' };
  var ITEM_SEL = '.it, .pj, .ls > li';
  var cleanup = null;

  var human = function (k) { return LABEL[k] || k.replace(/([A-Z])/g, ' $1').replace(/^./, function (c) { return c.toUpperCase(); }); };
  var ico = function (n) { return '<i data-lucide="' + n + '"></i>'; };
  var idFromHash = function () { var m = /[?&]id=([^&]+)/.exec(location.hash); try { return m ? decodeURIComponent(m[1]) : ''; } catch (x) { return ''; } };
  var hashPath = function () { return location.hash.replace(/^#\/?/, '').split('?')[0].replace(/\/$/, ''); };
  var has = function (R, k) { var v = R[k]; return k === 'summary' ? !!(v || '').trim() : Array.isArray(v) && v.length > 0; };

  function ensureResume(el) {
    var id = idFromHash();
    if (id) { var R = RC.state.open(id); if (R) return R; U.toast('That resume could not be found. Opening another one.'); }
    var rs = S.list(), r = rs[0] ? { ok: true, resume: rs[0] } : S.createSample('experienced');
    if (!r.ok) { el.innerHTML = '<div class="wrap pg">' + U.empty('file-x', 'Could not open the editor', r.error || 'Please try again.') + '</div>'; U.icons(); return null; }
    location.replace('#/editor?id=' + encodeURIComponent(r.resume.id));
    return null;
  }

  RC.pages.editor = function (el) {
    if (cleanup) cleanup();
    var R = ensureResume(el); if (!R) return;
    document.body.classList.add('ed-on');

    /* ---------- state ---------- */
    var zoomMode = 'fit', z = 1, tab = 'templates', leftOpen = true, rightOpen = true, sel = null, preview = false;
    var saveT = null, dirty = false, off = [];
    var mq = matchMedia('(max-width: 900px)'), mobile = function () { return mq.matches; };

    el.innerHTML =
      '<div class="ed" id="ed">' +
      '<header class="ed-top"><a class="ed-b" href="#/dashboard" aria-label="Back to dashboard" title="Dashboard">' + ico('arrow-left') + '</a>' +
      '<input class="ed-name" id="ed-name" data-ns="name" type="text" maxlength="80" aria-label="Resume name" value="' + esc(R.name) + '">' +
      '<div class="ed-tools" role="toolbar" aria-label="Editor tools">' +
      '<button class="ed-b" data-act="undo" aria-label="Undo" title="Undo (Ctrl+Z)">' + ico('undo-2') + '</button><button class="ed-b" data-act="redo" aria-label="Redo" title="Redo (Ctrl+Y)">' + ico('redo-2') + '</button><span class="ed-sep"></span>' +
      '<button class="ed-b" data-act="zout" aria-label="Zoom out" title="Zoom out">' + ico('minus') + '</button><button class="ed-zv" data-act="zfit" aria-label="Fit to screen" title="Fit to screen" id="ed-zv">100%</button><button class="ed-b" data-act="zin" aria-label="Zoom in" title="Zoom in">' + ico('plus') + '</button><span class="ed-sep"></span>' +
      '<button class="ed-b" data-act="pprev" aria-label="Previous page" title="Previous page">' + ico('chevron-up') + '</button><span class="ed-pn" id="ed-pn">Page 1 / 1</span><button class="ed-b" data-act="pnext" aria-label="Next page" title="Next page">' + ico('chevron-down') + '</button>' +
      '<span class="ed-sep"></span><label class="ed-ps"><span class="ed-sr">Page size</span><select data-ns="ds" data-k="pageSize" aria-label="Page size"><option value="A4">A4</option><option value="Letter">US Letter</option></select></label></div>' +
      '<div class="ed-dl"><button class="ed-b" data-act="file" aria-haspopup="true" aria-expanded="false" aria-label="Save and restore options" title="Save, restore, reset">' + ico('save') + '</button>' +
      '<div class="ed-menu" id="ed-fmenu" hidden><button data-act="save">' + ico('save') + 'Save now<kbd>Ctrl+S</kbd></button><button data-act="restore">' + ico('history') + 'Restore last saved version</button><button data-act="reset">' + ico('rotate-ccw') + 'Reset resume…</button></div></div>' +
      '<span class="ed-status ok" id="ed-status" role="status" aria-live="polite"><i></i><span>Saved</span></span>' +
      '<button class="ed-b ed-wide" data-act="preview" title="Preview">' + ico('eye') + '<span>Preview</span></button>' +
      '<div class="ed-dl"><button class="ed-b ed-pri" data-act="dl" aria-haspopup="true" aria-expanded="false">' + ico('download') + '<span>Download</span></button>' +
      '<div class="ed-menu" id="ed-menu" hidden><button data-act="export">' + ico('printer') + 'Preview &amp; export options</button><button data-act="dl-pdf">' + ico('file-text') + 'PDF (print to PDF)</button><button data-act="dl-html">' + ico('code') + 'HTML file</button><button data-act="dl-json">' + ico('braces') + 'Resume data (JSON)</button></div></div>' +
      '</header>' +
      '<nav class="ed-rail" aria-label="Editor panels">' + TABS.map(function (t) { return '<button data-tab="' + t[0] + '" aria-label="' + t[2] + '">' + ico(t[1]) + '<span>' + t[2] + '</span></button>'; }).join('') + '</nav>' +
      '<aside class="ed-left" id="ed-left" aria-label="Editor side panel"></aside>' +
      '<main class="ed-ws" id="ed-ws" tabindex="-1" aria-label="Resume workspace"><div class="ed-stage" id="ed-stage"><div class="ed-page" id="ed-page"><div class="ed-doc" id="ed-doc"></div><div class="ed-guides" id="ed-guides"></div><div class="ed-ov ed-ov-hov" id="ov-hov" hidden></div><div class="ed-ov ed-ov-sel" id="ov-sel" hidden></div></div></div></main>' +
      '<aside class="ed-right" id="ed-right" aria-label="Properties"></aside>' +
      '<button class="ed-fab" data-act="toggle-right" aria-label="Open properties panel">' + ico('sliders-horizontal') + '<span>Edit</span></button>' +
      '<button class="ed-exit" data-act="preview" hidden>' + ico('x') + 'Exit preview</button>' +
      '</div>';
    var root = el.firstChild, $ = function (s) { return root.querySelector(s); };
    var ws = $('#ed-ws'), stage = $('#ed-stage'), page = $('#ed-page'), doc = $('#ed-doc'), guides = $('#ed-guides'), ovSel = $('#ov-sel'), ovHov = $('#ov-hov'), left = $('#ed-left'), right = $('#ed-right');
    var pageStyle = document.createElement('style'); pageStyle.id = 'ed-print-size'; document.head.appendChild(pageStyle);

    var size = function () { return PAGES[R.designSettings.pageSize] || PAGES.A4; };
    var pages = 1;

    /* ---------- save, history ---------- */
    function status(kind, text) { var s = $('#ed-status'); s.className = 'ed-status ' + kind; s.lastChild.textContent = text; }
    function saveNow() { clearTimeout(saveT); saveT = null; RC.state.flush(); }
    function pushHist() { RC.state.commit(); syncTools(); }       /* history now lives in RC.state (shared with the form) */
    function changed(now) { drawPage(); RC.state.change('editor', !!now); syncForm(); }
    var formT = null, formUi = { open: {}, secOpen: { personal: 1, summary: 1, experience: 1 } };
    function syncForm() { if (tab !== 'content' || !leftOpen) return; clearTimeout(formT); formT = setTimeout(function () { RC.form && RC.form.refresh(); }, 250); }
    function flush() { saveNow(); }
    function undo() { RC.state.undo(); }
    function redo() { RC.state.redo(); }
    function redrawAll() { if (sel && !resolve(sel)) sel = null; $('#ed-name').value = R.name; drawPage(); renderLeft(); renderRight(); syncTools(); }
    function saveManual() { RC.state.saveToast(RC.state.manualSave()); }
    function restoreSaved() {
      if (!RC.state.differsFromSaved()) { U.toast('You are already on your latest saved version.'); return; }
      U.confirm({ title: 'Restore the last saved version?', text: 'Changes that are not saved yet will be replaced. You can press Undo to bring them back.', ok: 'Restore' }).then(function (y) {
        if (!y) return; var r = RC.state.restoreSaved(); U.toast(r.ok ? 'Restored your last saved version. Undo brings back the other one.' : r.error);
      });
    }
    function resetResume() {
      U.confirm({ title: 'Reset this resume?', text: 'All details and sections will be cleared. Your resume name, template and design are kept, and you can press Undo to bring everything back.', ok: 'Reset resume', danger: true }).then(function (y) {
        if (!y) return; var r = RC.state.reset(); if (!r.ok) return U.toast(r.error);
        var vs = loadVers(); vs.unshift({ id: M.uid(), name: 'Before reset', at: M.now(), data: r.before }); if (vs.length > 20) vs.length = 20; putVers(vs);   /* safety copy */
        sel = null; U.toast('Resume reset. Undo, or the "Before reset" version, brings your content back.');
      });
    }
    function fmenu(open) { var m = $('#ed-fmenu'); m.hidden = !open; $('[data-act=file]').setAttribute('aria-expanded', open); }
    function syncTools() {
      $('[data-act=undo]').disabled = !RC.state.canUndo(); $('[data-act=redo]').disabled = !RC.state.canRedo();
      $('[data-ns=ds][data-k=pageSize]').value = R.designSettings.pageSize === 'Letter' ? 'Letter' : 'A4';
    }

    /* ---------- page rendering, zoom, pages ---------- */
    function drawPage() {
      var s = size();
      page.style.setProperty('--pw', s.w + 'px'); page.style.setProperty('--ph', s.h + 'px'); page.style.setProperty('--pages', 1);
      doc.innerHTML = T.renderResume(R, R.templateId); markDraggable();
      var rt = doc.firstElementChild, h = rt ? rt.offsetHeight : s.h;
      pages = Math.max(1, Math.ceil((h - 2) / s.h));
      page.style.setProperty('--pages', pages);
      guides.innerHTML = ''; for (var i = 1; i < pages; i++) guides.insertAdjacentHTML('beforeend', '<div class="ed-guide" style="top:' + (i * s.h) + 'px"><span>Page ' + (i + 1) + ' starts here</span></div>');
      pageStyle.textContent = '@page{size:' + (R.designSettings.pageSize === 'Letter' ? 'letter' : 'A4') + ';margin:0}';
      applyZoom(); syncTools();
    }
    function fitZoom() { var s = size(), pad = mobile() ? 24 : 64; return Math.max(.2, Math.min(1, (ws.clientWidth - pad) / s.w)); }
    function applyZoom() {
      var s = size(); z = zoomMode === 'fit' ? fitZoom() : zoomMode;
      page.style.transform = 'scale(' + z + ')'; page.style.setProperty('--z', z); page.style.width = s.w + 'px'; page.style.height = (pages * s.h) + 'px';
      stage.style.width = (s.w * z) + 'px'; stage.style.height = (pages * s.h * z) + 'px';
      $('#ed-zv').textContent = Math.round(z * 100) + '%'; $('#ed-zv').title = zoomMode === 'fit' ? 'Fit to screen (on)' : 'Fit to screen';
      placeOv(); pageNum();
    }
    function zoomBy(f) { zoomMode = Math.max(.25, Math.min(2, Math.round(z * f * 100) / 100)); applyZoom(); }
    function pageNum() {
      var s = size(), top = ws.scrollTop - stage.offsetTop + ws.clientHeight / 3, n = Math.min(pages, Math.max(1, Math.floor(top / (s.h * z)) + 1));
      $('#ed-pn').textContent = 'Page ' + n + ' / ' + pages; return n;
    }
    function goPage(n) { var s = size(); n = Math.min(pages, Math.max(1, n)); ws.scrollTo({ top: stage.offsetTop + (n - 1) * s.h * z - 16, behavior: 'smooth' }); }

    /* ---------- selection ---------- */
    /* Some templates have no <header class="hd">; the name block is then found through .nm, grouped with its siblings. */
    function headParts() {
      var hd = doc.querySelector('header'); if (hd) return [hd];
      var nm = doc.querySelector('.nm'); if (!nm) return [];
      var p = nm.parentElement; if (!p.querySelector('section.s')) return [p];
      return [].filter.call(p.children, function (c) { return !c.matches('section.s') && !c.querySelector('section.s') && !c.matches('aside, .main, .cols'); });
    }
    function keyless() { return [].filter.call(doc.querySelectorAll('section.s'), function (x) { return !/\bs-\w+/.test(x.className); }); }
    function pick(t) {
      if (!t || !t.closest || !doc.contains(t)) return null;
      var sec = t.closest('section.s'), it, m, k, ci = 0, idx = 0;
      if (!sec) { return headParts().some(function (x) { return x.contains(t); }) ? { el: headParts(), sel: { t: 'hd', ci: -1 } } : null; }
      m = /\bs-(\w+)/.exec(sec.className);
      if (!m) return { el: sec, sel: { t: 'hd', ci: keyless().indexOf(sec) } };
      k = m[1]; if (k === 'custom') { k = 'customSections'; ci = [].indexOf.call(doc.querySelectorAll('section.s-custom'), sec); }
      it = t.closest(ITEM_SEL);
      if (it && sec.contains(it) && k !== 'summary' && k !== 'skills') { idx = [].indexOf.call(sec.querySelectorAll(ITEM_SEL), it); return { el: it, sel: { t: 'item', k: k, ci: ci, i: idx } }; }
      return { el: sec, sel: { t: 'sec', k: k, ci: ci } };
    }
    function findEl(s) {
      if (!s) return null;
      if (s.t === 'hd') return s.ci >= 0 ? keyless()[s.ci] || null : headParts();
      var sec = s.k === 'customSections' ? doc.querySelectorAll('section.s-custom')[s.ci] : doc.querySelector('section.s-' + s.k);
      if (!sec) return null; return s.t === 'sec' ? sec : sec.querySelectorAll(ITEM_SEL)[s.i] || null;
    }
    function visCustom() { return R.customSections.filter(function (c) { return !c.hidden && c.items.some(function (i) { return !i.hidden; }); }); }
    function itemList(s) { var arr = s.k === 'customSections' ? (visCustom()[s.ci] || { items: [] }).items : R[s.k]; return { all: arr, vis: arr.filter(function (x) { return !x.hidden; }) }; }
    function resolve(s) { return s.t === 'item' ? itemList(s).vis[s.i] : findEl(s); }
    function nameOf(s) {
      if (!s) return '';
      if (s.t === 'hd') return s.ci >= 0 ? 'Contact' : 'Header';
      var n = s.k === 'customSections' ? ((visCustom()[s.ci] || {}).title || 'Custom section') : M.LABELS[s.k];
      return s.t === 'sec' ? n : n + ' · item ' + (s.i + 1);
    }
    function box(o, el, label) {
      var els = el ? [].concat(el) : []; els = els.filter(Boolean);
      if (!els.length) { o.hidden = true; return; }
      var L = 1e9, T0 = 1e9, Rr = -1e9, B = -1e9, p = page.getBoundingClientRect();
      els.forEach(function (x) { var r = x.getBoundingClientRect(); L = Math.min(L, r.left); T0 = Math.min(T0, r.top); Rr = Math.max(Rr, r.right); B = Math.max(B, r.bottom); });
      o.hidden = false; o.style.left = ((L - p.left) / z) + 'px'; o.style.top = ((T0 - p.top) / z) + 'px';
      o.style.width = ((Rr - L) / z) + 'px'; o.style.height = ((B - T0) / z) + 'px'; o.style.setProperty('--iz', 1 / z); o.dataset.label = label || '';
    }
    function placeOv() { box(ovSel, findEl(sel), nameOf(sel)); }
    function select(s) {
      sel = s; placeOv(); renderRight(); revealInForm();
      if (s && mobile()) { rightOpen = true; leftOpen = false; layout(); }
    }

    /* ---------- field helpers ---------- */
    function fld(ns, k, label, val, o) {
      o = o || {}; var id = 'f-' + ns + '-' + k + (o.n || '');
      var attrs = ' id="' + id + '" data-ns="' + ns + '" data-k="' + k + '"' + (o.type ? ' data-type="' + o.type + '"' : '');
      var c = o.area ? '<textarea rows="' + (o.rows || 4) + '"' + attrs + '>' + esc(val) + '</textarea>' : '<input type="text"' + attrs + ' value="' + esc(val) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + '>';
      return '<div class="ed-f"><label for="' + id + '">' + esc(label) + '</label>' + c + '</div>';
    }
    function chk(ns, k, label, on, extra) { return '<label class="ed-chk"><input type="checkbox" data-ns="' + ns + '" data-k="' + k + '"' + (extra || '') + (on ? ' checked' : '') + '><span>' + esc(label) + '</span></label>'; }
    function seg(ns, k, cur, opts) { return '<div class="ed-seg" role="group">' + opts.map(function (o) { return '<button type="button" data-set data-ns="' + ns + '" data-k="' + k + '" data-v="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
    function fontSel() {
      return '<div class="ed-f"><label for="f-font">Body font</label><select id="f-font" data-ns="ds" data-k="fontFamily">' + FONTS.map(function (f) { return '<option value="' + esc(f[0]) + '"' + (R.designSettings.fontFamily === f[0] ? ' selected' : '') + '>' + f[1] + '</option>'; }).join('') + '</select></div>';
    }
    function accentBlock() {
      var cur = R.designSettings.accentColor, d = T.get(R.templateId), base = /^#[0-9a-f]{6}$/i.test(cur) ? cur : (d && /^#[0-9a-f]{6}$/i.test(d.accent) ? d.accent : '#0f766e');
      return '<div class="ed-sw">' + COLORS.map(function (c) { return '<button type="button" data-set data-ns="ds" data-k="accentColor" data-v="' + c + '" style="--c:' + c + '" aria-label="Accent ' + c + '" aria-pressed="' + (cur.toLowerCase() === c) + '"></button>'; }).join('') + '</div>' +
        '<div class="ed-row"><label class="ed-col"><span class="ed-sr">Custom colour</span><input type="color" data-ns="ds" data-k="accentColor" value="' + base + '" aria-label="Custom accent colour"></label><button type="button" class="ed-link" data-set data-ns="ds" data-k="accentColor" data-v="">Reset to template colour</button></div>';
    }

    /* ---------- right panel ---------- */
    function renderRight() {
      var h = '<div class="ed-ph"><h2>Properties</h2><button class="ed-b" data-act="toggle-right" aria-label="Close properties">' + ico('panel-right-close') + '</button></div><div class="ed-pb">';
      if (!sel || !resolve(sel)) {
        sel = sel && !resolve(sel) ? null : sel;
        h += '<div class="ed-empty">' + ico('mouse-pointer-click') + '<p><b>Nothing selected</b></p><p>Click the header, a section or an entry on the page to edit its content.</p></div>';
      } else { h += '<div class="ed-chip">' + ico('square-dashed-mouse-pointer') + esc(nameOf(sel)) + '</div>' + selFields(); }
      h += '<h3 class="ed-gh">Text settings</h3>' + fontSel() +
        '<div class="ed-f"><span class="ed-l">Text size</span>' + seg('ds', 'fontSize', R.designSettings.fontSize, [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']]) + '</div>' +
        '<div class="ed-f"><span class="ed-l">Spacing</span>' + seg('ds', 'spacing', R.designSettings.spacing, [['compact', 'Compact'], ['normal', 'Normal'], ['relaxed', 'Relaxed']]) + '</div>' +
        '<h3 class="ed-gh">Design settings</h3><div class="ed-f"><span class="ed-l">Accent colour</span>' + accentBlock() + '</div>' +
        '<div class="ed-f"><span class="ed-l">Page size</span>' + seg('ds', 'pageSize', R.designSettings.pageSize === 'Letter' ? 'Letter' : 'A4', [['A4', 'A4'], ['Letter', 'US Letter']]) + '</div>' +
        chk('vis', 'profilePhoto', 'Show photo (if the template has one)', R.visibilitySettings.profilePhoto) + '</div>';
      right.innerHTML = h; U.icons();
    }
    function selFields() {
      var h = '', s = sel, i;
      if (s.t === 'hd') {
        PERSONAL.forEach(function (p) { h += fld('pi', p[0], p[1], R.personalInfo[p[0]]); });
        return h + '<p class="ed-hint">Photo: use the Upload tab.</p>';
      }
      var key = s.k, order = effOrder(), pos = order.indexOf(key);
      if (s.t === 'sec') {
        if (key === 'summary') h += fld('sum', 'summary', 'Professional summary', R.summary, { area: 1, rows: 7 });
        else if (key === 'skills') h += fld('skills', 'skills', 'Skills (one per line)', R.skills.map(function (x) { return x.name; }).join('\n'), { area: 1, rows: 8 });
        else if (key === 'customSections') { var c = visCustom()[s.ci]; h += c ? fld('csec', 'title', 'Section title', c.title) + '<p class="ed-hint">Click an entry inside this section to edit it.</p><button class="ed-btn" data-act="add-item">' + ico('plus') + 'Add entry</button><button class="ed-btn" data-act="sec-dup">' + ico('copy') + 'Duplicate section</button>' : ''; }
        else h += '<p class="ed-hint">Click an entry on the page to edit it, or add a new one.</p><button class="ed-btn" data-act="add-item">' + ico('plus') + 'Add ' + ITEM_NAME[key].toLowerCase() + '</button>';
        if (key !== 'customSections') h += '<div class="ed-row">' + '<button class="ed-btn" data-act="sec-up"' + (pos <= 0 ? ' disabled' : '') + '>' + ico('arrow-up') + 'Move up</button><button class="ed-btn" data-act="sec-down"' + (pos < 0 || pos >= order.length - 1 ? ' disabled' : '') + '>' + ico('arrow-down') + 'Move down</button></div>' +
          '<button class="ed-btn ed-danger" data-act="sec-hide">' + ico('eye-off') + 'Hide section</button>';
        h += '<button class="ed-btn ed-danger" data-act="sec-del">' + ico('trash-2') + (key === 'customSections' ? 'Delete section' : 'Clear section') + '</button>';
        return h;
      }
      var it = itemList(s).vis[s.i], schema = key === 'customSections' ? { heading: 's', subheading: 's', date: 's', description: 's' } : M.ITEMS[key];
      Object.keys(schema).forEach(function (f) {
        var t = schema[f];
        if (t === 'b') h += chk('item', f, human(f), it[f]);
        else if (t === 'a') h += fld('item', f, human(f), it[f].join(f === 'achievements' ? '\n' : ', '), { area: f === 'achievements', rows: 5, type: f === 'achievements' ? 'lines' : 'csv' });
        else h += fld('item', f, human(f), it[f], { area: f === 'description', rows: 4, ph: /Date$|^date$/.test(f) ? 'YYYY-MM' : '' });
      });
      var n = itemList(s).vis.length;
      return h + '<div class="ed-row"><button class="ed-btn" data-act="item-up"' + (s.i <= 0 ? ' disabled' : '') + '>' + ico('arrow-up') + 'Move up</button><button class="ed-btn" data-act="item-down"' + (s.i >= n - 1 ? ' disabled' : '') + '>' + ico('arrow-down') + 'Move down</button></div>' +
        '<div class="ed-row"><button class="ed-btn" data-act="item-dup">' + ico('copy') + 'Duplicate</button><button class="ed-btn" data-act="item-hide">' + ico('eye-off') + 'Hide</button></div><button class="ed-btn ed-danger" data-act="item-del">' + ico('trash-2') + 'Delete this entry</button>';
    }
    function effOrder() { return RC.state.order(R); }

    /* ---------- left panel ---------- */
    function renderLeft() {
      var pb0 = left.querySelector('.ed-pb'), sc0 = pb0 && left.dataset.tab === tab ? pb0.scrollTop : 0; left.dataset.tab = tab;
      var t = TABS.filter(function (x) { return x[0] === tab; })[0], h = '<div class="ed-ph"><h2>' + t[2] + '</h2><button class="ed-b" data-act="toggle-left" aria-label="Close panel">' + ico('panel-left-close') + '</button></div><div class="ed-pb">';
      if (tab === 'templates') {
        h += '<p class="ed-hint">Your content stays the same. Only the layout changes.</p><div class="ed-tg">' + T.list().map(function (d) {
          return '<button type="button" class="ed-tc" data-tpl="' + esc(d.id) + '" aria-pressed="' + (d.id === R.templateId) + '" title="' + esc(d.name) + '">' + T.preview(R, d.id) + '<span>' + esc(d.name) + '</span></button>';
        }).join('') + '</div>';
      } else if (tab === 'content') {
        h += '<p class="ed-hint">Everything here edits your resume live. Click anything on the page to jump to it.</p><div id="ed-form" class="ed-form"></div>';
      } else if (tab === 'sections') {
        var tp = T.get(R.templateId); h += '<p class="ed-hint">Show, hide and reorder sections. Empty sections stay off the page.</p><ul class="ed-sl">';
        effOrder().forEach(function (k, i, a) {
          var empty = k === 'customSections' ? !R.customSections.some(function (c) { return c.items.length; }) : !has(R, k), off = tp && tp.supports.indexOf(k) < 0;
          h += '<li data-key="' + k + '">' + (RC.dnd.supported ? '<span class="ed-grip" draggable="true" aria-hidden="true" title="Drag to reorder">' + ico('grip-vertical') + '</span>' : '') + '<label class="ed-chk"><input type="checkbox" data-ns="vis" data-k="' + k + '"' + (R.visibilitySettings[k] !== false ? ' checked' : '') + '><span>' + M.LABELS[k] + (empty ? ' <em>empty</em>' : off ? ' <em>not in this template</em>' : '') + '</span></label>' +
            '<span class="ed-mv"><button class="ed-b" data-mv="' + k + '" data-d="-1" aria-label="Move ' + M.LABELS[k] + ' up"' + (i === 0 ? ' disabled' : '') + '>' + ico('arrow-up') + '</button><button class="ed-b" data-mv="' + k + '" data-d="1" aria-label="Move ' + M.LABELS[k] + ' down"' + (i === a.length - 1 ? ' disabled' : '') + '>' + ico('arrow-down') + '</button></span></li>';
        });
        h += '</ul><button class="ed-btn" data-act="add-custom">' + ico('plus') + 'Add custom section</button>';
      } else if (tab === 'upload') {
        var ph = R.personalInfo.profilePhoto;
        h += '<label class="ed-drop" id="ed-drop" tabindex="0">' + (ph ? '<img src="' + esc(ph) + '" alt="Current photo">' : ico('image-plus')) + '<b>' + (ph ? 'Replace photo' : 'Upload a photo') + '</b><small>JPG, PNG or WebP. Resized on this device.</small><input type="file" id="ed-file" accept="image/png,image/jpeg,image/webp" hidden></label>' +
          (ph ? '<button class="ed-btn ed-danger" data-act="photo-del">' + ico('trash-2') + 'Remove photo</button>' : '') +
          chk('vis', 'profilePhoto', 'Show photo on resume', R.visibilitySettings.profilePhoto) + '<p class="ed-hint">Only templates with a photo area show it. Your file never leaves your browser.</p>';
      } else if (tab === 'design' && RC.design) {
        h += RC.design.html(R);
      } else if (tab === 'design') {
        h += '<div class="ed-f"><span class="ed-l">Accent colour</span>' + accentBlock() + '</div>' + fontSel() +
          '<div class="ed-f"><span class="ed-l">Text size</span>' + seg('ds', 'fontSize', R.designSettings.fontSize, [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']]) + '</div>' +
          '<div class="ed-f"><span class="ed-l">Spacing</span>' + seg('ds', 'spacing', R.designSettings.spacing, [['compact', 'Compact'], ['normal', 'Normal'], ['relaxed', 'Relaxed']]) + '</div>' +
          '<div class="ed-f"><span class="ed-l">Page size</span>' + seg('ds', 'pageSize', R.designSettings.pageSize === 'Letter' ? 'Letter' : 'A4', [['A4', 'A4'], ['Letter', 'US Letter']]) + '</div>';
      } else if (tab === 'versions') {
        var vs = loadVers();
        h += '<div class="ed-f"><label for="f-vname">Version name</label><input type="text" id="f-vname" maxlength="60" placeholder="e.g. Sent to Acme"></div><button class="ed-btn ed-pri" data-act="ver-save">' + ico('bookmark-plus') + 'Save this version</button>' +
          (vs.length ? '<ul class="ed-vl">' + vs.map(function (v) { return '<li><div><b>' + esc(v.name) + '</b><small>' + new Date(v.at).toLocaleString() + '</small></div><span><button class="ed-btn" data-ver="restore" data-vid="' + v.id + '">Restore</button><button class="ed-b" data-ver="del" data-vid="' + v.id + '" aria-label="Delete version ' + esc(v.name) + '">' + ico('trash-2') + '</button></span></li>'; }).join('') + '</ul>' : '<p class="ed-hint">No saved versions yet. Save one before big changes. Restoring can be undone.</p>');
      }
      left.innerHTML = h + '</div>'; U.icons();
      if (sc0) left.querySelector('.ed-pb').scrollTop = sc0;
      if (tab === 'content') RC.form.mount($('#ed-form'), { ui: formUi, onFocus: formFocus });
      if (tab === 'sections') RC.dnd.bind(left.querySelector('.ed-sl'), { item: 'li[data-key]', handle: '.ed-grip', onDrop: function (from, to, below) { if (RC.state.reorder(from.dataset.key, to.dataset.key, below, R)) { changed(true); placeOv(); renderLeft(); } } });
      if (tab === 'templates') { T.fit(left); var a = left.querySelector('[aria-pressed=true]'); if (a) a.scrollIntoView({ block: 'nearest' }); }
      [].forEach.call(root.querySelectorAll('[data-tab]'), function (b) { b.setAttribute('aria-current', b.dataset.tab === tab && leftOpen ? 'true' : 'false'); });
    }
    var VK = 'rc-versions';
    function allVers() { try { var d = JSON.parse(localStorage.getItem(VK)); return M.isObj(d) ? d : {}; } catch (e) { return {}; } }
    function loadVers() { var l = allVers()[R.id]; return Array.isArray(l) ? l : []; }
    function putVers(l) { var d = allVers(); d[R.id] = l; try { localStorage.setItem(VK, JSON.stringify(d)); return true; } catch (e) { U.toast('Could not store versions: browser storage is full or blocked.'); return false; } }

    /* ---------- layout (panels) ---------- */
    function layout() {
      root.classList.toggle('l-open', leftOpen); root.classList.toggle('r-open', rightOpen); root.classList.toggle('is-preview', preview);
      $('.ed-exit').hidden = !preview;
      [].forEach.call(root.querySelectorAll('[data-tab]'), function (b) { b.setAttribute('aria-current', b.dataset.tab === tab && leftOpen ? 'true' : 'false'); });
      requestAnimationFrame(function () { if (zoomMode === 'fit') applyZoom(); else placeOv(); });
    }

    /* ---------- editing ---------- */
    function setVal(el) {
      var ns = el.dataset.ns, k = el.dataset.k, v = el.type === 'checkbox' ? el.checked : el.value, it;
      if (ns === 'name') { R.name = v; }
      else if (ns === 'pi') R.personalInfo[k] = v;
      else if (ns === 'sum') R.summary = v;
      else if (ns === 'ds') R.designSettings[k] = v;
      else if (ns === 'vis') R.visibilitySettings[k] = v;
      else if (ns === 'csec') { var cc = sel && visCustom()[sel.ci]; if (cc) cc.title = v; }
      else if (ns === 'skills') { var names = v.split('\n').map(function (x) { return x.trim(); }).filter(Boolean); R.skills = names.map(function (n, i) { var o = R.skills[i] ? JSON.parse(JSON.stringify(R.skills[i])) : M.normalize({ skills: [{}] }).skills[0]; o.name = n; return o; }); }
      else if (ns === 'item') {
        if (!sel || sel.t !== 'item') return; it = itemList(sel).vis[sel.i]; if (!it) return;
        it[k] = el.type === 'checkbox' ? v : el.dataset.type === 'lines' ? v.split('\n').map(function (x) { return x.trim(); }).filter(Boolean) : el.dataset.type === 'csv' ? v.split(',').map(function (x) { return x.trim(); }).filter(Boolean) : v;
      }
      if (ns === 'pi' || ns === 'sum') { var twin = root.querySelectorAll('[data-ns="' + ns + '"][data-k="' + k + '"]'); [].forEach.call(twin, function (t) { if (t !== el && t.value !== v) t.value = v; }); }
      changed(el.type === 'checkbox' || el.tagName === 'SELECT');
    }
    function swap(arr, a, b) { var t = arr[a]; arr[a] = arr[b]; arr[b] = t; }
    function moveSection(k, d) { var o = effOrder(), i = o.indexOf(k), j = i + d; if (i < 0 || j < 0 || j >= o.length) return; swap(o, i, j); R.sectionOrder = o; changed(true); }
    function photo(file) {
      if (!file) return;
      if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return U.toast('Please choose a JPG, PNG or WebP image.');
      if (file.size > 8 * 1024 * 1024) return U.toast('That image is larger than 8 MB. Please choose a smaller one.');
      var fr = new FileReader();
      fr.onerror = function () { U.toast('That file could not be read.'); };
      fr.onload = function () {
        var im = new Image();
        im.onerror = function () { U.toast('That image could not be opened.'); };
        im.onload = function () {
          var m = 400, sc = Math.min(1, m / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
          var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
          R.personalInfo.profilePhoto = c.toDataURL('image/jpeg', .85); R.visibilitySettings.profilePhoto = true; changed(true); renderLeft(); renderRight(); U.toast('Photo added.');
        };
        im.src = fr.result;
      };
      fr.readAsDataURL(file);
    }
    function download(name, type, text) { var b = new Blob([text], { type: type }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000); }
    function fileName(ext) { return (R.name || 'resume').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() + '.' + ext; }
    function menu(open) { var m = $('#ed-menu'); m.hidden = !open; $('[data-act=dl]').setAttribute('aria-expanded', open); }

    function act(a, b) {
      var s = sel, L, i, j;
      switch (a) {
        case 'undo': undo(); break; case 'redo': redo(); break;
        case 'zin': zoomBy(1.15); break; case 'zout': zoomBy(1 / 1.15); break; case 'zfit': zoomMode = 'fit'; applyZoom(); break;
        case 'pprev': goPage(pageNum() - 1); break; case 'pnext': goPage(pageNum() + 1); break;
        case 'preview': preview = !preview; if (preview) { sel = null; placeOv(); ovHov.hidden = true; menu(false); } layout(); break;
        case 'dl': fmenu(false); menu($('#ed-menu').hidden); break;
        case 'file': menu(false); fmenu($('#ed-fmenu').hidden); break;
        case 'save': fmenu(false); saveManual(); break;
        case 'restore': fmenu(false); restoreSaved(); break;
        case 'reset': fmenu(false); resetResume(); break;
        case 'export': menu(false); flush(); RC.exporter.open(R); break;
        case 'dl-pdf': menu(false); flush(); sel = null; placeOv(); setTimeout(function () { window.print(); }, 50); break;
        case 'dl-html': menu(false); download(fileName('html'), 'text/html', '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>' + esc(R.name) + '</title><link href="' + document.querySelector('link[href*="fonts.googleapis.com/css2"]').href + '" rel="stylesheet"><style>body{margin:0;background:#e9ebf0;display:flex;justify-content:center}' + document.getElementById('rt-css').textContent + '.rt{width:' + size().w + 'px;min-height:' + size().h + 'px}@page{size:' + (R.designSettings.pageSize === 'Letter' ? 'letter' : 'A4') + ';margin:0}@media print{body{background:none}}</style></head><body>' + T.renderResume(R, R.templateId) + '</body></html>'); U.toast('HTML file downloaded.'); break;
        case 'dl-json': menu(false); download(fileName('json'), 'application/json', JSON.stringify(M.normalize(R), null, 2)); U.toast('Resume data downloaded.'); break;
        case 'toggle-left': leftOpen = !leftOpen; if (leftOpen && mobile()) rightOpen = false; layout(); break;
        case 'toggle-right': rightOpen = !rightOpen; if (rightOpen && mobile()) leftOpen = false; layout(); break;
        case 'sec-up': case 'sec-down': if (s && s.t === 'sec') { moveSection(s.k, a === 'sec-up' ? -1 : 1); renderRight(); placeOv(); } break;
        case 'sec-hide': if (s && s.t === 'sec') { R.visibilitySettings[s.k] = false; sel = null; changed(true); renderRight(); renderLeft(); U.toast('Section hidden. Turn it back on in the Sections tab.'); } break;
        case 'add-item':
          if (s && s.t === 'sec' && s.k === 'customSections') {
            var c2 = visCustom()[s.ci]; if (c2) { c2.items.push(M.normalize({ customSections: [{ items: [{ heading: 'New entry' }] }] }).customSections[0].items[0]); changed(true); sel = { t: 'item', k: 'customSections', ci: s.ci, i: itemList({ k: 'customSections', ci: s.ci }).vis.length - 1 }; placeOv(); renderRight(); revealInForm(); }
          } else if (s && s.t === 'sec' && M.ITEMS[s.k]) {
            var blank = M.normalize((function () { var o = {}; o[s.k] = [{}]; return o; })())[s.k][0]; R[s.k].push(blank);
            changed(true); var n = R[s.k].filter(function (x) { return !x.hidden; }).length;
            /* a blank entry may render as an empty block; select it so it can be filled in */
            sel = { t: 'item', k: s.k, ci: 0, i: n - 1 }; placeOv(); renderRight(); if (!findEl(sel)) { sel = { t: 'sec', k: s.k, ci: 0 }; placeOv(); U.toast('Added. Type a title in the full form to see it on the page.'); renderRight(); }
          } break;
        case 'item-up': case 'item-down':
          if (s && s.t === 'item') { L = itemList(s); j = s.i + (a === 'item-up' ? -1 : 1); if (j >= 0 && j < L.vis.length) { var A = L.all.indexOf(L.vis[s.i]), B = L.all.indexOf(L.vis[j]); swap(L.all, A, B); changed(true); sel = { t: 'item', k: s.k, ci: s.ci, i: j }; placeOv(); renderRight(); } } break;
        case 'item-del':
          if (s && s.t === 'item') { L = itemList(s); i = L.all.indexOf(L.vis[s.i]); if (i > -1) L.all.splice(i, 1); sel = { t: 'sec', k: s.k, ci: s.ci }; changed(true); if (!findEl(sel)) sel = null; placeOv(); renderRight(); U.toast('Entry deleted. Press undo to bring it back.'); } break;
        case 'add-custom':
          var cs = M.normalize({ customSections: [{ title: 'New section', items: [{ heading: 'Entry title' }] }] }).customSections[0];
          R.customSections.push(cs); R.visibilitySettings.customSections = true; changed(true);
          sel = { t: 'sec', k: 'customSections', ci: visCustom().indexOf(cs) }; placeOv(); renderRight(); if (tab === 'sections') renderLeft(); revealInForm(); U.toast('Custom section added. Rename it in the panel on the right.'); break;
        case 'sec-dup':
          if (s && s.t === 'sec' && s.k === 'customSections') { var c0 = visCustom()[s.ci], cp0 = c0 && RC.state.reid(JSON.parse(JSON.stringify(c0))); if (cp0) { cp0.title = (c0.title + ' (copy)').trim(); R.customSections.splice(R.customSections.indexOf(c0) + 1, 0, cp0); changed(true); sel = { t: 'sec', k: 'customSections', ci: s.ci + 1 }; placeOv(); renderRight(); revealInForm(); U.toast('Section duplicated.'); } } break;
        case 'sec-del':
          if (s && s.t === 'sec') {
            var cust = s.k === 'customSections', c1 = cust && visCustom()[s.ci], nm0 = cust ? ((c1 && c1.title) || 'this section') : M.LABELS[s.k];
            U.confirm({ title: 'Delete this section?', text: cust ? '“' + esc(nm0) + '” and its entries will be removed from your resume. Undo brings them back.' : 'Everything in “' + esc(nm0) + '” will be removed. The section stays available, empty. Undo brings it back.', ok: 'Delete', danger: true }).then(function (y) {
              if (!y) return;
              if (cust) { if (c1 && R.customSections.indexOf(c1) > -1) R.customSections.splice(R.customSections.indexOf(c1), 1); } else if (s.k === 'summary') R.summary = ''; else R[s.k] = [];
              sel = null; changed(true); placeOv(); renderRight(); if (tab === 'sections') renderLeft(); U.toast('Section deleted. Press undo to bring it back.');
            });
          } break;
        case 'item-dup':
          if (s && s.t === 'item') { L = itemList(s); i = L.all.indexOf(L.vis[s.i]); if (i > -1) { L.all.splice(i + 1, 0, RC.state.reid(JSON.parse(JSON.stringify(L.all[i])))); changed(true); sel = { t: 'item', k: s.k, ci: s.ci, i: s.i + 1 }; placeOv(); renderRight(); revealInForm(); U.toast('Entry duplicated.'); } } break;
        case 'item-hide':
          if (s && s.t === 'item') { L = itemList(s); L.vis[s.i].hidden = true; sel = { t: 'sec', k: s.k, ci: s.ci }; changed(true); if (!findEl(sel)) sel = null; placeOv(); renderRight(); U.toast('Entry hidden. Show it again from the Content tab.'); } break;
        case 'photo-del': R.personalInfo.profilePhoto = ''; changed(true); renderLeft(); break;
        case 'ver-save':
          var nm = ($('#f-vname').value || '').trim().slice(0, 60), vs = loadVers(); flush();
          vs.unshift({ id: M.uid(), name: nm || 'Version ' + (vs.length + 1), at: M.now(), data: JSON.parse(JSON.stringify(R)) }); if (vs.length > 20) vs.length = 20;
          if (putVers(vs)) { U.toast('Version saved.'); renderLeft(); } break;
      }
    }

    /* ---------- events ---------- */
    root.addEventListener('input', function (e) { var t = e.target; if (t.dataset && t.dataset.ns && t.type !== 'checkbox' && t.tagName !== 'SELECT') setVal(t); });
    root.addEventListener('change', function (e) {
      var t = e.target;
      if (t.id === 'ed-file') { photo(t.files[0]); t.value = ''; }
      else if (t.dataset && t.dataset.ns && (t.type === 'checkbox' || t.tagName === 'SELECT')) { setVal(t); if (t.dataset.k === 'pageSize' || t.dataset.k === 'fontFamily') { renderRight(); if (tab === 'design') renderLeft(); } if (t.dataset.ns === 'vis' && tab === 'upload') renderLeft(); if (t.dataset.ns === 'vis') renderRight(); }
    });
    root.addEventListener('click', function (e) {
      var t = e.target, b;
      if ((b = t.closest('[data-dp]')) && RC.design) { RC.design.apply(R, b.dataset.dp); changed(true); renderLeft(); renderRight(); return; }
      if ((b = t.closest('[data-set]'))) { var f = { dataset: { ns: b.dataset.ns, k: b.dataset.k }, value: b.dataset.v, type: 'text', tagName: 'BUTTON' }; setVal(f); renderRight(); if (tab === 'design') renderLeft(); return; }
      if ((b = t.closest('[data-tab]'))) { if (tab === b.dataset.tab && leftOpen) leftOpen = false; else { tab = b.dataset.tab; leftOpen = true; if (mobile()) rightOpen = false; renderLeft(); } layout(); return; }
      if ((b = t.closest('[data-tpl]'))) { R.templateId = b.dataset.tpl; changed(true); [].forEach.call(left.querySelectorAll('[data-tpl]'), function (x) { x.setAttribute('aria-pressed', x === b); }); renderRight(); return; }
      if ((b = t.closest('[data-mv]'))) { moveSection(b.dataset.mv, +b.dataset.d); renderLeft(); return; }
      if ((b = t.closest('[data-ver]'))) {
        var vs = loadVers(), v = vs.filter(function (x) { return x.id === b.dataset.vid; })[0]; if (!v) return;
        if (b.dataset.ver === 'del') { putVers(vs.filter(function (x) { return x !== v; })); renderLeft(); }
        else { pushHist(); RC.state.replace(M.normalize(v.data)); sel = null; $('#ed-name').value = R.name; changed(true); renderLeft(); renderRight(); U.toast('Restored “' + v.name + '”. Undo brings back your previous version.'); }
        return;
      }
      if ((b = t.closest('[data-act]')) && !b.disabled) { act(b.dataset.act, b); return; }
      if (!$('#ed-menu').hidden && !t.closest('.ed-dl')) menu(false);
      if (!$('#ed-fmenu').hidden && !t.closest('.ed-dl')) fmenu(false);
      if (t.closest('#ed-drop')) return;
      if (doc.contains(t)) { var p = pick(t); select(p ? p.sel : null); }
      else if (t === ws || t === stage || t === page || t === guides) select(null);
    });
    doc.addEventListener('mouseover', function (e) { var p = pick(e.target); box(ovHov, p && !(sel && JSON.stringify(sel) === JSON.stringify(p.sel)) ? p.el : null); });
    doc.addEventListener('mouseleave', function () { ovHov.hidden = true; });
    ws.addEventListener('scroll', pageNum, { passive: true });
    ws.addEventListener('wheel', function (e) { if (e.ctrlKey || e.metaKey) { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.08 : 1 / 1.08); } }, { passive: false });
    $('#ed-left').addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.id === 'ed-drop') { e.preventDefault(); $('#ed-file').click(); } });
    var dz = function (e) { var d = e.target.closest && e.target.closest('#ed-drop'); if (d) { e.preventDefault(); if (e.type === 'drop') photo(e.dataTransfer.files[0]); } };
    left.addEventListener('dragover', dz); left.addEventListener('drop', dz);

    $('#ed-status').addEventListener('click', function () { if (this.classList.contains('err')) saveManual(); });
    $('.ed-top a.ed-b').addEventListener('click', function (e) {   /* leaving while a save keeps failing: warn first */
      if (RC.state.hasUnsaved()) RC.state.flush(); if (!RC.state.hasUnsaved()) return;
      e.preventDefault(); var h = this.getAttribute('href'), offAuto = RC.settings && RC.settings.get().autosave === false;
      U.confirm({ title: 'Leave without saving?', text: offAuto ? 'Autosave is off and you have unsaved changes. Press Save (or Ctrl+S) first, or leave and lose them.' : 'Your latest changes could not be saved to this browser. They are still in memory, but will be lost if you close the tab.', ok: 'Leave anyway', danger: true }).then(function (y) { if (y) location.hash = h; });
    });
    function key(e) {
      var inField = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName), mod = e.ctrlKey || e.metaKey, k = (e.key || '').toLowerCase();
      /* Ctrl+S, Ctrl+Z, Ctrl+Shift+Z and Ctrl+Y are handled centrally in RC.state */
      if (e.key === 'Escape') { if (!$('#ed-fmenu').hidden) fmenu(false); else if (!$('#ed-menu').hidden) menu(false); else if (preview) { preview = false; layout(); } else if (sel && !inField) select(null); }
    }
    function resize() { if (zoomMode === 'fit') applyZoom(); else placeOv(); }
    function leave() { if (hashPath() !== 'editor') teardown(); }
    function teardown() {
      flush(); off.forEach(function (f) { f(); }); off = []; document.body.classList.remove('ed-on'); pageStyle.remove(); cleanup = null;
    }
    document.addEventListener('keydown', key); addEventListener('resize', resize); addEventListener('hashchange', leave); addEventListener('pagehide', flush);
    off.push(function () { document.removeEventListener('keydown', key); removeEventListener('resize', resize); removeEventListener('hashchange', leave); removeEventListener('pagehide', flush); });
    cleanup = teardown;

    /* ---------- Part 12: form <-> preview connection, page drag and drop ---------- */
    function revealInForm() {
      if (tab !== 'content' || !leftOpen || !sel || !RC.form) return;
      if (sel.t === 'hd') return RC.form.reveal('personal', []);
      var ids = [], c = sel.k === 'customSections' ? visCustom()[sel.ci] : null;
      if (c) ids.push(c.id);
      if (sel.t === 'item') { var it = itemList(sel).vis[sel.i]; if (it) ids.push(it.id); }
      RC.form.reveal(sel.k, ids);
    }
    function formFocus(t) {
      var sec = t.closest && t.closest('.fm-s'); if (!sec) return; var k = sec.dataset.sec, ns;
      if (k === 'personal') ns = { t: 'hd', ci: -1 };
      else {
        ns = { t: 'sec', k: k, ci: 0 };
        var box = t.closest('.fm-i');
        if (box && k === 'customSections') {
          var nested = box.dataset.kind === 'customItems', par = nested ? box.parentElement.closest('.fm-i') : box, ci = R.customSections.filter(function (x) { return !x.hidden && x.items.some(function (i) { return !i.hidden; }); }).findIndex(function (x) { return par && x.id === par.dataset.id; });
          if (ci > -1) { ns.ci = ci; if (nested) { var ii = R.customSections.filter(function (x) { return !x.hidden; })[ci] ? visCustom()[ci].items.filter(function (i) { return !i.hidden; }).findIndex(function (i) { return i.id === box.dataset.id; }) : -1; if (ii > -1) ns = { t: 'item', k: k, ci: ci, i: ii }; } }
        } else if (box && k !== 'summary' && k !== 'skills') {
          var idx = R[k].filter(function (x) { return !x.hidden; }).findIndex(function (x) { return x.id === box.dataset.id; });
          if (idx > -1) ns = { t: 'item', k: k, ci: 0, i: idx };
        }
      }
      if (JSON.stringify(ns) === JSON.stringify(sel)) return;
      sel = ns; placeOv(); renderRight();
    }
    function markDraggable() { if (!RC.dnd.supported) return; [].forEach.call(doc.querySelectorAll('section.s'), function (x) { if (/\bs-\w+/.test(x.className)) x.setAttribute('draggable', 'true'); }); }
    function secKey(x) { var m = /\bs-(\w+)/.exec(x.className); return m ? (m[1] === 'custom' ? 'customSections' : m[1]) : ''; }
    RC.dnd.bind(doc, { item: 'section.s[draggable]', onDrop: function (from, to, below) {
      var a = secKey(from), b = secKey(to); if (!a || !b || a === b) return;
      if (RC.state.reorder(a, b, below, R)) { changed(true); sel = { t: 'sec', k: a, ci: 0 }; placeOv(); renderRight(); if (tab === 'sections') renderLeft(); U.toast('Section moved.'); }
    } });
    off.push(RC.state.subscribe(function (ev) {
      if (cleanup !== teardown) return;
      if (ev.type === 'saving') status('busy', 'Saving…');
      else if (ev.type === 'unsaved') status('err', 'Unsaved changes (autosave off)');
      else if (ev.type === 'saved') { if (ev.persisted) status('ok', 'Saved'); else status('warn', 'Saved for this session only'); }
      else if (ev.type === 'error') { status('err', 'Save failed'); $('#ed-status').title = (ev.message || 'Could not save.') + ' Click to try again.'; }
      else if (ev.type === 'history') syncTools();
      else if (ev.type === 'change' && ev.source === 'history') redrawAll();
      else if (ev.type === 'change' && ev.source === 'form') { drawPage(); if (sel && !resolve(sel)) sel = null; placeOv(); renderRight(); }
    }));

    /* ---------- start ---------- */
    if (mobile()) { leftOpen = false; rightOpen = false; }
    if (!S.status().persistent) status('warn', 'Browser storage unavailable: changes last only for this session');
    syncTools();
    layout(); renderLeft(); renderRight(); drawPage();
    document.fonts && document.fonts.ready && document.fonts.ready.then(function () { if (cleanup === teardown) drawPage(); });
    U.icons();
  };
})();
