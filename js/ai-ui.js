/* AI Assistant UI (Part 18): reusable modal, AI buttons injected into the resume form and cover letter editor,
   and the Job Description Analyzer page. Talks only to RC.ai, so providers can change without touching this file. */
(function () {
  var U = RC.ui, M = RC.model, e = M.esc, A = RC.ai, CK = 'rc-ai-ctx';
  var label = function (id) { return A.ACTIONS.filter(function (a) { return a[0] === id; })[0][1]; };
  var lsGet = function () { try { return JSON.parse(localStorage.getItem(CK)) || {}; } catch (x) { return {}; } };
  var lsSet = function (o) { try { localStorage.setItem(CK, JSON.stringify(o)); } catch (x) {} };
  var NEEDS_TEXT = { improveSummary: 'Your current summary', improveProject: 'Your current project description', improveCoverLetter: 'Your current cover letter', rewriteExperience: 'Experience text to rewrite (one point per line)', projectDesc: 'Project name or a one-line note' };
  var NEEDS_JD = { tailor: 1, atsKeywords: 1 };
  function copy(t) {
    var done = function () { U.toast('Copied.', 'ok'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, fallback); else fallback();
    function fallback() { var a = document.createElement('textarea'); a.value = t; a.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); done(); } catch (x) { U.toast('Could not copy. Select the text and copy it manually.'); } a.remove(); }
  }
  var fill = function (v) { return v.items ? v.items.join('\n') : v.text; };

  /* ---------- applying results to the open resume (all through the central state, so undo works) ---------- */
  function applyResume(v, tid) {
    var R = RC.state && RC.state.get && RC.state.get(); if (!R) return false;
    var lines = (v.text || '').split(/\n+/).map(function (x) { return x.replace(/^[-•*\s]+/, '').trim(); }).filter(Boolean), t;
    if (v.apply === 'summary') R.summary = v.text;
    else if (v.apply === 'skills') { var have = R.skills.map(function (s) { return s.name.toLowerCase(); }); (v.items || []).forEach(function (n) { if (have.indexOf(n.toLowerCase()) < 0) R.skills.push({ id: M.uid(), hidden: false, name: n, level: '', category: '' }); }); }
    else if (v.apply === 'bullets') { t = R.experience.filter(function (x) { return x.id === tid; })[0]; if (!t) return false; t.achievements = v._replace ? lines : t.achievements.concat(lines.filter(function (l) { return t.achievements.indexOf(l) < 0; })); }
    else if (v.apply === 'description') { t = R.projects.filter(function (x) { return x.id === tid; })[0]; if (!t) return false; t.description = v.text; }
    else return false;
    RC.state.change('ai', true); if (RC.form && RC.form.redraw) RC.form.redraw(); return true;
  }

  /* ---------- the reusable modal ---------- */
  function open(o) {
    o = o || {}; var action = o.action, R = o.resume || null, saved = lsGet(), seed = 0, last = null;
    var pre = Object.assign({ role: saved.role || '', level: saved.level || '', industry: saved.industry || '', goal: saved.goal || '', tone: saved.tone || 'professional', skills: '', text: '', jd: '', company: '', name: '' }, o.prefill || {});
    if (R) { var pi = R.personalInfo; pre.role = pre.role || pi.jobTitle || ''; pre.name = pre.name || pi.fullName; if (!pre.skills) pre.skills = R.skills.map(function (s) { return s.name; }).join(', '); if (action === 'improveSummary' && !pre.text) pre.text = R.summary; }
    var tgt = (R && /^(responsibilities|rewriteExperience|achievements)$/.test(action)) ? R.experience : (R && /^(projectDesc|improveProject)$/.test(action)) ? R.projects : null;
    var tname = function (x) { return x.position || x.company || x.name || 'Untitled'; };
    var fld = function (id, lab, inner) { return '<div class="fld"><label for="ai-' + id + '">' + lab + '</label>' + inner + '</div>'; };
    var inp = function (id, v, ph) { return '<input id="ai-' + id + '" value="' + e(v) + '" placeholder="' + e(ph || '') + '">'; };
    var sel = function (id, v, opts) { return '<select id="ai-' + id + '">' + opts.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === v ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select>'; };
    var body = '<p class="ai-note">Uses only what you enter here. It will not invent jobs, companies, degrees, certifications or achievements. Generic suggestions are labeled.</p><div class="ai-form">' +
      (tgt ? fld('tgt', R.projects === tgt ? 'Apply to project' : 'Apply to experience entry', tgt.length ? '<select id="ai-tgt">' + tgt.map(function (x) { return '<option value="' + e(x.id) + '">' + e(tname(x)) + (x.company ? ' · ' + e(x.company) : '') + '</option>'; }).join('') + '</select>' : '<p class="ai-warn">Add one first, then come back to use results. You can still copy them.</p>') : '') +
      fld('role', 'Target role', inp('role', pre.role, 'e.g. Frontend Developer')) + fld('level', 'Experience level', sel('level', pre.level, [['', 'Not specified'], ['fresher', 'Fresher / student'], ['junior', 'Junior'], ['mid', 'Mid-level'], ['senior', 'Senior']])) +
      fld('industry', 'Industry', inp('industry', pre.industry, 'e.g. Retail, Healthcare')) + fld('tone', 'Tone', sel('tone', pre.tone, [['professional', 'Professional'], ['confident', 'Confident'], ['friendly', 'Friendly']])) +
      (action === 'coverLetter' ? fld('company', 'Company', inp('company', pre.company)) : '') +
      fld('skills', 'Your skills (comma separated)', '<textarea id="ai-skills" rows="2">' + e(pre.skills) + '</textarea>') + fld('goal', 'Career goal', inp('goal', pre.goal, 'e.g. grow into a team lead role')) +
      (NEEDS_TEXT[action] ? fld('text', NEEDS_TEXT[action], '<textarea id="ai-text" rows="5">' + e(pre.text) + '</textarea>') : '') +
      (NEEDS_JD[action] ? fld('jd', 'Job description' + (action === 'atsKeywords' ? ' (optional)' : ''), '<textarea id="ai-jd" rows="6" placeholder="Paste the job posting here">' + e(pre.jd) + '</textarea>') : '') +
      '</div><div class="ai-go"><button type="button" class="btn btn-p" data-ai="go"><i data-lucide="sparkles"></i>' + label(action) + '</button><small class="ai-prov" id="ai-prov"></small></div><div id="ai-out" aria-live="polite"></div>';
    var d = U.modal({ title: 'AI Assistant · ' + label(action), wide: true, body: body, actions: [{ label: 'Close', kind: 'btn-o' }] }), out = d.querySelector('#ai-out');
    var v$ = function (id) { var x = d.querySelector('#ai-' + id); return x ? x.value : ''; };
    var prov = A.providers().filter(function (p) { return p.id === A.provider(); })[0]; d.querySelector('#ai-prov').textContent = 'Provider: ' + (prov ? prov.name : 'Smart Suggestions');
    out.innerHTML = '<div class="empty ai-empty"><p>Fill in what you know, then press the button. Results appear here.</p></div>';
    function ctx() {
      var c = { role: v$('role'), level: v$('level'), industry: v$('industry'), tone: v$('tone'), goal: v$('goal'), skills: v$('skills'), text: v$('text'), jd: v$('jd'), company: v$('company'), name: pre.name, seed: seed, resume: R || undefined };
      if (R) c.have = R.skills.map(function (s) { return s.name; });
      lsSet({ role: c.role, level: c.level, industry: c.industry, goal: c.goal, tone: c.tone }); return c;
    }
    function cardHtml(v, i) {
      var tid = tgt && v.apply === 'bullets' || tgt && v.apply === 'description';
      return '<article class="ai-card" data-i="' + i + '"><header><b>' + e(v.label) + '</b>' + (v.generic ? '<span class="tag ai-gen">Generic suggestion</span>' : '') + '</header>' +
        (v.items ? '<ul class="ai-chips">' + v.items.map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ul>' : '<div class="ai-text">' + e(v.text) + '</div>') + (v.note ? '<small class="ai-hint">' + e(v.note) + '</small>' : '') +
        '<div class="rc-act"><button type="button" class="btn btn-p btn-sm" data-ai="use">Use This</button><button type="button" class="btn btn-o btn-sm" data-ai="copy">Copy</button><button type="button" class="btn btn-o btn-sm" data-ai="regen">Regenerate</button></div></article>';
    }
    function show(res) {
      last = res;
      if (res.needs) { out.innerHTML = U.empty('circle-help', 'A little more information needed', e(res.needs)); U.icons(); return; }
      var vs = res.variants || []; if (!vs.length) { out.innerHTML = U.empty('inbox', 'Nothing to suggest yet', 'Add more details above and try again.'); U.icons(); return; }
      out.innerHTML = (res.tips && res.tips.length ? '<ul class="ai-tips">' + res.tips.map(function (t) { return '<li>' + e(t) + '</li>'; }).join('') + '</ul>' : '') + vs.map(cardHtml).join('') + '<p class="ai-foot">Review everything before using it. Nothing here guarantees any result in an applicant tracking system.</p>'; U.icons();
    }
    function run(onlyIndex) {
      var btn = d.querySelector('[data-ai=go]'); btn.disabled = true;
      if (onlyIndex === undefined) out.innerHTML = U.loading('Working on it…');
      A.run(action, ctx()).then(function (res) {
        btn.disabled = false;
        if (onlyIndex !== undefined && last && last.variants && res.variants && res.variants[onlyIndex]) { last.variants[onlyIndex] = res.variants[onlyIndex]; show(last); } else show(res);
      }).catch(function (err) {
        btn.disabled = false; out.innerHTML = '<div class="empty"><div class="empty-i"><i data-lucide="triangle-alert"></i></div><h2>That did not work</h2><p>' + e(err && err.message || 'Something went wrong.') + '</p><div class="cta-row" style="justify-content:center"><button type="button" class="btn btn-p" data-ai="retry">Retry</button><button type="button" class="btn btn-o" data-ai="local">Use local Smart Suggestions</button></div></div>'; U.icons();
      });
    }
    d.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-ai]'); if (!b) return; var k = b.dataset.ai, card = b.closest('.ai-card'), i = card ? +card.dataset.i : -1, v = i > -1 && last && last.variants[i];
      if (k === 'go' || k === 'retry') { seed = 0; run(); }
      else if (k === 'local') { A.setProvider('smart'); d.querySelector('#ai-prov').textContent = 'Provider: Smart Suggestions (local)'; run(); }
      else if (k === 'copy' && v) copy(fill(v));
      else if (k === 'regen' && v) { seed++; run(i); }
      else if (k === 'use' && v) {
        if (/\[[^\]]+\]/.test(fill(v))) U.toast('Replace the [bracketed] parts with real details.');
        if (o.apply) { if (o.apply(Object.assign({}, v, { _replace: action === 'rewriteExperience' }), v.apply)) { U.toast('Added to your ' + (o.where || 'resume') + '. You can undo it.', 'ok'); } else copy(fill(v)); }
        else if (R) { var sel2 = d.querySelector('#ai-tgt'); if ((v.apply === 'bullets' || v.apply === 'description') && !sel2) { U.toast('Add an item first. The text was copied instead.'); copy(fill(v)); } else if (applyResume(Object.assign({}, v, { _replace: action === 'rewriteExperience' }), sel2 && sel2.value)) U.toast('Added to your resume. You can undo it.', 'ok'); else copy(fill(v)); }
        else { copy(fill(v)); }
      }
    });
    var ts = d.querySelector('#ai-tgt');
    if (ts && action !== 'projectDesc') ts.addEventListener('change', function () { var it = tgt.filter(function (x) { return x.id === ts.value; })[0], tx = d.querySelector('#ai-text'); if (it && tx) tx.value = it.description || (it.achievements || []).join('\n'); });
    if (ts && !pre.text) { var it0 = tgt[0], tx0 = d.querySelector('#ai-text'); if (it0 && tx0 && action !== 'projectDesc') tx0.value = action === 'improveProject' ? (it0.description || '') : (it0.description ? it0.description + '\n' : '') + (it0.achievements || []).join('\n'); }
    return d;
  }
  function picker(o) {
    var groups = { summary: 'Summary & objective', experience: 'Experience', skills: 'Skills', projects: 'Projects', cover: 'Cover letter', keywords: 'Keywords & tailoring' };
    var d = U.modal({ title: 'AI Assistant', wide: true, body: Object.keys(groups).map(function (g) { return '<h3 class="ai-gh">' + groups[g] + '</h3><div class="ai-grid">' + A.ACTIONS.filter(function (a) { return a[2] === g; }).map(function (a) { return '<button type="button" class="btn btn-o" data-pick="' + a[0] + '">' + a[1] + '</button>'; }).join('') + '</div>'; }).join(''), actions: [{ label: 'Close', kind: 'btn-o' }] });
    d.addEventListener('click', function (ev) { var b = ev.target.closest('[data-pick]'); if (!b) return; d.close('x'); open(Object.assign({}, o, { action: b.dataset.pick })); });
  }

  /* ---------- buttons injected next to the right fields ---------- */
  var ROWS = {
    summary: [['objective', 'Generate Career Objective'], ['summary', 'Generate with AI'], ['improveSummary', 'Improve with AI'], ['tailor', 'Tailor to a job']],
    experience: [['responsibilities', 'Generate Responsibilities'], ['rewriteExperience', 'Rewrite with AI'], ['achievements', 'Achievement Bullets']],
    skills: [['techSkills', 'Suggest Technical Skills'], ['softSkills', 'Suggest Soft Skills']],
    projects: [['projectDesc', 'Write Project Description'], ['improveProject', 'Improve with AI']]
  };
  var rowHtml = function (list) { return list.map(function (a) { return '<button type="button" class="btn btn-o btn-sm ai-b" data-aiact="' + a[0] + '"><i data-lucide="sparkles"></i>' + a[1] + '</button>'; }).join(''); };
  function inject() {
    var view = document.getElementById('view'); if (!view) return; var added = false;
    Object.keys(ROWS).forEach(function (k) {
      var b = view.querySelector('#sb-' + k); if (b && !b.querySelector(':scope > .ai-row')) { var r = document.createElement('div'); r.className = 'ai-row'; r.innerHTML = rowHtml(ROWS[k]); b.insertBefore(r, b.firstChild); added = true; }
    });
    var op = view.querySelector('#cf-opening');
    if (op && !view.querySelector('.ai-row-cl')) { var f = op.closest('.fld'), r2 = document.createElement('div'); r2.className = 'ai-row ai-row-cl'; r2.innerHTML = rowHtml([['coverLetter', 'Generate with AI'], ['improveCoverLetter', 'Improve with AI']]); f.parentNode.insertBefore(r2, f); added = true; }
    if (added) U.icons();
  }
  function setField(id, val) { var x = document.getElementById(id); if (!x) return false; x.value = val; x.dispatchEvent(new Event('input', { bubbles: true })); return true; }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-aiact]'); if (!b) return; ev.preventDefault(); ev.stopPropagation();
    var action = b.dataset.aiact;
    if (b.closest('.ai-row-cl')) {
      var g = function (id) { var x = document.getElementById(id); return x ? x.value : ''; }, rs = RC.store.list()[0];
      return open({ action: action, where: 'cover letter', prefill: { role: g('cf-jobTitle'), company: g('cf-company'), name: g('cf-sender-name'), text: [g('cf-opening'), g('cf-body')].filter(Boolean).join('\n\n'), skills: rs ? rs.skills.map(function (s) { return s.name; }).join(', ') : '' },
        apply: function (v) { var parts = v.text.split(/\n{2,}/); return setField('cf-opening', parts.shift() || '') && setField('cf-body', parts.join('\n\n')); } });
    }
    var R = RC.state && RC.state.get && RC.state.get();
    open({ action: action, resume: R || null });
  }, true);
  var pending = false;
  new MutationObserver(function () { if (pending) return; pending = true; requestAnimationFrame(function () { pending = false; inject(); }); }).observe(document.getElementById('view'), { childList: true, subtree: true });

  /* ---------- Job Description Analyzer page ---------- */
  RC.pages['jd-analyzer'] = function (el) {
    var rs = RC.store.list(), chips = function (a) { return a.length ? '<ul class="ai-chips">' + a.map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ul>' : '<p class="ai-none">None found in the text.</p>'; };
    var bl = function (a) { return a.length ? '<ul class="ai-ul">' + a.map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ul>' : '<p class="ai-none">None found in the text.</p>'; };
    el.innerHTML = U.pageHeader('Job Description Analyzer', 'Paste a job posting to see its skills, tools and keywords, and how your resume compares.', '<button type="button" class="btn btn-o" data-j="all"><i data-lucide="sparkles"></i>All AI tools</button>') +
      '<div class="wrap pg"><div class="fld"><label for="jd-t">Job description</label><textarea id="jd-t" rows="10" placeholder="Paste the full job posting here"></textarea></div>' +
      '<div class="ai-go"><div class="fld" style="margin:0;min-width:240px"><label for="jd-r">Compare with a resume (optional)</label><select id="jd-r"><option value="">No resume</option>' + rs.map(function (r) { return '<option value="' + e(r.id) + '">' + e(r.name) + '</option>'; }).join('') + '</select></div><button type="button" class="btn btn-p" data-j="go"><i data-lucide="scan-search"></i>Analyze</button></div>' +
      '<p class="ai-note">This is a guide, not a score. No tool can promise a resume will pass any applicant tracking system. Add only skills and experience you truly have.</p><div id="jd-out"></div></div>';
    U.icons(); var out = el.querySelector('#jd-out');
    el.onclick = function (ev) {
      var b = ev.target.closest('[data-j]'); if (!b) return; var k = b.dataset.j;
      if (k === 'all') return picker({});
      var txt = el.querySelector('#jd-t').value, R = RC.store.load(el.querySelector('#jd-r').value);
      if (k === 'tailor') return open({ action: 'tailor', resume: R, prefill: { jd: txt, role: (A.analyzeJD(txt) || {}).title || '' } });
      var jd = A.analyzeJD(txt);
      if (!jd) { out.innerHTML = U.empty('clipboard-paste', 'Paste a job description first', 'Add at least a few lines of the posting, then press Analyze.'); U.icons(); return; }
      var ad = A.jdAdvice(jd, R), sec = function (t, h) { return '<section class="ai-sec"><h3>' + t + '</h3>' + h + '</section>'; };
      out.innerHTML = '<div class="ai-res">' + sec('Job title', '<p>' + (jd.title ? e(jd.title) : '<span class="ai-none">Not clearly stated.</span>') + '</p>') + sec('Skills', chips(jd.skills)) + sec('Tools', chips(jd.tools)) + sec('Repeated keywords', chips(jd.keywords)) + sec('Responsibilities', bl(jd.responsibilities)) + sec('Experience requirements', bl(jd.experience)) + '</div>' +
        '<h2 class="ai-h2">Suggestions' + (R ? ' for “' + e(R.name) + '”' : '') + '</h2><div class="ai-res">' + sec('Summary improvements', bl(ad.summary)) + sec('Skills to highlight', bl(ad.skills)) + sec('Keyword opportunities', bl(ad.keywords)) + sec('Experience improvements', bl(ad.experience)) + sec('Project relevance', bl(ad.projects)) + '</div>' +
        '<div class="cta-row" style="margin-top:18px"><button type="button" class="btn btn-p" data-j="tailor"><i data-lucide="sparkles"></i>Draft a tailored summary</button></div>'; U.icons();
    };
  };
  RC.aiUI = { open: open, picker: picker };
})();
