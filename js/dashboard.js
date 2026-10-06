/* Dashboard (Part 15): welcome, stats, search, sort, grid/list, create options, per-resume actions.
   All data lives in this browser (RC.store). No accounts, no cloud. */
(function () {
  var U = RC.ui, S = RC.store, M = RC.model, e = M.esc, PREF = 'rc-dash-prefs';
  var fmt = function (d) { try { return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); } catch (x) { return ''; } };
  var nice = function (id) { var t = RC.templates && RC.templates.get(id); return t ? t.name : id.replace(/-/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); }); };
  var WEEK = 7 * 864e5;
  var SORTS = [['updated', 'Last edited'], ['created', 'Newest created'], ['name', 'Name (A–Z)'], ['template', 'Template'], ['fav', 'Favorites first']];

  function prefs() { try { var p = JSON.parse(localStorage.getItem(PREF)); if (p && typeof p === 'object') return p; } catch (x) {} return {}; }
  function savePrefs(p) { try { localStorage.setItem(PREF, JSON.stringify(p)); } catch (x) {} }

  function ask(title, label, value, ok) {
    return new Promise(function (res) {
      var d = U.modal({
        title: title, body: '<div class="fld"><label for="rn">' + label + '</label><input id="rn" maxlength="80" value="' + e(value) + '"></div>',
        actions: [{ label: 'Cancel', value: 'no' }, { label: ok, kind: 'btn-p', value: 'yes' }],
        onClose: function (v) { res(v === 'yes' ? d.querySelector('#rn').value : null); }
      });
      var i = d.querySelector('#rn'); i.focus(); i.select();
      i.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') d.close('yes'); });
    });
  }
  function result(r, msg) {
    r.ok ? U.toast(msg, 'ok') : U.toast(r.error || 'Something went wrong.');
    if (r.ok && r.persisted === false && !S.status().persistent) U.toast('Browser storage is unavailable, so this lasts only for this session.');
    return r;
  }
  function openEditor(id) { location.hash = '#/resume-builder?id=' + encodeURIComponent(id); }

  /* ---------- downloads (work straight from saved data) ---------- */
  function fileName(r, ext) { return (r.name || 'resume').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase().slice(0, 60) + '.' + ext; }
  function save(name, type, text) {
    var b = new Blob([text], { type: type }), a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function pageDoc(r) {
    var sz = r.designSettings.pageSize === 'Letter' ? { w: 816, h: 1056, n: 'letter' } : { w: 794, h: 1123, n: 'A4' };
    var fl = document.querySelector('link[href*="fonts.googleapis.com/css2"]');
    return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>' + e(r.name) + '</title>' + (fl ? '<link href="' + fl.href + '" rel="stylesheet">' : '') +
      '<style>body{margin:0;background:#e9ebf0;display:flex;justify-content:center}' + (document.getElementById('rt-css') ? document.getElementById('rt-css').textContent : '') +
      '.rt{width:' + sz.w + 'px;min-height:' + sz.h + 'px}@page{size:' + sz.n + ';margin:0}@media print{body{background:none}}</style></head><body>' +
      RC.templates.renderResume(r, r.templateId) + '</body></html>';
  }
  function printPdf(r) {
    var f = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    f.srcdoc = pageDoc(r); document.body.appendChild(f);
    f.onload = function () {
      var go = function () { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (x) { U.toast('Printing is blocked here. Download the HTML file instead.'); } setTimeout(function () { f.remove(); }, 60000); };
      var w = f.contentWindow; (w.document.fonts && w.document.fonts.ready ? w.document.fonts.ready : Promise.resolve()).then(function () { setTimeout(go, 150); });
    };
  }
  function download(r) {
    U.modal({
      title: 'Download “' + e(r.name) + '”',
      body: '<p style="margin-bottom:12px">Choose a format. Files are created in your browser.</p><div class="dl-opts">' +
        '<button type="button" class="btn btn-p" data-f="export">Preview &amp; export options (A4 / Letter, margins)</button>' +
        '<button type="button" class="btn btn-o" data-f="pdf">Download PDF (choose “Save as PDF” in print window)</button>' +
        '<button type="button" class="btn btn-o" data-f="html">HTML file</button>' +
        '<button type="button" class="btn btn-o" data-f="json">Resume data (JSON)</button></div>',
      actions: [{ label: 'Close', value: 'x' }]
    }).addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-f]'); if (!b) return;
      var f = b.dataset.f; b.closest('dialog').close('x');
      if (f === 'pdf') RC.exporter.print(r, {}, 'pdf');
      else if (f === 'export') RC.exporter.open(r);
      else if (f === 'html') { save(fileName(r, 'html'), 'text/html', pageDoc(r)); U.toast('HTML file downloaded.', 'ok'); }
      else { save(fileName(r, 'json'), 'application/json', JSON.stringify(M.normalize(r), null, 2)); U.toast('Resume data downloaded.', 'ok'); }
    });
  }

  /* ---------- creation ---------- */
  function createBlank() {
    ask('New blank resume', 'Resume name', '', 'Create').then(function (n) {
      if (n === null) return; var r = result(S.create({ name: n }), 'Resume created.'); if (r.ok && r.resume) openEditor(r.resume.id);
    });
  }
  function createSample() {
    var keys = Object.keys(RC.sample);
    U.modal({
      title: 'Add a sample resume', body: '<p>Sample resumes use made-up details, so you can explore safely.</p>',
      actions: [{ label: 'Cancel', value: 'no' }].concat(keys.map(function (k, i) { return { label: RC.sample[k].label, kind: i ? 'btn-p' : 'btn-o', value: k }; })),
      onClose: function (v) { if (RC.sample[v]) { var r = result(S.createSample(v), 'Sample added.'); if (r.ok && r.resume) openEditor(r.resume.id); } }
    });
  }
  function chooseTemplate() {
    var all = RC.templates.list(), pick = RC.templates.DEFAULT_ID;
    var d = U.modal({
      title: 'Choose a template', wide: true,
      body: '<div class="fld"><label for="dt-q">Search templates</label><input id="dt-q" type="search" placeholder="Name or category"></div><div class="dt-grid" id="dt-g"></div>',
      actions: [{ label: 'Cancel', value: 'no' }, { label: 'Create resume', kind: 'btn-p', value: 'yes' }],
      onClose: function (v) {
        if (v !== 'yes') return; var t = RC.templates.get(pick);
        var r = result(S.create({ name: 'My ' + (t ? t.name : 'new') + ' resume', templateId: pick }), 'Resume created.'); if (r.ok && r.resume) openEditor(r.resume.id);
      }
    });
    var g = d.querySelector('#dt-g'), q = d.querySelector('#dt-q');
    function draw() {
      var s = q.value.trim().toLowerCase(), l = all.filter(function (t) { return !s || (t.name + ' ' + (t.category || '')).toLowerCase().indexOf(s) > -1; });
      g.innerHTML = l.length ? l.map(function (t) {
        return '<button type="button" class="dt-i" data-id="' + e(t.id) + '" aria-pressed="' + (t.id === pick) + '"><span class="dt-sw" style="background:' + e(t.accent || '#0f766e') + '"></span><b>' + e(t.name) + '</b><small>' + e(t.category || '') + '</small></button>';
      }).join('') : '<p class="dt-none">No templates match “' + e(q.value) + '”.</p>';
    }
    draw(); q.addEventListener('input', draw);
    g.addEventListener('click', function (ev) { var b = ev.target.closest('[data-id]'); if (!b) return; pick = b.dataset.id; g.querySelectorAll('.dt-i').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); });
    q.focus();
  }
  function createMenu() {
    U.modal({
      title: 'Create a new resume',
      body: '<div class="mk-opts">' +
        '<button type="button" class="mk" data-m="blank"><i data-lucide="file-plus"></i><b>Blank resume</b><small>Start empty and fill it in yourself.</small></button>' +
        '<button type="button" class="mk" data-m="template"><i data-lucide="layout-template"></i><b>Choose template</b><small>Pick a design first, then add your details.</small></button>' +
        '<button type="button" class="mk" data-m="sample"><i data-lucide="wand-sparkles"></i><b>Sample resume</b><small>Start from made-up details to see how it looks.</small></button></div>',
      actions: [{ label: 'Cancel', value: 'x' }],
      onClose: function (v) { if (v === 'blank') createBlank(); else if (v === 'template') chooseTemplate(); else if (v === 'sample') createSample(); }
    }).addEventListener('click', function (ev) { var b = ev.target.closest('[data-m]'); if (b) b.closest('dialog').close(b.dataset.m); });
  }

  /* ---------- page ---------- */
  RC.pages.dashboard = function (el) {
    var P = prefs(), st = { q: '', sort: SORTS.some(function (s) { return s[0] === P.sort; }) ? P.sort : 'updated', view: P.view === 'list' ? 'list' : 'grid', favOnly: false };
    var qFocus = false;

    function stats(rs) {
      var now = Date.now(), recent = rs.filter(function (r) { return now - Date.parse(r.updatedAt) <= WEEK; }).length;
      var used = {}; rs.forEach(function (r) { used[r.templateId] = 1; });
      return [['file-text', rs.length, 'Total resumes'], ['clock', recent, 'Edited in last 7 days'], ['heart', rs.filter(function (r) { return r.favorite; }).length, 'Favorites'], ['layout-template', Object.keys(used).length, 'Templates used']]
        .map(function (s) { return '<div class="ds-stat"><i data-lucide="' + s[0] + '"></i><div><strong>' + s[1] + '</strong><span>' + s[2] + '</span></div></div>'; }).join('');
    }
    function visibleList(rs) {
      var q = st.q.trim().toLowerCase();
      var l = rs.filter(function (r) { return (!st.favOnly || r.favorite) && (!q || (r.name + ' ' + nice(r.templateId) + ' ' + r.personalInfo.fullName + ' ' + r.personalInfo.jobTitle).toLowerCase().indexOf(q) > -1); });
      var by = { updated: function (a, b) { return Date.parse(b.updatedAt) - Date.parse(a.updatedAt); }, created: function (a, b) { return Date.parse(b.createdAt) - Date.parse(a.createdAt); },
        name: function (a, b) { return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }); }, template: function (a, b) { return nice(a.templateId).localeCompare(nice(b.templateId)) || a.name.localeCompare(b.name); },
        fav: function (a, b) { return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0) || Date.parse(b.updatedAt) - Date.parse(a.updatedAt); } };
      return l.sort(by[st.sort]);
    }
    function card(r) {
      var thumb = '<div class="rc-thumb">' + RC.templates.preview(r, r.templateId) + '</div>';
      return '<article class="rcard rc2" data-id="' + e(r.id) + '">' + thumb + '<div class="rc-main"><div class="rc-top"><h3>' + e(r.name) + '</h3>' +
        '<button type="button" class="fav2" data-a="fav" aria-pressed="' + !!r.favorite + '" aria-label="' + (r.favorite ? 'Remove ' : 'Add ') + e(r.name) + (r.favorite ? ' from favorites' : ' to favorites') + '"><i data-lucide="heart"></i></button></div>' +
        '<p>' + e(r.personalInfo.jobTitle || 'No job title yet') + '</p><small>' + e(nice(r.templateId)) + ' template &middot; edited ' + fmt(r.updatedAt) + '</small>' +
        '<div class="rc-act"><button class="btn btn-p btn-sm" data-a="edit">Edit</button><button class="btn btn-o btn-sm" data-a="dup">Duplicate</button><button class="btn btn-o btn-sm" data-a="rename">Rename</button><button class="btn btn-o btn-sm" data-a="dl">Download</button><button class="btn btn-d btn-sm" data-a="del">Delete</button></div></div></article>';
    }
    function list() {
      var rs = S.list(), shown = visibleList(rs), box = el.querySelector('#ds-list'); if (!box) return;
      el.querySelector('#ds-count').textContent = rs.length ? shown.length + ' of ' + rs.length + ' resume' + (rs.length === 1 ? '' : 's') : '';
      if (!rs.length) box.innerHTML = U.empty('folder-open', 'No resumes yet', 'Create your first resume. It is saved in this browser only.', '<button type="button" class="btn btn-p" data-a="create"><i data-lucide="plus"></i>Create New Resume</button><button type="button" class="btn btn-o" data-a="sample"><i data-lucide="wand-sparkles"></i>Add sample resume</button>');
      else if (!shown.length) box.innerHTML = U.empty('search-x', 'No resumes match', st.favOnly && !st.q ? 'You have not marked any favorites yet. Select the heart on a resume to add it.' : 'Nothing matches “' + e(st.q) + '”. Try another word.', '<button type="button" class="btn btn-o" data-a="clear">Clear search and filters</button>');
      else box.innerHTML = '<div class="ds-cards ' + st.view + '">' + shown.map(card).join('') + '</div>';
      el.querySelector('#ds-stats').innerHTML = stats(rs);
      RC.templates.fit(box); U.icons();
    }
    function draw() {
      var rs = S.list(), s = S.status();
      var note = !s.persistent ? '<p class="banner">Browser storage is unavailable or full. Your resumes will be lost when you close this tab.</p>' : '';
      if (s.recovered) note += '<p class="banner">Some saved data could not be read and was set aside. Valid resumes were kept.</p>';
      el.innerHTML = '<header class="ph"><div class="wrap"><h1>Welcome back</h1><p class="lead">' + (rs.length ? 'Pick up where you left off, or start something new.' : 'Create your first resume in a few minutes.') + ' Your resumes are saved in this browser.</p>' +
        '<div class="ds-head"><div class="ds-search"><i data-lucide="search"></i><input id="ds-q" type="search" placeholder="Search resumes" aria-label="Search resumes" value="' + e(st.q) + '"></div>' +
        '<button type="button" class="btn btn-p" data-a="create"><i data-lucide="plus"></i>Create New Resume</button></div></div></header>' +
        '<div class="wrap pg">' + note + '<div class="ds-stats" id="ds-stats"></div>' +
        '<div class="ds-bar"><span id="ds-count" class="ds-count" aria-live="polite"></span><div class="ds-tools">' +
        '<button type="button" class="btn btn-o btn-sm" id="ds-fav" aria-pressed="' + st.favOnly + '"><i data-lucide="heart"></i>Favorites</button>' +
        '<label class="ds-sort"><span>Sort</span><select id="ds-sort" aria-label="Sort resumes">' + SORTS.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === st.sort ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>' +
        '<div class="ds-view" role="group" aria-label="View"><button type="button" data-v="grid" aria-pressed="' + (st.view === 'grid') + '" aria-label="Grid view"><i data-lucide="layout-grid"></i></button><button type="button" data-v="list" aria-pressed="' + (st.view === 'list') + '" aria-label="List view"><i data-lucide="list"></i></button></div></div></div>' +
        '<div id="ds-list"></div></div>';
      list();
      var q = el.querySelector('#ds-q'); if (qFocus) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
    }
    draw();

    var on = function () { if (el.isConnected && location.hash.split('?')[0] === '#/dashboard') { qFocus = document.activeElement && document.activeElement.id === 'ds-q'; draw(); } else document.removeEventListener('rc:resumes-changed', on); };
    document.addEventListener('rc:resumes-changed', on);

    el.oninput = function (ev) { if (ev.target.id === 'ds-q') { st.q = ev.target.value; list(); } };
    el.onchange = function (ev) { if (ev.target.id === 'ds-sort') { st.sort = ev.target.value; P.sort = st.sort; savePrefs(P); list(); } };
    el.onclick = function (ev) {
      var v = ev.target.closest('[data-v]');
      if (v) { st.view = v.dataset.v; P.view = st.view; savePrefs(P); el.querySelectorAll('[data-v]').forEach(function (b) { b.setAttribute('aria-pressed', b === v); }); list(); return; }
      if (ev.target.closest('#ds-fav')) { st.favOnly = !st.favOnly; el.querySelector('#ds-fav').setAttribute('aria-pressed', st.favOnly); list(); return; }
      var b = ev.target.closest('[data-a]'); if (!b) return;
      var a = b.dataset.a, box = b.closest('[data-id]'), id = box && box.dataset.id, r = id && S.load(id);
      if (a === 'create') return createMenu();
      if (a === 'sample') return createSample();
      if (a === 'clear') { st.q = ''; st.favOnly = false; draw(); return; }
      if (!r) return U.toast('That resume no longer exists.');
      if (a === 'edit') openEditor(id);
      else if (a === 'fav') { r.favorite = !r.favorite; var u = S.save(r); u.ok ? U.toast(r.favorite ? 'Added to favorites.' : 'Removed from favorites.', 'ok') : U.toast(u.error); }
      else if (a === 'rename') ask('Rename resume', 'Resume name', r.name, 'Save').then(function (n) { if (n !== null) result(S.rename(id, n), 'Renamed.'); });
      else if (a === 'dup') result(S.duplicate(id), 'Duplicated.');
      else if (a === 'dl') download(r);
      else if (a === 'del') U.confirm({ title: 'Delete this resume?', text: '“' + e(r.name) + '” will be removed from this browser. This cannot be undone. Download a JSON copy first if you may need it.', ok: 'Delete', danger: true }).then(function (y) { if (y) result(S.remove(id), 'Deleted.'); });
    };
  };
})();
