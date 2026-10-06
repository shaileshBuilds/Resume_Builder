/* Templates 41-50: technical and academic layouts (Part 8).
   41-45 foreground technical skills, GitHub / portfolio links, projects with technologies and certifications.
   46-50 foreground education, publications, research, awards, teaching and conference talks.
   Research, teaching and conferences use the existing "custom sections" feature, so they render in every template. */
(function () {
  var T = RC.templates.register, U = RC.templates.util, e = RC.model.esc;
  var SPACE = "'Space Grotesk',system-ui,sans-serif", INTER = "'Inter',system-ui,sans-serif", DM = "'DM Sans',system-ui,sans-serif", SRC = "'Source Sans 3','Segoe UI',sans-serif";
  var MONO = "'Space Mono','Courier New',monospace", SERIF = "'Libre Baskerville',Georgia,serif", TIMES = "'Times New Roman',Times,Georgia,serif", MERRI = "'Merriweather',Georgia,serif", LORA = "'Lora',Georgia,serif";
  var present = function (c, ks) { return ks.filter(function (k) { return c.keys.indexOf(k) > -1; }); };
  var TO = ['summary', 'skills', 'projects', 'experience', 'education', 'certifications', 'awards', 'languages', 'volunteer', 'publications', 'customSections'];
  var TL = { skills: 'Technical Skills', projects: 'Projects & Technologies', summary: 'Profile' };
  var EO = ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'awards', 'languages', 'volunteer', 'publications', 'customSections'];
  var AO = ['summary', 'education', 'experience', 'publications', 'customSections', 'awards', 'projects', 'volunteer', 'certifications', 'skills', 'languages'];
  var AL = { summary: 'Research Interests', experience: 'Academic & Professional Appointments', projects: 'Research Projects', volunteer: 'Teaching & Service', skills: 'Technical & Research Skills' };

  /* header with labelled contacts, so GitHub / Web / LinkedIn are named, not just listed */
  function head(c, cls) {
    var pi = c.r.personalInfo;
    return '<header class="hd ' + cls + '"><h1 class="nm">' + e(pi.fullName || 'Your Name') + '</h1>' + (pi.jobTitle ? '<div class="jt">' + e(pi.jobTitle) + '</div>' : '') + U.ct(pi, true) + '</header>';
  }
  function count(c, k, label) { var n = (c.r[k] || []).length; return n ? [n, label] : null; }
  function scholarStats(c) {
    var s = [count(c, 'publications', 'publications'), count(c, 'awards', 'awards & grants'), count(c, 'experience', 'appointments'), count(c, 'projects', 'research projects')].filter(Boolean);
    return s.length ? '<div class="stats">' + s.map(function (x) { return '<div><b>' + x[0] + '</b><small>' + x[1] + '</small></div>'; }).join('') + '</div>' : '';
  }

  /* ---------- technical ---------- */
  T({ id: 'developer-pro', name: 'Developer Pro', category: 'Technical', ats: 'ATS-compatible', layout: 'single', order: TO, labels: TL,
    description: 'Dark masthead with named GitHub and portfolio links; grouped technical skills and project cards come first.',
    accent: '#6366f1', typography: { heading: SPACE, body: INTER, size: 12.5 },
    visual: { header: 'side', h: 'slash', x: 'bordered', sk: 'grouped', pj: 'cards', pad: [0, 44] },
    build: function (c) { return head(c, 'hd-dev') + '<div class="main">' + c.keys.map(c.sec).join('') + '</div>'; },
    css: '& .pg{padding-bottom:40px}& .hd-dev{background:#0f172a;color:#e2e8f0;margin:0 calc(-1*var(--px));padding:32px var(--px) 24px;border-bottom:4px solid var(--ac)}& .hd-dev .nm{font-size:34px;color:#fff}& .hd-dev .jt{color:#a5b4fc}& .hd-dev .ct{display:grid;grid-template-columns:repeat(3,1fr);gap:8px 18px;margin-top:16px;font-size:.88em}& .hd-dev .ct small{display:block;font:700 .72em var(--hf);text-transform:uppercase;letter-spacing:.14em;color:#818cf8}& .hd-dev .ct span{word-break:break-all}& .main{margin-top:6px}& .tech{font-family:' + MONO + ';font-size:.82em;color:var(--ac);opacity:1;display:block;margin:2px 0}& .pj .t{display:block}& .sk-g b{display:inline-block;min-width:96px;color:var(--ac)}' });

  T({ id: 'software-engineer', name: 'Software Engineer', category: 'Technical', ats: 'ATS-compatible', layout: 'sidebar-right', headIn: 'top', order: EO, labels: TL,
    sideKeys: ['skills', 'certifications', 'education', 'languages'],
    description: 'Experience and projects in the wide column; a ruled skills-and-credentials rail on the right.',
    accent: '#0369a1', typography: { heading: INTER, body: INTER, size: 12.5 },
    visual: { header: 'left', h: 'bar', x: 'inline', sk: 'grouped', pj: 'list', sideW: '230px', pad: [40, 44] },
    css: '& .hd-left{padding-bottom:12px;border-bottom:2px solid var(--ac);margin-bottom:22px}& .nm{font-size:30px}& .ct{gap:0}& .ct li:not(:last-child):after{content:"|";margin:0 9px;opacity:.4}& .cols{grid-template-columns:1fr var(--sw);gap:26px}& .side{border-left:1px solid #d9dee5;padding-left:20px}& .side .s:first-child{margin-top:0}& .side .sk-g{display:block;margin-top:8px}& .side .sk-g b{display:block;font-size:.85em;color:var(--ac);text-transform:uppercase;letter-spacing:.06em}& .tech{font-family:' + MONO + ';font-size:.8em;color:var(--ac);opacity:1}& .pj .t{display:block}' });

  T({ id: 'it-specialist', name: 'IT Specialist', category: 'Technical', ats: 'ATS-compatible', layout: 'single', order: TO, labels: { skills: 'Technical Proficiency', summary: 'Profile', certifications: 'Certifications & Licences' },
    description: 'A shaded proficiency panel and a certification grid sit right after the header, then dated experience.',
    accent: '#0f766e', typography: { heading: SRC, body: SRC, size: 13 },
    visual: { header: 'left', h: 'band', x: 'dateleft', sk: 'grouped', pj: 'list', pad: [40, 46] },
    build: function (c) {
      var top = present(c, ['skills', 'certifications']), rest = c.keys.filter(function (k) { return top.indexOf(k) < 0; });
      var sum = present(c, ['summary']), rest2 = rest.filter(function (k) { return sum.indexOf(k) < 0; });
      return head(c, 'hd-it') + sum.map(c.sec).join('') + (top.length ? '<div class="prof">' + top.map(function (k) { return '<div class="pf pf-' + k + '">' + c.sec(k) + '</div>'; }).join('') + '</div>' : '') + '<div class="main">' + rest2.map(c.sec).join('') + '</div>';
    },
    css: '& .hd-it{border-bottom:3px solid var(--ac);padding-bottom:10px}& .nm{font-size:32px;color:var(--ac)}& .hd-it .ct{gap:2px 20px;font-size:.88em}& .hd-it .ct small{margin-right:5px;font-weight:700;color:var(--ac)}& .prof{display:grid;grid-template-columns:1.25fr 1fr;gap:16px;margin-top:18px;padding:14px 16px;background:#ecf6f5;border-radius:8px}& .prof:has(.pf:only-child){grid-template-columns:1fr}& .prof .s{margin-top:0}& .prof .sh{background:none;color:var(--ac);padding:0;border-bottom:1px solid #b6d9d5;border-radius:0}& .sk-g b{color:var(--ac)}' });

  T({ id: 'data-professional', name: 'Data Professional', category: 'Technical', ats: 'ATS-compatible', layout: 'single', order: EO, labels: TL,
    description: 'Key-impact strip, then a bar-chart skills panel beside certifications and education, then the full record.',
    accent: '#0284c7', accent2: '#14b8a6', typography: { heading: DM, body: DM, size: 12.5 },
    visual: { header: 'split', h: 'plain', x: 'cards', sk: 'bars', pj: 'grid', pad: [40, 44] },
    build: function (c) {
      var duo = present(c, ['skills', 'certifications', 'education']), rest = c.keys.filter(function (k) { return duo.indexOf(k) < 0; });
      var left = present(c, ['skills']), right = present(c, ['certifications', 'education']);
      return c.header('split') + c.highlights(3) + (duo.length ? '<div class="duo"><div>' + left.map(c.sec).join('') + '</div>' + (right.length ? '<div>' + right.map(c.sec).join('') + '</div>' : '') + '</div>' : '') + '<div class="main">' + rest.map(c.sec).join('') + '</div>';
    },
    css: '& .hd-split{display:grid;grid-template-columns:1fr auto;gap:20px;align-items:end;padding-bottom:12px;border-bottom:3px solid var(--ac)}& .hd-split .ct{flex-direction:column;text-align:right;margin:0;font-size:.88em}& .nm{font-size:32px}& .hl p{font-size:.95em}& .hl div{border-top-color:var(--a2)}& .duo{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:18px;padding:14px 16px;background:#f0f9ff;border-radius:10px}& .duo>div:only-child{grid-column:1/-1}& .duo .s{margin-top:0}& .duo .s+.s{margin-top:14px}& .duo .sh{color:var(--ac);border-bottom:1px solid #bae6fd;padding-bottom:2px}& .sk-b i:after{background:linear-gradient(90deg,var(--ac),var(--a2))}& .tech{display:block;color:var(--ac);opacity:1}& .pj .t{display:block}' });

  T({ id: 'tech-minimal', name: 'Tech Minimal', category: 'Technical', ats: 'ATS-friendly', layout: 'single', order: TO, labels: TL,
    description: 'Quiet and monochrome. Monospaced slash labels, dates in the margin, plain-text skill lists and inline projects.',
    accent: '#334155', typography: { heading: MONO, body: INTER, size: 12.5 },
    visual: { header: 'left', h: 'plain', x: 'dateleft', sk: 'grouped', pj: 'inline', pad: [58, 66], sp: 1.15 },
    css: '&{font-weight:400}& .nm{font:600 28px var(--bf);letter-spacing:-.01em}& .jt{color:#64748b;font:400 .95em var(--hf)}& .ct{font:400 .8em var(--hf);color:#64748b;margin-top:12px;gap:2px 18px}& .sh{font:400 .82em var(--hf);color:#64748b;text-transform:lowercase;border:0;padding:0}& .sh:before{content:"// ";color:#94a3b8}& .d{font-family:var(--hf);font-size:.78em;color:#64748b;opacity:1}& .tech{font-family:var(--hf);font-size:.78em;color:#64748b;opacity:1}& .sk-g b{font:400 .85em var(--hf);color:#64748b;margin-right:10px}& .lk{color:#64748b;font-family:var(--hf)}& .ach li:before{background:#94a3b8;width:4px;height:4px}' });

  /* ---------- academic ---------- */
  T({ id: 'research-scholar', name: 'Research Scholar', category: 'Academic', ats: 'ATS-friendly', layout: 'single', order: AO, labels: AL,
    description: 'Centred serif CV with ruled headings, dates in the margin and numbered publications.',
    accent: '#7f1d1d', typography: { heading: SERIF, body: SERIF, size: 12.5 },
    visual: { header: 'center', h: 'rule', x: 'dateleft', sk: 'comma', pj: 'list', pad: [48, 56] },
    css: '& .hd-center{text-align:center;padding-bottom:12px}& .nm{font-size:30px;font-weight:700;letter-spacing:.04em}& .jt{color:#444;font-style:italic;font-weight:400}& .ct{justify-content:center}& .sh{border-color:var(--ac);color:var(--ac)}& .s-publications .ls{counter-reset:pub}& .s-publications .ls li{counter-increment:pub;padding-left:30px;position:relative}& .s-publications .ls li:before{content:"[" counter(pub) "]";position:absolute;left:0;color:var(--ac);font-weight:700}' });

  T({ id: 'academic-classic', name: 'Academic Classic', category: 'Academic', ats: 'ATS-friendly', layout: 'single', order: AO, labels: AL,
    description: 'Times-style monochrome CV. Section titles sit in a left gutter; publications use hanging indents.',
    accent: '#000000', typography: { heading: TIMES, body: TIMES, size: 13 },
    visual: { header: 'left', h: 'side', x: 'classic', sk: 'comma', pj: 'list', pad: [46, 52] },
    css: '& .hd-left{padding-bottom:10px;border-bottom:1.5px solid #000;margin-bottom:6px}& .nm{font-size:28px;text-transform:uppercase;letter-spacing:.06em}& .jt{color:#000;font-style:italic;font-weight:400}& .ct{margin-top:6px}& .sh{color:#000;font-weight:700;font-size:.95em;text-transform:uppercase;letter-spacing:.05em}& .s{margin-top:calc(14px*var(--sp))}& .ach li:before{background:#000}& .s-publications .ls li{padding-left:22px;text-indent:-22px;margin-left:22px;margin-top:6px}& .s-publications .ls li *{text-indent:0}& .s-publications .ls li b{font-weight:400;font-style:italic}& .lk{color:#000}' });

  T({ id: 'research-modern', name: 'Research Modern', category: 'Academic', ats: 'ATS-compatible', layout: 'sidebar-left', headIn: 'side', order: AO, labels: AL,
    sideKeys: ['education', 'awards', 'skills', 'languages', 'certifications'],
    description: 'Lavender rail for name, contacts and credentials; wide column leads with interests and publications.',
    accent: '#6d28d9', typography: { heading: DM, body: DM, size: 12.5 },
    visual: { header: 'side', h: 'under', x: 'bordered', sk: 'comma', pj: 'list', sideW: '240px', bleed: true, pad: [40, 34] },
    css: '& .cols{grid-template-columns:var(--sw) 1fr}& .side{background:#f5f3ff;border-right:1px solid #ddd6fe}& .side .s:first-child{margin-top:0}& .hd-side .av{display:none}& .hd-side .nm{font-size:26px;color:var(--ac);line-height:1.15}& .hd-side .jt{color:#444}& .hd-side .ct{display:block;margin:14px 0 20px;font-size:.88em;word-break:break-word}& .hd-side .ct li{margin-top:5px}& .hd-side .ct small{display:block;font-size:.76em;text-transform:uppercase;letter-spacing:.12em;color:var(--ac)}& .s-publications .ls{counter-reset:pub}& .s-publications .ls li{counter-increment:pub;padding-left:30px;position:relative}& .s-publications .ls li:before{content:counter(pub);position:absolute;left:0;top:0;width:20px;height:20px;border-radius:50%;background:var(--ac);color:#fff;font:700 .78em/20px var(--hf);text-align:center}' });

  T({ id: 'university-cv', name: 'University CV', category: 'Academic', ats: 'ATS-compatible', layout: 'single', order: AO, labels: AL,
    description: 'Formal faculty-application CV: boxed headings, dated appointments and a two-column awards list.',
    accent: '#14532d', typography: { heading: SRC, body: SRC, size: 13 },
    visual: { header: 'left', h: 'box', x: 'dateleft', sk: 'grouped', pj: 'list', pad: [44, 50] },
    css: '& .hd-left{border-top:7px solid var(--ac);padding-top:14px;padding-bottom:12px;border-bottom:1px solid #bbb}& .nm{font-size:30px;font-variant:small-caps;letter-spacing:.06em;color:var(--ac)}& .jt{color:#333;font-weight:400}& .sh{background:#eef3ee;border-left:4px solid var(--ac);color:#111}& .s-awards .ls{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px}& .s-awards .ls li{margin-top:0}& .s-publications .ls li{margin-top:6px;padding-left:16px;position:relative}& .s-publications .ls li:before{content:"–";position:absolute;left:0;color:var(--ac)}' });

  T({ id: 'academic-executive', name: 'Academic Executive', category: 'Academic', ats: 'ATS-compatible', layout: 'sidebar-right', headIn: 'top', order: AO, labels: AL,
    sideKeys: ['education', 'awards', 'skills', 'languages', 'certifications'],
    description: 'For senior faculty: a scholarly-record counter strip, publications in the main column, honours on the right.',
    accent: '#1e3a5f', accent2: '#b08d3c', typography: { heading: MERRI, body: INTER, size: 12.5 },
    visual: { header: 'left', h: 'plain', x: 'inline', sk: 'comma', pj: 'list', sideW: '236px', pad: [42, 46] },
    extra: scholarStats,
    css: '& .hd-left{border-left:6px solid var(--a2);padding-left:16px}& .nm{font-size:34px;color:var(--ac)}& .jt{color:#555;font-weight:400}& .stats div{border-radius:0;border-color:var(--a2);background:#faf7ef}& .stats b{color:var(--ac)}& .cols{grid-template-columns:1fr var(--sw);margin-top:6px}& .side{background:#f3f5f8;padding:16px 18px;border-top:4px solid var(--ac)}& .side .s:first-child{margin-top:0}& .sh{color:var(--ac);border-bottom:1px solid var(--a2);padding-bottom:3px;font-size:1.02em}& .s-publications .ls{counter-reset:pub}& .s-publications .ls li{counter-increment:pub;padding-left:26px;position:relative}& .s-publications .ls li:before{content:counter(pub) ".";position:absolute;left:0;color:var(--a2);font-weight:700}' });
})();
