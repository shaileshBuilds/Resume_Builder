/* Career Tools (Part 19): ATS Checker, Resume Score, Word Counter, Action Verbs, Skill Suggestions.
   Every score uses visible, fixed rules (listed on each page). Nothing is sent anywhere.
   Replaces the Part 2 placeholders for #/career-tools and #/ats-checker (loaded after pages.js). */
RC.careerTools = (function () {
  var M = RC.model, wc = function (s) { return (String(s || '').match(/\S+/g) || []).length; };
  var has = function (s) { return !!String(s || '').trim(); };
  var METRIC = /\d|%|\$|₹|€|£|\b(doubled|tripled|halved)\b/;

  /* All visible text of a resume, grouped by section (hidden items and hidden sections are left out). */
  function parts(resume) {
    var r = M.visible(M.normalize(resume)), on = function (k) { return r.visibilitySettings[k] !== false; }, p = [], pi = r.personalInfo;
    p.push(['Contact', [pi.fullName, pi.jobTitle, pi.email, pi.phone, pi.location, pi.website, pi.linkedin, pi.github].filter(has).join(' ')]);
    if (on('summary') && has(r.summary)) p.push(['Summary', r.summary]);
    var add = function (k, fn) { if (on(k) && r[k].length) p.push([M.LABELS[k], r[k].map(fn).join('\n')]); };
    add('experience', function (x) { return [x.position, x.company, x.location, x.startDate, x.endDate, x.description].concat(x.achievements).filter(has).join(' '); });
    add('education', function (x) { return [x.institution, x.degree, x.field, x.startDate, x.endDate, x.description].filter(has).join(' '); });
    add('skills', function (x) { return [x.name, x.category].filter(has).join(' '); });
    add('projects', function (x) { return [x.name, x.description, x.technologies.join(' '), x.link].filter(has).join(' '); });
    add('certifications', function (x) { return [x.name, x.issuer, x.date].filter(has).join(' '); });
    add('languages', function (x) { return [x.name, x.proficiency].filter(has).join(' '); });
    add('awards', function (x) { return [x.title, x.issuer, x.date, x.description].filter(has).join(' '); });
    add('volunteer', function (x) { return [x.organization, x.role, x.description].filter(has).join(' '); });
    add('publications', function (x) { return [x.title, x.publisher, x.description].filter(has).join(' '); });
    if (on('customSections')) r.customSections.forEach(function (c) { if (c.items.length) p.push([c.title || 'Additional', c.items.map(function (i) { return [i.heading, i.subheading, i.date, i.description].filter(has).join(' '); }).join('\n')]); });
    return p;
  }
  var fullText = function (r) { return parts(r).map(function (x) { return x[1]; }).join('\n'); };
  function bullets(r) { var v = M.visible(M.normalize(r)), b = []; v.experience.forEach(function (x) { x.achievements.forEach(function (a) { b.push(a); }); if (has(x.description)) b.push(x.description); }); v.projects.forEach(function (x) { if (has(x.description)) b.push(x.description); }); return b; }

  /* ---------- ATS checker: 13 rules, each worth fixed points. pass = full, warning = half, fail = none ---------- */
  var CONV = /^(summary|professional summary|profile|objective|career objective|work experience|experience|professional experience|employment history|education|skills|technical skills|key skills|projects|certifications?|licenses?|languages?|awards?|honors|volunteer(ing)?( experience)?|publications?|references|achievements|additional information|interests|training|courses)$/i;
  var SYM = /[\u2190-\u21FF\u2300-\u23FF\u25A0-\u27BF\u2B00-\u2BFF\u{1F000}-\u{1FAFF}]|[!?]{2,}|\*{2,}|~{2,}|={3,}|_{3,}/gu;
  function ats(resume) {
    var r = M.normalize(resume), v = M.visible(r), pi = r.personalInfo, tpl = RC.templates && RC.templates.get(r.templateId), ds = r.designSettings, rules = [];
    var R = function (id, name, w, status, msg, rec) { rules.push({ id: id, name: name, w: w, status: status, msg: msg, rec: status === 'pass' ? '' : rec }); };
    R('name', 'Name', 5, pi.fullName.trim().split(/\s+/).filter(Boolean).length >= 2 ? 'pass' : has(pi.fullName) ? 'warn' : 'fail', has(pi.fullName) ? 'Name found: “' + pi.fullName.trim() + '”.' : 'No name found.', 'Use your full first and last name at the top.');
    R('email', 'Email', 5, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(pi.email.trim()) ? 'pass' : has(pi.email) ? 'warn' : 'fail', has(pi.email) ? (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(pi.email.trim()) ? 'Email looks valid.' : 'Email does not look valid.') : 'No email found.', 'Add a working email address as plain text.');
    var digits = pi.phone.replace(/\D/g, '').length;
    R('phone', 'Phone', 5, digits >= 7 && digits <= 15 ? 'pass' : has(pi.phone) ? 'warn' : 'fail', has(pi.phone) ? (digits >= 7 && digits <= 15 ? 'Phone number found.' : 'Phone number has an unusual number of digits (' + digits + ').') : 'No phone number found.', 'Add a phone number with country code, for example +91 98765 43210.');
    var sw = wc(r.summary);
    R('summary', 'Summary', 8, sw >= 25 && sw <= 120 ? 'pass' : sw ? 'warn' : 'fail', sw ? 'Summary has ' + sw + ' words.' : 'No summary found.', sw ? (sw < 25 ? 'Expand the summary to about 2–4 sentences (25–120 words).' : 'Shorten the summary to 120 words or fewer.') : 'Add a 2–4 sentence summary that names your role and main skills.');
    var exOk = v.experience.filter(function (x) { return (has(x.position) || has(x.company)) && (has(x.description) || x.achievements.length); }).length;
    R('experience', 'Work experience', 12, exOk >= 1 ? (exOk === v.experience.length ? 'pass' : 'warn') : 'fail', v.experience.length ? exOk + ' of ' + v.experience.length + ' entries have a title or company and details.' : 'No work experience entries.', v.experience.length ? 'Add a description or bullet points to every entry.' : 'Add work experience. If you have none yet, add internships, projects or volunteer work.');
    var edOk = v.education.filter(function (x) { return has(x.institution); }).length;
    R('education', 'Education', 8, edOk >= 1 ? 'pass' : 'fail', edOk ? edOk + ' education entr' + (edOk === 1 ? 'y' : 'ies') + ' found.' : 'No education entry with an institution.', 'Add your highest qualification with the institution name.');
    var sk = v.skills.length;
    R('skills', 'Skills', 8, sk >= 5 ? 'pass' : sk ? 'warn' : 'fail', sk + ' skill' + (sk === 1 ? '' : 's') + ' listed.', 'List at least 5 skills that you really have and that fit the jobs you want.');
    var dated = v.experience.concat(v.education), bad = [], fmts = {};
    dated.forEach(function (x) { [x.startDate, x.endDate].forEach(function (d) { if (!has(d)) return; var f = /^\d{4}-\d{1,2}$/.test(d) ? 'ym' : /^\d{4}$/.test(d) ? 'y' : 'other'; fmts[f] = 1; if (f === 'other') bad.push(d); }); });
    var missing = v.experience.filter(function (x) { return !has(x.startDate); }).length;
    var dst = !dated.length ? 'fail' : (bad.length || missing || Object.keys(fmts).length > 1) ? 'warn' : Object.keys(fmts).length ? 'pass' : 'fail';
    R('dates', 'Dates', 8, dst, !dated.length ? 'No experience or education to check.' : (dst === 'pass' ? 'Dates are present and use one clear format.' : [missing ? missing + ' experience entr' + (missing === 1 ? 'y has' : 'ies have') + ' no start date' : '', bad.length ? 'unclear format: ' + bad.slice(0, 3).join(', ') : '', Object.keys(fmts).length > 1 ? 'mixed date formats' : ''].filter(Boolean).join('; ') + '.'), 'Give every job a start date and use one format such as 2022-04 or 2022.');
    var oddT = r.customSections.filter(function (c) { return c.items.length && has(c.title) && !CONV.test(c.title.trim()); }).map(function (c) { return c.title; });
    R('headings', 'Conventional headings', 8, oddT.length ? 'warn' : 'pass', oddT.length ? 'Unusual section titles: ' + oddT.join(', ') + '.' : 'Section headings use standard names.', 'Rename unusual titles to common ones such as Experience, Education, Skills or Projects.');
    var deco = []; if (tpl && !/^ATS/.test(tpl.ats || '')) deco.push('the “' + tpl.name + '” template is not marked ATS-friendly'); if (tpl && /sidebar|grid/.test(tpl.layout || '') ) deco.push('multi-column layout'); if (ds.columns === 'two') deco.push('two-column override'); if (ds.icons === 'on') deco.push('contact icons'); if (ds.pageBorder) deco.push('page border'); if (has(pi.profilePhoto) && r.visibilitySettings.profilePhoto) deco.push('profile photo');
    R('decoration', 'Decoration', 8, deco.length === 0 ? 'pass' : deco.length <= 2 ? 'warn' : 'fail', deco.length ? 'Found: ' + deco.join('; ') + '.' : 'Plain layout with no photo, icons or border.', 'For online application forms, use a single-column ATS template without photo, icons or borders.');
    var all = fullText(r), sym = all.match(SYM) || [];
    R('symbols', 'Symbols', 6, sym.length === 0 ? 'pass' : sym.length <= 3 ? 'warn' : 'fail', sym.length ? sym.length + ' unusual symbol' + (sym.length === 1 ? '' : 's') + ' found (' + sym.slice(0, 4).join(' ') + ').' : 'No emoji or unusual symbols.', 'Remove emoji, arrows, stars and repeated punctuation. Use plain words.');
    var words = wc(all), avg = bullets(r).length ? bullets(r).reduce(function (a, b) { return a + wc(b); }, 0) / bullets(r).length : 0;
    var dens = words >= 200 && words <= 800 && avg <= 40 ? 'pass' : words < 100 || words > 1100 ? 'fail' : 'warn';
    R('density', 'Text density', 6, dens, words + ' words' + (avg ? ', average ' + Math.round(avg) + ' words per bullet' : '') + '.', words < 200 ? 'Add more detail. Most resumes run about 300–700 words.' : words > 800 ? 'Trim to the most relevant points. Over 800 words is long for most roles.' : 'Shorten long bullets to 1–2 lines.');
    var mb = bullets(r), mm = mb.filter(function (b) { return METRIC.test(b); }).length;
    R('metrics', 'Measurable achievements', 10, mm >= 3 ? 'pass' : mm >= 1 ? 'warn' : 'fail', mb.length ? mm + ' of ' + mb.length + ' points include a number.' : 'No experience or project points to check.', 'Where it is true, add real numbers: how many, how often, how much, how fast. Do not invent figures.');
    var tot = 0, got = 0; rules.forEach(function (x) { tot += x.w; got += x.status === 'pass' ? x.w : x.status === 'warn' ? x.w / 2 : 0; x.pts = x.status === 'pass' ? x.w : x.status === 'warn' ? x.w / 2 : 0; });
    var score = Math.round(got / tot * 100);
    return { score: score, total: tot, earned: got, rules: rules, band: score >= 85 ? 'Well structured' : score >= 65 ? 'Good, with things to fix' : score >= 40 ? 'Needs work' : 'Needs a lot of work',
      passed: rules.filter(function (x) { return x.status === 'pass'; }), warnings: rules.filter(function (x) { return x.status !== 'pass'; }) };
  }

  /* ---------- resume score: 7 weighted categories ---------- */
  function score(resume) {
    var r = M.normalize(resume), v = M.visible(r), pi = r.personalInfo, c = [], b = bullets(r), cl = function (n) { return Math.max(0, Math.min(100, Math.round(n))); };
    var C = function (id, name, w, val, how) { c.push({ id: id, name: name, w: w, val: cl(val), how: how }); };
    var fields = [pi.fullName, pi.jobTitle, pi.email, pi.phone, pi.location, r.summary, v.experience.length, v.education.length, v.skills.length, pi.linkedin || pi.website || pi.github];
    C('completeness', 'Completeness', 20, fields.filter(function (x) { return has(String(x)) && x !== 0; }).length * 10, '10 items worth 10 points each: name, job title, email, phone, location, summary, an experience entry, an education entry, a skill, and one link (LinkedIn, website or GitHub).');
    var sw = wc(r.summary), avg = b.length ? b.reduce(function (a, x) { return a + wc(x); }, 0) / b.length : 0, longb = b.filter(function (x) { return wc(x) > 45; }).length, shout = (fullText(r).match(/\b[A-Z]{6,}\b/g) || []).length + (fullText(r).match(/[!?]{2,}/g) || []).length;
    C('readability', 'Readability', 15, (sw >= 25 && sw <= 120 ? 40 : sw ? 20 : 0) + (b.length ? (avg <= 28 ? 30 : avg <= 40 ? 15 : 0) : 0) + (b.length ? (longb === 0 ? 15 : 0) : 0) + (shout === 0 ? 15 : 0), 'Summary of 25–120 words (40) + average bullet 28 words or fewer (30; 15 up to 40) + no bullet over 45 words (15) + no long ALL-CAPS words or repeated !/? (15).');
    var ex = v.experience, withBul = ex.filter(function (x) { return x.achievements.length >= 2 || wc(x.description) >= 15; }).length, both = ex.filter(function (x) { return has(x.startDate) && (has(x.endDate) || x.current); }).length;
    C('experience', 'Experience', 20, ex.length ? Math.min(ex.length, 3) / 3 * 50 + withBul / ex.length * 30 + both / ex.length * 20 : 0, 'Up to 3 entries count (50) + share of entries with 2 or more bullets or a 15-word description (30) + share with full dates (20).');
    var cats = {}; v.skills.forEach(function (s) { if (has(s.category)) cats[s.category.toLowerCase()] = 1; });
    C('skills', 'Skills', 15, Math.min(v.skills.length, 10) / 10 * 80 + (Object.keys(cats).length >= 2 ? 20 : 0), 'Up to 10 skills count (80) + skills grouped into 2 or more categories (20).');
    var ed = v.education, edc = ed.filter(function (x) { return has(x.institution) && (has(x.degree) || has(x.field)); }).length, edd = ed.filter(function (x) { return has(x.startDate) || has(x.endDate); }).length;
    C('education', 'Education', 10, ed.length ? 60 + edc / ed.length * 25 + edd / ed.length * 15 : 0, 'At least one entry (60) + share with institution and degree or field (25) + share with dates (15).');
    var pj = v.projects, pjd = pj.filter(function (x) { return wc(x.description) >= 8 && x.technologies.length; }).length;
    C('projects', 'Projects', 10, pj.length ? Math.min(pj.length, 3) / 3 * 60 + pjd / pj.length * 40 : 0, 'Up to 3 projects count (60) + share with an 8-word description and technologies (40). Most useful for students and career changers.');
    var mm = b.filter(function (x) { return METRIC.test(x); }).length;
    C('achievements', 'Achievements', 10, Math.min(mm, 5) / 5 * 100, 'Points that include a number: 5 or more gives full marks (20 each).');
    var tw = 0, sum = 0; c.forEach(function (x) { tw += x.w; sum += x.val * x.w; x.pts = Math.round(x.val * x.w / 100 * 10) / 10; });
    return { score: Math.round(sum / tw), cats: c };
  }
  function count(text) { text = String(text || ''); var w = wc(text); return { words: w, chars: text.length, charsNoSpace: text.replace(/\s/g, '').length, sentences: (text.match(/[^.!?]+[.!?]+/g) || (w ? [text] : [])).length, minutes: w / 200, pages: w / 500 }; }

  var VERBS = {
    leadership: ['Led', 'Directed', 'Managed', 'Supervised', 'Mentored', 'Coached', 'Guided', 'Coordinated', 'Oversaw', 'Headed', 'Organized', 'Delegated', 'Motivated', 'Trained', 'Mobilized', 'Chaired', 'Championed', 'Spearheaded', 'Facilitated', 'Represented'],
    technical: ['Built', 'Developed', 'Designed', 'Implemented', 'Programmed', 'Configured', 'Debugged', 'Deployed', 'Tested', 'Automated', 'Integrated', 'Optimized', 'Migrated', 'Maintained', 'Engineered', 'Analyzed', 'Documented', 'Refactored', 'Installed', 'Troubleshot'],
    business: ['Analyzed', 'Negotiated', 'Forecasted', 'Budgeted', 'Reconciled', 'Audited', 'Evaluated', 'Reported', 'Planned', 'Secured', 'Closed', 'Reviewed', 'Streamlined', 'Advised', 'Appraised', 'Calculated', 'Compiled', 'Prepared', 'Projected', 'Researched'],
    marketing: ['Promoted', 'Launched', 'Created', 'Wrote', 'Published', 'Campaigned', 'Engaged', 'Grew', 'Positioned', 'Branded', 'Advertised', 'Edited', 'Designed', 'Presented', 'Shared', 'Targeted', 'Increased', 'Produced', 'Surveyed', 'Tracked'],
    operations: ['Scheduled', 'Processed', 'Maintained', 'Improved', 'Reduced', 'Standardized', 'Monitored', 'Dispatched', 'Inspected', 'Ordered', 'Handled', 'Resolved', 'Supported', 'Delivered', 'Recorded', 'Tracked', 'Organized', 'Simplified', 'Coordinated', 'Administered']
  };
  return { ats: ats, score: score, count: count, parts: parts, fullText: fullText, bullets: bullets, VERBS: VERBS, wc: wc };
})();

