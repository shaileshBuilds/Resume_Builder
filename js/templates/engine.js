/* Template engine: registry + renderResume(resume, templateId).
   Templates only read resume data; they never change it. Output is plain HTML with scoped CSS,
   so it stays selectable text and is ready for print/PDF later. */
RC.templates = (function () {
  var M = RC.model, e = M.esc, list = [], map = {}, rejected = [], css = '';
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DEFAULT = 'executive-classic';

  /* ---------- registry ---------- */
  function register(d) {
    if (!d || !d.id) { rejected.push({ id: d && d.id, name: d && d.name, reason: 'missing id' }); return; }
    if (map[d.id]) { rejected.push({ id: d.id, name: d.name, reason: 'duplicate id' }); return; }
    d.supports = d.supports || M.SECTIONS.slice();
    d.visual = d.visual || {};
    map[d.id] = d; list.push(d);
    if (d.css) css += d.css.replace(/&/g, '.rt-' + d.id) + '\n';
    if (document.getElementById('rt-css')) document.getElementById('rt-css').textContent = BASE + css;
  }

  /* ---------- small helpers ---------- */
  function fd(s) { if (!s) return ''; var m = /^(\d{4})(?:-(\d{1,2}))?/.exec(s); return m ? (m[2] && MON[+m[2] - 1] ? MON[+m[2] - 1] + ' ' : '') + m[1] : e(s); }
  function range(a, b, cur) { var x = fd(a), y = cur ? 'Present' : fd(b); return x && y ? x + ' – ' + y : x || y; }
  function safeUrl(u) { return /^(https?:\/\/|data:image\/)/i.test(u || '') ? u : ''; }
  function initials(n) { return (n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }
  function pct(l) { l = (l || '').toLowerCase(); return /expert|native|fluent/.test(l) ? 95 : /advanced|profession/.test(l) ? 80 : /inter/.test(l) ? 60 : /begin|basic/.test(l) ? 35 : 70; }
  function dots(l) { var n = Math.round(pct(l) / 20), s = ''; for (var i = 0; i < 5; i++) s += '<i' + (i < n ? ' class="on"' : '') + '></i>'; return '<em class="dots">' + s + '</em>'; }
  function has(r, k) { var v = r[k]; return k === 'summary' ? !!(v || '').trim() : Array.isArray(v) && v.length > 0; }

  /* ---------- content blocks ---------- */
  function entry(t, c, d, ds, ach) {
    return '<div class="it"><div class="hd2"><div class="tc"><b class="t">' + t + '</b>' + (c ? '<span class="c">' + c + '</span>' : '') + '</div>' + (d ? '<span class="d">' + d + '</span>' : '') + '</div>' +
      ((ds || (ach && ach.length)) ? '<div class="bd">' + (ds ? '<p class="ds">' + e(ds) + '</p>' : '') + (ach && ach.length ? '<ul class="ach">' + ach.map(function (a) { return '<li>' + e(a) + '</li>'; }).join('') + '</ul>' : '') + '</div>' : '') + '</div>';
  }
  var join = function (a, s) { return a.filter(Boolean).map(e).join(s || ', '); };
  function skills(r, v) {
    var s = r.skills;
    if (v === 'comma') return '<p class="sk-c">' + s.map(function (x) { return e(x.name); }).join(', ') + '</p>';
    if (v === 'chips' || v === 'tags') return '<ul class="sk-ch ' + v + '">' + s.map(function (x) { return '<li>' + e(x.name) + '</li>'; }).join('') + '</ul>';
    if (v === 'bars') return '<ul class="sk-b">' + s.map(function (x) { return '<li><span>' + e(x.name) + '</span><i style="--p:' + pct(x.level) + '%"></i></li>'; }).join('') + '</ul>';
    if (v === 'dots') return '<ul class="sk-d">' + s.map(function (x) { return '<li><span>' + e(x.name) + '</span>' + dots(x.level) + '</li>'; }).join('') + '</ul>';
    if (v === 'grouped') {
      var g = {}, o = []; s.forEach(function (x) { var k = x.category || 'Other'; if (!g[k]) { g[k] = []; o.push(k); } g[k].push(x.name); });
      return o.map(function (k) { return '<div class="sk-g"><b>' + e(k) + '</b><span>' + join(g[k]) + '</span></div>'; }).join('');
    }
    return '<ul class="sk-col">' + s.map(function (x) { return '<li>' + e(x.name) + '</li>'; }).join('') + '</ul>';
  }
  function body(k, r, v) {
    switch (k) {
      case 'summary': return '<p class="sum">' + e(r.summary) + '</p>';
      case 'experience': return r.experience.map(function (x) { return entry(e(x.position || x.company), join([x.position ? x.company : '', x.location], ' · '), range(x.startDate, x.endDate, x.current), x.description, x.achievements); }).join('');
      case 'education': return r.education.map(function (x) { return entry(e(join([x.degree, x.field], ' in ') || x.institution), x.degree || x.field ? e(x.institution) : '', range(x.startDate, x.endDate), x.description); }).join('');
      case 'skills': return skills(r, v.sk);
      case 'projects': return '<div class="pjs">' + r.projects.map(function (x) {
        return '<div class="pj"><b class="t">' + e(x.name) + '</b>' + (x.technologies.length ? '<span class="tech">' + join(x.technologies, ' · ') + '</span>' : '') + (x.description ? '<p>' + e(x.description) + '</p>' : '') + (safeUrl(x.link) ? '<span class="lk">' + e(x.link.replace(/^https?:\/\//, '')) + '</span>' : '') + '</div>';
      }).join('') + '</div>';
      case 'certifications': return '<ul class="ls">' + r.certifications.map(function (x) { return '<li><b>' + e(x.name) + '</b>' + (x.issuer || x.date ? '<span>' + join([x.issuer, fd(x.date)]) + '</span>' : '') + '</li>'; }).join('') + '</ul>';
      case 'languages': return v.lang === 'bars' ? '<ul class="sk-b">' + r.languages.map(function (x) { return '<li><span>' + e(x.name) + '</span><i style="--p:' + pct(x.proficiency) + '%"></i></li>'; }).join('') + '</ul>' :
        '<ul class="ls lg">' + r.languages.map(function (x) { return '<li><b>' + e(x.name) + '</b>' + (x.proficiency ? '<span>' + e(x.proficiency) + '</span>' : '') + '</li>'; }).join('') + '</ul>';
      case 'awards': return '<ul class="ls">' + r.awards.map(function (x) { return '<li><b>' + e(x.title) + '</b><span>' + join([x.issuer, fd(x.date)]) + '</span>' + (x.description ? '<p>' + e(x.description) + '</p>' : '') + '</li>'; }).join('') + '</ul>';
      case 'volunteer': return r.volunteer.map(function (x) { return entry(e(x.role || x.organization), x.role ? e(x.organization) : '', range(x.startDate, x.endDate), x.description); }).join('');
      case 'publications': return '<ul class="ls">' + r.publications.map(function (x) { return '<li><b>' + e(x.title) + '</b><span>' + join([x.publisher, fd(x.date)]) + '</span>' + (x.description ? '<p>' + e(x.description) + '</p>' : '') + '</li>'; }).join('') + '</ul>';
    }
    return '';
  }
  function section(k, r, d) {
    var L = d.labels || {};
    var wrap = function (key, label, inner) { return '<section class="s s-' + key + '"><h2 class="sh"><span>' + e(label) + '</span></h2><div class="sb">' + inner + '</div></section>'; };
    if (k === 'customSections') return r.customSections.filter(function (c) { return c.items.length; }).map(function (c) {
      return wrap('custom', c.title || 'Additional', c.items.map(function (i) { return entry(e(i.heading), e(i.subheading), fd(i.date), i.description); }).join(''));
    }).join('');
    return wrap(k, L[k] || M.LABELS[k], body(k, r, d.visual));
  }

  /* ---------- headers ---------- */
  function ct(pi, labeled) {
    var rows = [['Email', pi.email], ['Phone', pi.phone], ['Location', pi.location], ['Web', pi.website], ['LinkedIn', pi.linkedin], ['GitHub', pi.github]].filter(function (x) { return x[1]; });
    return rows.length ? '<ul class="ct">' + rows.map(function (x) { return '<li class="c-' + x[0].toLowerCase() + '">' + (labeled ? '<small>' + x[0] + '</small>' : '') + '<span>' + e(x[1]) + '</span></li>'; }).join('') + '</ul>' : '';
  }
  function avatar(r) {
    var u = r.visibilitySettings.profilePhoto ? safeUrl(r.personalInfo.profilePhoto) : '';
    return u ? '<img class="av" src="' + e(u) + '" alt="">' : '<div class="av">' + e(initials(r.personalInfo.fullName)) + '</div>';
  }
  function photo(r) {
    var u = r.visibilitySettings.profilePhoto ? safeUrl(r.personalInfo.profilePhoto) : '';
    return u ? '<img class="av" src="' + e(u) + '" alt="">' : '';
  }
  function header(v, r) {
    var pi = r.personalInfo, name = e(pi.fullName || 'Your Name'), jt = pi.jobTitle ? '<div class="jt">' + e(pi.jobTitle) + '</div>' : '';
    var nm = '<h1 class="nm">' + name + '</h1>' + jt;
    var inner = nm + ct(pi);
    if (v === 'split') inner = '<div>' + nm + '</div>' + ct(pi);
    else if (v === 'photo') inner = avatar(r) + '<div>' + nm + ct(pi) + '</div>';
    else if (v === 'side') inner = avatar(r) + nm + ct(pi, true);
    else if (v === 'words') inner = '<h1 class="nm">' + (pi.fullName || 'Your Name').split(/\s+/).map(function (w) { return '<span>' + e(w) + '</span>'; }).join('') + '</h1>' + jt + ct(pi, true);
    return '<header class="hd hd-' + v + '">' + inner + '</header>';
  }

  /* ---------- context + layouts ---------- */
  function keysFor(r, d) {
    var isDefault = r.sectionOrder.join() === M.SECTIONS.join();
    var base = isDefault && d.order ? d.order.concat(M.SECTIONS.filter(function (k) { return d.order.indexOf(k) < 0; })) : r.sectionOrder;
    return base.filter(function (k) { return r.visibilitySettings[k] !== false && has(r, k) && d.supports.indexOf(k) > -1 && (k !== 'customSections' || r.customSections.some(function (c) { return c.items.length; })); });
  }
  function years(r) {
    var ys = r.experience.map(function (x) { return parseInt(x.startDate, 10); }).filter(Boolean);
    return ys.length ? Math.max(1, new Date().getFullYear() - Math.min.apply(null, ys)) : 0;
  }
  function makeCtx(r, d) {
    var c = { r: r, d: d, keys: keysFor(r, d) };
    c.sec = function (k) { return section(k, r, d); };
    c.body = function (k) { return body(k, r, d.visual); };
    c.label = function (k) { return (d.labels || {})[k] || M.LABELS[k]; };
    c.header = function (v) { return header(v || d.visual.header || 'left', r); };
    c.highlights = function (n) {
      var out = []; r.experience.forEach(function (x) { var t = x.achievements[0] || x.description; if (t && out.length < n) out.push([t, x.company]); });
      return out.length ? '<div class="hl">' + out.map(function (o) { return '<div><p>' + e(o[0]) + '</p><small>' + e(o[1]) + '</small></div>'; }).join('') + '</div>' : '';
    };
    c.stats = function () {
      var s = [[years(r), 'years of experience'], [r.projects.length, 'projects'], [r.certifications.length, 'certifications'], [r.skills.length, 'skills']].filter(function (x) { return x[0]; });
      return s.length ? '<div class="stats">' + s.map(function (x) { return '<div><b>' + x[0] + '</b><small>' + x[1] + '</small></div>'; }).join('') + '</div>' : '';
    };
    return c;
  }
  function layout(c) {
    var d = c.d, L = d.layout, ks = c.keys, extra = d.extra ? d.extra(c) : '';
    if (d.build) return d.build(c);
    if (L === 'single') return c.header() + extra + '<div class="main">' + ks.map(c.sec).join('') + '</div>';
    if (L === 'grid') return '<div class="tiles"><div class="tile t-head">' + c.header() + extra + '</div>' + ks.map(function (k) { return '<div class="tile t-' + k + '">' + c.sec(k) + '</div>'; }).join('') + '</div>';
    var side = ks.filter(function (k) { return (d.sideKeys || []).indexOf(k) > -1; }), main = ks.filter(function (k) { return side.indexOf(k) < 0; });
    var hi = d.headIn || 'top', head = c.header();
    var s = '<aside class="side">' + (hi === 'side' ? head : '') + side.map(c.sec).join('') + '</aside>';
    var m = '<div class="main">' + (hi === 'main' ? head : '') + (hi !== 'top' ? extra : '') + main.map(c.sec).join('') + '</div>';
    return (hi === 'top' ? head + extra : '') + '<div class="cols">' + (L === 'sidebar-left' ? s + m : m + s) + '</div>';
  }

  /* ---------- public: renderResume ---------- */
  function renderResume(resume, templateId) {
    var r = M.visible(M.normalize(resume)), d = map[templateId] || map[DEFAULT] || list[0];
    if (!d) return '';
    var ds = r.designSettings, v = d.visual, ty = d.typography || {};
    var hex = function (c) { return /^#[0-9a-f]{3,8}$/i.test(c); }, num = function (x, lo, hi, df) { var n = parseFloat(x); return isFinite(n) ? Math.min(hi, Math.max(lo, n)) : df; };
    var fnt = function (f) { return /^[\w\s,'"-]{2,80}$/.test(f) ? f : ''; };
    var one = function (x, ok) { return ok.indexOf(x) > -1 ? x : ''; };
    var acc = hex(ds.accentColor) ? ds.accentColor : d.accent;
    var a2 = hex(ds.secondaryColor) ? ds.secondaryColor : (d.accent2 || acc);
    var font = fnt(ds.fontFamily), hfont = fnt(ds.headingFont);
    var fm = { small: .93, large: 1.08 }[ds.fontSize] || 1, sp = { compact: .8, relaxed: 1.25 }[ds.spacing] || 1;
    var pm = num(ds.pageMargin, .4, 1.8, 1) * ({ compact: .8, wide: 1.2 }[ds.margins] || 1), sg = num(ds.sectionGap, .4, 2.2, 1);
    var pad = (v.pad || [40, 44]).map(function (x) { return Math.round(x * pm); });
    var sw = /^\d{2}%$/.test(ds.sidebarWidth) ? ds.sidebarWidth : (v.sideW || '30%');
    /* Layout override: single column or two columns, whatever the template normally uses. Content is untouched. */
    var dd = d, cols = one(ds.columns, ['single', 'two']);
    if (cols === 'single' && (d.layout !== 'single' || d.build)) dd = Object.assign({}, d, { layout: 'single', build: null, visual: Object.assign({}, v, { bleed: false }) });
    else if (cols === 'two' && d.layout === 'single') dd = Object.assign({}, d, { layout: 'sidebar-right', build: null, headIn: 'top', sideKeys: ['skills', 'languages', 'certifications', 'awards'], visual: Object.assign({}, v, { bleed: false }) });
    var vv = dd.visual;
    var style = '--ac:' + acc + ';--a2:' + a2 + ';--hf:' + (hfont || ty.heading) + ';--bf:' + (font || ty.body) + ';--base:' + num(ds.bodySize, 9, 18, ty.size || 13) + 'px;--fm:' + fm + ';--sp:' + (sp * sg * (v.sp || 1)) + ';--pt:' + pad[0] + 'px;--px:' + pad[1] + 'px;--sw:' + sw;
    var at = '';
    if (hex(ds.textColor)) { at += ' data-tx="on"'; style += ';--tx:' + ds.textColor; }
    if (hex(ds.bgColor)) { at += ' data-bgc="on"'; style += ';--bgc:' + ds.bgColor; }
    if (hex(ds.secondaryColor)) at += ' data-sc="on"';
    if (ds.lineHeight && num(ds.lineHeight, 1.1, 2.2, 0)) { at += ' data-lh="on"'; style += ';--lh:' + num(ds.lineHeight, 1.1, 2.2, 1.5); }
    if (ds.letterSpacing !== '' && isFinite(parseFloat(ds.letterSpacing))) { at += ' data-ls="on"'; style += ';--ls:' + num(ds.letterSpacing, -.05, .15, 0) + 'em'; }
    if (ds.headingSize && num(ds.headingSize, .7, 1.6, 0)) { at += ' data-hs="on"'; style += ';--hs:' + num(ds.headingSize, .7, 1.6, 1); }
    if (cols) at += ' data-cols="' + cols + '"';
    ['dividers:dv:none,thin,thick,dashed', 'pageBorder:bd:thin,thick,accent', 'icons:ic:on', 'photoShape:ps:circle,rounded,square'].forEach(function (m) { m = m.split(':'); var x = one(ds[m[0]], m[2].split(',')); if (x) at += ' data-' + m[1] + '="' + x + '"'; });
    var hs = one(ds.headingStyle, ['rule', 'bar', 'band', 'pill', 'under', 'plain', 'box', 'mini', 'slash']) || vv.h || 'rule';
    return '<div class="rt rt-' + d.id + '" data-h="' + hs + '" data-x="' + (vv.x || 'classic') + '" data-pj="' + (vv.pj || 'list') + '"' + (vv.bleed ? ' data-bleed' : '') + at + ' style="' + style + '"><div class="pg">' + layout(makeCtx(r, dd)) + '</div></div>';
  }

  /* ---------- scaled previews (A4 page = 794px wide, scaled to the container) ---------- */
  var ro = window.ResizeObserver ? new ResizeObserver(function (en) { en.forEach(function (x) { scale(x.target); }); }) : null;
  function scale(p) { var r = p.firstElementChild; if (r && p.clientWidth) r.style.transform = 'scale(' + (p.clientWidth / 794) + ')'; }
  function fit(root) { (root || document).querySelectorAll('.pv').forEach(function (p) { scale(p); if (ro) ro.observe(p); }); }
  function preview(resume, id) { return '<div class="pv">' + renderResume(resume, id) + '</div>'; }

  var BASE = [
    '.pv{position:relative;overflow:hidden;aspect-ratio:794/1123;background:#fff;border:1px solid var(--line);border-radius:6px;pointer-events:none}',
    '.pv .rt{position:absolute;top:0;left:0;transform-origin:0 0}',
    '.rt{width:794px;min-height:1123px;background:#fff;color:#1f2933;font:calc(var(--base,13px)*var(--fm,1))/1.5 var(--bf);position:relative;overflow:hidden;text-align:left;-webkit-font-smoothing:antialiased}',
    '.rt *{box-sizing:border-box;margin:0}.rt ul{list-style:none;padding:0}.rt .pg{padding:var(--pt) var(--px)}.rt[data-bleed] .pg{padding:0}',
    /* Part 13 design overrides (only active when the matching data- attribute is set) */
    '.rt[data-tx]{color:var(--tx)}.rt[data-bgc]{background:var(--bgc)}.rt[data-lh]{line-height:var(--lh)}.rt[data-lh] .it,.rt[data-lh] .ds,.rt[data-lh] p,.rt[data-lh] li{line-height:var(--lh)}',
    '.rt[data-ls],.rt[data-ls] .nm,.rt[data-ls] .jt,.rt[data-ls] .ct{letter-spacing:var(--ls)}',
    '.rt[data-hs] .sh{font-size:calc(var(--hs)*1.05em)}.rt[data-hs] .nm{font-size:calc(var(--hs)*30px)}',
    '.rt[data-sc] .jt,.rt[data-sc] .d,.rt[data-sc] .lk,.rt[data-sc] .tech{color:var(--a2);opacity:1}',
    '.rt[data-cols=two] .cols{grid-template-columns:minmax(0,1fr) var(--sw)}.rt[data-cols=two] .side{padding-left:20px;border-left:1px solid rgba(128,128,128,.3)}',
    '.rt[data-cols=single] .main,.rt[data-cols=single] .side{width:100%}',
    '.rt[data-dv=none] .sh{border-bottom:0!important}.rt[data-dv=none] .sh:after{display:none!important}',
    '.rt[data-dv=thin] .sh,.rt[data-dv=thick] .sh,.rt[data-dv=dashed] .sh{padding-bottom:3px;border-bottom-color:rgba(128,128,128,.55)}.rt[data-dv=thin] .sh{border-bottom-width:1px;border-bottom-style:solid}.rt[data-dv=thick] .sh{border-bottom-width:3px;border-bottom-style:solid;border-bottom-color:var(--ac)}.rt[data-dv=dashed] .sh{border-bottom-width:1px;border-bottom-style:dashed}',
    '.rt[data-dv=thin] .s+.s,.rt[data-dv=dashed] .s+.s,.rt[data-dv=thick] .s+.s{padding-top:calc(10px*var(--sp))}',
    '.rt[data-bd=thin]{box-shadow:inset 0 0 0 1px #c9ced6}.rt[data-bd=thick]{box-shadow:inset 0 0 0 4px #c9ced6}.rt[data-bd=accent]{box-shadow:inset 0 0 0 5px var(--ac)}',
    '.rt[data-ps=circle] .av{border-radius:50%}.rt[data-ps=rounded] .av{border-radius:18px}.rt[data-ps=square] .av{border-radius:0}',
    '.rt[data-ic] .ct li span:before{display:inline-block;width:1.25em;font-style:normal;color:var(--ac);opacity:.9}',
    '.rt[data-ic] .c-email span:before{content:"\\2709"}.rt[data-ic] .c-phone span:before{content:"\\260E"}.rt[data-ic] .c-location span:before{content:"\\2316"}.rt[data-ic] .c-web span:before{content:"\\25CE"}.rt[data-ic] .c-linkedin span:before{content:"in";font-weight:700;font-size:.8em}.rt[data-ic] .c-github span:before{content:"\\2442"}',
    /* isolate resumes from site-wide rules in styles.css (section padding, heading letter-spacing) */
    '.rt section{padding:0}.rt h1,.rt h2{letter-spacing:normal}.rt .stats{padding:0}',
    '.rt .av{width:84px;height:84px;border-radius:50%;object-fit:cover;background:var(--ac);color:#fff;display:grid;place-items:center;font:700 28px var(--hf);flex:none}',
    '.rt .nm{font:700 30px/1.1 var(--hf)}.rt .jt{margin-top:4px;color:var(--ac);font-weight:600}',
    '.rt .ct{display:flex;flex-wrap:wrap;gap:2px 14px;margin-top:8px;font-size:.92em}',
    '.rt .s{margin-top:calc(18px*var(--sp))}.rt .sh{font:700 1em var(--hf)}.rt .sb{margin-top:calc(8px*var(--sp))}',
    '.rt .it{margin-top:calc(11px*var(--sp))}.rt .it:first-child{margin-top:0}.rt .t{font-weight:700}.rt .c{opacity:.75}.rt .d{opacity:.7;font-size:.92em;white-space:nowrap}.rt .ds{margin-top:3px}',
    '.rt .ach{margin-top:3px}.rt .ach li{position:relative;padding-left:14px;margin-top:2px}.rt .ach li:before{content:"";position:absolute;left:2px;top:.62em;width:5px;height:5px;border-radius:50%;background:var(--ac)}',
    /* experience / entry variants */
    '.rt .hd2{display:flex;justify-content:space-between;gap:12px;align-items:baseline}.rt .tc .c:before{content:" — "}',
    '.rt[data-x=dateleft] .it{display:grid;grid-template-columns:104px 1fr;column-gap:16px}.rt[data-x=dateleft] .hd2{display:contents}.rt[data-x=dateleft] .d{grid-column:1;grid-row:1;white-space:normal}.rt[data-x=dateleft] .tc{grid-column:2;grid-row:1}.rt[data-x=dateleft] .bd{grid-column:2}',
    '.rt[data-x=timeline] .it{position:relative;border-left:2px solid var(--ac);padding:0 0 2px 18px;margin-left:5px}.rt[data-x=timeline] .it:before{content:"";position:absolute;left:-7px;top:3px;width:12px;height:12px;border-radius:50%;background:#fff;border:3px solid var(--ac)}.rt[data-x=timeline] .hd2{flex-direction:column-reverse;gap:0}.rt[data-x=timeline] .d{font-weight:600;color:var(--ac);opacity:1}',
    '.rt[data-x=cards] .it{border:1px solid rgba(128,128,128,.28);border-radius:8px;padding:10px 12px;background:rgba(128,128,128,.06)}',
    '.rt[data-x=bordered] .it{border-left:3px solid var(--ac);padding-left:12px}',
    '.rt[data-x=inline] .hd2{justify-content:flex-start;gap:10px}.rt[data-x=inline] .d{margin-left:auto}',
    '.rt .tc .c:before{content:" · "}.rt[data-x=dateleft] .tc .c:before,.rt[data-x=timeline] .tc .c:before,.rt[data-x=cards] .tc .c:before{content:""}.rt[data-x=dateleft] .tc .c,.rt[data-x=timeline] .tc .c,.rt[data-x=cards] .tc .c{display:block}',
    /* skills */
    '.rt .sk-ch,.rt .sk-d{display:flex;flex-wrap:wrap;gap:6px}.rt .sk-ch li{padding:3px 10px;border-radius:999px;background:var(--ac);color:#fff;font-size:.9em}.rt .sk-ch.tags li{background:none;color:inherit;border:1px solid var(--ac);border-radius:4px}',
    '.rt .sk-b li{margin-top:7px}.rt .sk-b li:first-child{margin-top:0}.rt .sk-b span{display:block;font-size:.92em;margin-bottom:3px}.rt .sk-b i{display:block;height:5px;border-radius:3px;background:rgba(128,128,128,.25);position:relative}.rt .sk-b i:after{content:"";position:absolute;inset:0;width:var(--p);border-radius:3px;background:var(--ac)}',
    '.rt .sk-d{display:block}.rt .sk-d li{display:flex;justify-content:space-between;align-items:center;margin-top:5px}.rt .dots{display:flex;gap:3px}.rt .dots i{width:9px;height:9px;border-radius:50%;border:1.5px solid var(--ac)}.rt .dots i.on{background:var(--ac)}',
    '.rt .sk-g{margin-top:4px}.rt .sk-g b{margin-right:6px}.rt .sk-col{columns:3;column-gap:20px}.rt .sk-col li{break-inside:avoid;padding-left:12px;position:relative}.rt .sk-col li:before{content:"▪";position:absolute;left:0;color:var(--ac)}',
    /* projects and lists */
    '.rt .pj{margin-top:8px}.rt .pj:first-child{margin-top:0}.rt .tech{margin-left:8px;opacity:.7;font-size:.9em}.rt .lk{display:block;font-size:.88em;color:var(--ac)}',
    '.rt[data-pj=cards] .pjs,.rt[data-pj=grid] .pjs{display:grid;grid-template-columns:1fr 1fr;gap:10px}.rt[data-pj=cards] .pj{margin:0;padding:10px 12px;border:1px solid rgba(128,128,128,.3);border-radius:8px}.rt[data-pj=grid] .pj{margin:0;padding-top:8px;border-top:3px solid var(--ac)}',
    '.rt[data-pj=inline] .pj p{display:inline}.rt[data-pj=inline] .pj .tech{display:block;margin:0}',
    '.rt .ls li{margin-top:4px}.rt .ls li:first-child{margin-top:0}.rt .ls li span{display:block;opacity:.75;font-size:.92em}.rt .ls.lg li{display:flex;justify-content:space-between}.rt .ls p{font-size:.92em}',
    '.rt .hl{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:16px}.rt .hl div{border-top:3px solid var(--ac);padding-top:8px}.rt .hl small{opacity:.7}.rt .hl p{font-weight:600}',
    '.rt .stats{display:flex;gap:10px;margin-top:14px}.rt .stats div{flex:1;text-align:center;padding:8px 4px;border:1px solid rgba(128,128,128,.3);border-radius:8px}.rt .stats b{display:block;font:700 22px var(--hf);color:var(--ac)}.rt .stats small{opacity:.7}',
    /* headings */
    '.rt[data-h=rule] .sh{text-transform:uppercase;letter-spacing:.12em;font-size:.88em;border-bottom:1px solid currentColor;padding-bottom:3px}',
    '.rt[data-h=bar] .sh{border-left:4px solid var(--ac);padding-left:10px;font-size:1.08em}',
    '.rt[data-h=band] .sh{background:var(--ac);color:#fff;padding:3px 10px;font-size:.95em;border-radius:3px}',
    '.rt[data-h=pill] .sh span{display:inline-block;background:var(--ac);color:#fff;padding:2px 14px;border-radius:999px;font-size:.92em}',
    '.rt[data-h=under] .sh{font-size:1.1em}.rt[data-h=under] .sh:after{content:"";display:block;width:36px;height:3px;background:var(--ac);margin-top:4px}',
    '.rt[data-h=plain] .sh{font-size:1.1em;color:var(--ac);border-bottom:1px solid rgba(128,128,128,.35);padding-bottom:2px}',
    '.rt[data-h=side] .s{display:grid;grid-template-columns:104px 1fr;column-gap:16px}.rt[data-h=side] .sb{margin-top:0}.rt[data-h=side] .sh{color:var(--ac);font-size:.95em}',
    '.rt[data-h=box] .sh{background:rgba(128,128,128,.14);padding:3px 8px;text-transform:uppercase;letter-spacing:.08em;font-size:.82em}',
    '.rt[data-h=mini] .sh{font-weight:500;font-size:.82em;letter-spacing:.14em;text-transform:lowercase;opacity:.6}',
    '.rt[data-h=slash] .sh:before{content:"/ ";color:var(--ac)}.rt[data-h=slash] .sh{font-size:1.1em}',
    /* layout frames */
    '.rt .cols{display:grid;gap:28px;align-items:start}.rt[data-bleed] .cols{gap:0;align-items:stretch;min-height:1123px}',
    '.rt .tiles{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}.rt .tile{grid-column:span 3;padding:14px;border-radius:12px}.rt .tile .s{margin-top:0}',
    '.rt[data-bleed] .side{padding:var(--pt) 26px}.rt[data-bleed] .main{padding:var(--pt) var(--px)}'
  ].join('\n');

  function mountStyle() {
    var s = document.getElementById('rt-css'); if (!s) { s = document.createElement('style'); s.id = 'rt-css'; document.head.appendChild(s); }
    s.textContent = BASE + css;
  }
  mountStyle();

  return {
    register: register, rejected: function () { return rejected.slice(); }, list: function () { return list.slice(); }, get: function (id) { return map[id] || null; },
    renderResume: renderResume, preview: preview, fit: fit, DEFAULT_ID: DEFAULT,
    util: { e: e, fd: fd, range: range, join: join, safeUrl: safeUrl, initials: initials, pct: pct, entry: entry, skills: skills, ct: ct, avatar: avatar, photo: photo }
  };
})();
window.renderResume = RC.templates.renderResume;
