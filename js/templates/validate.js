/* Template registry validation. Call validateTemplateRegistry() (also on RC.templates) any time;
   it renders every template for real with several resume shapes, so a broken layout cannot pass. */
(function () {
  var TP = RC.templates, M = RC.model;
  var MIN_TOTAL = 50;
  var MIN_CATEGORY = { ATS: 5, Minimal: 5, Fresher: 6, Technical: 5, Academic: 5, Executive: 7 };
  var LAYOUTS = ['single', 'sidebar-left', 'sidebar-right', 'grid'];
  var KNOWN = {
    header: ['left', 'center', 'split', 'photo', 'side', 'words', 'band', 'mini'],
    h: ['rule', 'bar', 'band', 'pill', 'under', 'plain', 'side', 'box', 'mini', 'slash', 'custom'],
    x: ['classic', 'dateleft', 'timeline', 'cards', 'bordered', 'inline'],
    sk: ['comma', 'chips', 'tags', 'bars', 'dots', 'grouped', 'columns'],
    pj: ['list', 'cards', 'grid', 'inline']
  };
  var HEX = /^#[0-9a-f]{3,8}$/i;

  function sources(d) {
    var v = d.visual || {}, t = d.typography || {};
    return JSON.stringify([d.layout, d.headIn, d.sideKeys, d.order, d.labels, v, t.heading, t.body, t.size, d.accent, d.accent2, d.css, d.build ? String(d.build) : '', d.extra ? String(d.extra) : '']);
  }
  function shapes() {
    var full = RC.sample && RC.sample.experienced, fresher = RC.sample && RC.sample.fresher;
    var longR = JSON.parse(JSON.stringify(full || {}));
    if (longR.experience) { for (var i = 0; i < 3; i++) longR.experience = longR.experience.concat(full.experience); longR.experience[0].company = 'An Extraordinarily Long Company Name International Holdings Group'; }
    var onlyName = M.blank({ personalInfo: { fullName: 'Sam Taylor' } });
    var noSections = JSON.parse(JSON.stringify(full || {})); M.SECTIONS.forEach(function (k) { if (k !== 'summary') noSections[k] = []; });
    return [['experienced', full], ['fresher', fresher], ['long', longR], ['name-only', onlyName], ['empty', M.blank({})], ['no-sections', noSections]];
  }

  function validateTemplateRegistry() {
    var errors = [], warnings = [], list = TP.list(), counts = {}, ids = {}, names = {}, sigs = {};
    var err = function (id, m) { errors.push((id ? '[' + id + '] ' : '') + m); }, warn = function (id, m) { warnings.push((id ? '[' + id + '] ' : '') + m); };

    /* registration problems recorded by the engine (duplicate / missing ids) */
    TP.rejected().forEach(function (r) { err(r.id, 'rejected at registration: ' + r.reason + (r.name ? ' ("' + r.name + '")' : '')); });

    list.forEach(function (d) {
      var id = d.id, v = d.visual || {}, t = d.typography || {};
      /* unique ids and names */
      if (ids[id]) err(id, 'duplicate id'); ids[id] = 1;
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) err(id, 'id must be lowercase kebab-case');
      var nk = String(d.name || '').trim().toLowerCase();
      if (!nk) err(id, 'missing name'); else if (names[nk]) err(id, 'duplicate name "' + d.name + '" (also ' + names[nk] + ')'); else names[nk] = id;
      /* required metadata */
      ['category', 'ats', 'description'].forEach(function (k) { if (!d[k] || typeof d[k] !== 'string') err(id, 'missing ' + k); });
      if (d.description && d.description.length < 20) warn(id, 'description is very short');
      if (!HEX.test(d.accent || '')) err(id, 'accent must be a hex colour');
      if (!t.heading || !t.body) err(id, 'typography.heading and typography.body are required');
      /* renderer / configuration */
      if (typeof d.build !== 'function' && LAYOUTS.indexOf(d.layout) < 0) err(id, 'layout "' + d.layout + '" is not supported and there is no build()');
      if (d.build && typeof d.build !== 'function') err(id, 'build must be a function');
      if (d.extra && typeof d.extra !== 'function') err(id, 'extra must be a function');
      if (/^sidebar/.test(d.layout || '') && typeof d.build !== 'function' && !(d.sideKeys && d.sideKeys.length)) err(id, 'sidebar layout needs sideKeys');
      (d.sideKeys || []).concat(d.order || [], Object.keys(d.labels || {})).forEach(function (k) { if (M.SECTIONS.indexOf(k) < 0) err(id, 'unknown section key "' + k + '"'); });
      if (d.order && d.order.length !== M.SECTIONS.length) warn(id, 'order lists ' + d.order.length + ' of ' + M.SECTIONS.length + ' sections (the rest are appended)');
      Object.keys(KNOWN).forEach(function (k) { if (v[k] && KNOWN[k].indexOf(v[k]) < 0) warn(id, 'visual.' + k + ' "' + v[k] + '" is not a built-in variant'); });
      if (d.css && typeof d.css !== 'string') err(id, 'css must be a string');
      /* no disguised duplicates: identical configuration under another id */
      var sg = sources(d); if (sigs[sg]) err(id, 'identical design to ' + sigs[sg]); else sigs[sg] = id;
      counts[d.category] = (counts[d.category] || 0) + 1;
    });

    /* totals and category coverage */
    if (list.length < MIN_TOTAL) err('', 'only ' + list.length + ' templates registered, need at least ' + MIN_TOTAL);
    Object.keys(MIN_CATEGORY).forEach(function (c) { if ((counts[c] || 0) < MIN_CATEGORY[c]) err('', 'category "' + c + '" has ' + (counts[c] || 0) + ' templates, need ' + MIN_CATEGORY[c]); });

    /* every template must really render, with every resume shape */
    var S = shapes(), rendered = 0;
    list.forEach(function (d) {
      S.forEach(function (s) {
        var html;
        try { html = TP.renderResume(s[1], d.id); } catch (x) { err(d.id, 'renderer threw on "' + s[0] + '": ' + x.message); return; }
        if (typeof html !== 'string' || html.indexOf('rt-' + d.id) < 0) return err(d.id, 'renderer output missing template class on "' + s[0] + '"');
        if (!/<h1 class="nm"/.test(html)) err(d.id, 'no name heading rendered on "' + s[0] + '"');
        if (/undefined|NaN|\[object/.test(html)) err(d.id, 'output contains undefined/NaN on "' + s[0] + '"');
        rendered++;
      });
    });

    return { ok: errors.length === 0, total: list.length, distinct: Object.keys(sigs).length, categories: counts, rendered: rendered, errors: errors, warnings: warnings };
  }

  TP.validateTemplateRegistry = validateTemplateRegistry;
  window.validateTemplateRegistry = validateTemplateRegistry;
  try {
    var rep = validateTemplateRegistry();
    if (rep.ok) console.info('[ResumeCraft] Template registry OK: ' + rep.total + ' templates, ' + rep.distinct + ' distinct designs.', rep.categories);
    else console.error('[ResumeCraft] Template registry problems:', rep.errors);
    if (rep.warnings.length) console.warn('[ResumeCraft] Template registry warnings:', rep.warnings);
  } catch (x) { console.error('[ResumeCraft] Validation could not run:', x); }
})();
