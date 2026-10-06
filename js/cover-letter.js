/* Cover Letter Builder (Part 17). Replaces the Part 2 placeholder (loaded after pages.js).
   Letters are stored in this browser only (key "rc-letters"). Reuses the shared UI, modal, toast,
   scaled preview (RC.templates.fit) and print approach from the resume export. */
RC.letters = (function () {
  var M = RC.model, KEY = 'rc-letters', mem = null, ls = null;
  var FONTS = { 'Inter': "'Inter',system-ui,sans-serif", 'Lora': "'Lora',Georgia,serif", 'Merriweather': "'Merriweather',Georgia,serif", 'Source Sans 3': "'Source Sans 3','Segoe UI',sans-serif", 'DM Sans': "'DM Sans',system-ui,sans-serif", 'Poppins': "'Poppins',system-ui,sans-serif", 'Georgia': "Georgia,'Times New Roman',serif", 'Arial': "Arial,Helvetica,sans-serif" };
  var TEMPLATES = [
    { id: 'classic', name: 'Classic', font: 'Lora', color: '#1f2933', note: 'Traditional business letter with a thin rule.' },
    { id: 'modern', name: 'Modern', font: 'Inter', color: '#0f766e', note: 'Accent bar beside your name.' },
    { id: 'minimal', name: 'Minimal', font: 'DM Sans', color: '#111827', note: 'Quiet, lots of white space.' },
    { id: 'executive', name: 'Executive', font: 'Merriweather', color: '#1e3a5f', note: 'Centered header with a double rule.' },
    { id: 'bold', name: 'Bold', font: 'Poppins', color: '#b4233c', note: 'Large name and a colored edge.' }
  ];
  var str = function (v, n) { return typeof v === 'string' ? v.slice(0, n || 20000) : ''; };
  var tpl = function (id) { return TEMPLATES.filter(function (t) { return t.id === id; })[0] || TEMPLATES[0]; };
  function today() { var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }

  function nm(n) { n = str(n, 80).trim(); return n || 'Untitled cover letter'; }
  function normalize(raw) {
    raw = M.isObj(raw) ? raw : {}; var s = M.isObj(raw.sender) ? raw.sender : {}, r = M.isObj(raw.recipient) ? raw.recipient : {}, d = M.isObj(raw.design) ? raw.design : {};
    var t = tpl(raw.templateId), now = M.now(), num = function (v, lo, hi, df) { v = parseFloat(v); return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : df; };
    return {
      id: str(raw.id, 80) || M.uid(), name: nm(raw.name), templateId: t.id,
      createdAt: !isNaN(Date.parse(raw.createdAt)) ? raw.createdAt : now, updatedAt: !isNaN(Date.parse(raw.updatedAt)) ? raw.updatedAt : now,
      sender: { name: str(s.name, 120), email: str(s.email, 160), phone: str(s.phone, 60), address: str(s.address, 300) },
      recipient: { name: str(r.name, 120), title: str(r.title, 120), address: str(r.address, 300) },
      company: str(raw.company, 160), jobTitle: str(raw.jobTitle, 160), date: str(raw.date, 20), subject: str(raw.subject, 240),
      greeting: str(raw.greeting, 160), opening: str(raw.opening), body: str(raw.body), closing: str(raw.closing, 160), signature: str(raw.signature, 160),
      design: { font: FONTS[d.font] ? d.font : t.font, size: num(d.size, 9, 15, 11.5), color: /^#[0-9a-f]{6}$/i.test(d.color || '') ? d.color : t.color, lineHeight: num(d.lineHeight, 1.2, 2, 1.55), paraGap: num(d.paraGap, 4, 28, 12), pageSize: d.pageSize === 'Letter' ? 'Letter' : 'A4' }
    };
  }
  function hasLS() { if (ls !== null) return ls; try { localStorage.setItem('__rcl', '1'); localStorage.removeItem('__rcl'); ls = true; } catch (e) { ls = false; } return ls; }
  function readAll() {
    if (!hasLS()) return (mem = mem || {});
    var out = {}; try { var d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (M.isObj(d) && M.isObj(d.items)) Object.keys(d.items).forEach(function (k) { if (M.isObj(d.items[k])) { var l = normalize(d.items[k]); out[l.id] = l; } }); } catch (e) {}
    return out;
  }
  function writeAll(map) {
    mem = map; if (!hasLS()) return { ok: true, persisted: false };
    try { localStorage.setItem(KEY, JSON.stringify({ v: 1, items: map })); } catch (e) { return { ok: false, error: 'Browser storage is full or blocked. Changes last only until you close this tab.' }; }
    return { ok: true, persisted: true };
  }
  function changed() { try { document.dispatchEvent(new CustomEvent('rc:letters-changed')); } catch (e) {} }
  var NF = { ok: false, error: 'That cover letter no longer exists.' };
  function save(l, quiet) { var map = readAll(), n = normalize(l); n.updatedAt = M.now(); if (map[n.id]) n.createdAt = map[n.id].createdAt; map[n.id] = n; var r = writeAll(map); r.letter = n; if (!quiet) changed(); return r; }
  var EXAMPLE = {
    greeting: 'Dear {{hiringManager}},', subject: 'Application for {{jobTitle}}',
    opening: 'I am writing to apply for the {{jobTitle}} position at {{company}}. With a strong track record of delivering reliable work and learning quickly, I believe I can contribute from my first week.',
    body: 'In my recent roles I have owned projects end to end, worked closely with colleagues across teams, and improved processes so that work was faster and clearer for everyone. I enjoy turning unclear problems into simple, practical solutions.\n\nWhat draws me to {{company}} is its focus on quality and its clear commitment to its customers. I would welcome the chance to bring the same care to your team and to learn from the people already there.\n\nI have attached my resume for your review. Thank you for your time and consideration.',
    closing: 'Sincerely,'
  };
  var api = {
    FONTS: FONTS, TEMPLATES: TEMPLATES, normalize: normalize, today: today, EXAMPLE: EXAMPLE,
    list: function () { var m = readAll(); return Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return Date.parse(b.updatedAt) - Date.parse(a.updatedAt); }); },
    load: function (id) { return readAll()[id] || null; },
    save: save,
    create: function (o) { o = o || {}; var base = { name: o.name, templateId: o.templateId, date: today(), closing: 'Sincerely,' }; if (o.example) Object.assign(base, EXAMPLE); return save(base); },
    rename: function (id, name) { var l = api.load(id); if (!l) return NF; l.name = nm(name); var u = l.updatedAt; var r = save(l); return r; },
    duplicate: function (id) { var l = api.load(id); if (!l) return NF; l.id = M.uid(); l.name = nm(l.name.slice(0, 73) + ' (copy)'); l.createdAt = M.now(); return save(l); },
    remove: function (id) { var m = readAll(); if (!m[id]) return NF; delete m[id]; var r = writeAll(m); changed(); return r; },
    status: function () { return { persistent: hasLS() }; }
  };
  return api;
})();

