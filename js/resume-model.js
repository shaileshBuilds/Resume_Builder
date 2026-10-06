/* Resume data model. Pure content + design overrides: no HTML, no template markup.
   normalize() accepts anything and always returns a complete, valid resume. */
window.RC = window.RC || {};
RC.model = (function () {
  var SECTIONS = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'awards', 'volunteer', 'publications', 'customSections'];
  var LABELS = { summary: 'Summary', experience: 'Experience', education: 'Education', skills: 'Skills', projects: 'Projects', certifications: 'Certifications', languages: 'Languages', awards: 'Awards', volunteer: 'Volunteer', publications: 'Publications', customSections: 'Custom sections' };
  /* Field types: s = text, b = true/false, a = list of text (a comma-separated string is accepted) */
  var ITEMS = {
    experience: { company: 's', position: 's', location: 's', startDate: 's', endDate: 's', current: 'b', description: 's', achievements: 'a' },
    education: { institution: 's', degree: 's', field: 's', startDate: 's', endDate: 's', description: 's' },
    skills: { name: 's', level: 's', category: 's' },
    projects: { name: 's', description: 's', technologies: 'a', link: 's' },
    certifications: { name: 's', issuer: 's', date: 's', credentialUrl: 's' },
    languages: { name: 's', proficiency: 's' },
    awards: { title: 's', issuer: 's', date: 's', description: 's' },
    volunteer: { organization: 's', role: 's', startDate: 's', endDate: 's', description: 's' },
    publications: { title: 's', publisher: 's', date: 's', url: 's', description: 's' }
  };
  var PERSONAL = ['fullName', 'jobTitle', 'email', 'phone', 'location', 'website', 'linkedin', 'github', 'profilePhoto'];
  var DESIGN = { accentColor: '', fontFamily: '', fontSize: 'medium', spacing: 'normal', margins: 'normal', pageSize: 'A4',
    /* Part 13 design controls: '' means "use the template's own value" */
    secondaryColor: '', textColor: '', bgColor: '', headingFont: '', headingSize: '', bodySize: '', lineHeight: '', letterSpacing: '', columns: '', sidebarWidth: '', pageMargin: '', sectionGap: '', dividers: '', pageBorder: '', icons: '', photoShape: '', headingStyle: '', palette: '', preset: '' };

  var isObj = function (v) { return v && typeof v === 'object' && !Array.isArray(v); };
  var str = function (v) { return typeof v === 'string' ? v : (typeof v === 'number' ? String(v) : ''); };
  var now = function () { return new Date().toISOString(); };
  var uid = function () {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  };
  var list = function (v) {
    if (typeof v === 'string') v = v.split(',');
    return Array.isArray(v) ? v.map(str).map(function (x) { return x.trim(); }).filter(Boolean) : [];
  };
  var iso = function (v, d) { return typeof v === 'string' && !isNaN(Date.parse(v)) ? v : d; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  function item(schema, raw) {
    var o = { id: str(raw.id) || uid(), hidden: raw.hidden === true };
    Object.keys(schema).forEach(function (k) {
      o[k] = schema[k] === 'b' ? raw[k] === true : schema[k] === 'a' ? list(raw[k]) : str(raw[k]);
    });
    return o;
  }
  function items(key, raw) { return Array.isArray(raw) ? raw.filter(isObj).map(function (r) { return item(ITEMS[key], r); }) : []; }
  function custom(raw) {
    return Array.isArray(raw) ? raw.filter(isObj).map(function (r) {
      return { id: str(r.id) || uid(), hidden: r.hidden === true, title: str(r.title), items: Array.isArray(r.items) ? r.items.filter(isObj).map(function (i) { return item({ heading: 's', subheading: 's', date: 's', description: 's' }, i); }) : [] };
    }) : [];
  }
  function cleanName(n) { n = str(n).trim().slice(0, 80); return n || 'Untitled resume'; }

  function normalize(raw) {
    raw = isObj(raw) ? raw : {};
    var t = now(), r = {
      id: str(raw.id) || uid(), name: cleanName(raw.name), templateId: str(raw.templateId) || 'executive-classic',
      createdAt: iso(raw.createdAt, t), updatedAt: iso(raw.updatedAt, iso(raw.createdAt, t)),
      personalInfo: {}, summary: str(raw.summary), favorite: raw.favorite === true
    };
    var pi = isObj(raw.personalInfo) ? raw.personalInfo : {};
    PERSONAL.forEach(function (k) { r.personalInfo[k] = str(pi[k]); });
    Object.keys(ITEMS).forEach(function (k) { r[k] = items(k, raw[k]); });
    r.customSections = custom(raw.customSections);
    var ds = isObj(raw.designSettings) ? raw.designSettings : {};
    r.designSettings = {}; Object.keys(DESIGN).forEach(function (k) { r.designSettings[k] = typeof ds[k] === 'string' ? ds[k] : DESIGN[k]; });
    var order = Array.isArray(raw.sectionOrder) ? raw.sectionOrder.filter(function (k, i, a) { return SECTIONS.indexOf(k) > -1 && a.indexOf(k) === i; }) : [];
    r.sectionOrder = order.concat(SECTIONS.filter(function (k) { return order.indexOf(k) < 0; }));
    var vs = isObj(raw.visibilitySettings) ? raw.visibilitySettings : {};
    r.visibilitySettings = { profilePhoto: vs.profilePhoto !== false };
    SECTIONS.forEach(function (k) { r.visibilitySettings[k] = vs[k] !== false; });
    return r;
  }

  /* Copy of a resume without items the person chose to hide (used for rendering/preview only). */
  function visible(r) {
    var v = JSON.parse(JSON.stringify(r)), show = function (x) { return !x.hidden; };
    Object.keys(ITEMS).forEach(function (k) { v[k] = v[k].filter(show); });
    v.customSections = v.customSections.filter(show).map(function (c) { c.items = c.items.filter(show); return c; });
    return v;
  }

  return { SECTIONS: SECTIONS, LABELS: LABELS, ITEMS: ITEMS, DESIGN_DEFAULTS: DESIGN, normalize: normalize, blank: function (o) { return normalize(o || {}); }, uid: uid, now: now, cleanName: cleanName, isObj: isObj, esc: esc, visible: visible };
})();
