/* Templates 21-30: ATS and minimalist layouts (Part 6).
   21-25 are plain, single-column and read top to bottom in a conventional order: no photo, no icons,
   no tables, no side columns, all real text. 26-30 are minimalist but each has its own structure. */
(function () {
  var T = RC.templates.register;
  var ARIAL = "Arial,Helvetica,sans-serif", TIMES = "'Times New Roman',Times,Georgia,serif", SRC = "'Source Sans 3','Segoe UI',Arial,sans-serif";
  var INTER = "'Inter',system-ui,sans-serif", LORA = "'Lora',Georgia,serif", MONO = "'Space Mono','Courier New',monospace";
  var JOSEF = "'Josefin Sans','Segoe UI',sans-serif", DMS = "'DM Serif Display',Georgia,serif", GEO = "Georgia,'Times New Roman',serif";
  var ORDER = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'awards', 'volunteer', 'publications', 'customSections'];
  var ATSL = { summary: 'Professional Summary', experience: 'Work Experience', education: 'Education', skills: 'Skills', projects: 'Projects', certifications: 'Certifications', languages: 'Languages', awards: 'Awards', volunteer: 'Volunteer Experience', publications: 'Publications' };
  var PIPES = '& .ct{gap:0;margin-top:6px}& .ct li:not(:last-child):after{content:"|";margin:0 9px;opacity:.55}';

  /* ---------- 21-25: ATS ---------- */
  T({ id: 'ats-clean', name: 'ATS Clean', category: 'ATS', ats: 'ATS-friendly', layout: 'single', order: ORDER, labels: ATSL,
    description: 'Plain single column, black on white, standard headings. The safest choice for online application forms.',
    accent: '#111111', typography: { heading: ARIAL, body: ARIAL, size: 12 },
    visual: { header: 'left', h: 'rule', x: 'classic', sk: 'comma', pj: 'list', pad: [40, 48], sp: .95 },
    css: '& .jt{color:#111;font-weight:400}& .nm{font-size:28px}& .sh{letter-spacing:.06em}& .ach li:before{background:#111;width:4px;height:4px}& .lk{color:#111}' + PIPES });

  T({ id: 'ats-classic', name: 'ATS Classic', category: 'ATS', ats: 'ATS-friendly', layout: 'single', order: ORDER, labels: ATSL,
    description: 'Traditional Times-style document. Organisation on its own line, role beneath, dates on the right.',
    accent: '#000000', typography: { heading: TIMES, body: TIMES, size: 13 },
    visual: { header: 'left', h: 'plain', x: 'classic', sk: 'grouped', pj: 'list', pad: [46, 56] },
    css: '& .nm{font-size:30px;text-transform:uppercase;letter-spacing:.04em;font-weight:700}& .jt{color:#000;font-weight:400;font-style:italic}& .sh{color:#000;font-weight:700;text-transform:uppercase;font-size:1em;border-bottom:1.5px solid #000}& .tc{display:block}& .tc .t{display:block}& .tc .c{display:block;font-style:italic;opacity:1}& .tc .c:before{content:""}& .ach li:before{background:#000}& .lk{color:#000}' + PIPES });

  T({ id: 'ats-professional', name: 'ATS Professional', category: 'ATS', ats: 'ATS-friendly', layout: 'single', order: ORDER, labels: ATSL,
    description: 'Shaded heading bars and a single dark accent. Still one column, still plain text.',
    accent: '#1f3a5f', typography: { heading: SRC, body: SRC, size: 13 },
    visual: { header: 'left', h: 'box', x: 'classic', sk: 'grouped', pj: 'list', pad: [40, 48] },
    css: '& .hd-left{border-bottom:3px solid var(--ac);padding-bottom:10px}& .nm{font-size:32px;color:var(--ac)}& .jt{color:#222}& .sh{background:#e9edf2;color:#111;border-left:4px solid var(--ac);font-size:.9em}& .tc .c:before{content:", "}& .ach li:before{background:#222}' + PIPES });

  T({ id: 'ats-simple', name: 'ATS Simple', category: 'ATS', ats: 'ATS-friendly', layout: 'single', order: ORDER, labels: ATSL,
    description: 'No lines at all. Bold headings, generous spacing, role, company and dates on one line.',
    accent: '#222222', typography: { heading: SRC, body: SRC, size: 13 },
    visual: { header: 'left', h: 'plain', x: 'inline', sk: 'comma', pj: 'list', pad: [48, 60], sp: 1.1 },
    css: '& .nm{font-size:26px}& .jt{color:#333;font-weight:400}& .sh{color:#111;border:0;font-size:1.12em;padding:0}& .ach li:before{background:#222}& .lk{color:#222}& .d{margin-left:auto}' + PIPES });

  T({ id: 'ats-compact', name: 'ATS Compact', category: 'ATS', ats: 'ATS-friendly', layout: 'single', order: ORDER, labels: ATSL,
    description: 'Tight spacing and small type to fit long careers on fewer pages. Name and title share a line.',
    accent: '#111111', typography: { heading: SRC, body: SRC, size: 11.5 },
    visual: { header: 'left', h: 'rule', x: 'inline', sk: 'grouped', pj: 'inline', pad: [28, 38], sp: .7 },
    css: '& .hd-left{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 14px}& .hd-left .ct{width:100%}& .nm{font-size:24px}& .jt{margin:0;color:#333}& .sh{font-size:.82em;letter-spacing:.1em}& .it{margin-top:calc(6px*var(--sp))}& .ach li{margin-top:1px}& .ach li:before{background:#111;width:4px;height:4px}& .lk{display:inline;margin-left:6px;color:#111}& .tech{margin-left:6px}& .pj .t:after{content:"."}' + PIPES });

  /* ---------- 26-30: minimalist ---------- */
  T({ id: 'minimal-one', name: 'Minimal One', category: 'Minimal', ats: 'ATS-friendly', layout: 'single', order: ORDER,
    description: 'Centred, airy and quiet. Short hairlines divide sections; dates sit beneath each role.',
    accent: '#444444', typography: { heading: INTER, body: INTER, size: 12.5 },
    visual: { header: 'center', h: 'mini', x: 'classic', sk: 'comma', pj: 'list', pad: [62, 110], sp: 1.25 },
    css: '&{font-weight:300}& .t,& .nm{font-weight:600}& .hd-center{text-align:center}& .nm{font-size:32px;font-weight:300;letter-spacing:.14em;text-transform:uppercase}& .jt{color:#777;font-weight:300;letter-spacing:.08em}& .ct{justify-content:center;color:#666;font-size:.85em}& .s{text-align:left}& .sh{text-align:center;font-weight:500;letter-spacing:.22em;text-transform:uppercase;opacity:.55}& .sh:after{content:"";display:block;width:28px;height:1px;background:#999;margin:8px auto 0}& .hd2{flex-direction:column;gap:2px}& .d{color:#888}& .ach li:before{background:#999;width:3px;height:3px}' });

  T({ id: 'minimal-two', name: 'Minimal Two', category: 'Minimal', ats: 'ATS-compatible', layout: 'sidebar-left', headIn: 'side', order: ORDER,
    sideKeys: ['skills', 'languages', 'certifications'],
    description: 'A narrow facts column split from the career story by a single vertical hairline.',
    accent: '#2b2b2b', typography: { heading: INTER, body: INTER, size: 12 },
    visual: { header: 'side', h: 'mini', x: 'classic', sk: 'columns', pj: 'list', sideW: '190px', pad: [48, 44], sp: 1.05 },
    css: '& .cols{grid-template-columns:var(--sw) 1fr;gap:0}& .side{padding-right:24px;border-right:1px solid #ddd}& .main{padding-left:28px}& .side .s:first-child{margin-top:0}& .hd-side .av{display:none}& .hd-side .nm{font-size:24px;line-height:1.15}& .hd-side .jt{color:#666;font-weight:400}& .hd-side .ct{display:block;margin:14px 0 22px;font-size:.85em;color:#555;word-break:break-word}& .hd-side .ct li{margin-top:5px}& .hd-side .ct small{display:block;font-size:.8em;text-transform:uppercase;letter-spacing:.1em;opacity:.55}& .sk-col{columns:1}& .sk-col li:before{content:"–"}& .ls.lg li{display:block}' });

  T({ id: 'minimal-executive', name: 'Minimal Executive', category: 'Minimal', ats: 'ATS-compatible', layout: 'single', order: ORDER,
    labels: { summary: 'Profile' },
    description: 'Oversized serif name, a short bold rule and a large lead paragraph in place of a summary box.',
    accent: '#8a1c1c', typography: { heading: LORA, body: INTER, size: 12.5 },
    visual: { header: 'left', h: 'plain', x: 'inline', sk: 'comma', pj: 'list', pad: [52, 58] },
    css: '& .hd-left{padding-bottom:18px}& .hd-left:before{content:"";display:block;width:56px;height:5px;background:var(--ac);margin-bottom:18px}& .nm{font-size:46px;font-weight:600;letter-spacing:-.02em;line-height:1}& .jt{margin-top:8px;font-size:1.1em;color:#555;font-weight:400}& .ct{color:#555;margin-top:12px}& .s-summary .sum{font:italic 400 1.28em/1.45 var(--hf);color:#222}& .s-summary .sh{display:none}& .sh{border:0;color:var(--ac);font-size:.78em;text-transform:uppercase;letter-spacing:.2em;font-family:var(--bf);font-weight:700}& .s{border-top:1px solid #ddd;padding-top:14px}& .s-summary{border:0;padding:0}& .d{margin-left:auto}' });

  T({ id: 'clean-mono', name: 'Clean Mono', category: 'Minimal', ats: 'ATS-compatible', layout: 'single', order: ORDER,
    description: 'Monospaced, terminal-flavoured. Hash headings, bracketed dates and dashed rules.',
    accent: '#0f766e', typography: { heading: MONO, body: MONO, size: 11.5 },
    visual: { header: 'left', h: 'plain', x: 'classic', sk: 'tags', pj: 'list', pad: [44, 50], sp: 1 },
    css: '& .nm{font-size:24px;font-weight:700}& .nm:before{content:"> ";color:var(--ac)}& .jt{color:#444;font-weight:400}& .jt:before{content:"# ";color:var(--ac)}& .hd-left{border-bottom:1px dashed #999;padding-bottom:12px}& .ct{font-size:.9em;gap:2px 18px}& .sh{color:#111;border:0;font-size:1em;text-transform:lowercase}& .sh:before{content:"## ";color:var(--ac)}& .d:before{content:"["}& .d:after{content:"]"}& .d{opacity:1;color:#555}& .it{border-left:1px dashed #aaa;padding-left:12px}& .sk-ch.tags li{border:1px solid #999;border-radius:0;font-size:.95em}& .ach li:before{border-radius:0;width:5px;height:2px;top:.8em}& .tc .c:before{content:" @ "}& .lk{color:var(--ac)}' });

  T({ id: 'elegant-minimal', name: 'Elegant Minimal', category: 'Minimal', ats: 'ATS-compatible', layout: 'single', order: ORDER,
    description: 'Large stacked name in a display serif, italic headings that trail into a fine line.',
    accent: '#9a7b4f', typography: { heading: DMS, body: JOSEF, size: 12.5 },
    visual: { header: 'words', h: 'plain', x: 'bordered', sk: 'comma', pj: 'list', pad: [54, 64], sp: 1.1 },
    css: '&{font-weight:300}& .t{font-weight:600}& .hd-words{padding-bottom:20px;border-bottom:1px solid #ddd}& .hd-words .nm{font:400 46px/1.02 var(--hf)}& .hd-words .nm span{display:block}& .jt{margin-top:12px;font:300 1em var(--bf);text-transform:uppercase;letter-spacing:.3em;color:var(--ac)}& .ct{margin-top:16px;gap:2px 22px;color:#555}& .ct small{margin-right:6px;font-size:.78em;text-transform:uppercase;letter-spacing:.12em;color:var(--ac)}& .sh{display:flex;align-items:center;gap:14px;font:italic 400 1.3em var(--hf);color:var(--ac);border:0;padding:0}& .sh:after{content:"";flex:1;height:1px;background:#ddd}& .it{border-left:1px solid #ddd;padding-left:14px}& .ach li:before{background:var(--ac);width:4px;height:4px}' });
})();
