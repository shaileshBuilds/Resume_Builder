/* Templates 11-20: modern and creative layouts.
   Each template has its own markup (build) and scoped CSS, so none is a recolour of another.
   Rules used throughout: "&" in css expands to the template's own root class; no "&" in content. */
(function () {
  var TP = RC.templates, T = TP.register, U = TP.util, e = U.e;
  var POP = "'Poppins',system-ui,sans-serif", INTER = "'Inter',system-ui,sans-serif", ARCH = "'Archivo Black','Arial Black',sans-serif",
    INST = "'Instrument Sans','Inter',system-ui,sans-serif", GROT = "'Space Grotesk',system-ui,sans-serif", BRIC = "'Bricolage Grotesque','Inter',system-ui,sans-serif",
    DM = "'DM Sans',system-ui,sans-serif", JOS = "'Josefin Sans','Century Gothic',sans-serif", SRC = "'Source Sans 3','Segoe UI',sans-serif",
    DMS = "'DM Serif Display',Georgia,serif";

  /* ---------- shared helpers ---------- */
  function sec(c, k, o) {
    if (k === 'customSections') return c.sec(k);
    o = o || {};
    return '<section class="s s-' + k + '"><h2 class="sh"><span>' + e(c.label(k)) + '</span></h2><div class="sb">' + (o.inner != null ? o.inner : c.body(k)) + '</div></section>';
  }
  var secs = function (c, ks) { return ks.map(function (k) { return sec(c, k); }).join(''); };
  var has = function (c, k) { return c.keys.indexOf(k) > -1; };
  var only = function (c, list) { return c.keys.filter(function (k) { return list.indexOf(k) > -1; }); };
  var except = function (c, list) { return c.keys.filter(function (k) { return list.indexOf(k) < 0; }); };
  var nm = function (pi) { return '<h1 class="nm">' + e(pi.fullName || 'Your Name') + '</h1>'; };
  var jt = function (pi) { return pi.jobTitle ? '<div class="jt">' + e(pi.jobTitle) + '</div>' : ''; };
  var words = function (pi) { return '<h1 class="nm">' + (pi.fullName || 'Your Name').split(/\s+/).map(function (w) { return '<span>' + e(w) + '</span>'; }).join('') + '</h1>'; };

  /* ---------- 11. Modern Wave: gradient banner with a wave edge, skill ribbon, timeline ---------- */
  T({ id: 'modern-wave', name: 'Modern Wave', category: 'Modern', ats: 'Design-led', layout: 'single',
    description: 'Gradient banner with a wave edge, a skill ribbon and a vertical career timeline.',
    accent: '#6d28d9', accent2: '#2563eb', typography: { heading: POP, body: INTER, size: 12.5 },
    visual: { h: 'custom', x: 'timeline', pj: 'cards', sk: 'chips', bleed: true, pad: [36, 48] },
    build: function (c) {
      var r = c.r, pi = r.personalInfo, foot = ['education', 'certifications', 'languages', 'awards'];
      var head = '<header class="wv-h"><div class="wv-id">' + U.avatar(r) + '<div>' + nm(pi) + jt(pi) + '</div></div>' + U.ct(pi) +
        '<svg class="wv-w" viewBox="0 0 794 58" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 C120 66 250 0 400 28 S680 58 794 14 V58 H0Z" fill="rgba(255,255,255,.38)"/><path d="M0 40 C150 8 280 62 430 38 S690 8 794 34 V58 H0Z" fill="#fff"/></svg></header>';
      var ribbon = has(c, 'skills') ? sec(c, 'skills', { inner: U.skills(r, 'chips') }) : '';
      var flow = except(c, foot.concat('skills')), fk = only(c, foot);
      return head + '<div class="wv-b">' + ribbon + secs(c, flow) + (fk.length ? '<div class="wv-f">' + secs(c, fk) + '</div>' : '') + '</div>';
    },
    css: `
& .wv-h{position:relative;color:#fff;background:linear-gradient(115deg,var(--ac),var(--a2));padding:40px var(--px) 86px}
& .wv-id{display:flex;gap:22px;align-items:center}
& .av{width:94px;height:94px;border:4px solid rgba(255,255,255,.75);background:rgba(255,255,255,.18);font-size:30px;box-shadow:0 8px 20px rgba(0,0,0,.15)}
& .nm{font-size:35px;font-weight:600;letter-spacing:-.015em}
& .jt{color:rgba(255,255,255,.93);font-weight:400;font-size:1.12em;margin-top:6px}
& .ct{margin-top:20px;gap:3px 18px}
& .wv-w{position:absolute;left:0;bottom:-1px;width:100%;height:58px;display:block}
& .wv-b{padding:0 var(--px) var(--pt)}
& .sh{font-size:1.15em;font-weight:600}
& .sh span{background:linear-gradient(90deg,var(--ac),var(--a2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
& .sh:after{content:"";display:block;width:34px;height:6px;margin-top:3px;background:linear-gradient(90deg,var(--ac),var(--a2));-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='34' height='6' viewBox='0 0 34 6'%3E%3Cpath d='M0 3 Q4.25 -1 8.5 3 T17 3 T25.5 3 T34 3' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='34' height='6' viewBox='0 0 34 6'%3E%3Cpath d='M0 3 Q4.25 -1 8.5 3 T17 3 T25.5 3 T34 3' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat}
& .s-skills .sk-ch li{background:linear-gradient(90deg,var(--ac),var(--a2));font-weight:500;padding:4px 12px}
& .s-summary .sum{font-size:1.04em;line-height:1.6}
& .it .t{font-weight:600}
&[data-pj] .pj{border:2px solid transparent;border-radius:14px;background:linear-gradient(#fff,#fff) padding-box,linear-gradient(135deg,var(--ac),var(--a2)) border-box}
& .wv-f{columns:2;column-gap:32px}& .wv-f .s{break-inside:avoid;margin-top:0;padding-top:calc(18px*var(--sp))}
` });

  /* ---------- 12. Creative Split: two-tone hero, numbered sections, two equal columns ---------- */
  T({ id: 'creative-split', name: 'Creative Split', category: 'Creative', ats: 'Design-led', layout: 'single',
    description: 'A dark and light split hero with stacked name, numbered sections and a centre divider.',
    accent: '#c2410c', accent2: '#111827', typography: { heading: ARCH, body: INST, size: 12.5 },
    visual: { h: 'custom', x: 'classic', pj: 'list', sk: 'chips', bleed: true, pad: [40, 44] },
    build: function (c) {
      var r = c.r, pi = r.personalInfo, L = ['experience', 'volunteer', 'publications', 'customSections'];
      var hero = '<header class="sp-h"><div class="sp-l">' + words(pi) + jt(pi) + '</div><div class="sp-r">' + (has(c, 'summary') ? '<p class="sum">' + e(r.summary) + '</p>' : '') + U.ct(pi, true) + '</div></header>';
      var left = only(c, L), right = except(c, L.concat('summary'));
      return hero + '<div class="sp-c"><div class="sp-a">' + secs(c, left) + '</div><div class="sp-z">' + secs(c, right) + '</div></div>';
    },
    css: `
& .sp-h{display:grid;grid-template-columns:1fr 1fr}
& .sp-l{background:var(--a2);color:#fff;padding:42px 30px 34px var(--px);display:flex;flex-direction:column;justify-content:flex-end}
& .nm{font:400 44px/.98 var(--hf);text-transform:uppercase;letter-spacing:.01em}
& .nm span{display:block}
& .nm span:last-child{color:color-mix(in srgb,var(--ac) 62%,#fff)}
& .jt{color:#d1d5db;text-transform:uppercase;letter-spacing:.18em;font-size:.78em;margin-top:12px;font-weight:600}
& .sp-r{background:color-mix(in srgb,var(--ac) 9%,#fff);padding:42px var(--px) 28px 30px}
& .sp-r .sum{font-size:1.04em;line-height:1.55}
& .sp-r .ct{display:grid;grid-template-columns:1.5fr 1fr;gap:8px 14px;margin-top:16px}
& .ct li{display:flex;flex-direction:column;min-width:0}
& .ct small{font:700 8.5px var(--bf);letter-spacing:.16em;text-transform:uppercase;color:var(--ac)}
& .ct span{overflow-wrap:anywhere}
& .sp-c{display:grid;grid-template-columns:1.15fr 1fr;counter-reset:n;padding-bottom:var(--pt)}
& .sp-a{padding:6px 24px 0 var(--px)}
& .sp-z{padding:6px var(--px) 0 24px;border-left:2px solid #111827}
& .sh{display:flex;align-items:center;gap:10px;font:400 15px var(--hf);text-transform:uppercase;letter-spacing:.05em}
& .sh:before{counter-increment:n;content:counter(n,decimal-leading-zero);font:400 30px/1 var(--hf);color:transparent;-webkit-text-stroke:1.2px var(--ac)}
& .it .hd2{flex-direction:column-reverse;align-items:flex-start;gap:2px}
& .d{background:#111827;color:#fff;padding:1px 7px;font-size:.74em;font-weight:600;letter-spacing:.07em;text-transform:uppercase;opacity:1}
& .tc .c{display:block}
& .tc .c:before{content:""}
& .sk-ch li{background:#111827;color:#fff;border-radius:0;font-size:.74em;letter-spacing:.07em;text-transform:uppercase;padding:3px 8px}
& .pj .tech{display:block;margin:2px 0 0;color:var(--ac);font-weight:600;opacity:1}
` });

  /* ---------- 13. Bold Portfolio: projects first, hard shadows, mono labels ---------- */
  T({ id: 'bold-portfolio', name: 'Bold Portfolio', category: 'Creative', ats: 'Design-led', layout: 'single',
    description: 'Projects lead, with thick outlines, hard shadows and monospace labels.',
    accent: '#ff6b35', accent2: '#111111', typography: { heading: GROT, body: GROT, size: 12.5 },
    order: ['summary', 'projects', 'experience'],
    visual: { h: 'custom', x: 'classic', pj: 'list', sk: 'chips', bleed: true, pad: [34, 44] },
    build: function (c) {
      var r = c.r, pi = r.personalInfo, ph = U.photo(r), G = ['education', 'skills', 'certifications', 'languages', 'awards', 'volunteer', 'publications'];
      var head = '<header class="bp-h"><div class="bp-hl">' + ph + '<div>' + nm(pi) + jt(pi) + '</div></div>' + U.ct(pi) + '</header>';
      var flow = except(c, G), grid = only(c, G);
      return head + '<div class="bp-b">' + secs(c, flow) + (grid.length ? '<div class="bp-g">' + secs(c, grid) + '</div>' : '') + '</div>';
    },
    css: `
&{--mono:'Space Mono',ui-monospace,Menlo,monospace;background:#fffbef}
& .bp-h{display:flex;justify-content:space-between;gap:24px;align-items:flex-end;background:#111;color:#fff;padding:34px var(--px) 26px;border-bottom:8px solid var(--ac)}
& .bp-hl{display:flex;gap:18px;align-items:flex-end}
& .av{width:84px;height:84px;border-radius:0;border:3px solid #fff;box-shadow:5px 5px 0 var(--ac);object-fit:cover}
& .nm{font-size:40px;line-height:.98;letter-spacing:-.025em;text-transform:uppercase}
& .jt{color:color-mix(in srgb,var(--ac) 60%,#fff);font:700 12px var(--mono);letter-spacing:.08em;text-transform:uppercase;margin-top:8px}
& .ct{flex-direction:column;align-items:flex-end;font:400 10.5px/1.55 var(--mono);margin:0;gap:0}
& .bp-b{padding:24px var(--px) var(--pt)}
& .sh span{display:inline-block;background:#111;color:#fff;font:700 11px var(--mono);text-transform:uppercase;letter-spacing:.14em;padding:4px 10px;box-shadow:4px 4px 0 var(--ac)}
& .sb{margin-top:calc(14px*var(--sp))}
& .s-summary .sh{display:none}
& .s-summary .sb{margin-top:0}
& .s-summary .sum{font-size:1.18em;font-weight:500;line-height:1.45;border-left:6px solid var(--ac);padding-left:14px}
& .s-projects .pjs{counter-reset:p;display:grid;grid-template-columns:1fr 1fr;gap:16px}
& .pj{counter-increment:p;border:2px solid #111;background:#fff;padding:12px 14px;box-shadow:5px 5px 0 var(--ac);margin:0}
& .pj:before{content:counter(p,decimal-leading-zero);display:block;font:700 28px/1 var(--hf);margin-bottom:6px}
& .pj .tech{display:block;width:fit-content;margin:4px 0 4px;padding:1px 6px;font:400 10px var(--mono);opacity:1;background:color-mix(in srgb,var(--ac) 35%,#fff);color:#111}
& .pj .lk{font-family:var(--mono);color:#111}
& .it{border:2px solid #111;background:#fff;padding:10px 12px;margin-top:12px;box-shadow:4px 4px 0 #111}
& .it:first-child{margin-top:0}
& .it .d{font:700 10px var(--mono);background:color-mix(in srgb,var(--ac) 40%,#fff);color:#111;padding:1px 6px;opacity:1}
& .sk-ch li{border:2px solid #111;background:#fff;color:#111;border-radius:0;font:700 10.5px var(--mono);padding:2px 7px;box-shadow:2px 2px 0 var(--ac)}
& .bp-g{columns:2;column-gap:28px}& .bp-g .s{break-inside:avoid;margin-top:0;padding-top:calc(18px*var(--sp))}
` });

  /* ---------- 14. Gradient Modern: soft cards plus a floating gradient profile panel on the right ---------- */
  T({ id: 'gradient-modern', name: 'Gradient Modern', category: 'Modern', ats: 'Design-led', layout: 'sidebar-right',
    description: 'Soft white cards beside a floating, rounded gradient profile panel.',
    accent: '#7c3aed', accent2: '#db2777', typography: { heading: BRIC, body: INST, size: 12.5 },
    visual: { h: 'custom', x: 'classic', pj: 'list', sk: 'chips', pad: [34, 36] },
    build: function (c) {
      var r = c.r, pi = r.personalInfo, S = ['skills', 'languages', 'certifications'];
      var side = '<aside class="gm-s">' + U.avatar(r) + '<section class="s"><h2 class="sh"><span>Contact</span></h2><div class="sb">' + U.ct(pi, true) + '</div></section>' + secs(c, only(c, S)) + '</aside>';
      var main = '<div class="gm-m"><header class="gm-hd">' + nm(pi) + jt(pi) + '</header>' + secs(c, except(c, S)) + '</div>';
      return '<div class="gm-w">' + main + side + '</div>';
    },
    css: `
&{background:linear-gradient(180deg,#f7f3ff 0,#fff 380px)}
& .gm-w{display:grid;grid-template-columns:1fr 226px;gap:24px;align-items:start}
& .gm-m .nm{font:800 40px/1.02 var(--hf);letter-spacing:-.02em;background:linear-gradient(90deg,var(--ac),var(--a2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
& .jt{display:inline-block;margin-top:10px;padding:3px 12px;border-radius:999px;background:color-mix(in srgb,var(--ac) 12%,#fff);font-weight:600;font-size:.95em}
& .gm-m .s{background:#fff;border-radius:18px;padding:16px 18px;border:1px solid color-mix(in srgb,var(--ac) 14%,#fff);box-shadow:0 8px 24px color-mix(in srgb,var(--ac) 10%,transparent);margin-top:14px}
& .gm-m .gm-hd{padding:6px 2px 4px}
& .gm-m .sh{display:flex;align-items:center;gap:9px;font:800 15px var(--hf)}
& .gm-m .sh:before{content:"";width:11px;height:11px;border-radius:50%;background:linear-gradient(135deg,var(--ac),var(--a2))}
& .gm-m .d{background:color-mix(in srgb,var(--ac) 12%,#fff);color:var(--ac);padding:1px 9px;border-radius:999px;font-weight:600;opacity:1;font-size:.82em}
& .gm-m .pj{border-left:3px solid var(--ac);padding-left:11px}
& .gm-m .pj .tech{display:inline-block;margin:3px 0;padding:1px 8px;border-radius:999px;background:color-mix(in srgb,var(--a2) 12%,#fff);opacity:1}
& .gm-s{background:linear-gradient(165deg,var(--ac),var(--a2));color:#fff;border-radius:26px;padding:26px 20px;box-shadow:0 14px 30px color-mix(in srgb,var(--ac) 28%,transparent)}
& .gm-s .av{width:104px;height:104px;margin:0 auto 6px;border:4px solid rgba(255,255,255,.7);background:rgba(255,255,255,.2);font-size:34px}
& .gm-s .s{margin-top:18px}
& .gm-s .sh{font:700 10.5px var(--bf);letter-spacing:.16em;text-transform:uppercase;opacity:.92}
& .gm-s .ct{flex-direction:column;gap:9px;margin-top:0}
& .gm-s .ct li{display:flex;flex-direction:column}
& .gm-s .ct small{font-size:8.5px;letter-spacing:.16em;text-transform:uppercase;opacity:.75}
& .gm-s .ct span{overflow-wrap:anywhere;font-size:.95em}
& .gm-s .sk-ch li{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);font-size:.8em}
& .gm-s .ls span{opacity:.88}
` });

  /* ---------- 15. Creative Grid: bento tiles in mixed sizes and tones ---------- */
  var SPAN = { summary: 6, experience: 6, projects: 6, education: 3, skills: 3, certifications: 3, languages: 3, awards: 3, volunteer: 3, publications: 3, customSections: 3 };
  T({ id: 'creative-grid', name: 'Creative Grid', category: 'Creative', ats: 'Design-led', layout: 'grid',
    description: 'Bento-style tiles in mixed sizes and tones, with a photo tile and a stats strip.',
    accent: '#0284c7', accent2: '#d97706', typography: { heading: DM, body: DM, size: 12.5 },
    visual: { h: 'custom', x: 'classic', pj: 'grid', sk: 'chips', pad: [28, 28], sp: .9 },
    build: function (c) {
      var r = c.r, pi = r.personalInfo, i = 0, st = c.stats();
      var t = '<div class="tile t-head">' + nm(pi) + jt(pi) + U.ct(pi) + '</div><div class="tile ta">' + U.avatar(r) + '</div>' + (st ? '<div class="tile t-stats">' + st + '</div>' : '');
      c.keys.forEach(function (k) {
        var h = sec(c, k); if (!h) return;
        t += '<div class="tile t-' + k + ' tn' + (i++ % 4) + '" style="grid-column:span ' + (SPAN[k] || 3) + '">' + h + '</div>';
      });
      return '<div class="tiles">' + t + '</div>';
    },
    css: `
& .tiles{gap:10px;grid-auto-flow:dense}
& .tile{border-radius:20px;padding:16px 18px}
& .t-head{grid-column:span 4;background:#0f172a;color:#fff;display:flex;flex-direction:column;justify-content:flex-end;min-height:156px}
& .nm{font:700 36px/1 var(--hf);letter-spacing:-.02em}
& .jt{color:color-mix(in srgb,var(--ac) 50%,#fff);margin-top:8px}
& .t-head .ct{margin-top:14px;color:#cbd5e1;font-size:.88em}
& .ta{grid-column:span 2;background:var(--ac);display:grid;place-items:center;padding:12px}
& .ta .av{width:128px;height:128px;border-radius:30px;background:rgba(255,255,255,.22);font-size:44px}
& .t-stats{grid-column:span 6;padding:10px 12px;background:color-mix(in srgb,var(--a2) 14%,#fff)}
& .t-stats .stats{margin:0}
& .t-stats .stats div{border:0;background:rgba(255,255,255,.75);border-radius:14px}
& .tn0{background:color-mix(in srgb,var(--ac) 11%,#fff)}
& .tn1{background:color-mix(in srgb,var(--a2) 15%,#fff)}
& .tn2{background:#f3f4f6}
& .tn3{background:color-mix(in srgb,var(--ac) 5%,#fff);border:1.5px solid color-mix(in srgb,var(--ac) 25%,#fff)}
& .tile .sh{display:flex;align-items:center;gap:7px;font:700 10px var(--hf);text-transform:uppercase;letter-spacing:.16em;color:var(--ac)}
& .tile .sh:before{content:"";width:8px;height:8px;border-radius:50%;background:var(--a2)}
& .tile .it{padding-top:9px;border-top:1px dashed rgba(15,23,42,.2)}
& .tile .it:first-child{border-top:0;padding-top:0}
& .tile .sk-ch li{background:#fff;color:#0f172a;border-radius:8px;font-weight:500}
& .tile .pjs{gap:12px}
` });

  /* ---------- 16. Visual Resume: ring skills, centred profile, alternating timeline ---------- */
  function mono(n) {
    var w = (n || '').split(/\s+/).filter(function (x) { return /[a-z0-9]/i.test(x); });
    var t = w.length > 1 ? w.slice(0, 2).map(function (x) { return x.replace(/[^a-z0-9]/ig, '').charAt(0); }).join('') : (w[0] || '').replace(/[^a-z0-9]/ig, '').slice(0, 2);
    return (t || '?').toUpperCase();
  }
  function rings(r) {
    return '<ul class="vr-rg">' + r.skills.map(function (x) {
      return '<li style="--p:' + U.pct(x.level) + '"><div class="vr-c"><b>' + e(mono(x.name)) + '</b></div><span>' + e(x.name) + '</span></li>';
    }).join('') + '</ul>';
  }
  function altTimeline(r) {
    return '<div class="vr-tl">' + r.experience.map(function (x, i) {
      return '<div class="vr-a ' + (i % 2 ? 'rg' : 'lf') + '"><span class="vr-dot"></span><div class="vr-cell">' +
        U.entry(e(x.position || x.company), U.join([x.position ? x.company : '', x.location], ' · '), U.range(x.startDate, x.endDate, x.current), x.description, x.achievements) + '</div></div>';
    }).join('') + '</div>';
  }
  T({ id: 'visual-resume', name: 'Visual Resume', category: 'Creative', ats: 'Design-led', layout: 'single',
    description: 'Centred profile with a ring avatar, ring-style skills and a centre-spine timeline.',
    accent: '#0f766e', accent2: '#6366f1', typography: { heading: JOS, body: SRC, size: 13 },
    visual: { h: 'custom', x: 'classic', pj: 'list', sk: 'chips', lang: 'bars', pad: [40, 46] },
    build: function (c) {
      var r = c.r, pi = r.personalInfo, F = ['education', 'certifications', 'languages', 'awards', 'volunteer', 'publications'];
      var head = '<header class="vr-h"><div class="vr-ring">' + U.avatar(r) + '</div>' + nm(pi) + jt(pi) + U.ct(pi) + '</header>';
      var sum = has(c, 'summary') ? '<p class="vr-sum">' + e(r.summary) + '</p>' : '', st = c.stats();
      var flow = except(c, F.concat(['summary', 'skills', 'experience'])), fk = only(c, F);
      var inner = '';
      c.keys.forEach(function (k) {
        if (k === 'skills') inner += sec(c, k, { inner: rings(r) });
        else if (k === 'experience') inner += sec(c, k, { inner: altTimeline(r) });
        else if (flow.indexOf(k) > -1) inner += sec(c, k);
      });
      return head + sum + st + inner + (fk.length ? '<div class="vr-f">' + secs(c, fk) + '</div>' : '');
    },
    css: `
& .vr-h{text-align:center}
& .vr-ring{display:inline-block;padding:5px;border-radius:50%;background:conic-gradient(var(--ac),var(--a2),var(--ac))}
& .vr-ring .av{width:104px;height:104px;border:4px solid #fff;font-size:34px}
& .nm{font:600 34px/1.1 var(--hf);letter-spacing:.22em;text-transform:uppercase;margin-top:14px;padding-left:.22em}
& .jt{font-weight:400;letter-spacing:.3em;text-transform:uppercase;font-size:.82em;color:var(--a2);padding-left:.3em}
& .ct{justify-content:center;margin-top:12px;gap:2px 0}
& .ct li+li:before{content:"•";margin:0 10px;color:var(--ac)}
& .vr-sum{max-width:560px;margin:16px auto 0;text-align:center;font-size:1.04em;line-height:1.6}
& .stats{justify-content:center;gap:14px;margin-top:20px}
& .stats div{flex:none;width:92px;height:92px;border-radius:50%;display:grid;place-content:center;padding:0;border:2px solid var(--ac)}
& .stats b{font-size:22px}
& .stats small{font-size:8.5px;line-height:1.15;text-transform:uppercase;letter-spacing:.06em;padding:0 8px}
& .sh{display:flex;align-items:center;gap:14px;font:600 13px var(--hf);letter-spacing:.3em;text-transform:uppercase;color:var(--ac)}
& .sh:before,& .sh:after{content:"";flex:1;height:1px}
& .sh:before{background:linear-gradient(90deg,transparent,var(--ac))}
& .sh:after{background:linear-gradient(90deg,var(--ac),transparent)}
& .vr-rg{display:grid;grid-template-columns:repeat(4,1fr);gap:14px 8px;text-align:center}
& .vr-rg span{display:block;font-size:.9em;margin-top:6px}
& .vr-c{position:relative;width:62px;height:62px;margin:0 auto;border-radius:50%;background:conic-gradient(var(--ac) calc(var(--p)*1%),#e5e7eb 0);display:grid;place-items:center}
& .vr-c:after{content:"";position:absolute;inset:6px;border-radius:50%;background:#fff}
& .vr-c b{position:relative;z-index:1;font:600 12px var(--hf);color:var(--a2);letter-spacing:.04em}
& .vr-tl{position:relative}
& .vr-tl:before{content:"";position:absolute;left:50%;top:4px;bottom:4px;width:2px;margin-left:-1px;background:linear-gradient(var(--ac),var(--a2))}
& .vr-a{position:relative;display:grid;grid-template-columns:1fr 1fr;margin-top:14px}
& .vr-a:first-child{margin-top:0}
& .vr-a.lf .vr-cell{grid-column:1;padding-right:26px}
& .vr-a.rg .vr-cell{grid-column:2;padding-left:26px}
& .vr-dot{position:absolute;left:50%;top:5px;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:#fff;border:3px solid var(--ac)}
& .vr-cell .hd2{flex-direction:column;gap:0}
& .vr-a.lf .hd2{align-items:flex-end;text-align:right}
& .vr-cell .d{color:var(--ac);font-weight:600;opacity:1}
& .vr-cell .tc .c{display:block}
& .vr-cell .tc .c:before{content:""}
& .vr-f{columns:2;column-gap:30px}& .vr-f .s{break-inside:avoid;margin-top:0;padding-top:calc(18px*var(--sp))}
& .s-projects .pjs{counter-reset:p;display:grid;grid-template-columns:1fr 1fr;gap:12px}
& .pj{counter-increment:p;position:relative;padding:12px 14px 12px 50px;background:#f8fafc;border-radius:12px;margin:0}
& .pj:before{content:counter(p);position:absolute;left:12px;top:12px;width:26px;height:26px;border-radius:50%;background:conic-gradient(var(--ac),var(--a2));color:#fff;display:grid;place-items:center;font:600 12px var(--hf)}
` });

  /* ---------- 17. Modern Sidebar: dark full-height rail with photo, bars, and a headline main column ---------- */
  T({ id: 'modern-sidebar', name: 'Modern Sidebar', category: 'Modern', ats: 'ATS-compatible', layout: 'sidebar-left',
    description: 'Dark full-height rail with photo and skill bars, headline name and a stats strip.',
    accent: '#2563eb', accent2: '#38bdf8', typography: { heading: POP, body: SRC, size: 13 },
    visual: { h: 'custom', x: 'inline', pj: 'inline', sk: 'bars', lang: 'bars', sideW: '236px', bleed: true, pad: [40, 38] },
    build: function (c) {
      var r = c.r, pi = r.personalInfo, S = ['skills', 'languages', 'certifications'];
      var side = '<aside class="side">' + U.avatar(r) + '<section class="s"><h2 class="sh"><span>Contact</span></h2><div class="sb">' + U.ct(pi, true) + '</div></section>' + secs(c, only(c, S)) + '</aside>';
      var main = '<div class="main">' + nm(pi) + jt(pi) + c.stats() + secs(c, except(c, S)) + '</div>';
      return '<div class="cols">' + side + main + '</div>';
    },
    css: `
& .cols{grid-template-columns:var(--sw) 1fr}
& .side{background:#0f172a;color:#e2e8f0}
& .side .av{width:108px;height:108px;margin:0 auto 22px;border:4px solid var(--a2);font-size:36px;background:#1e293b}
& .side .s:first-of-type{margin-top:0}
& .side .sh{display:flex;align-items:center;gap:8px;font:600 10.5px var(--hf);letter-spacing:.2em;text-transform:uppercase;color:var(--a2)}
& .side .sh:after{content:"";flex:1;height:1px;background:rgba(255,255,255,.18)}
& .side .ct{flex-direction:column;gap:9px;margin-top:0}
& .side .ct li{display:flex;flex-direction:column}
& .side .ct small{font-size:8.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--a2)}
& .side .ct span{overflow-wrap:anywhere;font-size:.92em}
& .side .sk-b i{background:rgba(255,255,255,.16)}
& .side .sk-b i:after{background:linear-gradient(90deg,var(--ac),var(--a2))}
& .side .ls span{opacity:1;color:#cbd5e1}
& .main .nm{font:600 40px/1.05 var(--hf);letter-spacing:-.02em}
& .main .jt{font-weight:500;letter-spacing:.04em;margin-top:6px}
& .main .stats{gap:0;margin:16px 0 4px;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0}
& .main .stats div{border:0;border-radius:0;border-right:1px solid #e2e8f0}
& .main .stats div:last-child{border-right:0}
& .main .sh{font:600 12px var(--hf);letter-spacing:.18em;text-transform:uppercase}
& .main .sh:before{content:"";display:block;width:30px;height:4px;background:var(--ac);margin-bottom:6px}
& .main .t{font-weight:600}
` });

  /* ---------- 18. Designer Edge: editorial type, rotated margin headings, big numerals ---------- */
  function slashSkills(r) { return '<p class="de-sk">' + r.skills.map(function (x) { return e(x.name); }).join('<i>/</i>') + '</p>'; }
  T({ id: 'designer-edge', name: 'Designer Edge', category: 'Creative', ats: 'Design-led', layout: 'single',
    description: 'Editorial serif name over an accent circle, vertical margin headings and big numerals.',
    accent: '#c2410c', accent2: '#111111', typography: { heading: DMS, body: INST, size: 12.5 },
    visual: { h: 'custom', x: 'classic', pj: 'list', sk: 'comma', pad: [46, 48] },
    build: function (c) {
      var r = c.r, pi = r.personalInfo, inner = '';
      var head = '<header class="de-h">' + words(pi) + jt(pi) + U.ct(pi, true) + '</header>';
      c.keys.forEach(function (k) { inner += k === 'skills' ? sec(c, k, { inner: slashSkills(r) }) : sec(c, k); });
      return head + '<div class="main">' + inner + '</div>';
    },
    css: `
& .de-h{position:relative;padding-bottom:6px}
& .de-h:before{content:"";position:absolute;right:-14px;top:-14px;width:196px;height:196px;border-radius:50%;background:var(--ac);opacity:.9}
& .de-h>*{position:relative}
& .nm{font:400 62px/.92 var(--hf);letter-spacing:-.02em}
& .nm span{display:block}
& .nm span:nth-child(2){padding-left:62px}
& .jt{color:#111;text-transform:uppercase;letter-spacing:.24em;font-size:.76em;font-weight:600;margin-top:16px}
& .de-h .ct{display:grid;grid-template-columns:repeat(3,1fr);gap:6px 16px;margin-top:22px;padding:9px 0;border-top:1px solid #111;border-bottom:1px solid #111;font-size:.9em}
& .ct li{min-width:0}
& .ct small{display:block;font-size:8.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--ac);font-weight:600}
& .ct span{overflow-wrap:anywhere}
& .s{display:grid;grid-template-columns:30px 1fr;column-gap:20px;border-top:1px solid #111;padding-top:12px;margin-top:calc(16px*var(--sp))}
& .main .s:first-child{margin-top:18px}
& .sb{margin-top:0}
& .sh span{display:block;writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;font:400 17px var(--hf);color:#111}
& .it .t{font:400 16px var(--hf)}
& .d{font-size:.8em;letter-spacing:.06em;text-transform:uppercase;opacity:.75}
& .ach li:before{content:"–";background:none;width:auto;height:auto;top:0;left:0;border-radius:0;color:var(--ac);font-weight:700}
& .de-sk{font:400 15px/1.75 var(--hf)}
& .de-sk i{color:var(--ac);font-style:normal;padding:0 7px}
& .pjs{counter-reset:p}
& .pj{counter-increment:p;display:grid;grid-template-columns:46px 1fr;column-gap:8px;margin-top:12px}
& .pj:before{content:counter(p);grid-column:1;grid-row:1/span 4;font:400 38px/1 var(--hf);color:var(--ac)}
& .pj>*{grid-column:2}
& .pj .t{font:400 15px var(--hf)}
& .pj .tech{display:block;margin:2px 0 0}
` });

  /* ---------- 19. Contemporary Pro: monogram header, summary and facts row, two-column job table, three-column footer ---------- */
  function cpRows(r) {
    return r.experience.map(function (x) {
      var both = x.company && x.position;
      return '<div class="cp-row"><div class="cp-l"><b>' + e(x.company || x.position) + '</b>' + (x.location ? '<span>' + e(x.location) + '</span>' : '') + '<em>' + U.range(x.startDate, x.endDate, x.current) + '</em></div>' +
        '<div class="cp-r">' + (both ? '<b class="t">' + e(x.position) + '</b>' : '') + (x.description ? '<p class="ds">' + e(x.description) + '</p>' : '') +
        (x.achievements.length ? '<ul class="ach">' + x.achievements.map(function (a) { return '<li>' + e(a) + '</li>'; }).join('') + '</ul>' : '') + '</div></div>';
    }).join('');
  }
  T({ id: 'contemporary-pro', name: 'Contemporary Pro', category: 'Modern', ats: 'ATS-compatible', layout: 'single',
    description: 'Monogram header, a facts row, a two-column job table and a three-column footer.',
    accent: '#4338ca', accent2: '#111827', typography: { heading: INST, body: INTER, size: 12.5 },
    visual: { h: 'custom', x: 'classic', pj: 'inline', sk: 'dots', lang: 'list', pad: [40, 44] },
    build: function (c) {
      var r = c.r, pi = r.personalInfo, st = c.stats(), sum = has(c, 'summary');
      var cols = [['education', 'volunteer'], ['skills', 'languages'], ['certifications', 'awards', 'publications', 'customSections']];
      var used = ['summary', 'experience', 'projects'].concat(cols[0], cols[1], cols[2]);
      var head = '<header class="cp-h">' + U.avatar(r) + '<div>' + nm(pi) + jt(pi) + '</div>' + U.ct(pi) + '</header>';
      var prof = (sum || st) ? '<div class="cp-p' + (sum ? '' : ' cp-p1') + '">' + (sum ? sec(c, 'summary') : '') + st + '</div>' : '';
      var exp = has(c, 'experience') ? sec(c, 'experience', { inner: cpRows(r) }) : '', pj = has(c, 'projects') ? sec(c, 'projects') : '';
      var extra = except(c, used).length ? secs(c, except(c, used)) : '';
      var foot = cols.map(function (g) { var h = secs(c, only(c, g)); return h ? '<div>' + h + '</div>' : ''; }).join('');
      return head + prof + exp + pj + extra + (foot ? '<div class="cp-f">' + foot + '</div>' : '');
    },
    css: `
& .cp-h{position:relative;display:grid;grid-template-columns:auto 1fr auto;gap:18px;align-items:center;padding-bottom:18px;border-bottom:3px solid #111827}
& .cp-h:after{content:"";position:absolute;left:0;bottom:-3px;width:96px;height:3px;background:var(--ac)}
& .av{width:66px;height:66px;border-radius:14px;background:#111827;font-size:23px;object-fit:cover}
& .nm{font:700 30px/1.1 var(--hf);letter-spacing:-.01em}
& .jt{font-weight:600;margin-top:3px}
& .cp-h .ct{flex-direction:column;align-items:flex-end;gap:1px;margin:0;font-size:.88em;text-align:right}
& .cp-p{display:grid;grid-template-columns:1fr 176px;gap:26px;margin-top:6px;align-items:start}
& .cp-p1{grid-template-columns:1fr}
& .cp-p .s-summary{padding:12px 16px;background:color-mix(in srgb,var(--ac) 7%,#fff);border-left:4px solid var(--ac)}
& .cp-p .stats{flex-direction:column;gap:4px;margin:calc(18px*var(--sp)) 0 0}
& .cp-p1 .stats{flex-direction:row;margin-top:calc(18px*var(--sp))}
& .cp-p .stats div{display:flex;align-items:baseline;gap:8px;text-align:left;border:0;border-bottom:1px solid #e5e7eb;border-radius:0;padding:2px 0}
& .cp-p1 .stats div{flex:1}
& .cp-p .stats b{font-size:20px;min-width:30px}
& .sh{display:flex;align-items:center;gap:10px;font:600 10.5px var(--hf);text-transform:uppercase;letter-spacing:.18em;color:var(--ac)}
& .sh:after{content:"";flex:1;height:1px;background:#d6dbe3}
& .cp-row{display:grid;grid-template-columns:148px 1fr;gap:18px;padding:11px 0;border-top:1px solid #eceff3}
& .cp-row:first-child{border-top:0;padding-top:0}
& .cp-l b{display:block}
& .cp-l span{display:block;opacity:.7;font-size:.92em}
& .cp-l em{display:block;font-style:normal;color:var(--ac);font-weight:600;font-size:.9em;margin-top:2px}
& .cp-f{display:flex;gap:26px;margin-top:calc(22px*var(--sp));padding-top:4px;border-top:2px solid #111827}
& .cp-f>div{flex:1;min-width:0}
& .cp-f .s+.s{margin-top:calc(16px*var(--sp))}
& .pj .tech{display:block;margin:0}
` });

  /* ---------- 20. Creative Minimal: narrow centred column, airy spacing, hairline ornaments ---------- */
  T({ id: 'creative-minimal', name: 'Creative Minimal', category: 'Creative', ats: 'ATS-friendly', layout: 'single',
    description: 'A narrow centred column with light type, wide spacing and hairline ornaments.',
    accent: '#8a6f55', accent2: '#8a6f55', typography: { heading: JOS, body: JOS, size: 12.5 },
    visual: { header: 'center', h: 'custom', x: 'classic', pj: 'list', sk: 'chips', sp: 1.15, pad: [70, 118] },
    css: `
&{font-weight:300}
& .hd-center{text-align:center;padding-bottom:4px}
& .nm{font:300 36px/1.15 var(--hf);letter-spacing:.34em;text-transform:uppercase;padding-left:.34em}
& .jt{color:#6b6b6b;letter-spacing:.3em;text-transform:uppercase;font-size:.78em;font-weight:400;margin-top:12px;padding-left:.3em}
& .hd-center .ct{justify-content:center;margin-top:16px;gap:2px 0;font-size:.85em}
& .ct li+li:before{content:"·";margin:0 9px;color:var(--ac)}
& .hd-center:after{content:"";display:block;width:30px;height:1px;background:var(--ac);margin:24px auto 0}
& .main{text-align:center}
& .sh{display:flex;align-items:center;justify-content:center;gap:14px;font:600 10.5px var(--hf);letter-spacing:.36em;text-transform:uppercase;color:var(--ac)}
& .sh:before,& .sh:after{content:"";width:22px;height:1px;background:currentColor;opacity:.6}
& .s{margin-top:calc(30px*var(--sp))}
& .s-summary .sum{font-size:1.08em;line-height:1.75}
& .it .hd2{flex-direction:column;align-items:center;gap:2px}
& .it .t{font-weight:600}
& .d{opacity:.65;letter-spacing:.1em;text-transform:uppercase;font-size:.8em}
& .tc .c{display:block}
& .tc .c:before{content:""}
& .ach li{padding:0;margin-top:5px}
& .ach li:before{display:none}
& .sk-ch{justify-content:center;gap:2px 0}
& .sk-ch li{background:none;color:inherit;padding:0;border-radius:0}
& .sk-ch li+li:before{content:"·";margin:0 10px;color:var(--ac)}
& .pj .tech{display:block;margin:2px 0}
& .ls.lg li{justify-content:center;gap:10px}
` });
})();
