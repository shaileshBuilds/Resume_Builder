/* Templates 1-10: business and executive layouts. Each is a different structure, not a recolour. */
(function () {
  var T = RC.templates.register;
  var SERIF = "'Libre Baskerville',Georgia,serif", MERRI = "'Merriweather',Georgia,serif", LORA = "'Lora',Georgia,serif";
  var INTER = "'Inter',system-ui,sans-serif", SRC = "'Source Sans 3','Segoe UI',sans-serif", ARIAL = "Arial,Helvetica,sans-serif", DM = "'DM Sans',system-ui,sans-serif";

  T({ id: 'executive-classic', name: 'Executive Classic', category: 'Executive', ats: 'ATS-friendly', layout: 'single',
    description: 'Centred serif header with a double rule. Traditional single column.',
    accent: '#1f3a5f', typography: { heading: SERIF, body: SERIF, size: 12.5 },
    visual: { header: 'center', h: 'rule', x: 'classic', sk: 'comma', pj: 'list', pad: [44, 54] },
    css: '& .hd-center{text-align:center;border-bottom:3px double var(--ac);padding-bottom:14px}& .nm{font-weight:400;letter-spacing:.08em;text-transform:uppercase}& .jt{color:#333;font-style:italic;font-weight:400}& .ct{justify-content:center}' });

  T({ id: 'corporate-edge', name: 'Corporate Edge', category: 'Corporate', ats: 'ATS-compatible', layout: 'sidebar-right', headIn: 'top',
    sideKeys: ['skills', 'languages', 'certifications', 'awards'], description: 'Full-width colour band header with a ruled right column for skills.',
    accent: '#0b4a8f', typography: { heading: INTER, body: INTER, size: 12.5 },
    visual: { header: 'band', h: 'bar', x: 'classic', sk: 'tags', pj: 'list', sideW: '210px' },
    css: '& .hd-band{background:var(--ac);color:#fff;margin:calc(-1*var(--pt)) calc(-1*var(--px)) 24px;padding:30px var(--px)}& .hd-band .jt{color:#cfe0f5}& .cols{grid-template-columns:1fr var(--sw)}& .side{border-left:1px solid #d6dbe1;padding-left:20px}' });

  T({ id: 'professional-prime', name: 'Professional Prime', category: 'Professional', ats: 'ATS-compatible', layout: 'sidebar-left', headIn: 'main',
    sideKeys: ['skills', 'education', 'languages', 'certifications'], description: 'Tinted left rail for facts, wide main column for the career story.',
    accent: '#2f6f5e', typography: { heading: SRC, body: SRC, size: 13 },
    visual: { header: 'left', h: 'under', x: 'classic', sk: 'grouped', pj: 'list', sideW: '230px', bleed: true, pad: [38, 34] },
    css: '& .cols{grid-template-columns:var(--sw) 1fr}& .side{background:#eef2f1}& .side .s:first-child{margin-top:0}& .hd-left{padding-bottom:6px}& .nm{font-size:34px}' });

  T({ id: 'business-elite', name: 'Business Elite', category: 'Executive', ats: 'ATS-compatible', layout: 'single',
    description: 'Split header, labels in a left gutter and dates beside each role.',
    accent: '#7a1f2b', typography: { heading: MERRI, body: SRC, size: 13 },
    visual: { header: 'split', h: 'side', x: 'dateleft', sk: 'grouped', pj: 'list' },
    css: '& .hd-split{display:grid;grid-template-columns:1fr auto;gap:20px;border-top:6px solid var(--ac);padding:16px 0 14px;border-bottom:1px solid #ccc}& .hd-split .ct{flex-direction:column;text-align:right;margin:0}& .s{border-top:1px solid #e2e2e2;padding-top:12px}' });

  T({ id: 'career-standard', name: 'Career Standard', category: 'Professional', ats: 'ATS-friendly', layout: 'single',
    description: 'Compact, no-nonsense single column with a three-column skills list.',
    accent: '#1d4e89', typography: { heading: ARIAL, body: ARIAL, size: 12 },
    visual: { header: 'left', h: 'plain', x: 'classic', sk: 'columns', pj: 'list', sp: .85, pad: [36, 44] },
    css: '& .hd-left{border-bottom:2px solid #222;padding-bottom:10px}& .nm{font-size:26px}& .jt{color:#222}' });

  T({ id: 'corporate-minimal', name: 'Corporate Minimal', category: 'Corporate', ats: 'ATS-friendly', layout: 'single',
    description: 'Quiet one-line header, lowercase labels and generous white space.',
    accent: '#0f766e', typography: { heading: INTER, body: INTER, size: 12.5 },
    visual: { header: 'mini', h: 'mini', x: 'dateleft', sk: 'comma', pj: 'inline', pad: [56, 64], sp: 1.2 },
    css: '&{font-weight:300}& .t,& .nm{font-weight:600}& .hd-mini{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 14px;padding-bottom:14px;border-bottom:1px solid #e5e7eb}& .nm{font-size:24px}& .jt{margin:0;color:#6b7280;font-weight:400}& .hd-mini .ct{width:100%;color:#6b7280}' });

  T({ id: 'executive-focus', name: 'Executive Focus', category: 'Executive', ats: 'ATS-compatible', layout: 'sidebar-right', headIn: 'main',
    sideKeys: ['education', 'skills', 'certifications', 'awards', 'languages'], labels: { summary: 'Executive profile' },
    description: 'Highlighted executive profile, gold accents and a warm right column.',
    accent: '#1b2a41', accent2: '#b08d3c', typography: { heading: MERRI, body: INTER, size: 12.5 },
    visual: { header: 'left', h: 'box', x: 'classic', sk: 'dots', pj: 'list', sideW: '230px', bleed: true, pad: [40, 38] },
    css: '& .cols{grid-template-columns:1fr var(--sw)}& .side{background:#f4f1ea}& .side .s:first-child{margin-top:0}& .nm{font-size:36px;letter-spacing:-.01em}& .jt{color:var(--a2)}& .s-summary{background:#f6f3ec;border-left:4px solid var(--a2);padding:12px 16px}& .s-summary .sh{background:none;padding:0}' });

  T({ id: 'professional-timeline', name: 'Professional Timeline', category: 'Professional', ats: 'ATS-compatible', layout: 'single',
    description: 'A vertical timeline carries experience, education and volunteering.',
    accent: '#0e7490', typography: { heading: SRC, body: SRC, size: 13 },
    visual: { header: 'left', h: 'pill', x: 'timeline', sk: 'chips', pj: 'list' },
    css: '& .hd-left{padding-left:16px;border-left:6px solid var(--ac)}& .nm{font-size:32px}' });

  T({ id: 'leadership', name: 'Leadership', category: 'Executive', ats: 'ATS-compatible', layout: 'single',
    description: 'Photo header and a three-result highlights strip before the detail.',
    accent: '#7c2d12', typography: { heading: LORA, body: INTER, size: 12.5 },
    visual: { header: 'photo', h: 'slash', x: 'bordered', sk: 'tags', pj: 'list' },
    extra: function (c) { return c.highlights(3); },
    css: '& .hd-photo{display:flex;gap:18px;align-items:center}& .nm{font-size:32px}' });

  T({ id: 'corporate-modern', name: 'Corporate Modern', category: 'Corporate', ats: 'ATS-compatible', layout: 'sidebar-right', headIn: 'top',
    sideKeys: ['skills', 'education', 'languages', 'certifications'], description: 'Gradient top bar, near-even columns and boxed side sections.',
    accent: '#0369a1', accent2: '#14b8a6', typography: { heading: DM, body: DM, size: 12.5 },
    visual: { header: 'left', h: 'plain', x: 'cards', sk: 'bars', pj: 'list', sideW: '320px' },
    css: '& .pg:before{content:"";display:block;height:6px;background:linear-gradient(90deg,var(--ac),var(--a2));margin:calc(-1*var(--pt)) calc(-1*var(--px)) 26px}& .hd-left{margin-bottom:18px}& .cols{grid-template-columns:1fr var(--sw)}& .side .s{background:#f5f7fa;border-radius:10px;padding:14px;margin-top:12px}& .side .s:first-child{margin-top:0}' });
})();