(function () {
  var U = RC.ui, L = RC.letters, M = RC.model, e = M.esc;
  var fmtDate = function (d) { if (!d) return ''; var x = new Date(d + 'T00:00:00'); return isNaN(x) ? e(d) : x.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }); };
  var fmtShort = function (d) { try { return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); } catch (x) { return ''; } };

  /* ---------- rendering ---------- */
  var CSS = [
    '.cl{--ac:#0f766e;--lh:1.55;--gap:12px;line-height:var(--lh);color:#1f2933}',
    '.cl .pg{padding:72px 76px}.cl .sn{font:700 1.9em/1.15 var(--bf);color:var(--ac)}.cl .sc{margin-top:4px;color:#4b5563;font-size:.92em}.cl .sc span+span:before{content:"·";margin:0 8px;opacity:.6}',
    '.cl .sa{white-space:pre-line;color:#4b5563;font-size:.92em}.cl .sd{margin-top:28px}.cl .rc{margin-top:22px}.cl .rc b{display:block}.cl .rc div{white-space:pre-line}',
    '.cl .dt{margin-top:22px;color:#4b5563}.cl .sj{margin-top:20px;font-weight:700}.cl .gr{margin-top:20px}.cl p.bp{margin:0 0 var(--gap);white-space:pre-wrap;overflow-wrap:anywhere}',
    '.cl .bd{margin-top:var(--gap)}.cl .cs{margin-top:22px}.cl .sg{margin-top:34px;font-weight:600}',
    '.cl-classic .hd{border-bottom:1.5px solid var(--ac);padding-bottom:14px}.cl-classic .sn{color:inherit;font-weight:700}',
    '.cl-modern .hd{border-left:6px solid var(--ac);padding-left:16px}.cl-modern .sj{color:var(--ac)}',
    '.cl-minimal .sn{font-weight:500;font-size:1.5em;letter-spacing:.02em;color:inherit}.cl-minimal .hd{padding-bottom:6px}.cl-minimal .dt,.cl-minimal .sj{font-size:.95em}.cl-minimal .sj{font-weight:600}.cl-minimal .pg{padding:84px 92px}',
    '.cl-executive .hd{text-align:center;border-top:3px double var(--ac);border-bottom:3px double var(--ac);padding:16px 0}.cl-executive .sn{text-transform:uppercase;letter-spacing:.1em;font-size:1.55em}.cl-executive .sc span+span:before{margin:0 10px}',
    '.cl-bold .pg{border-left:12px solid var(--ac);padding-left:64px}.cl-bold .sn{font-size:2.5em;line-height:1;text-transform:uppercase;letter-spacing:-.01em}.cl-bold .sj{color:var(--ac);text-transform:uppercase;letter-spacing:.04em;font-size:.95em}',
    '.cl-bold .sg{color:var(--ac)}'
  ].join('');
  function mount() { var s = document.getElementById('cl-css'); if (!s) { s = document.createElement('style'); s.id = 'cl-css'; document.head.appendChild(s); } s.textContent = CSS; }
  mount();

  function tokens(t, l) {
    var hm = l.recipient.name || 'Hiring Manager';
    return String(t || '').replace(/\{\{\s*company\s*\}\}/gi, l.company || 'the company').replace(/\{\{\s*jobTitle\s*\}\}/gi, l.jobTitle || 'the role').replace(/\{\{\s*hiringManager\s*\}\}/gi, hm);
  }
  function paras(t) { return String(t || '').split(/\n{2,}/).map(function (p) { return p.trim(); }).filter(Boolean).map(function (p) { return '<p class="bp">' + e(p) + '</p>'; }).join(''); }
  function resolved(l) {
    l = L.normalize(l); var T = function (x) { return tokens(x, l); };
    var rn = l.recipient.name.trim();
    return {
      l: l, subject: T(l.subject), greeting: T(l.greeting) || (rn ? 'Dear ' + rn + ',' : 'Dear Hiring Manager,'), opening: T(l.opening), body: T(l.body),
      closing: T(l.closing) || 'Sincerely,', signature: l.signature || l.sender.name
    };
  }
  function render(letter) {
    var x = resolved(letter), l = x.l, d = l.design, s = l.sender, r = l.recipient;
    var contact = [s.email, s.phone].filter(Boolean).map(function (v) { return '<span>' + e(v) + '</span>'; }).join('');
    var rcpt = [r.name ? '<b>' + e(r.name) + '</b>' : '', r.title ? '<div>' + e(r.title) + '</div>' : '', l.company ? '<div>' + e(l.company) + '</div>' : '', r.address ? '<div>' + e(r.address) + '</div>' : ''].join('');
    var style = '--ac:' + d.color + ';--bf:' + L.FONTS[d.font] + ';--hf:' + L.FONTS[d.font] + ';--base:' + d.size + 'px;--fm:1;--lh:' + d.lineHeight + ';--gap:' + d.paraGap + 'px;--pt:72px;--px:76px';
    return '<div class="rt cl cl-' + l.templateId + '" style="' + style + '"><div class="pg">' +
      '<header class="hd"><div class="sn">' + e(s.name || 'Your Name') + '</div>' + (contact ? '<div class="sc">' + contact + '</div>' : '') + (s.address ? '<div class="sa">' + e(s.address) + '</div>' : '') + '</header>' +
      (l.date ? '<div class="dt">' + fmtDate(l.date) + '</div>' : '') + (rcpt ? '<div class="rc">' + rcpt + '</div>' : '') +
      (x.subject ? '<div class="sj">' + e(x.subject) + '</div>' : '') + '<div class="gr">' + e(x.greeting) + '</div>' +
      '<div class="bd">' + paras(x.opening) + paras(x.body) + '</div><div class="cs">' + e(x.closing) + '</div><div class="sg">' + e(x.signature) + '</div></div></div>';
  }
  function asText(letter) {
    var x = resolved(letter), l = x.l, s = l.sender, r = l.recipient;
    return [[s.name, s.email, s.phone, s.address].filter(Boolean).join('\n'), fmtDate(l.date).replace(/&[a-z#0-9]+;/g, ''), [r.name, r.title, l.company, r.address].filter(Boolean).join('\n'), x.subject ? 'Subject: ' + x.subject : '', x.greeting, x.opening, x.body, x.closing + '\n' + x.signature].filter(Boolean).join('\n\n') + '\n';
  }
  var SZ = { A4: { w: 210, h: 297, c: 'A4' }, Letter: { w: 215.9, h: 279.4, c: 'letter' } };
  function doc(letter, mode) {
    var l = L.normalize(letter), S = SZ[l.design.pageSize], fl = document.querySelector('link[href*="fonts.googleapis.com/css2"]'), m = 20;
    var css = '@page{size:' + S.c + ';margin:' + m + 'mm}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}html,body{margin:0}.rt{width:auto!important;min-height:0!important;overflow:visible!important}.cl .pg{padding:0!important}.cl-bold .pg{padding-left:14mm!important}.cl p.bp{break-inside:avoid-page;orphans:3;widows:3}.cl .sg,.cl .cs{break-inside:avoid}';
    if (mode === 'preview') css += '@media screen{html{background:#d5d9e0}body{display:flex;justify-content:center;padding:18px 0 28px}.sheet{width:' + S.w + 'mm;min-height:' + S.h + 'mm;background:#fff;box-shadow:0 6px 28px rgba(0,0,0,.22);padding:' + m + 'mm;box-sizing:border-box}}';
    return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>' + e(l.name) + '</title>' + (fl ? '<link href="' + e(fl.href) + '" rel="stylesheet">' : '') + '<style>' + (document.getElementById('rt-css') ? document.getElementById('rt-css').textContent : '') + CSS + css + '</style></head><body>' +
      (mode === 'preview' ? '<div class="sheet">' + render(l) + '</div>' : render(l)) + '</body></html>';
  }
  function fileName(l, ext) { return (l.name || 'cover-letter').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase().slice(0, 60) + '.' + ext; }
  function saveFile(name, type, text) { var b = new Blob([text], { type: type }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000); }
  function printLetter(l, pdf) {
    var f = document.createElement('iframe'), old = document.title, done = false; f.setAttribute('aria-hidden', 'true'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    var restore = function () { if (done) return; done = true; document.title = old; setTimeout(function () { f.remove(); }, 500); };
    f.srcdoc = doc(l, 'print'); document.body.appendChild(f);
    f.onload = function () {
      var w = f.contentWindow, go = function () { try { document.title = l.name; w.focus(); w.addEventListener('afterprint', restore); w.print(); setTimeout(restore, 120000); } catch (x) { restore(); U.toast('Printing is blocked here. Download the HTML file and print it from there.'); } };
      var rd = w.document.fonts && w.document.fonts.ready ? w.document.fonts.ready : Promise.resolve();
      Promise.race([rd, new Promise(function (ok) { setTimeout(ok, 2500); })]).then(function () { setTimeout(go, 200); });
    };
    if (pdf) U.toast('In the print window, choose “Save as PDF” as the destination.');
  }
  function previewModal(l) {
    var d = U.modal({ title: 'Preview “' + e(l.name) + '”', wide: true, body: '<iframe class="ex-pv" title="Cover letter preview"></iframe>', actions: [{ label: 'Close', kind: 'btn-p' }] });
    d.querySelector('iframe').srcdoc = doc(l, 'preview');
  }
  function exportModal(l) {
    U.modal({
      title: 'Export “' + e(l.name) + '”', body: '<p style="margin-bottom:12px">Files are created in your browser. “Save as PDF” keeps text selectable.</p><div class="dl-opts"><button type="button" class="btn btn-p" data-f="pdf">Download PDF (choose “Save as PDF” in print window)</button><button type="button" class="btn btn-o" data-f="html">HTML file</button><button type="button" class="btn btn-o" data-f="txt">Plain text (.txt)</button></div>',
      actions: [{ label: 'Close', value: 'x' }]
    }).addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-f]'); if (!b) return; var f = b.dataset.f; b.closest('dialog').close('x');
      if (f === 'pdf') printLetter(l, true); else if (f === 'html') { saveFile(fileName(l, 'html'), 'text/html', doc(l, 'print')); U.toast('HTML file downloaded.', 'ok'); } else { saveFile(fileName(l, 'txt'), 'text/plain', asText(l)); U.toast('Text file downloaded.', 'ok'); }
    });
  }
  RC.letterTools = { render: render, asText: asText, doc: doc, tokens: tokens };

  /* ---------- dialogs ---------- */
  function ask(title, label, value, ok, extra) {
    return new Promise(function (res) {
      var acts = [{ label: 'Cancel', value: 'no' }].concat(extra || [{ label: ok, kind: 'btn-p', value: 'yes' }]);
      var d = U.modal({ title: title, body: '<div class="fld"><label for="rn">' + label + '</label><input id="rn" maxlength="80" value="' + e(value) + '"></div>', actions: acts, onClose: function (v) { res(v === 'no' || v === 'x' ? null : { v: v, name: d.querySelector('#rn').value }); } });
      var i = d.querySelector('#rn'); i.focus(); i.select(); i.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') d.close(acts[acts.length - 1].value); });
    });
  }
  function result(r, msg) { r.ok ? U.toast(msg, 'ok') : U.toast(r.error || 'Something went wrong.'); if (r.ok && r.persisted === false) U.toast('Browser storage is unavailable, so this lasts only for this session.'); return r; }
  var openL = function (id) { location.hash = '#/cover-letter?id=' + encodeURIComponent(id); };
  var idFromHash = function () { var m = /[?&]id=([^&]+)/.exec(location.hash); try { return m ? decodeURIComponent(m[1]) : ''; } catch (x) { return ''; } };

  /* ---------- list page ---------- */
  function listPage(el) {
    function draw() {
      var ls = L.list(), note = L.status().persistent ? '' : '<p class="banner">Browser storage is unavailable. Your letters will be lost when you close this tab.</p>';
      el.innerHTML = U.pageHeader('Cover Letter', 'Write a letter that matches your resume. Saved in this browser only.', U.button('New cover letter', { icon: 'plus', attrs: 'data-a="new"' })) +
        '<div class="wrap pg">' + note + (ls.length ? '<div class="ds-cards grid">' + ls.map(function (l) {
          return '<article class="rcard rc2" data-id="' + e(l.id) + '"><div class="rc-thumb"><div class="pv">' + render(l) + '</div></div><div class="rc-main"><h3>' + e(l.name) + '</h3><p>' + e(l.jobTitle || 'No job title yet') + (l.company ? ' · ' + e(l.company) : '') + '</p><small>' + e(L.TEMPLATES.filter(function (t) { return t.id === l.templateId; })[0].name) + ' template &middot; edited ' + fmtShort(l.updatedAt) + '</small>' +
            '<div class="rc-act"><button class="btn btn-p btn-sm" data-a="edit">Edit</button><button class="btn btn-o btn-sm" data-a="preview">Preview</button><button class="btn btn-o btn-sm" data-a="dup">Duplicate</button><button class="btn btn-o btn-sm" data-a="rename">Rename</button><button class="btn btn-d btn-sm" data-a="del">Delete</button></div></div></article>';
        }).join('') + '</div>' : U.empty('mail', 'No cover letters yet', 'Create a letter, fill in the details, and see it update as you type.', '<button type="button" class="btn btn-p" data-a="new"><i data-lucide="plus"></i>New cover letter</button>')) + '</div>';
      RC.templates.fit(el); U.icons();
    }
    draw();
    var on = function () { if (el.isConnected && /^#\/cover-letter(\?|$)/.test(location.hash) && !idFromHash()) draw(); else document.removeEventListener('rc:letters-changed', on); };
    document.addEventListener('rc:letters-changed', on);
    el.oninput = el.onchange = null;
    el.onclick = function (ev) {
      var b = ev.target.closest('[data-a]'); if (!b) return; var a = b.dataset.a, box = b.closest('[data-id]'), id = box && box.dataset.id, l = id && L.load(id);
      if (a === 'new') return ask('New cover letter', 'Letter name', '', '', [{ label: 'Blank letter', value: 'blank' }, { label: 'With example text', kind: 'btn-p', value: 'example' }]).then(function (o) {
        if (!o) return; var r = result(L.create({ name: o.name, example: o.v === 'example' }), 'Cover letter created.'); if (r.ok) openL(r.letter.id);
      });
      if (!l) return U.toast('That cover letter no longer exists.');
      if (a === 'edit') openL(id); else if (a === 'preview') previewModal(l);
      else if (a === 'dup') result(L.duplicate(id), 'Duplicated.');
      else if (a === 'rename') ask('Rename cover letter', 'Letter name', l.name, 'Save').then(function (o) { if (o) result(L.rename(id, o.name), 'Renamed.'); });
      else if (a === 'del') U.confirm({ title: 'Delete this cover letter?', text: '“' + e(l.name) + '” will be removed from this browser. This cannot be undone.', ok: 'Delete', danger: true }).then(function (y) { if (y) result(L.remove(id), 'Deleted.'); });
    };
  }

  /* ---------- editor page ---------- */
  function editorPage(el, id) {
    var l = L.load(id);
    if (!l) { el.innerHTML = '<div class="wrap pg">' + U.empty('file-x', 'Cover letter not found', 'It may have been deleted in another tab.', '<a class="btn btn-p" href="#/cover-letter">Back to cover letters</a>') + '</div>'; U.icons(); return; }
    var timer = null, dirty = false;
    var fld = function (label, path, v, o) {
      o = o || {}; var idf = 'cf-' + path.replace(/\W/g, '-'), at = ' id="' + idf + '" data-p="' + path + '"' + (o.ph ? ' placeholder="' + e(o.ph) + '"' : '');
      return '<div class="fld' + (o.half ? ' fm-half' : '') + '"><label for="' + idf + '">' + label + '</label>' + (o.area ? '<textarea rows="' + o.area + '"' + at + '>' + e(v) + '</textarea>' : '<input type="' + (o.type || 'text') + '"' + at + ' value="' + e(v) + '">') + '</div>';
    };
    var sec = function (t, inner, open) { return '<details class="cl-sec"' + (open ? ' open' : '') + '><summary>' + t + '</summary><div class="fm-g">' + inner + '</div></details>'; };
    function form() {
      var d = l.design, rs = RC.store.list();
      return sec('Sender', (rs.length ? '<div class="fld"><label for="cl-fromres">Fill from a saved resume</label><select id="cl-fromres"><option value="">Choose a resume…</option>' + rs.map(function (r) { return '<option value="' + e(r.id) + '">' + e(r.name) + '</option>'; }).join('') + '</select></div>' : '') +
        fld('Your name', 'sender.name', l.sender.name, { half: 1 }) + fld('Email', 'sender.email', l.sender.email, { half: 1, type: 'email' }) + fld('Phone', 'sender.phone', l.sender.phone, { half: 1 }) + fld('Address', 'sender.address', l.sender.address, { half: 1, ph: 'City, State' }), true) +
        sec('Recipient & job', fld('Recipient name', 'recipient.name', l.recipient.name, { half: 1, ph: 'Ms. Rao' }) + fld('Recipient title', 'recipient.title', l.recipient.title, { half: 1, ph: 'Hiring Manager' }) + fld('Company', 'company', l.company, { half: 1 }) + fld('Job title', 'jobTitle', l.jobTitle, { half: 1 }) + fld('Company address', 'recipient.address', l.recipient.address, { area: 2 }), true) +
        sec('Letter', fld('Date', 'date', l.date, { half: 1, type: 'date' }) + fld('Subject', 'subject', l.subject, { half: 1, ph: 'Application for {{jobTitle}}' }) + fld('Greeting', 'greeting', l.greeting, { ph: 'Dear Hiring Manager,' }) +
          fld('Opening paragraph', 'opening', l.opening, { area: 4 }) + fld('Body', 'body', l.body, { area: 10, ph: 'Separate paragraphs with a blank line.' }) + fld('Closing', 'closing', l.closing, { half: 1, ph: 'Sincerely,' }) + fld('Signature', 'signature', l.signature, { half: 1, ph: 'Defaults to your name' }) +
          '<p class="cl-tip">Tip: write <code>{{company}}</code>, <code>{{jobTitle}}</code> or <code>{{hiringManager}}</code> and they fill in automatically.</p>', true) +
        sec('Design', '<div class="fld"><label for="cd-font">Font</label><select id="cd-font" data-d="font">' + Object.keys(L.FONTS).map(function (f) { return '<option' + (f === d.font ? ' selected' : '') + '>' + f + '</option>'; }).join('') + '</select></div>' +
          '<div class="fld fm-half"><label for="cd-size">Font size (' + d.size + ' pt)</label><input id="cd-size" type="range" min="9" max="15" step="0.5" value="' + d.size + '" data-d="size"></div>' +
          '<div class="fld fm-half"><label for="cd-lh">Line spacing (' + d.lineHeight + ')</label><input id="cd-lh" type="range" min="1.2" max="2" step="0.05" value="' + d.lineHeight + '" data-d="lineHeight"></div>' +
          '<div class="fld fm-half"><label for="cd-gap">Paragraph spacing (' + d.paraGap + ' px)</label><input id="cd-gap" type="range" min="4" max="28" step="1" value="' + d.paraGap + '" data-d="paraGap"></div>' +
          '<div class="fld fm-half"><label for="cd-color">Accent color</label><input id="cd-color" type="color" value="' + d.color + '" data-d="color"></div>' +
          '<div class="fld fm-half"><label for="cd-page">Page size</label><select id="cd-page" data-d="pageSize"><option' + (d.pageSize === 'A4' ? ' selected' : '') + '>A4</option><option' + (d.pageSize === 'Letter' ? ' selected' : '') + '>Letter</option></select></div>' +
          '<div class="fld fm-half"><button type="button" class="btn btn-o btn-sm" data-a="resetdesign">Reset to template look</button></div>', false);
    }
    function chips() { return L.TEMPLATES.map(function (t) { return '<button type="button" class="cl-chip" data-t="' + t.id + '" aria-pressed="' + (t.id === l.templateId) + '" title="' + e(t.note) + '">' + t.name + '</button>'; }).join(''); }
    function shell() {
      el.innerHTML = '<div class="fm-bar"><div class="wrap fm-barin"><a class="btn btn-g btn-sm" href="#/cover-letter"><i data-lucide="arrow-left"></i>Cover letters</a><h1 class="cl-title" id="cl-name">' + e(l.name) + '</h1><span class="fm-save" id="cl-saved" aria-live="polite">Saved</span>' +
        '<button type="button" class="btn btn-o btn-sm" data-a="rename">Rename</button><button type="button" class="btn btn-o btn-sm" data-a="dup">Duplicate</button><button type="button" class="btn btn-o btn-sm" data-a="preview">Preview</button><button type="button" class="btn btn-o btn-sm" data-a="print"><i data-lucide="printer"></i>Print</button><button type="button" class="btn btn-p btn-sm" data-a="export"><i data-lucide="download"></i>Export</button><button type="button" class="btn btn-d btn-sm" data-a="del">Delete</button></div></div>' +
        '<div class="wrap pg cl-ws"><div class="cl-form">' + '<div class="cl-chips" role="group" aria-label="Template">' + chips() + '</div>' + form() + '</div><div class="cl-pvcol"><p class="cl-warn" id="cl-warn" hidden></p><div class="pv" id="cl-pv"></div></div></div>';
      U.icons(); paint();
    }
    function paint() {
      var pv = el.querySelector('#cl-pv'); if (!pv) return; pv.innerHTML = render(l); RC.templates.fit(el);
      var rt = pv.firstElementChild, h = SZ[l.design.pageSize].h * 96 / 25.4, w = el.querySelector('#cl-warn');
      var over = rt && rt.offsetHeight > h + 4; w.hidden = !over; w.textContent = over ? 'This letter is longer than one page. Shorten it or lower the font size to fit on one page.' : '';
    }
    function commit() { var r = L.save(l, true); if (r.ok) { l.updatedAt = r.letter.updatedAt; setSaved(r.persisted === false ? 'Not saved (storage unavailable)' : 'Saved'); } else { setSaved('Not saved'); U.toast(r.error); } }
    function setSaved(t) { var s = el.querySelector('#cl-saved'); if (s) s.textContent = t; }
    function touch() { setSaved('Saving…'); clearTimeout(timer); timer = setTimeout(function () { dirty = false; commit(); }, 350); paint(); dirty = true; }
    function flush() { if (dirty) { clearTimeout(timer); dirty = false; commit(); } }
    shell();
    function setPath(p, v) { var k = p.split('.'); if (k.length === 2) l[k[0]][k[1]] = v; else l[k[0]] = v; }
    el.oninput = function (ev) {
      var t = ev.target, p = t.dataset.p, dd = t.dataset.d;
      if (p) { setPath(p, t.value); touch(); }
      else if (dd && t.type === 'range') { l.design[dd] = parseFloat(t.value); var lab = t.previousElementSibling; if (lab) lab.textContent = lab.textContent.replace(/\(.*\)/, '(' + t.value + (dd === 'size' ? ' pt' : dd === 'paraGap' ? ' px' : '') + ')'); touch(); }
      else if (dd === 'color') { l.design.color = t.value; touch(); }
    };
    el.onchange = function (ev) {
      var t = ev.target;
      if (t.dataset.d && t.tagName === 'SELECT') { l.design[t.dataset.d] = t.value; touch(); }
      else if (t.id === 'cl-fromres') { var r = RC.store.load(t.value); if (r) { var pi = r.personalInfo; l.sender.name = pi.fullName || l.sender.name; l.sender.email = pi.email || l.sender.email; l.sender.phone = pi.phone || l.sender.phone; l.sender.address = pi.location || l.sender.address; if (!l.jobTitle) l.jobTitle = pi.jobTitle || ''; if (!l.signature) l.signature = pi.fullName || ''; commit(); shell(); U.toast('Filled from “' + r.name + '”.', 'ok'); } }
    };
    el.onclick = function (ev) {
      var c = ev.target.closest('[data-t]');
      if (c) { var t = L.TEMPLATES.filter(function (x) { return x.id === c.dataset.t; })[0], old = L.TEMPLATES.filter(function (x) { return x.id === l.templateId; })[0];
        /* switching templates keeps all text; design values still at the old template's defaults follow the new template */
        if (l.design.font === old.font) l.design.font = t.font; if (l.design.color.toLowerCase() === old.color.toLowerCase()) l.design.color = t.color;
        l.templateId = t.id; commit(); var y = window.pageYOffset; shell(); window.scrollTo(0, y); return; }
      var b = ev.target.closest('[data-a]'); if (!b) return; var a = b.dataset.a; flush();
      if (a === 'preview') previewModal(l); else if (a === 'print') printLetter(l, false); else if (a === 'export') exportModal(l);
      else if (a === 'resetdesign') { var tp = L.TEMPLATES.filter(function (x) { return x.id === l.templateId; })[0]; l.design = L.normalize({ templateId: l.templateId, design: { pageSize: l.design.pageSize } }).design; commit(); shell(); U.toast('Design reset.', 'ok'); }
      else if (a === 'dup') { var r = result(L.duplicate(l.id), 'Duplicated. Opening the copy.'); if (r.ok) openL(r.letter.id); }
      else if (a === 'rename') ask('Rename cover letter', 'Letter name', l.name, 'Save').then(function (o) { if (!o) return; var r = result(L.rename(l.id, o.name), 'Renamed.'); if (r.ok) { l.name = r.letter.name; l.updatedAt = r.letter.updatedAt; el.querySelector('#cl-name').textContent = l.name; } });
      else if (a === 'del') U.confirm({ title: 'Delete this cover letter?', text: '“' + e(l.name) + '” will be removed from this browser. This cannot be undone.', ok: 'Delete', danger: true }).then(function (y) { if (y) { var r = result(L.remove(l.id), 'Deleted.'); if (r.ok) location.hash = '#/cover-letter'; } });
    };
    window.addEventListener('hashchange', function once() { flush(); window.removeEventListener('hashchange', once); });
    window.addEventListener('beforeunload', flush);
  }

  RC.pages['cover-letter'] = function (el) { var id = idFromHash(); id ? editorPage(el, id) : listPage(el); };
})();
