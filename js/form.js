/* Part 10: Resume Information Form. Replaces the Resume Builder placeholder (loaded after pages.js).
   Every field reads and writes one central resume object (RC.model shape) and auto-saves through RC.store.
   Route: #/resume-builder?id=<resume id>. Without an id it shows a resume picker. */
(function () {
  var U = RC.ui, S = RC.store, M = RC.model, e = M.esc;
  var LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  var PROF = ['Basic', 'Conversational', 'Professional', 'Fluent', 'Native'];
  var RE = {
    mail: /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/,
    phone: /^\+?[\d][\d\s().-]{6,19}$/,
    url: /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d{1,5})?([\/?#]\S*)?$/i,
    date: /^(\d{4})(?:-(0[1-9]|1[0-2]))?$/
  };
  var N = new Date(), NOWIDX = N.getFullYear() * 12 + N.getMonth();

  /* ---------- field + section configuration ---------- */
  var C = {}; /* kind -> config */
  var F = {}; /* "kind.field" -> field definition (used for validation) */
  function def(kind, cfg) { C[kind] = cfg; (cfg.f || []).forEach(function (d) { F[kind + '.' + d.k] = d; }); }
  F.name = { l: 'Resume name', req: 1, max: 80 };
  F.vis = { t: 'check', l: 'Show photo on resume' };
  F.summary = { t: 'textarea', l: 'Professional summary', max: 600, rows: 6, ph: 'e.g. Frontend developer with 7 years of experience building fast, accessible web apps. Led small teams, mentored juniors, and cares about performance and clear interfaces.' };
  var rng = function (i) { var a = i.startDate, b = i.current ? 'Present' : i.endDate; return a || b ? (a || '') + ' – ' + (b || '') : ''; };
  var join = function (a) { return a.filter(Boolean).join(' · '); };
  var D = function (k, l, o) { o = o || {}; o.k = k; o.l = l; o.t = 'date'; o.half = 1; o.ph = o.ph || 'YYYY-MM  (e.g. 2022-04)'; return o; };

  var PERSONAL = [
    { k: 'fullName', l: 'Full name', req: 1, max: 60, half: 1, ph: 'e.g. Shailesh Chauhan', ac: 'name' },
    { k: 'jobTitle', l: 'Job title', max: 80, half: 1, ph: 'e.g. Senior Frontend Developer', ac: 'organization-title' },
    { k: 'email', l: 'Email', req: 1, t: 'email', max: 100, half: 1, ph: 'name@example.com', ac: 'email' },
    { k: 'phone', l: 'Phone', t: 'tel', max: 20, half: 1, ph: '+91 98765 43210', ac: 'tel' },
    { k: 'location', l: 'Location', max: 80, half: 1, ph: 'City, State or Country', ac: 'address-level2' },
    { k: 'website', l: 'Website', t: 'url', max: 120, half: 1, ph: 'yourname.com' },
    { k: 'linkedin', l: 'LinkedIn', t: 'url', max: 120, half: 1, ph: 'linkedin.com/in/your-name' },
    { k: 'github', l: 'GitHub', t: 'url', max: 120, half: 1, ph: 'github.com/your-name' }
  ];
  def('personalInfo', { f: PERSONAL });

  def('experience', { t: 'Work Experience', ic: 'briefcase', add: 'Add experience', title: function (i) { return i.position || i.company; }, sub: function (i) { return join([i.position && i.company, rng(i)]); }, f: [
    { k: 'position', l: 'Job title', req: 1, max: 80, half: 1, ph: 'e.g. Senior Frontend Developer' },
    { k: 'company', l: 'Company', req: 1, max: 80, half: 1, ph: 'e.g. Northwind Retail Tech' },
    { k: 'location', l: 'Location', max: 80, half: 1, ph: 'City, or Remote' },
    { k: 'current', l: 'I currently work here', t: 'check', half: 1 },
    D('startDate', 'Start date', { req: 1 }), D('endDate', 'End date', { after: 'startDate', ph: 'YYYY-MM, or leave blank if current' }),
    { k: 'description', l: 'Role overview', t: 'textarea', rows: 3, max: 400, ph: 'One or two sentences on what you owned and who you worked with.' },
    { k: 'achievements', l: 'Key achievements', t: 'lines', hint: 'One bullet per line, up to 8.', ph: 'Start with a verb and add a number, e.g.\nCut page load time from 3.8s to 1.9s by lazy loading images\nLed a 5-person squad that rebuilt checkout' }
  ] });
  def('education', { t: 'Education', ic: 'graduation-cap', add: 'Add education', title: function (i) { return i.institution || i.degree; }, sub: function (i) { return join([i.degree && (i.degree + (i.field ? ', ' + i.field : '')), rng(i)]); }, f: [
    { k: 'institution', l: 'School or university', req: 1, max: 100, ph: 'e.g. Savitribai Phule Pune University' },
    { k: 'degree', l: 'Degree', max: 80, half: 1, ph: 'e.g. B.Tech' }, { k: 'field', l: 'Field of study', max: 80, half: 1, ph: 'e.g. Computer Engineering' },
    D('startDate', 'Start', { fut: 1, ph: 'YYYY (e.g. 2014)' }), D('endDate', 'End (or expected)', { fut: 1, after: 'startDate', ph: 'YYYY (e.g. 2018)' }),
    { k: 'description', l: 'Details', t: 'textarea', rows: 2, max: 300, ph: 'Grades, honors, relevant coursework or final-year project.' }
  ] });
  def('skills', { t: 'Skills', ic: 'sparkles', add: 'Add skill', cmp: 1, f: [
    { k: 'name', l: 'Skill', req: 1, max: 40, ph: 'e.g. React' },
    { k: 'level', l: 'Level', t: 'select', opts: LEVELS }, { k: 'category', l: 'Group', max: 40, ph: 'e.g. Frameworks' }
  ] });
  def('projects', { t: 'Projects', ic: 'folder-git-2', add: 'Add project', title: function (i) { return i.name; }, sub: function (i) { return join([i.technologies.slice(0, 3).join(', ')]); }, f: [
    { k: 'name', l: 'Project name', req: 1, max: 80, half: 1, ph: 'e.g. Pattern Shelf' },
    { k: 'link', l: 'Link', t: 'url', max: 150, half: 1, ph: 'github.com/you/project' },
    { k: 'technologies', l: 'Technologies', t: 'tags', max: 200, ph: 'React, TypeScript, Storybook', hint: 'Separate with commas.' },
    { k: 'description', l: 'Description', t: 'textarea', rows: 3, max: 300, ph: 'What it does, who it is for, and what you built.' }
  ] });
  def('certifications', { t: 'Certifications', ic: 'badge-check', add: 'Add certification', title: function (i) { return i.name; }, sub: function (i) { return join([i.issuer, i.date]); }, f: [
    { k: 'name', l: 'Certification', req: 1, max: 100, half: 1, ph: 'e.g. Web Accessibility Specialist' },
    { k: 'issuer', l: 'Issuer', max: 80, half: 1, ph: 'e.g. International Accessibility Board' },
    D('date', 'Date earned', { ph: 'YYYY-MM' }), { k: 'credentialUrl', l: 'Credential link', t: 'url', max: 150, half: 1, ph: 'example.com/verify/1042' }
  ] });
  def('languages', { t: 'Languages', ic: 'languages', add: 'Add language', cmp: 1, f: [
    { k: 'name', l: 'Language', req: 1, max: 40, ph: 'e.g. Hindi' }, { k: 'proficiency', l: 'Proficiency', t: 'select', opts: PROF }
  ] });
  def('awards', { t: 'Achievements', ic: 'trophy', add: 'Add achievement', title: function (i) { return i.title; }, sub: function (i) { return join([i.issuer, i.date]); }, f: [
    { k: 'title', l: 'Achievement or award', req: 1, max: 100, half: 1, ph: 'e.g. Engineering Excellence Award' },
    { k: 'issuer', l: 'Awarded by', max: 80, half: 1, ph: 'e.g. Northwind Retail Tech' },
    D('date', 'Date', { ph: 'YYYY or YYYY-MM' }),
    { k: 'description', l: 'Details', t: 'textarea', rows: 2, max: 250, ph: 'Why you received it, in one sentence.' }
  ] });
  def('volunteer', { t: 'Volunteer Experience', ic: 'heart-handshake', add: 'Add volunteer role', title: function (i) { return i.role || i.organization; }, sub: function (i) { return join([i.role && i.organization, rng(i)]); }, f: [
    { k: 'organization', l: 'Organization', req: 1, max: 80, half: 1, ph: 'e.g. CodeBridge Pune' }, { k: 'role', l: 'Role', max: 80, half: 1, ph: 'e.g. Weekend Mentor' },
    D('startDate', 'Start date'), D('endDate', 'End date', { after: 'startDate', ph: 'Leave blank if ongoing' }),
    { k: 'description', l: 'Description', t: 'textarea', rows: 3, max: 300, ph: 'What you do and the difference it makes.' }
  ] });
  def('publications', { t: 'Publications', ic: 'book-open', add: 'Add publication', title: function (i) { return i.title; }, sub: function (i) { return join([i.publisher, i.date]); }, f: [
    { k: 'title', l: 'Title', req: 1, max: 150, ph: 'e.g. Making Forms Work for Everyone' },
    { k: 'publisher', l: 'Publisher or journal', max: 100, half: 1, ph: 'e.g. Frontend Weekly' }, D('date', 'Published', { ph: 'YYYY-MM' }),
    { k: 'url', l: 'Link', t: 'url', max: 150, ph: 'example.com/my-article' },
    { k: 'description', l: 'Summary', t: 'textarea', rows: 2, max: 250, ph: 'One sentence on what the piece covers.' }
  ] });
  def('customItems', { t: 'Entry', add: 'Add entry', title: function (i) { return i.heading; }, sub: function (i) { return join([i.subheading, i.date]); }, f: [
    { k: 'heading', l: 'Heading', req: 1, max: 100, half: 1, ph: 'e.g. Performance on a Budget' }, { k: 'subheading', l: 'Subheading', max: 100, half: 1, ph: 'e.g. Pune Web Meetup' },
    D('date', 'Date', { ph: 'YYYY or YYYY-MM' }), { k: 'description', l: 'Description', t: 'textarea', rows: 2, max: 300, ph: 'A short note about this entry.' }
  ] });
  def('customSections', { t: 'Custom Section', ic: 'layout-list', add: 'Add custom section', title: function (i) { return i.title; }, sub: function (i) { return i.items.length + (i.items.length === 1 ? ' entry' : ' entries'); }, f: [
    { k: 'title', l: 'Section title', req: 1, max: 40, ph: 'e.g. Talks, Hobbies, References' }
  ] });
  var NAV = { summary: ['Professional Summary', 'align-left'], personal: ['Personal Information', 'user'] };
  var TITLE = function (k) { return NAV[k] ? NAV[k][0] : C[k].t; };
  var ICON = function (k) { return NAV[k] ? NAV[k][1] : C[k].ic; };

  /* ---------- helpers ---------- */
  var ico = function (n, fb) { return '<i data-lucide="' + n + '" aria-hidden="true">' + (fb || '') + '</i>'; };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  function getPath(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function setPath(o, p, v) { var a = p.split('.'), l = a.pop(), t = getPath(o, a.join('.')) || o; if (!a.length) t = o; t[l] = v; }
  function parentOf(R, p) { var a = p.split('.'); a.pop(); return a.length ? getPath(R, a.join('.')) : R; }
  function pd(s, end) { var m = RE.date.exec(s); return m ? +m[1] * 12 + (m[2] ? +m[2] - 1 : end ? 11 : 0) : null; }
  function reid(o) { if (Array.isArray(o)) o.forEach(reid); else if (o && typeof o === 'object') { if (o.id) o.id = M.uid(); Object.keys(o).forEach(function (k) { if (o[k] && typeof o[k] === 'object') reid(o[k]); }); } return o; }
  function mk(kind, src) {
    var o = src ? clone(src) : {};
    if (kind === 'customItems') return M.normalize({ customSections: [{ items: [o] }] }).customSections[0].items[0];
    if (kind === 'customSections') return M.normalize({ customSections: [o] }).customSections[0];
    var w = {}; w[kind] = [o]; return M.normalize(w)[kind][0];
  }
  function sampleSrc(kind) {
    var x = RC.sample.experienced;
    return kind === 'customItems' ? x.customSections[0].items[0] : kind === 'customSections' ? x.customSections[0] : x[kind][0];
  }

  /* ---------- validation: returns an error message, or '' when fine ---------- */
  function check(d, v, it) {
    if (d.t === 'check') return '';
    if (d.t === 'lines') {
      if (!v.length) return d.req ? d.l + ' is required.' : '';
      if (v.length > 8) return 'Keep it to 8 bullets or fewer (you have ' + v.length + ').';
      for (var i = 0; i < v.length; i++) if (v[i].length > 200) return 'Bullet ' + (i + 1) + ' is too long (' + v[i].length + ' of 200 characters).';
      return '';
    }
    var s = d.t === 'tags' ? v.join(', ') : String(v == null ? '' : v).trim();
    if (!s) return d.req ? d.l + ' is required.' : '';
    if (d.max && s.length > d.max) return 'Too long: ' + s.length + ' of ' + d.max + ' characters.';
    if (d.t === 'email' && !RE.mail.test(s)) return 'Enter a valid email, like name@example.com.';
    if (d.t === 'tel' && !RE.phone.test(s)) return 'Enter a valid phone number, like +91 98765 43210.';
    if (d.t === 'url' && !RE.url.test(s)) return 'Enter a valid web address, like example.com/profile.';
    if (d.t === 'date') {
      var p = pd(s); if (p === null) return 'Use YYYY or YYYY-MM, like 2022-04.';
      if (p < 1950 * 12) return 'That year looks too early. Check the date.';
      if (!d.fut && p > NOWIDX) return 'This date is in the future.';
      if (d.fut && p > NOWIDX + 12 * 10) return 'That date is too far ahead.';
      if (d.after && it && it[d.after] && RE.date.test(it[d.after]) && pd(s, true) < pd(it[d.after])) return 'End date must be on or after the start date.';
    }
    return '';
  }

  /* ---------- rendering ---------- */
  function field(d, path, val, it, fkey) {
    var id = 'f-' + path.replace(/\./g, '-'), dis = d.k === 'endDate' && it && it.current;
    var meta = ' id="' + id + '" data-path="' + e(path) + '" data-f="' + fkey + '" aria-describedby="' + id + '-e"' + (d.ph && d.t !== 'select' && d.t !== 'check' ? ' placeholder="' + e(d.ph) + '"' : '') + (dis ? ' disabled' : '') + (d.req ? ' aria-required="true"' : '');
    var cls = 'fld' + (d.half ? ' fm-half' : ''), h;
    if (d.t === 'check') return '<div class="' + cls + ' fm-chk"><label class="fm-ck"><input type="checkbox"' + meta + (val ? ' checked' : '') + '><span>' + e(d.l) + '</span></label></div>';
    h = '<div class="' + cls + '"><div class="fm-lh"><label for="' + id + '">' + e(d.l) + (d.req ? ' <b class="fm-req" title="Required">*</b>' : '') + '</label>' + (d.max || d.t === 'lines' ? '<span class="fm-cnt" data-for="' + id + '"></span>' : '') + '</div>';
    if (d.t === 'textarea' || d.t === 'lines') h += '<textarea rows="' + (d.rows || 4) + '"' + meta + '>' + e(d.t === 'lines' ? val.join('\n') : val) + '</textarea>';
    else if (d.t === 'select') {
      var o = d.opts.indexOf(val) < 0 && val ? d.opts.concat(val) : d.opts;
      h += '<select' + meta + '><option value="">Select…</option>' + o.map(function (x) { return '<option' + (x === val ? ' selected' : '') + '>' + e(x) + '</option>'; }).join('') + '</select>';
    } else {
      var im = { email: 'email', tel: 'tel', url: 'url' }[d.t] || (d.t === 'date' ? 'numeric' : 'text');
      h += '<input type="text" inputmode="' + im + '" autocomplete="' + (d.ac || 'off') + '" spellcheck="' + (d.t ? 'false' : 'true') + '"' + meta + ' value="' + e(d.t === 'tags' ? val.join(', ') : val) + '">';
    }
    return h + (d.hint ? '<small class="fm-hint">' + e(d.hint) + '</small>' : '') + '<small class="err" id="' + id + '-e" role="alert"></small></div>';
  }
  function fields(kind, base, it) {
    return '<div class="fm-g">' + C[kind].f.map(function (d) { return field(d, base + '.' + d.k, it[d.k], it, kind + '.' + d.k); }).join('') + '</div>';
  }
  function btn(act, icon, fb, label, a, extra) { return '<button type="button" class="fm-ib' + (extra || '') + '" data-act="' + act + '" aria-label="' + label + '" title="' + label + '"' + (a || '') + '>' + ico(icon, fb) + '</button>'; }
  function actions(kind, list, i, n, it) {
    var a = ' data-list="' + list + '" data-i="' + i + '" data-kind="' + kind + '"';
    return '<div class="fm-ia">' + (RC.dnd.supported ? '<span class="fm-ib fm-dh" draggable="true" title="Drag to reorder" aria-hidden="true"' + a + '>' + ico('grip-vertical', '⋮') + '</span>' : '') + btn('up', 'arrow-up', '↑', 'Move up', a + (i === 0 ? ' disabled' : '')) + btn('dn', 'arrow-down', '↓', 'Move down', a + (i === n - 1 ? ' disabled' : '')) +
      btn('dup', 'copy', '⧉', 'Duplicate', a) + btn('hid', it.hidden ? 'eye' : 'eye-off', it.hidden ? '👁' : '⊘', it.hidden ? 'Show on resume' : 'Hide from resume', a) + btn('del', 'trash-2', '✕', 'Delete', a, ' fm-del') + '</div>';
  }
  function itemHtml(kind, list, i, arr) {
    var c = C[kind], it = arr[i], base = list + '.' + i, open = !!st.open[it.id];
    if (c.cmp) return '<div class="fm-i fm-cmp' + (it.hidden ? ' off' : '') + '" data-id="' + e(it.id) + '" data-kind="' + kind + '">' + fields(kind, base, it) + actions(kind, list, i, arr.length, it) + '</div>';
    var inner = fields(kind, base, it) + (kind === 'customSections' ? '<div class="fm-nest"><h4>Entries in this section</h4>' + listHtml('customItems', base + '.items', it.items) + '</div>' : '');
    return '<div class="fm-i' + (open ? ' open' : '') + (it.hidden ? ' off' : '') + '" data-id="' + e(it.id) + '" data-kind="' + kind + '"><div class="fm-ih">' +
      '<button type="button" class="fm-it" data-act="itog" aria-expanded="' + open + '"><span class="fm-chev">' + ico('chevron-right', '›') + '</span><span class="fm-tt"><b class="ttl"></b><small class="sub"></small></span>' + (it.hidden ? '<span class="fm-badge">Hidden</span>' : '') + '</button>' +
      actions(kind, list, i, arr.length, it) + '</div><div class="fm-ibody">' + inner + '</div></div>';
  }
  function listHtml(kind, list, arr) {
    var c = C[kind], a = ' data-list="' + list + '" data-kind="' + kind + '"';
    var h = arr.map(function (_, i) { return itemHtml(kind, list, i, arr); }).join('');
    if (!arr.length) h = '<div class="fm-empty"><p>' + (kind === 'customItems' ? 'No entries yet.' : 'Nothing here yet.') + '</p></div>';
    return '<div class="fm-list">' + h + '</div><div class="fm-add"><button type="button" class="btn btn-o btn-sm" data-act="add"' + a + '>' + ico('plus', '+') + c.add + '</button>' +
      (arr.length ? '' : '<button type="button" class="btn btn-g btn-sm" data-act="addex"' + a + '>' + ico('wand-sparkles', '✦') + 'Add an example</button>') + '</div>';
  }
  function photoHtml(R) {
    var p = R.personalInfo.profilePhoto, nm = R.personalInfo.fullName;
    var ini = nm ? nm.trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join('') : '';
    return '<div class="fm-photo"><div class="fm-av">' + (p ? '<img alt="Profile photo preview" src="' + e(p) + '">' : (ini || ico('user', '?'))) + '</div><div class="fm-pbody"><b>Profile photo</b><small>Optional. Any image; it is cropped to a square and shrunk to fit.</small>' +
      '<div class="fm-row"><button type="button" class="btn btn-o btn-sm" data-act="phup">' + (p ? 'Replace' : 'Upload') + '</button>' + (p ? '<button type="button" class="btn btn-g btn-sm" data-act="phrm">Remove</button>' : '') + '</div>' +
      field(F.vis, 'visibilitySettings.profilePhoto', R.visibilitySettings.profilePhoto, null, 'vis') + '</div><input type="file" id="fm-file" accept="image/*" hidden></div>';
  }
  function sectionHtml(k, R, idx, total) {
    var off = k !== 'personal' && R.visibilitySettings[k] === false, body, count = '';
    if (k === 'personal') body = photoHtml(R) + fields('personalInfo', 'personalInfo', R.personalInfo);
    else if (k === 'summary') body = field(F.summary, 'summary', R.summary, null, 'summary') + '<div class="fm-add">' + (R.summary ? '' : '<button type="button" class="btn btn-g btn-sm" data-act="exsum">' + ico('wand-sparkles', '✦') + 'Add an example</button>') + '<small class="fm-hint">Aim for 2–4 sentences, around 300–500 characters.</small></div>';
    else { body = listHtml(k, k, R[k]); count = R[k].length; }
    var tools = k === 'personal' ? '' : '<div class="fm-ia">' + (RC.dnd.supported ? '<span class="fm-ib fm-dh" draggable="true" data-secdrag="' + k + '" title="Drag to reorder section" aria-hidden="true">' + ico('grip-vertical', '⋮') + '</span>' : '') + btn('sup', 'arrow-up', '↑', 'Move section up', ' data-sec="' + k + '"' + (idx === 0 ? ' disabled' : '')) + btn('sdn', 'arrow-down', '↓', 'Move section down', ' data-sec="' + k + '"' + (idx === total - 1 ? ' disabled' : '')) +
      btn('svis', off ? 'eye' : 'eye-off', off ? '👁' : '⊘', off ? 'Show section on resume' : 'Hide section from resume', ' data-sec="' + k + '"') + '</div>';
    var open = !!st.secOpen[k];
    return '<article class="fm-s' + (open ? ' open' : '') + (off ? ' off' : '') + '" id="sec-' + k + '" data-sec="' + k + '"><header class="fm-sh"><button type="button" class="fm-st" data-act="stog" aria-expanded="' + open + '" aria-controls="sb-' + k + '">' +
      '<span class="fm-si">' + ico(ICON(k), '') + '</span><span class="fm-sn">' + TITLE(k) + '</span>' + (count !== '' ? '<em class="fm-n">' + count + '</em>' : '') + (off ? '<span class="fm-badge">Hidden</span>' : '') + '<span class="fm-chev">' + ico('chevron-down', '⌄') + '</span></button>' + tools + '</header><div class="fm-sbody" id="sb-' + k + '">' + body + '</div></article>';
  }
  function order(R) { return ['personal'].concat(RC.state.order(R)); }

  /* ---------- page state ---------- */
  var st = { R: null, root: null, open: {}, secOpen: { personal: 1, summary: 1, experience: 1 }, showAll: false, timer: null, status: ['', ''], issues: 0 };
  var cur = null;

  function draw(o) {
    o = o || {}; var R = st.R, y = window.scrollY, ord = order(R), pct = strength(R), sc = st.embed ? st.root.closest('.ed-pb') : null, sy = sc ? sc.scrollTop : 0;
    var navHtml = ord.map(function (k) {
      var off = k !== 'personal' && R.visibilitySettings[k] === false;
      return '<button type="button" class="fm-nv' + (off ? ' off' : '') + '" data-act="nav" data-sec="' + k + '">' + ico(ICON(k), '') + '<span>' + TITLE(k) + '</span><i class="fm-dot" aria-hidden="true"></i></button>';
    }).join('');
    st.root.innerHTML = st.embed ? '<div class="fm-emb">' + ord.map(function (k, i) { return sectionHtml(k, R, i - 1, ord.length - 1); }).join('') + '</div>' :
      '<div class="fm-bar"><div class="wrap fm-barin"><a class="btn btn-g btn-sm" href="#/dashboard">' + ico('arrow-left', '←') + 'Dashboard</a>' +
      '<div class="fm-nm"><label class="fm-sr" for="f-name">Resume name</label><input id="f-name" type="text" data-path="name" data-f="name" value="' + e(R.name) + '" placeholder="Resume name" aria-describedby="f-name-e"><small class="err" id="f-name-e"></small></div>' +
      '<div class="fm-pg" title="How complete your resume is"><div class="fm-bar2"><span style="width:' + pct + '%"></span></div><small>' + pct + '% complete</small></div>' +
      '<span class="fm-hist" role="group" aria-label="History"><button type="button" class="btn btn-o btn-sm" data-act="undo" aria-label="Undo" title="Undo (Ctrl+Z)"' + (RC.state.canUndo() ? '' : ' disabled') + '>' + ico('undo-2', '↶') + '</button><button type="button" class="btn btn-o btn-sm" data-act="redo" aria-label="Redo" title="Redo (Ctrl+Y)"' + (RC.state.canRedo() ? '' : ' disabled') + '>' + ico('redo-2', '↷') + '</button><button type="button" class="btn btn-o btn-sm" data-act="save" title="Save now (Ctrl+S)">' + ico('save', '') + 'Save</button></span>' +
      '<span class="fm-save" role="status" aria-live="polite"></span>' +
      '<button type="button" class="btn btn-o btn-sm fm-rev" data-act="review"></button>' +
      '<button type="button" class="btn btn-o btn-sm" data-act="sample">' + ico('wand-sparkles', '✦') + 'Sample data</button>' +
      '<a class="btn btn-o btn-sm" href="#/editor?id=' + encodeURIComponent(R.id) + '">' + ico('layout-template', '') + 'Visual editor</a>' + '<button type="button" class="btn btn-p btn-sm" data-act="preview">' + ico('eye', '') + 'Preview</button></div></div>' +
      '<div class="wrap fm-lay"><nav class="fm-nav" aria-label="Resume sections">' + navHtml + '</nav><div class="fm-main">' +
      ord.map(function (k, i) { return sectionHtml(k, R, i - 1, ord.length - 1); }).join('') +
      '<p class="fm-foot">' + ico('shield-check', '') + 'Changes save automatically in this browser. Hidden items stay in your resume data but are not shown on the resume.</p></div></div>';
    st.root.querySelectorAll('.fm-i:not(.fm-cmp)').forEach(function (b) { heads(b); });
    st.root.querySelectorAll('[data-path]').forEach(counter);
    U.icons(); refresh(); showStatus();
    if (!st.embed) window.scrollTo(0, y); else if (sc) sc.scrollTop = sy;
    if (o.reveal) { var t = st.root.querySelector(o.reveal); if (t) t.scrollIntoView({ block: 'nearest' }); }
    if (o.focus) { var f = st.root.querySelector(o.focus); if (f) { f.focus({ preventScroll: false }); } }
  }
  function strength(R) {
    var p = R.personalInfo, c = [p.fullName, p.jobTitle, p.email, p.phone, p.location, R.summary, R.experience.length, R.education.length, R.skills.length];
    return Math.round(c.filter(Boolean).length / c.length * 100);
  }
  function heads(box) {
    var c = C[box.dataset.kind], it = itemOf(box); if (!it) return;
    var t = (c.title(it) || '').trim(), s = (c.sub(it) || '').trim(), tt = box.querySelector('.ttl'), ss = box.querySelector('.sub');
    if (!tt) return; tt.textContent = t || 'Untitled'; tt.classList.toggle('mute', !t); ss.textContent = s; ss.hidden = !s;
  }
  function itemOf(box) {
    var list = box.closest('[data-list]'); /* find by id across the central object */
    var found = null, id = box.dataset.id;
    (function walk(o) { if (found || !o || typeof o !== 'object') return; if (o.id === id && !Array.isArray(o)) { found = o; return; } Object.keys(o).forEach(function (k) { walk(o[k]); }); })(st.R);
    return found;
  }
  function counter(el) {
    var d = F[el.dataset.f], c = d && st.root.querySelector('.fm-cnt[data-for="' + el.id + '"]'); if (!c) return;
    var n, m;
    if (d.t === 'lines') { n = el.value.split('\n').filter(function (x) { return x.trim(); }).length; m = 8; c.textContent = n + ' of ' + m + ' bullets'; }
    else { n = el.value.length; m = d.max; c.textContent = n + ' / ' + m; }
    c.className = 'fm-cnt' + (n > m ? ' over' : n >= m * .9 ? ' warn' : '');
  }
  /* Revalidate everything from the central object; show messages for touched fields (or all, after "Review"). */
  function refresh() {
    var R = st.R, issues = 0, per = {};
    st.root.querySelectorAll('[data-path]').forEach(function (el) {
      var d = F[el.dataset.f]; if (!d || d.t === 'check') return;
      var msg = el.disabled ? '' : check(d, getPath(R, el.dataset.path), parentOf(R, el.dataset.path)), show = msg && (el.dataset.t || st.showAll), er = document.getElementById(el.id + '-e');
      if (er) er.textContent = show ? msg : '';
      el.setAttribute('aria-invalid', show ? 'true' : 'false');
      if (msg) issues++;
      if (show) { var s = el.closest('[data-sec]'); if (s) per[s.dataset.sec] = 1; }
    });
    st.issues = issues;
    st.root.querySelectorAll('.fm-nv').forEach(function (b) { b.classList.toggle('bad', !!per[b.dataset.sec]); });
    st.root.querySelectorAll('.fm-s').forEach(function (s) { s.classList.toggle('bad', !!per[s.dataset.sec]); });
    var r = st.root.querySelector('.fm-rev');
    if (r) { r.innerHTML = issues ? ico('circle-alert', '!') + issues + (issues === 1 ? ' thing to fix' : ' things to fix') : ico('circle-check', '✓') + 'No issues'; r.classList.toggle('warn', !!issues); U.icons(); }
  }
  function showStatus() { var s = st.root && st.root.querySelector('.fm-save'); if (s) { s.textContent = st.status[0]; s.className = 'fm-save ' + st.status[1]; } }
  function setStatus(t, c) { st.status = [t, c || '']; showStatus(); }

  /* ---------- saving ---------- */
  function flush() { RC.state.flush(); }
  function schedule() { RC.state.change('form'); }
  var unsub = null;
  function bindState() {
    if (unsub) unsub();
    unsub = RC.state.subscribe(function (ev) {
      if (!st || !st.root || !document.body.contains(st.root)) return;
      if (ev.type === 'saving') setStatus('Saving…');
      else if (ev.type === 'saved') setStatus(ev.persisted ? 'Saved' : 'Saved for this session only', ev.persisted ? 'ok' : 'warn');
      else if (ev.type === 'error') { setStatus('Save failed', 'bad'); var sv = st.root.querySelector('.fm-save'); if (sv) sv.title = (ev.message || 'Could not save.') + ' We will keep trying, or press Save.'; }
      else if (ev.type === 'history') { var u = st.root.querySelector('[data-act=undo]'), r2 = st.root.querySelector('[data-act=redo]'); if (u) u.disabled = !RC.state.canUndo(); if (r2) r2.disabled = !RC.state.canRedo(); }
      else if (ev.type === 'change' && ev.source === 'history' && !st.embed) { st.R = RC.state.get() || st.R; draw(); }
    });
  }
  addEventListener('hashchange', function () { flush(); });
  addEventListener('beforeunload', function () { flush(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) flush(); });

  /* ---------- events ---------- */
  function readEl(el) {
    if (el.type === 'checkbox') return el.checked;
    var d = F[el.dataset.f] || {};
    if (d.t === 'lines') return el.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    if (d.t === 'tags') return el.value.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    return el.value.trim();
  }
  function onInput(ev) {
    var el = ev.target; if (!el.dataset || !el.dataset.path) return;
    var p = el.dataset.path; setPath(st.R, p, readEl(el)); counter(el);
    if (el.dataset.f.slice(-8) === '.current') {
      var end = st.root.querySelector('[data-path="' + p.replace(/current$/, 'endDate') + '"]');
      if (end) { end.disabled = el.checked; if (el.checked) { end.value = ''; setPath(st.R, end.dataset.path, ''); } }
    }
    var box = el.closest('.fm-i:not(.fm-cmp)'); if (box) heads(box);
    if (p === 'personalInfo.fullName') { var av = st.root.querySelector('.fm-av'); if (av && !av.querySelector('img')) { var w = el.value.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(function (x) { return x[0].toUpperCase(); }).join(''); if (w) av.textContent = w; } }
    refresh(); schedule();
  }
  function onBlur(ev) { var el = ev.target; if (el.dataset && el.dataset.path) { el.dataset.t = '1'; refresh(); } }

  function listOf(b) { return getPath(st.R, b.dataset.list); }
  function swap(arr, i, j) { var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
  function after(o) { RC.state.change('form', true); draw(o); }      /* add / delete / reorder: its own undo step */
  function addItem(b, example) {
    var kind = b.dataset.kind, arr = listOf(b), it = mk(kind, example ? sampleSrc(kind) : null);
    if (example) reid(it);
    arr.push(it); st.open[it.id] = true; st.secOpen[b.closest('[data-sec]').dataset.sec] = 1;
    if (kind === 'customSections' && !example) it.items.length = 0;
    after({ focus: '[data-path="' + b.dataset.list + '.' + (arr.length - 1) + '.' + C[kind].f[0].k + '"]', reveal: '[data-id="' + it.id + '"]' });
  }
  function act(b) {
    var a = b.dataset.act, R = st.R, arr, i, k;
    switch (a) {
      case 'stog': var s = b.closest('.fm-s'), on = !s.classList.contains('open'); s.classList.toggle('open', on); b.setAttribute('aria-expanded', on); st.secOpen[s.dataset.sec] = on ? 1 : 0; break;
      case 'itog': var bx = b.closest('.fm-i'), o2 = !bx.classList.contains('open'); bx.classList.toggle('open', o2); b.setAttribute('aria-expanded', o2); st.open[bx.dataset.id] = o2; break;
      case 'nav': st.secOpen[b.dataset.sec] = 1; var sc = st.root.querySelector('#sec-' + b.dataset.sec); sc.classList.add('open'); sc.querySelector('.fm-st').setAttribute('aria-expanded', true); sc.scrollIntoView({ behavior: 'smooth', block: 'start' }); break;
      case 'add': addItem(b, false); break;
      case 'addex': addItem(b, true); break;
      case 'exsum': R.summary = RC.sample.experienced.summary; st.secOpen.summary = 1; after({ focus: '#f-summary' }); break;
      case 'up': case 'dn': arr = listOf(b); i = +b.dataset.i; k = a === 'up' ? i - 1 : i + 1; if (k < 0 || k >= arr.length) break; swap(arr, i, k); after({ reveal: '[data-id="' + arr[k].id + '"]' }); break;
      case 'dup': arr = listOf(b); i = +b.dataset.i; var cp = reid(clone(arr[i])); if (b.dataset.kind === 'customSections') cp.title = (cp.title + ' (copy)').trim(); arr.splice(i + 1, 0, cp); st.open[cp.id] = true; after({ reveal: '[data-id="' + cp.id + '"]' }); U.toast('Duplicated.', 'ok'); break;
      case 'hid': arr = listOf(b); i = +b.dataset.i; arr[i].hidden = !arr[i].hidden; after({ reveal: '[data-id="' + arr[i].id + '"]' }); U.toast(arr[i].hidden ? 'Hidden from your resume.' : 'Shown on your resume.'); break;
      case 'del': arr = listOf(b); i = +b.dataset.i; var it = arr[i], nm = (C[b.dataset.kind].title && C[b.dataset.kind].title(it)) || 'this item';
        U.confirm({ title: 'Delete this entry?', text: '“' + e(nm) + '” will be removed from your resume. This cannot be undone.', ok: 'Delete', danger: true }).then(function (y) { if (!y) return; var j = arr.indexOf(it); if (j > -1) arr.splice(j, 1); after(); U.toast('Deleted.', 'ok'); }); break;
      case 'sup': case 'sdn': var od = RC.state.order(R), p = od.indexOf(b.dataset.sec), q = a === 'sup' ? p - 1 : p + 1; if (q < 0 || q >= od.length) break; swap(od, p, q); R.sectionOrder = od; after({ reveal: '#sec-' + b.dataset.sec }); break;
      case 'svis': R.visibilitySettings[b.dataset.sec] = R.visibilitySettings[b.dataset.sec] === false; after({ reveal: '#sec-' + b.dataset.sec }); U.toast(R.visibilitySettings[b.dataset.sec] ? 'Section shown on your resume.' : 'Section hidden from your resume.'); break;
      case 'phup': st.root.querySelector('#fm-file').click(); break;
      case 'phrm': R.personalInfo.profilePhoto = ''; after(); break;
      case 'undo': RC.state.undo(); break;
      case 'redo': RC.state.redo(); break;
      case 'save': RC.state.saveToast(RC.state.manualSave()); break;
      case 'review': st.showAll = true; refresh(); var bad = [].filter.call(st.root.querySelectorAll('.err'), function (x) { return x.textContent; })[0];
        if (!bad) { U.toast('Everything looks good.', 'ok'); break; }
        var f = bad.parentNode.querySelector('[data-path]'), par = f; while ((par = par.parentNode.closest && par.parentNode.closest('.fm-s, .fm-i'))) { par.classList.add('open'); if (par.dataset.id) st.open[par.dataset.id] = true; else st.secOpen[par.dataset.sec] = 1; }
        f.scrollIntoView({ block: 'center', behavior: 'smooth' }); f.focus({ preventScroll: true }); break;
      case 'preview': if (!RC.templates) { U.toast('Preview is not available.'); break; } flush();
        var d = U.modal({ title: 'Preview', wide: true, body: '<div class="fm-prev">' + RC.templates.preview(R, R.templateId) + '</div>', actions: [{ label: 'Close', kind: 'btn-p' }] }); RC.templates.fit(d); break;
      case 'sample': U.modal({
        title: 'Fill with sample data', body: '<p>This replaces the content in this resume with made-up example details so you can see how everything fits. Your template and design choices stay the same.</p>',
        actions: [{ label: 'Cancel', value: 'no' }, { label: RC.sample.fresher.label, value: 'fresher' }, { label: RC.sample.experienced.label, kind: 'btn-p', value: 'experienced' }],
        onClose: function (v) { if (!RC.sample[v]) return; var s2 = M.normalize(clone(RC.sample[v])); ['personalInfo', 'summary', 'customSections'].concat(Object.keys(M.ITEMS)).forEach(function (x) { R[x] = s2[x]; }); st.open = {}; after(); U.toast('Sample data added.', 'ok'); } }); break;
    }
  }
  /* ---------- drag and drop (mouse devices) ---------- */
  function dropItem(from, to, below) {
    var fh = from.querySelector('.fm-dh'), th = to.querySelector('.fm-dh'); if (!fh || !th || fh.dataset.list !== th.dataset.list) return;
    var arr = getPath(st.R, fh.dataset.list), it = arr[+fh.dataset.i], tg = arr[+th.dataset.i]; if (!it || !tg || it === tg) return;
    arr.splice(arr.indexOf(it), 1); arr.splice(arr.indexOf(tg) + (below ? 1 : 0), 0, it);
    after({ reveal: '[data-id="' + it.id + '"]' });
  }
  function dropSection(from, to, below) {
    if (RC.state.reorder(from.dataset.sec, to.dataset.sec, below, st.R)) after({ reveal: '#sec-' + from.dataset.sec });
  }
  function bind(root) {
    root.addEventListener('input', onInput);
    root.addEventListener('focusout', onBlur);
    root.addEventListener('focusin', function (ev) { if (st.onFocus) st.onFocus(ev.target); });
    root.addEventListener('click', function (ev) { var b = ev.target.closest('[data-act]'); if (b && !b.disabled) act(b); });
    root.addEventListener('change', function (ev) { if (ev.target.id === 'fm-file') { photo(ev.target.files[0]); ev.target.value = ''; } });
    root.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' && ev.target.tagName === 'INPUT' && ev.target.type === 'text') ev.preventDefault(); });
    RC.dnd.bind(root, { item: '.fm-i', handle: '.fm-dh:not([data-secdrag])', group: function (it) { var h = it.querySelector('.fm-dh'); return h ? h.dataset.list : ''; }, onDrop: dropItem, cls: 'fm-drag-i' });
    RC.dnd.bind(root, { item: '.fm-s', handle: '[data-secdrag]', group: function (x) { return x.dataset.sec === 'personal' ? 'p' : 's'; }, onDrop: dropSection, cls: 'fm-drag-s' });
  }

  function photo(file) {
    if (!file) return;
    if (!/^image\//.test(file.type)) { U.toast('Please choose an image file.'); return; }
    if (file.size > 8e6) { U.toast('That image is over 8 MB. Choose a smaller one.'); return; }
    var fr = new FileReader();
    fr.onerror = function () { U.toast('Could not read that image.'); };
    fr.onload = function () {
      var im = new Image();
      im.onerror = function () { U.toast('That image could not be opened.'); };
      im.onload = function () {
        var c = document.createElement('canvas'), n = 240, s = Math.min(im.width, im.height); c.width = c.height = n;
        c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, n, n);
        st.R.personalInfo.profilePhoto = c.toDataURL('image/jpeg', .85); after();
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  /* ---------- pages ---------- */
  function idFromHash() { var m = /[?&]id=([^&]+)/.exec(location.hash); try { return m ? decodeURIComponent(m[1]) : ''; } catch (x) { return ''; } }
  var go = function (id) { location.hash = '#/resume-builder?id=' + encodeURIComponent(id); };
  function picker(el, note) {
    var rs = S.list();
    el.innerHTML = U.pageHeader('Resume Builder', 'Choose a resume to edit, or start a new one.') + '<div class="wrap pg">' + (note ? '<p class="banner">' + note + '</p>' : '') +
      '<div class="cta-row" style="margin-bottom:28px">' + U.button('New blank resume', { icon: 'plus', attrs: 'data-a="new"' }) + U.button('Start from sample', { kind: 'btn-o', icon: 'wand-sparkles', attrs: 'data-a="sample"' }) + '</div>' +
      (rs.length ? '<div class="grid g3">' + rs.map(function (r) {
        return '<article class="rcard"><h3>' + e(r.name) + '</h3><p>' + e(r.personalInfo.jobTitle || 'No job title yet') + '</p><div class="rc-act"><button class="btn btn-p btn-sm" data-a="edit" data-id="' + e(r.id) + '">Edit</button></div></article>';
      }).join('') + '</div>' : U.empty('file-pen-line', 'No resumes yet', 'Create a blank resume or start from a sample to try the form.')) + '</div>';
    U.icons();
    el.onclick = function (ev) {
      var b = ev.target.closest('[data-a]'); if (!b) return; var a = b.dataset.a, r;
      if (a === 'edit') go(b.dataset.id);
      else if (a === 'new') { r = S.create({ name: 'My resume' }); r.ok ? go(r.resume.id) : U.toast(r.error); }
      else if (a === 'sample') U.modal({ title: 'Start from a sample', body: '<p>Sample resumes use made-up details so you can explore the form safely.</p>', actions: [{ label: 'Cancel', value: 'no' }, { label: RC.sample.fresher.label, value: 'fresher' }, { label: RC.sample.experienced.label, kind: 'btn-p', value: 'experienced' }], onClose: function (v) { if (RC.sample[v]) { var x = S.createSample(v); x.ok ? go(x.resume.id) : U.toast(x.error); } } });
    };
  }

  RC.pages['resume-builder'] = function (el) {
    var id = idFromHash();
    if (!id) { cur = null; return picker(el); }
    var R = RC.state.open(id);
    if (!R) { cur = null; return picker(el, 'That resume could not be found. It may have been deleted. Pick another below.'); }
    st = { R: R, root: null, open: {}, secOpen: { personal: 1, summary: 1, experience: 1 }, showAll: false, timer: null, status: ['Saved', 'ok'], issues: 0 };
    ['experience', 'education', 'projects', 'certifications', 'awards', 'volunteer', 'publications', 'customSections'].forEach(function (k) { if (R[k][0]) st.open[R[k][0].id] = true; });
    el.innerHTML = '<div class="fm"></div>'; st.root = el.firstChild; cur = st;
    if (!S.status().persistent) st.status = ['Browser storage is unavailable. Changes last only for this session.', 'warn'];
    bind(st.root); bindState();
    draw();
  };

  /* Embedded use: the visual editor mounts the same form inside its Content tab, on the same central object. */
  RC.form = {
    mount: function (root, o) {
      var R = RC.state.get(); if (!R || !root) return; o = o || {};
      var ui = o.ui || { open: {}, secOpen: { personal: 1, summary: 1, experience: 1 } };
      st = { R: R, root: root, embed: true, open: ui.open, secOpen: ui.secOpen, showAll: false, timer: null, status: ['', ''], issues: 0, onFocus: o.onFocus };
      if (!Object.keys(ui.open).length) ['experience', 'education', 'projects', 'certifications', 'awards', 'volunteer', 'publications', 'customSections'].forEach(function (k) { if (R[k][0]) ui.open[R[k][0].id] = true; });
      bind(root); bindState(); draw();
    },
    redraw: function () { if (st && st.root && document.body.contains(st.root)) { st.R = RC.state.get() || st.R; draw(); } },
    refresh: function () { if (st && st.embed && st.root && document.body.contains(st.root)) { st.R = RC.state.get() || st.R; draw(); } },
    reveal: function (sec, ids) {
      if (!st || !st.embed || !st.root || !document.body.contains(st.root)) return;
      st.secOpen[sec] = 1; (ids || []).forEach(function (id) { if (id) st.open[id] = true; });
      var last = (ids || []).filter(Boolean).pop(); draw({ reveal: last ? '[data-id="' + last + '"]' : '#sec-' + sec });
      var t = st.root.querySelector(last ? '[data-id="' + last + '"]' : '#sec-' + sec); if (t) { t.classList.add('fm-flash'); setTimeout(function () { t.classList.remove('fm-flash'); }, 1100); }
    }
  };
})();
