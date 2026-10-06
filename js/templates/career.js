/* Templates 31-40: fresher and executive layouts (Part 7).
   31-36 lead with education, projects, internships, certifications, skills and awards.
   37-40 lead with an executive summary, career progression and measurable business results. */
(function () {
  var T = RC.templates.register, e = RC.model.esc;
  var SRC = "'Source Sans 3','Segoe UI',sans-serif", INTER = "'Inter',system-ui,sans-serif", DM = "'DM Sans',system-ui,sans-serif", POP = "'Poppins','Segoe UI',sans-serif";
  var MERRI = "'Merriweather',Georgia,serif", LORA = "'Lora',Georgia,serif", SERIF = "'Libre Baskerville',Georgia,serif", SPACE = "'Space Grotesk',system-ui,sans-serif";
  var FO = ['summary', 'education', 'projects', 'experience', 'certifications', 'skills', 'awards', 'languages', 'volunteer', 'publications', 'customSections'];
  var FL = { summary: 'Career Objective', experience: 'Internships & Experience', projects: 'Academic & Personal Projects', awards: 'Achievements' };
  var XO = ['summary', 'experience', 'awards', 'education', 'skills', 'certifications', 'volunteer', 'publications', 'customSections', 'projects', 'languages'];
  var XL = { summary: 'Executive Summary', experience: 'Career Progression', awards: 'Honours & Recognition', volunteer: 'Board & Community Leadership' };
  var present = function (c, ks) { return ks.filter(function (k) { return c.keys.indexOf(k) > -1; }); };

  /* ---------- fresher ---------- */
  T({ id: 'fresher-start', name: 'Fresher Start', category: 'Fresher', ats: 'ATS-compatible', layout: 'single', order: FO, labels: FL,
    description: 'Education and projects lead. Pill headings, skill chips and project cards in two columns.',
    accent: '#2563eb', accent2: '#e0ecff', typography: { heading: POP, body: DM, size: 12.5 },
    visual: { header: 'left', h: 'pill', x: 'classic', sk: 'chips', pj: 'cards', pad: [40, 46] },
    css: '& .hd-left{background:var(--a2);border-radius:14px;padding:20px 24px}& .nm{font-size:32px}& .jt{margin-top:6px}& .sh span{font-size:.9em}& .pj .t{display:block}& .pj .tech{margin:2px 0 4px;display:block}' });

  T({ id: 'graduate-pro', name: 'Graduate Pro', category: 'Fresher', ats: 'ATS-compatible', layout: 'sidebar-left', headIn: 'main', order: FO, labels: FL,
    sideKeys: ['skills', 'certifications', 'languages', 'awards'],
    description: 'Teal rail for skills, certifications and achievements; education and projects lead the main column.',
    accent: '#0f766e', typography: { heading: SRC, body: SRC, size: 13 },
    visual: { header: 'left', h: 'under', x: 'bordered', sk: 'bars', pj: 'list', sideW: '230px', bleed: true, pad: [38, 34] },
    css: '& .cols{grid-template-columns:var(--sw) 1fr}& .side{background:#0f766e;color:#fff}& .side .s:first-child{margin-top:0}& .side .sh{color:#fff;border-color:rgba(255,255,255,.4)}& .side .sh:after{background:#99f6e4}& .side .sk-b i{background:rgba(255,255,255,.28)}& .side .sk-b i:after{background:#fff}& .side .ls span{opacity:.85}& .nm{font-size:34px;color:#0f766e}& .hd-left{margin-bottom:6px}' });

  T({ id: 'student-focus', name: 'Student Focus', category: 'Fresher', ats: 'ATS-compatible', layout: 'single', order: FO, labels: FL,
    description: 'A "profile at a glance" counter row, then education, projects and internships on a timeline.',
    accent: '#7c3aed', typography: { heading: DM, body: DM, size: 12.5 },
    visual: { header: 'left', h: 'bar', x: 'timeline', sk: 'tags', pj: 'grid', pad: [40, 46] },
    extra: function (c) { return c.stats(); },
    css: '& .nm{font-size:34px}& .stats div{background:#f5f3ff;border-color:#ddd6fe}& .stats b{font-size:26px}& .it:before{background:#f5f3ff}& .pj .t{display:block}' });

  T({ id: 'internship-ready', name: 'Internship Ready', category: 'Fresher', ats: 'ATS-compatible', layout: 'sidebar-right', headIn: 'top', order: FO, labels: FL,
    sideKeys: ['education', 'skills', 'certifications', 'languages'],
    description: 'Internships and projects take the wide column; education and skills sit in a warm right panel.',
    accent: '#c2410c', typography: { heading: INTER, body: INTER, size: 12.5 },
    visual: { header: 'photo', h: 'slash', x: 'dateleft', sk: 'dots', pj: 'list', sideW: '250px', pad: [40, 44] },
    css: '& .hd-photo{display:flex;gap:18px;align-items:center;padding-bottom:16px;border-bottom:3px solid var(--ac);margin-bottom:22px}& .nm{font-size:32px}& .cols{grid-template-columns:1fr var(--sw);gap:26px}& .side{background:#fff4ec;border-radius:12px;padding:18px}& .side .s:first-child{margin-top:0}& .s-experience .it{grid-template-columns:92px 1fr}' });

  T({ id: 'campus-career', name: 'Campus Career', category: 'Fresher', ats: 'ATS-compatible', layout: 'single', order: FO, labels: FL,
    description: 'Education, skills and certifications sit side by side under the header, then projects and internships.',
    accent: '#be185d', typography: { heading: SPACE, body: DM, size: 12.5 },
    visual: { header: 'split', h: 'rule', x: 'inline', sk: 'columns', pj: 'inline', pad: [40, 44] },
    build: function (c) {
      var g = present(c, ['education', 'skills', 'certifications']), rest = c.keys.filter(function (k) { return g.indexOf(k) < 0; });
      return c.header('split') + (g.length ? '<div class="glance">' + g.map(function (k) { return '<div>' + c.sec(k) + '</div>'; }).join('') + '</div>' : '') + '<div class="main">' + rest.map(c.sec).join('') + '</div>';
    },
    css: '& .hd-split{display:grid;grid-template-columns:1fr auto;gap:20px;align-items:end;padding-bottom:14px;border-bottom:4px solid var(--ac)}& .hd-split .ct{flex-direction:column;text-align:right;margin:0}& .nm{font-size:32px}& .glance{display:flex;gap:18px;margin-top:18px;padding:14px 16px;background:#fdf2f8;border-radius:10px}& .glance>div{flex:1;min-width:0}& .glance .s{margin-top:0}& .glance .sk-col{columns:1}& .glance .sh{font-size:.8em}& .glance .it{margin-top:6px}& .glance .hd2{display:block}& .glance .d{display:block}' });

  T({ id: 'first-job', name: 'First Job', category: 'Fresher', ats: 'ATS-friendly', layout: 'single', order: FO, labels: FL,
    description: 'Friendly and open: round photo or initials, plain headings, skills as two tidy columns.',
    accent: '#16a34a', typography: { heading: POP, body: SRC, size: 13 },
    visual: { header: 'photo', h: 'plain', x: 'classic', sk: 'dots', pj: 'list', pad: [46, 52], sp: 1.1 },
    css: '& .hd-photo{display:flex;gap:20px;align-items:center;margin-bottom:6px}& .av{width:92px;height:92px}& .nm{font-size:30px}& .sh{color:var(--ac);font-size:1.05em}& .s-skills .sk-d{display:grid;grid-template-columns:1fr 1fr;column-gap:28px}& .s-skills .sk-d li{margin-top:6px}& .s-languages .ls.lg{display:grid;grid-template-columns:1fr 1fr;column-gap:28px}' });

  /* ---------- executive ---------- */
  T({ id: 'senior-executive', name: 'Senior Executive', category: 'Executive', ats: 'ATS-compatible', layout: 'single', order: XO, labels: XL,
    description: 'Centred serif header, a career-at-a-glance strip, then career progression with dates in the margin.',
    accent: '#1f2f4d', accent2: '#a8843b', typography: { heading: SERIF, body: SRC, size: 13 },
    visual: { header: 'center', h: 'rule', x: 'dateleft', sk: 'grouped', pj: 'list', pad: [46, 54] },
    extra: function (c) { return c.stats(); },
    css: '& .hd-center{text-align:center;padding-bottom:12px;border-bottom:1px solid var(--a2)}& .nm{font-size:34px;font-weight:700;letter-spacing:.02em}& .jt{color:var(--a2);letter-spacing:.14em;text-transform:uppercase;font-size:.85em}& .ct{justify-content:center}& .stats div{border-radius:0;border-width:1px 0}& .stats b{color:var(--ac)}& .sh{border-color:var(--a2)}& .s-summary .sum{font-size:1.06em}' });

  T({ id: 'executive-board', name: 'Executive Board', category: 'Executive', ats: 'ATS-compatible', layout: 'sidebar-left', headIn: 'side', order: XO, labels: XL,
    sideKeys: ['education', 'skills', 'certifications', 'languages', 'awards'],
    description: 'Dark navy rail carries the name, contacts and credentials. Wide column for summary and results.',
    accent: '#16263f', accent2: '#c9a45c', typography: { heading: MERRI, body: INTER, size: 12.5 },
    visual: { header: 'side', h: 'box', x: 'bordered', sk: 'comma', pj: 'list', sideW: '250px', bleed: true, pad: [40, 40] },
    css: '& .cols{grid-template-columns:var(--sw) 1fr}& .side{background:var(--ac);color:#e8edf5}& .side .s:first-child{margin-top:0}& .hd-side .av{display:none}& .hd-side .nm{font-size:28px;color:#fff;line-height:1.15}& .hd-side .jt{color:var(--a2)}& .hd-side .ct{display:block;margin:16px 0 22px;font-size:.88em;word-break:break-word}& .hd-side .ct li{margin-top:6px}& .hd-side .ct small{display:block;font-size:.78em;text-transform:uppercase;letter-spacing:.12em;color:var(--a2)}& .side .sh{background:none;color:var(--a2);padding:0 0 4px;border-bottom:1px solid rgba(201,164,92,.5)}& .side .c,& .side .d{opacity:.85}& .main .sh{background:none;padding:0 0 3px;border-bottom:2px solid var(--ac);color:var(--ac);font-size:.9em}& .it{border-color:var(--a2)}& .s-summary .sum{font-size:1.04em}' });

  T({ id: 'leadership-pro', name: 'Leadership Pro', category: 'Executive', ats: 'ATS-compatible', layout: 'single', order: XO, labels: XL,
    description: 'Pulls the biggest measurable results (percentages, money, multiples) into headline figures up top.',
    accent: '#b91c1c', typography: { heading: SPACE, body: INTER, size: 12.5 },
    visual: { header: 'left', h: 'under', x: 'timeline', sk: 'tags', pj: 'list', pad: [44, 50] },
    extra: function (c) {
      var re = /(\$\s?\d[\d,.]*\s?(?:[kKmMbB]|million|billion)?|\d[\d,.]*\s?(?:%|x\b|X\b|million|billion))/, out = [], seen = {};
      c.r.experience.forEach(function (x) {
        (x.achievements || []).concat(x.description ? [x.description] : []).forEach(function (t) {
          var m = re.exec(t || ''); if (!m || out.length >= 3 || seen[m[1]]) return; seen[m[1]] = 1;
          var s = t.length > 92 ? t.slice(0, 92).replace(/\s+\S*$/, '') + '…' : t; out.push([m[1].trim(), s, x.company]);
        });
      });
      if (!out.length) return c.stats();
      return '<div class="mx">' + out.map(function (o) { return '<div><b>' + e(o[0]) + '</b><p>' + e(o[1]) + '</p>' + (o[2] ? '<small>' + e(o[2]) + '</small>' : '') + '</div>'; }).join('') + '</div>';
    },
    css: '& .nm{font-size:36px;letter-spacing:-.01em}& .jt{color:#444}& .hd-left{padding-bottom:4px}& .mx{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:18px}& .mx div{background:#fef2f2;border-radius:10px;padding:12px 14px}& .mx b{display:block;font:700 28px/1 var(--hf);color:var(--ac)}& .mx p{margin-top:6px;font-size:.92em;line-height:1.35}& .mx small{display:block;margin-top:6px;opacity:.65}& .stats div{background:#fef2f2;border-color:#fecaca}' });

  T({ id: 'director-resume', name: 'Director Resume', category: 'Executive', ats: 'ATS-compatible', layout: 'single', order: XO, labels: XL,
    description: 'Full-width dark masthead, a core-competencies strip, then results; credentials close in two columns.',
    accent: '#0f2c3f', accent2: '#2a9d8f', typography: { heading: INTER, body: INTER, size: 12.5 },
    visual: { header: 'split', h: 'band', x: 'classic', sk: 'tags', pj: 'list', pad: [0, 44] },
    build: function (c) {
      var tail = present(c, ['education', 'certifications', 'languages', 'awards']), strip = present(c, ['skills']);
      var mid = c.keys.filter(function (k) { return tail.indexOf(k) < 0 && strip.indexOf(k) < 0; });
      return c.header('split') + (strip.length ? '<div class="comp">' + c.sec('skills').replace('<h2 class="sh"><span>' + c.label('skills') + '</span></h2>', '<h2 class="sh"><span>Core Competencies</span></h2>') + '</div>' : '') +
        '<div class="main">' + mid.map(c.sec).join('') + '</div>' + (tail.length ? '<div class="tail">' + tail.map(function (k) { return '<div>' + c.sec(k) + '</div>'; }).join('') + '</div>' : '');
    },
    css: '& .pg{padding-bottom:40px}& .hd-split{display:grid;grid-template-columns:1fr auto;gap:20px;align-items:end;background:var(--ac);color:#fff;margin:0 calc(-1*var(--px));padding:34px var(--px) 24px;border-bottom:5px solid var(--a2)}& .hd-split .nm{font-size:34px}& .hd-split .jt{color:#9fe3da}& .hd-split .ct{flex-direction:column;text-align:right;margin:0;font-size:.88em}& .comp{margin:0 calc(-1*var(--px));padding:14px var(--px) 16px;background:#eef6f5}& .comp .s{margin-top:0}& .comp .sh{background:none;color:var(--ac);padding:0;font-size:.82em;text-transform:uppercase;letter-spacing:.14em}& .comp .sk-ch.tags li{background:#fff;border-color:var(--a2);color:var(--ac)}& .main .sh{background:none;color:var(--ac);padding:0 0 3px;border-bottom:2px solid var(--a2);border-radius:0}& .tail{display:grid;grid-template-columns:1fr 1fr;gap:4px 28px;margin-top:6px}& .tail .sh{background:none;color:var(--ac);padding:0 0 3px;border-bottom:1px solid #ccc;border-radius:0}' });
})();
