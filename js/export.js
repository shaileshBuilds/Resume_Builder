/* Print-ready export (Part 16). Builds a standalone HTML document containing ONLY the resume (no app UI),
   with @page size/margins and page-break rules, so text stays selectable and long resumes flow onto more pages.
   "Download PDF" uses the browser's print engine (Save as PDF), which keeps real text. No screenshots. */
RC.exporter = (function () {
  var M = RC.model, U = RC.ui, e = M.esc;
  var SIZES = { A4: { w: 210, h: 297, css: 'A4', label: 'A4 (210 × 297 mm)' }, Letter: { w: 215.9, h: 279.4, css: 'letter', label: 'US Letter (8.5 × 11 in)' } };
  var MARGINS = { template: ['Template default', 0], narrow: ['Narrow (10 mm)', 10], normal: ['Normal (16 mm)', 16], wide: ['Wide (22 mm)', 22] };
  var PX = 25.4 / 96;
  var r2 = function (n) { return Math.round(n * 100) / 100; };

  function opts(r, o) {
    o = o || {};
    var size = SIZES[o.size] ? o.size : (r.designSettings && r.designSettings.pageSize === 'Letter' ? 'Letter' : 'A4');
    return { size: size, margin: MARGINS[o.margin] ? o.margin : ((RC.settings && MARGINS[RC.settings.get().exportMargin]) ? RC.settings.get().exportMargin : 'template'), mode: o.mode === 'preview' ? 'preview' : 'print' };
  }
  /* Returns { html, pageW, pageH, top, side, bleed, note } */
  function build(resume, o) {
    var r = M.normalize(resume); o = opts(r, o);
    var body = RC.templates.renderResume(r, r.templateId), head = body.slice(0, 900);
    var bleed = /data-bleed/.test(head), S = SIZES[o.size], t, s, note = '';
    var pt = /--pt:(\d+(?:\.\d+)?)px/.exec(head), px = /--px:(\d+(?:\.\d+)?)px/.exec(head);
    if (bleed) { t = s = 0; if (o.margin !== 'template') note = 'This template has a full-width colored design, so the margin setting does not apply to it.'; }
    else if (o.margin === 'template') { t = r2((pt ? +pt[1] : 40) * PX); s = r2((px ? +px[1] : 44) * PX); }
    else t = s = MARGINS[o.margin][1];
    var ch = r2(S.h - 2 * t);                                   /* printable height of one page, mm */
    var css = '@page{size:' + S.css + ';margin:' + t + 'mm ' + s + 'mm}' +
      '*{-webkit-print-color-adjust:exact;print-color-adjust:exact}html,body{margin:0;padding:0}' +
      '.rt{width:auto!important;min-height:0!important;overflow:visible!important;box-shadow:none!important}' +
      (bleed ? '.rt[data-bleed]{min-height:' + r2(S.h - 1.5) + 'mm!important}' : '.rt .pg{padding:0!important}') +
      '.rt .it,.rt .pj,.rt .sk-g,.rt .ls li,.rt .hl>div,.rt .tile,.rt .sk-b li,.rt .sk-d li{break-inside:avoid;page-break-inside:avoid}' +
      '.rt .sh,.rt .hd2{break-after:avoid;page-break-after:avoid}.rt .ach li,.rt .ds{orphans:2;widows:2}.rt img{max-width:100%}';
    var fl = document.querySelector('link[href*="fonts.googleapis.com/css2"]');
    var doc = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>' + e(r.name) + '</title>' + (fl ? '<link href="' + e(fl.href) + '" rel="stylesheet">' : '') +
      '<style>' + (document.getElementById('rt-css') ? document.getElementById('rt-css').textContent : '') + css;
    if (o.mode === 'preview') {
      doc += '@media screen{html{background:#d5d9e0}body{display:flex;justify-content:center;padding:18px 0 28px}' +
        '.sheet{position:relative;width:' + S.w + 'mm;background:#fff;box-shadow:0 6px 28px rgba(0,0,0,.22);padding:' + t + 'mm ' + s + 'mm;box-sizing:border-box;min-height:' + S.h + 'mm}' +
        '.sheet:after{content:"";position:absolute;left:0;right:0;top:' + t + 'mm;bottom:0;pointer-events:none;background:repeating-linear-gradient(to bottom,transparent 0,transparent calc(' + ch + 'mm - 2px),rgba(217,45,90,.55) calc(' + ch + 'mm - 2px),rgba(217,45,90,.55) ' + ch + 'mm)}}' +
        '</style></head><body><div class="sheet">' + body + '</div></body></html>';
    } else doc += '</style></head><body>' + body + '</body></html>';
    return { html: doc, size: o.size, ch: ch, bleed: bleed, note: note, top: t, side: s };
  }

  function fileName(r, ext) { return (r.name || 'resume').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase().slice(0, 60) + '.' + ext; }
  function saveFile(name, type, text) {
    var b = new Blob([text], { type: type }), a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* Print through a hidden iframe so none of the app UI is ever part of the printed page. */
  function print(resume, o, how) {
    var r = M.normalize(resume), b = build(r, Object.assign({}, o, { mode: 'print' }));
    var f = document.createElement('iframe'), old = document.title, done = false;
    f.setAttribute('aria-hidden', 'true'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    var restore = function () { if (done) return; done = true; document.title = old; setTimeout(function () { f.remove(); }, 500); };
    f.srcdoc = b.html; document.body.appendChild(f);
    f.onload = function () {
      var w = f.contentWindow, go = function () {
        try { document.title = r.name; w.focus(); w.addEventListener('afterprint', restore); w.print(); setTimeout(restore, 120000); }
        catch (x) { restore(); U.toast('Printing is blocked in this browser. Download the HTML file and print it from there.'); }
      };
      var ready = w.document.fonts && w.document.fonts.ready ? w.document.fonts.ready : Promise.resolve();
      Promise.race([ready, new Promise(function (ok) { setTimeout(ok, 2500); })]).then(function () { setTimeout(go, 200); });
    };
    if (how === 'pdf') U.toast('In the print window, choose “Save as PDF” as the destination.');
  }
  function html(resume, o) { var r = M.normalize(resume); saveFile(fileName(r, 'html'), 'text/html', build(r, Object.assign({}, o, { mode: 'print' })).html); U.toast('HTML file downloaded.', 'ok'); }

  /* Export dialog: options + live preview + actions. */
  function open(resume) {
    var r = M.normalize(resume), cur = opts(r, {});
    var sel = function (id, label, map, v, lab) { return '<label class="ex-f"><span>' + label + '</span><select id="' + id + '">' + Object.keys(map).map(function (k) { return '<option value="' + k + '"' + (k === v ? ' selected' : '') + '>' + e(lab(map[k])) + '</option>'; }).join('') + '</select></label>'; };
    var d = U.modal({
      title: 'Export “' + e(r.name) + '”', wide: true,
      body: '<div class="ex-bar">' + sel('ex-size', 'Page size', SIZES, cur.size, function (x) { return x.label; }) + sel('ex-margin', 'Margins', MARGINS, cur.margin, function (x) { return x[0]; }) +
        '<span class="ex-pages" id="ex-pages" aria-live="polite"></span></div><p class="ex-note" id="ex-note" hidden></p>' +
        '<iframe class="ex-pv" id="ex-pv" title="Export preview"></iframe>' +
        '<div class="ex-act"><button type="button" class="btn btn-p" data-x="pdf"><i data-lucide="file-down"></i>Download PDF</button><button type="button" class="btn btn-o" data-x="print"><i data-lucide="printer"></i>Print resume</button><button type="button" class="btn btn-o" data-x="html"><i data-lucide="code"></i>HTML file</button></div>' +
        '<p class="ex-help">Download PDF opens your browser’s print window. Choose “Save as PDF”; text stays selectable. Red lines in the preview show approximate page breaks.</p>',
      actions: [{ label: 'Close', kind: 'btn-o' }]
    });
    var fr = d.querySelector('#ex-pv'), cfg = function () { return { size: d.querySelector('#ex-size').value, margin: d.querySelector('#ex-margin').value }; };
    function refresh() {
      var b = build(r, Object.assign(cfg(), { mode: 'preview' })), n = d.querySelector('#ex-note');
      n.hidden = !b.note; n.textContent = b.note;
      d.querySelector('#ex-pages').textContent = 'Calculating pages…';
      fr.onload = function () {
        try {
          var h = fr.contentDocument.querySelector('.rt').getBoundingClientRect().height, pages = Math.max(1, Math.ceil((h - 4) / (b.ch / PX)));
          d.querySelector('#ex-pages').textContent = 'About ' + pages + ' page' + (pages === 1 ? '' : 's');
        } catch (x) { d.querySelector('#ex-pages').textContent = ''; }
      };
      fr.srcdoc = b.html;
    }
    d.addEventListener('change', function (ev) { if (ev.target.id === 'ex-size' || ev.target.id === 'ex-margin') refresh(); });
    d.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-x]'); if (!b) return; var x = b.dataset.x;
      if (x === 'html') html(r, cfg()); else print(r, cfg(), x);
    });
    refresh();
  }

  return { build: build, print: print, html: html, open: open, SIZES: SIZES, MARGINS: MARGINS };
})();