(function () {
  var U = RC.ui, S = RC.store, M = RC.model, e = M.esc, CT = RC.careerTools;
  var TOOLS = [['ats-checker', 'ATS Checker', 'scan-search', 'Run 13 clear checks on your resume and see what to fix.'], ['resume-score', 'Resume Score', 'gauge', 'A 7-part score that explains exactly how it is calculated.'], ['word-counter', 'Word Counter', 'text', 'Words, characters and reading time for your resume or any text.'],
    ['action-verbs', 'Action Verbs', 'zap', 'Strong verbs by category. Click one to copy it.'], ['skill-suggestions', 'Skill Suggestions', 'list-plus', 'Skills for common roles. Add the ones you really have.'], ['jd-analyzer', 'Job Description Analyzer', 'clipboard-list', 'Paste a job post and compare it with your resume.'], ['cover-letter', 'Cover Letter', 'mail', 'Write a letter that matches your resume.']];
  var idOf = function () { var m = /[?&]id=([^&]+)/.exec(location.hash); try { return m ? decodeURIComponent(m[1]) : ''; } catch (x) { return ''; } };
  function tabs(cur) { return '<nav class="ct-tabs" aria-label="Career tools"><a href="#/career-tools"' + (cur === 'career-tools' ? ' aria-current="page"' : '') + '>All tools</a>' + TOOLS.slice(0, 5).map(function (t) { return '<a href="#/' + t[0] + '"' + (t[0] === cur ? ' aria-current="page"' : '') + '>' + t[1] + '</a>'; }).join('') + '</nav>'; }
  function page(el, route, title, sub, needsResume, body) {
    var rs = S.list(), id = idOf(), R = id ? S.load(id) : null; if (!R && rs.length) R = rs[0];
    var pick = '';
    if (needsResume && rs.length) pick = '<div class="fld ct-pick"><label for="ct-r">Resume</label><select id="ct-r">' + rs.map(function (r) { return '<option value="' + e(r.id) + '"' + (R && r.id === R.id ? ' selected' : '') + '>' + e(r.name) + '</option>'; }).join('') + '</select></div>';
    el.innerHTML = U.pageHeader(title, sub) + '<div class="wrap pg">' + tabs(route) + pick + '<div id="ct-body"></div></div>';
    var box = el.querySelector('#ct-body');
    if (needsResume && !R) { box.innerHTML = U.empty('file-plus', 'No resume to check yet', 'Create a resume or add a sample. Everything stays in this browser.', '<a class="btn btn-p" href="#/dashboard"><i data-lucide="plus"></i>Go to Dashboard</a>'); U.icons(); return; }
    el.onchange = function (ev) { if (ev.target.id === 'ct-r') location.hash = '#/' + route + '?id=' + encodeURIComponent(ev.target.value); };
    body(box, R, el); U.icons();
  }
  var ST = { pass: ['circle-check', 'Passed'], warn: ['triangle-alert', 'Warning'], fail: ['circle-x', 'Needs attention'] };
  var ring = function (n) { return '<div class="ct-ring" style="--p:' + n + '" role="img" aria-label="Score ' + n + ' out of 100"><b>' + n + '</b><small>/ 100</small></div>'; };

  RC.pages['career-tools'] = function (el) {
    el.innerHTML = U.pageHeader('Career Tools', 'Small helpers for the rest of your job search. Everything runs in your browser.') + '<div class="wrap pg"><div class="grid g3">' + TOOLS.map(function (t) { return '<div class="feat"><i data-lucide="' + t[2] + '"></i><h3>' + t[1] + '</h3><p>' + t[3] + '</p><a class="btn btn-o" style="margin-top:16px" href="#/' + t[0] + '">Open</a></div>'; }).join('') + '</div></div>'; U.icons();
  };

  RC.pages['ats-checker'] = function (el) {
    page(el, 'ats-checker', 'ATS Checker', 'Check your resume against 13 clear, fixed rules.', true, function (box, R) {
      var a = CT.ats(R);
      box.innerHTML = '<div class="ct-top">' + ring(a.score) + '<div><h2>' + a.band + '</h2><p>' + a.passed.length + ' of ' + a.rules.length + ' checks passed, ' + a.warnings.length + ' to review.</p></div></div>' +
        '<p class="ai-note"><b>This is a structure check, not an approval.</b> Every company’s applicant tracking system works differently, so no tool can promise your resume will pass.</p>' +
        '<div class="ct-cols"><section class="ai-sec"><h3>Passed checks (' + a.passed.length + ')</h3>' + (a.passed.length ? '<ul class="ct-list">' + a.passed.map(function (x) { return '<li class="pass"><i data-lucide="circle-check"></i><span><b>' + x.name + '</b><br><small>' + e(x.msg) + '</small></span></li>'; }).join('') + '</ul>' : '<p class="ai-none">Nothing passed yet.</p>') + '</section>' +
        '<section class="ai-sec"><h3>Warnings (' + a.warnings.length + ')</h3>' + (a.warnings.length ? '<ul class="ct-list">' + a.warnings.map(function (x) { return '<li class="' + x.status + '"><i data-lucide="' + ST[x.status][0] + '"></i><span><b>' + x.name + '</b> <em>' + ST[x.status][1] + '</em><br><small>' + e(x.msg) + '</small></span></li>'; }).join('') + '</ul>' : '<p class="ai-none">No warnings. Nice work.</p>') + '</section></div>' +
        '<section class="ai-sec" style="margin-top:14px"><h3>Recommendations</h3>' + (a.warnings.length ? '<ol class="ai-ul">' + a.warnings.map(function (x) { return '<li><b>' + x.name + ':</b> ' + e(x.rec) + '</li>'; }).join('') + '</ol>' : '<p class="ai-none">Nothing to fix right now.</p>') + '<a class="btn btn-p btn-sm" href="#/resume-builder?id=' + encodeURIComponent(R.id) + '">Edit this resume</a></section>' +
        '<details class="ai-sec ct-how" style="margin-top:14px"><summary><b>How the score is calculated</b></summary><p>Each rule has fixed points. Pass earns all of them, warning earns half, needs attention earns none. Score = points earned ÷ total points × 100.</p><div class="ct-scroll"><table class="ct-table"><thead><tr><th>Rule</th><th>Result</th><th>Points</th></tr></thead><tbody>' +
        a.rules.map(function (x) { return '<tr><td>' + x.name + '</td><td>' + ST[x.status][1] + '</td><td>' + x.pts + ' / ' + x.w + '</td></tr>'; }).join('') + '<tr><th>Total</th><th></th><th>' + a.earned + ' / ' + a.total + '</th></tr></tbody></table></div></details>';
    });
  };

  RC.pages['resume-score'] = function (el) {
    page(el, 'resume-score', 'Resume Score', 'Seven categories, each with a plain explanation.', true, function (box, R) {
      var s = CT.score(R);
      box.innerHTML = '<div class="ct-top">' + ring(s.score) + '<div><h2>Overall: ' + s.score + ' / 100</h2><p>The weighted average of the seven categories below. It measures how complete and clear the resume is, not how good a candidate you are.</p></div></div>' +
        '<div class="ct-cats">' + s.cats.map(function (c) { return '<article class="ai-sec"><div class="ct-cat-h"><h3>' + c.name + '</h3><b>' + c.val + '<small>/100</small></b></div><div class="ct-bar"><i style="width:' + c.val + '%"></i></div><small class="ai-hint">Weight ' + c.w + '% · adds ' + c.pts + ' to the total</small><p class="ct-how-t">' + e(c.how) + '</p></article>'; }).join('') + '</div>' +
        '<details class="ai-sec ct-how" style="margin-top:14px"><summary><b>How the overall score is calculated</b></summary><p>Overall = (Σ category score × weight) ÷ 100. Weights: ' + s.cats.map(function (c) { return c.name + ' ' + c.w + '%'; }).join(', ') + '.</p></details>';
    });
  };

  RC.pages['word-counter'] = function (el) {
    page(el, 'word-counter', 'Word Counter', 'Words, characters and estimated reading time.', false, function (box) {
      var rs = S.list(), id = idOf();
      box.innerHTML = '<div class="ct-wc"><div><div class="fld"><label for="wc-src">Count</label><select id="wc-src"><option value="">Pasted text</option>' + rs.map(function (r) { return '<option value="' + e(r.id) + '"' + (r.id === id ? ' selected' : '') + '>Resume: ' + e(r.name) + '</option>'; }).join('') + '</select></div><div class="fld"><label for="wc-t">Text</label><textarea id="wc-t" rows="10" placeholder="Paste or type text here"></textarea></div></div><div id="wc-out"></div></div>';
      var src = box.querySelector('#wc-src'), t = box.querySelector('#wc-t'), out = box.querySelector('#wc-out');
      function draw() {
        var R = src.value ? S.load(src.value) : null, txt = R ? CT.fullText(R) : t.value; t.disabled = !!R; if (R) t.value = txt;
        var c = CT.count(txt), mins = c.minutes < 1 ? (c.words ? 'under 1 minute' : '0 minutes') : (Math.round(c.minutes * 10) / 10) + ' minutes';
        out.innerHTML = '<div class="ct-stats"><div><strong>' + c.words + '</strong><span>Words</span></div><div><strong>' + c.chars + '</strong><span>Characters</span></div><div><strong>' + c.charsNoSpace + '</strong><span>Without spaces</span></div><div><strong>' + c.sentences + '</strong><span>Sentences</span></div></div>' +
          '<p><b>Estimated reading time:</b> ' + mins + ' <small class="ai-hint">at 200 words per minute</small></p><p><b>About ' + (Math.round(c.pages * 10) / 10) + ' page' + (c.pages === 1 ? '' : 's') + '</b> <small class="ai-hint">at roughly 500 words per page</small></p>' +
          (R ? '<table class="ct-table"><thead><tr><th>Section</th><th>Words</th></tr></thead><tbody>' + CT.parts(R).map(function (p) { return '<tr><td>' + e(p[0]) + '</td><td>' + CT.wc(p[1]) + '</td></tr>'; }).join('') + '</tbody></table>' : '') +
          (!c.words ? '<p class="ai-none">Nothing to count yet.</p>' : '');
      }
      src.onchange = draw; t.oninput = draw; draw();
    });
  };

  RC.pages['action-verbs'] = function (el) {
    page(el, 'action-verbs', 'Action Verbs', 'Start bullet points with a strong verb. Use only verbs that describe what you actually did.', false, function (box) {
      var cats = Object.keys(CT.VERBS), cur = cats[0], q = '';
      box.innerHTML = '<div class="ct-vb"><div class="cl-chips" role="group" aria-label="Category">' + cats.map(function (c) { return '<button type="button" class="cl-chip" data-c="' + c + '" aria-pressed="' + (c === cur) + '">' + c.charAt(0).toUpperCase() + c.slice(1) + '</button>'; }).join('') + '</div><div class="fld" style="max-width:320px;margin-top:12px"><label for="vb-q">Filter</label><input id="vb-q" type="search" placeholder="Type to filter"></div><ul class="ai-chips ct-verbs" id="vb-l"></ul><p class="ai-hint" id="vb-n"></p></div>';
      var l = box.querySelector('#vb-l');
      function draw() { var v = CT.VERBS[cur].filter(function (x) { return x.toLowerCase().indexOf(q) > -1; }); l.innerHTML = v.map(function (x) { return '<li><button type="button" data-v="' + e(x) + '" title="Copy">' + e(x) + '</button></li>'; }).join(''); box.querySelector('#vb-n').textContent = v.length ? 'Click a verb to copy it.' : 'No verbs match.'; }
      box.onclick = function (ev) { var c = ev.target.closest('[data-c]'), v = ev.target.closest('[data-v]'); if (c) { cur = c.dataset.c; box.querySelectorAll('[data-c]').forEach(function (b) { b.setAttribute('aria-pressed', b === c); }); draw(); } else if (v) { var t = v.dataset.v; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { U.toast('Copied “' + t + '”.', 'ok'); }, function () { U.toast('Could not copy. Select the word and copy it manually.'); }); } };
      box.querySelector('#vb-q').oninput = function (ev) { q = ev.target.value.trim().toLowerCase(); draw(); }; draw();
    });
  };

  RC.pages['skill-suggestions'] = function (el) {
    var order = ['web', 'swe', 'it', 'da', 'des', 'mkt', 'sal', 'hr', 'fin', 'tea', 'stu'], Rr = RC.ai.ROLES;
    page(el, 'skill-suggestions', 'Skill Suggestions', 'Pick a role, then add only the skills you really have.', true, function (box, R) {
      var role = order[0];
      box.innerHTML = '<div class="fld" style="max-width:320px"><label for="sg-role">Role</label><select id="sg-role">' + order.map(function (k) { return '<option value="' + k + '">' + Rr[k].n + '</option>'; }).join('') + '</select></div><div id="sg-l"></div>';
      var l = box.querySelector('#sg-l');
      function draw() {
        var cur = S.load(R.id), have = cur.skills.map(function (s) { return s.name.toLowerCase(); }), d = Rr[role];
        var grp = function (t, a, cat) { return '<section class="ai-sec"><h3>' + t + '</h3><ul class="ct-sk">' + a.map(function (x, i) { var h = have.indexOf(x.toLowerCase()) > -1, id = 'sk-' + cat + i; return '<li><input type="checkbox" id="' + id + '" data-n="' + e(x) + '" data-cat="' + cat + '"' + (h ? ' disabled checked' : '') + '><label for="' + id + '">' + e(x) + (h ? ' <em>already added</em>' : '') + '</label></li>'; }).join('') + '</ul></section>'; };
        l.innerHTML = '<div class="ct-cols">' + grp('Technical skills', d.tech, 'Technical') + grp('Soft skills', d.soft, 'Soft skills') + '</div><div class="ct-add"><button type="button" class="btn btn-p" id="sg-add"><i data-lucide="plus"></i>Add selected to “' + e(cur.name) + '”</button><small class="ai-hint">Suggestions come from common requirements for the role. Add a skill only if you can honestly claim it.</small></div>'; U.icons();
      }
      box.querySelector('#sg-role').onchange = function (ev) { role = ev.target.value; draw(); };
      l.onclick = function (ev) {
        if (!ev.target.closest('#sg-add')) return; var sel = [].slice.call(l.querySelectorAll('input:checked:not(:disabled)'));
        if (!sel.length) return U.toast('Select at least one skill first.');
        var cur = S.load(R.id); if (!cur) return U.toast('That resume no longer exists.');
        sel.forEach(function (c) { cur.skills.push({ id: M.uid(), hidden: false, name: c.dataset.n, level: '', category: c.dataset.cat }); });
        var r = S.save(cur); r.ok ? U.toast(sel.length + ' skill' + (sel.length === 1 ? '' : 's') + ' added.', 'ok') : U.toast(r.error); draw();
      };
      draw();
    });
  };
})();
