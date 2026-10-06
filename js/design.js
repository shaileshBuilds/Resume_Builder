/* Part 13: Design controls (colours, typography, layout, style, presets).
   Everything is stored in resume.designSettings (strings; '' = use the template's own value), so it is saved with the
   resume and survives template changes. Content is never touched here. The template engine reads these keys. */
RC.design = (function () {
  var M = RC.model, e = M.esc;
  var KEYS = Object.keys(M.DESIGN_DEFAULTS), KEEP = { fontSize: 1, spacing: 1, pageSize: 1, margins: 1 };
  var F = {
    inter: "'Inter',system-ui,sans-serif", dm: "'DM Sans',system-ui,sans-serif", pop: "'Poppins',system-ui,sans-serif", src: "'Source Sans 3','Segoe UI',sans-serif", grot: "'Space Grotesk',system-ui,sans-serif",
    lora: "'Lora',Georgia,serif", merri: "'Merriweather',Georgia,serif", bask: "'Libre Baskerville',Georgia,serif", geo: "Georgia,'Times New Roman',serif", arial: 'Arial,Helvetica,sans-serif',
    dmserif: "'DM Serif Display',Georgia,serif", jos: "'Josefin Sans',system-ui,sans-serif", mono: "'Space Mono',monospace", bric: "'Bricolage Grotesque',system-ui,sans-serif"
  };
  var FONTS = [['', 'Template default'], [F.inter, 'Inter'], [F.dm, 'DM Sans'], [F.pop, 'Poppins'], [F.src, 'Source Sans'], [F.grot, 'Space Grotesk'], [F.jos, 'Josefin Sans'], [F.lora, 'Lora'], [F.merri, 'Merriweather'], [F.bask, 'Libre Baskerville'], [F.geo, 'Georgia'], [F.dmserif, 'DM Serif Display'], [F.arial, 'Arial'], [F.mono, 'Space Mono']];
  /* name, primary, secondary, text, background ('' = template default / white) */
  var PALETTES = [
    ['Navy', '#1f3a5f', '#c9a45c', '#1f2933', ''], ['Teal', '#0f766e', '#f2b84b', '#16221f', ''], ['Royal blue', '#2563eb', '#0ea5e9', '#1e293b', ''], ['Violet', '#7c3aed', '#ec4899', '#1f1b2e', ''],
    ['Rose', '#be185d', '#fb923c', '#2a1520', ''], ['Crimson', '#b91c1c', '#475569', '#1f1717', ''], ['Sunset', '#ea580c', '#f59e0b', '#2a1d12', '#fffaf5'], ['Gold', '#a16207', '#1f3a5f', '#211b0e', '#fffdf6'],
    ['Forest', '#15803d', '#65a30d', '#14231a', ''], ['Slate', '#334155', '#64748b', '#0f172a', ''], ['Charcoal', '#111827', '#6b7280', '#111827', ''], ['Ocean', '#0369a1', '#14b8a6', '#0c2230', '#f6fbfd'],
    ['Plum', '#6b21a8', '#d97706', '#220f33', '#fcf9ff'], ['Mint', '#047857', '#34d399', '#10231c', '#f6fffb'], ['Terracotta', '#c2410c', '#78716c', '#2a1810', '#fffaf7'], ['Midnight', '#0b3d91', '#f59e0b', '#e8eefc', '#0f172a'],
    ['Sand', '#92400e', '#0f766e', '#2b2118', '#fbf6ec'], ['Monochrome', '#000000', '#555555', '#111111', '']
  ];
  var PRESETS = {
    professional: { label: 'Professional', note: 'Navy, classic serif headings', pal: 0, s: { headingFont: F.lora, fontFamily: F.src, headingStyle: 'rule', dividers: 'thin', lineHeight: '1.5', headingSize: '1', photoShape: 'circle', pageBorder: '', icons: '', columns: '', sectionGap: '1' } },
    modern: { label: 'Modern', note: 'Bold colour, clean sans', pal: 2, s: { headingFont: F.grot, fontFamily: F.dm, headingStyle: 'bar', dividers: 'none', lineHeight: '1.55', headingSize: '1.1', photoShape: 'rounded', icons: 'on', columns: 'two', sectionGap: '1.1' } },
    minimal: { label: 'Minimal', note: 'Light, airy, no clutter', pal: 17, s: { headingFont: F.inter, fontFamily: F.inter, headingStyle: 'mini', dividers: 'none', lineHeight: '1.6', headingSize: '.9', letterSpacing: '0.01', photoShape: 'circle', pageBorder: '', icons: '', columns: 'single', pageMargin: '1.2', sectionGap: '1.2' } },
    creative: { label: 'Creative', note: 'Playful colour and shapes', pal: 3, s: { headingFont: F.bric, fontFamily: F.pop, headingStyle: 'pill', dividers: 'none', lineHeight: '1.55', headingSize: '1.15', photoShape: 'rounded', icons: 'on', columns: 'two', sectionGap: '1.15' } },
    ats: { label: 'ATS', note: 'Plain, single column, safe fonts', pal: 17, s: { headingFont: F.arial, fontFamily: F.arial, headingStyle: 'rule', dividers: 'thin', lineHeight: '1.4', headingSize: '1', photoShape: 'square', icons: '', pageBorder: '', columns: 'single', sectionGap: '1' } },
    executive: { label: 'Executive', note: 'Refined serif, gold accents', pal: 7, s: { headingFont: F.bask, fontFamily: F.lora, headingStyle: 'under', dividers: 'thin', lineHeight: '1.5', headingSize: '1.05', photoShape: 'circle', pageBorder: 'thin', icons: '', columns: '', pageMargin: '1.1', sectionGap: '1.1' } }
  };

  var open = { presets: 1, colors: 1, type: 1, layout: 1, style: 1 };
  document.addEventListener('toggle', function (ev) { var d = ev.target; if (d && d.dataset && d.dataset.grp) open[d.dataset.grp] = d.open ? 1 : 0; }, true);

  function resetDesign(R) { KEYS.forEach(function (k) { if (!KEEP[k]) R.designSettings[k] = ''; }); }
  function setPalette(R, i) { var p = PALETTES[i]; if (!p) return; var d = R.designSettings; d.accentColor = p[1]; d.secondaryColor = p[2]; d.textColor = p[3]; d.bgColor = p[4]; d.palette = String(i); }
  /* Apply a preset ("pre:name"), a palette ("pal:3") or a full reset ("reset"). Content is never touched. */
  function apply(R, code) {
    var a = String(code).split(':'), d = R.designSettings;
    if (a[0] === 'reset') { resetDesign(R); return; }
    if (a[0] === 'pal') { setPalette(R, +a[1]); d.preset = ''; return; }
    if (a[0] === 'pre' && PRESETS[a[1]]) {
      var p = PRESETS[a[1]]; resetDesign(R); setPalette(R, p.pal); Object.keys(p.s).forEach(function (k) { d[k] = p.s[k]; }); d.preset = a[1]; d.palette = String(p.pal);
    }
  }

  /* ---------- panel markup (uses the editor's data-ns/data-k conventions, so its handlers store the values) ---------- */
  var ico = function (n) { return '<i data-lucide="' + n + '"></i>'; };
  function seg(k, cur, opts) { return '<div class="ed-seg" role="group">' + opts.map(function (o) { return '<button type="button" data-set data-ns="ds" data-k="' + k + '" data-v="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
  function range(k, label, cur, min, max, step, dflt, fmt) {
    var v = cur === '' ? dflt : cur, id = 'dp-' + k;
    return '<div class="ed-f"><div class="dp-rl"><label for="' + id + '">' + label + '</label><output id="' + id + '-o" data-fmt="' + (fmt || '') + '">' + show(v, fmt) + (cur === '' ? ' · default' : '') + '</output></div>' +
      '<input type="range" id="' + id + '" data-ns="ds" data-k="' + k + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + e(v) + '"><button type="button" class="ed-link" data-set data-ns="ds" data-k="' + k + '" data-v="">Reset</button></div>';
  }
  function show(v, fmt) { var n = parseFloat(v); if (!isFinite(n)) return ''; return fmt === 'px' ? n + ' px' : fmt === 'em' ? n.toFixed(2) + ' em' : fmt === 'x' ? Math.round(n * 100) + '%' : String(n); }
  function sel(k, label, cur, opts) {
    var has = opts.some(function (o) { return o[0] === cur; });
    return '<div class="ed-f"><label for="dp-' + k + '">' + label + '</label><select id="dp-' + k + '" data-ns="ds" data-k="' + k + '">' + (has || !cur ? '' : '<option value="' + e(cur) + '" selected>Custom</option>') + opts.map(function (o) { return '<option value="' + e(o[0]) + '"' + (o[0] === cur ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>';
  }
  function color(k, label, cur, fallback) {
    var ok = /^#[0-9a-f]{6}$/i.test(cur) ? cur : fallback;
    return '<div class="dp-c"><label class="ed-col"><span class="ed-sr">' + label + '</span><input type="color" data-ns="ds" data-k="' + k + '" value="' + ok + '" aria-label="' + label + '"></label><span><b>' + label + '</b><small>' + (cur || 'Template default') + '</small></span>' + (cur ? '<button type="button" class="ed-link" data-set data-ns="ds" data-k="' + k + '" data-v="">Reset</button>' : '') + '</div>';
  }
  function group(id, title, icon, body) { return '<details class="dp-g" data-grp="' + id + '"' + (open[id] ? ' open' : '') + '><summary>' + ico(icon) + title + '</summary><div class="dp-b">' + body + '</div></details>'; }

  function html(R) {
    var d = R.designSettings, tpl = RC.templates && RC.templates.get(R.templateId), tAcc = tpl && /^#[0-9a-f]{6}$/i.test(tpl.accent) ? tpl.accent : '#0f766e';
    var h = '<p class="ed-hint">Design is saved with this resume. Switching templates keeps your content and these choices.</p>';
    h += group('presets', 'Style presets', 'wand-sparkles', '<div class="dp-pre">' + Object.keys(PRESETS).map(function (k) {
      var p = PRESETS[k], c = PALETTES[p.pal];
      return '<button type="button" class="dp-pc" data-dp="pre:' + k + '" aria-pressed="' + (d.preset === k) + '"><span class="dp-dots"><i style="background:' + c[1] + '"></i><i style="background:' + c[2] + '"></i></span><b>' + p.label + '</b><small>' + p.note + '</small></button>';
    }).join('') + '</div><button type="button" class="ed-link" data-dp="reset">Reset all design to template defaults</button>');
    h += group('colors', 'Colours', 'palette', '<span class="ed-l">Palettes</span><div class="dp-pal">' + PALETTES.map(function (p, i) {
      return '<button type="button" class="dp-p" data-dp="pal:' + i + '" aria-pressed="' + (d.palette === String(i)) + '" aria-label="' + p[0] + ' palette" title="' + p[0] + '"><i style="background:' + p[1] + '"></i><i style="background:' + p[2] + '"></i><i style="background:' + (p[4] || '#ffffff') + '"></i><i style="background:' + p[3] + '"></i></button>';
    }).join('') + '</div>' + color('accentColor', 'Primary', d.accentColor, tAcc) + color('secondaryColor', 'Secondary', d.secondaryColor, '#c9a45c') + color('textColor', 'Text', d.textColor, '#1f2933') + color('bgColor', 'Background', d.bgColor, '#ffffff'));
    h += group('type', 'Typography', 'type', '<div class="ed-f"><label for="dp-fontFamily">Body font</label><select id="dp-fontFamily" data-ns="ds" data-k="fontFamily">' + FONTS.map(function (f) { return '<option value="' + e(f[0]) + '"' + (d.fontFamily === f[0] ? ' selected' : '') + '>' + f[1] + '</option>'; }).join('') + '</select></div>' +
      '<div class="ed-f"><label for="dp-headingFont">Heading font</label><select id="dp-headingFont" data-ns="ds" data-k="headingFont">' + FONTS.map(function (f) { return '<option value="' + e(f[0]) + '"' + (d.headingFont === f[0] ? ' selected' : '') + '>' + f[1] + '</option>'; }).join('') + '</select></div>' +
      range('headingSize', 'Heading size', d.headingSize, .7, 1.6, .05, 1, 'x') + range('bodySize', 'Body size', d.bodySize, 9, 18, .5, 13, 'px') +
      range('lineHeight', 'Line height', d.lineHeight, 1.1, 2.2, .05, 1.5) + range('letterSpacing', 'Letter spacing', d.letterSpacing, -.05, .15, .01, 0, 'em'));
    h += group('layout', 'Layout', 'layout-panel-left', '<div class="ed-f"><span class="ed-l">Columns</span>' + seg('columns', d.columns, [['', 'Template'], ['single', 'Single'], ['two', 'Two']]) + '</div>' +
      sel('sidebarWidth', 'Sidebar width (two columns)', d.sidebarWidth, [['', 'Template default'], ['22%', 'Narrow (22%)'], ['26%', 'Slim (26%)'], ['30%', 'Medium (30%)'], ['34%', 'Wide (34%)'], ['38%', 'Extra wide (38%)']]) +
      range('pageMargin', 'Page margins', d.pageMargin, .4, 1.8, .05, 1, 'x') + range('sectionGap', 'Section spacing', d.sectionGap, .4, 2.2, .05, 1, 'x') +
      '<div class="ed-f"><span class="ed-l">Page size</span>' + seg('pageSize', d.pageSize === 'Letter' ? 'Letter' : 'A4', [['A4', 'A4'], ['Letter', 'US Letter']]) + '</div>');
    h += group('style', 'Style', 'brush', sel('headingStyle', 'Heading style', d.headingStyle, [['', 'Template default'], ['rule', 'Rule underline'], ['bar', 'Side bar'], ['band', 'Colour band'], ['pill', 'Pill'], ['under', 'Short accent line'], ['plain', 'Plain colour'], ['box', 'Grey box'], ['mini', 'Small and light'], ['slash', 'Slash']]) +
      '<div class="ed-f"><span class="ed-l">Dividers</span>' + seg('dividers', d.dividers, [['', 'Default'], ['none', 'None'], ['thin', 'Thin'], ['thick', 'Thick'], ['dashed', 'Dashed']]) + '</div>' +
      '<div class="ed-f"><span class="ed-l">Page border</span>' + seg('pageBorder', d.pageBorder, [['', 'None'], ['thin', 'Thin'], ['thick', 'Thick'], ['accent', 'Accent']]) + '</div>' +
      '<div class="ed-f"><span class="ed-l">Contact icons</span>' + seg('icons', d.icons, [['', 'Hidden'], ['on', 'Shown']]) + '</div>' +
      '<div class="ed-f"><span class="ed-l">Profile image shape</span>' + seg('photoShape', d.photoShape, [['', 'Default'], ['circle', 'Circle'], ['rounded', 'Rounded'], ['square', 'Square']]) + '</div>' +
      '<div class="ed-f"><span class="ed-l">Text size</span>' + seg('fontSize', d.fontSize, [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']]) + '</div>');
    return h;
  }

  /* live readout beside sliders */
  document.addEventListener('input', function (ev) {
    var t = ev.target; if (!t || t.type !== 'range' || !t.dataset || t.dataset.ns !== 'ds') return;
    var o = document.getElementById(t.id + '-o'); if (o) o.textContent = show(t.value, o.dataset.fmt);
  });

  return { KEYS: KEYS, PALETTES: PALETTES, PRESETS: PRESETS, FONTS: FONTS, apply: apply, html: html };
})();
