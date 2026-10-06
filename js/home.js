/* Home page (moved from the Part 1 index.html; content unchanged, links now use routes) */
RC.pages = RC.pages || {};
RC.pages.home = function (el) {
  var C = RC.content, U = RC.ui, ic = function (n) { return '<i data-lucide="' + n + '"></i>'; };
  el.innerHTML = `
  <section class="hero"><div class="wrap">
    <div>
      <h1>Build a Resume That Gets Noticed.</h1>
      <p class="lead">Choose a template, add your story once, and switch designs whenever you like. Clean layouts that people enjoy reading and software can parse.</p>
      <div class="cta-row">
        <a href="#/resume-builder" class="btn btn-p"><i data-lucide="sparkles"></i>Create My Resume</a>
        <a href="#/templates" class="btn btn-o">Explore Templates</a>
      </div>
      <p class="note"><i data-lucide="check-circle-2"></i>No sign-up needed to explore</p>
    </div>
    <div class="mock" aria-hidden="true">
      <div class="mock-bar"><b></b><b></b><b></b></div>
      <div class="mock-body">
        <div class="mock-side"><span class="on">Personal info</span><span>Summary</span><span>Experience</span><span>Education</span><span>Skills</span><span>Projects</span></div>
        <div class="mock-paper"><div class="paper">
          <div class="pname">Shailesh Chauhan</div>
          <div style="color:var(--accent);font-weight:600;margin-bottom:8px">Frontend Developer</div>
          <div class="bar a s"></div><div class="bar"></div><div class="bar m"></div>
          <div class="bar a w" style="margin-top:12px"></div><div class="bar"></div><div class="bar m"></div><div class="bar w"></div>
          <div class="bar a s" style="margin-top:12px"></div><div class="bar"></div><div class="bar m"></div>
        </div></div>
      </div>
    </div>
  </div></section>
  <div class="stats"><div class="wrap">${C.stats.map(s => '<div class="stat"><strong>' + s[0] + '</strong><span>' + s[1] + '</span></div>').join('')}</div></div>
  <section><div class="wrap">
    <div class="sec-head"><h2>Templates for every career stage</h2><p>Each one is a real layout built from your content, not a screenshot. A sample of what's coming.</p></div>
    <div class="grid g3 hm-tg" id="hm-tg">${C.templates.map(function (t) { var id = RC.homeTplId(t.n); return '<a href="#/templates" class="tcard hm-tc"><div class="hm-pv">' + RC.templates.preview(RC.sample.experienced, id) + '</div><h3>' + t.n + '</h3><p>' + t.d + '</p></a>'; }).join('')}</div>
  </div></section>
  <section><div class="wrap">
    <div class="sec-head"><h2>Everything you need to write it well</h2><p>Simple tools that help you finish a resume you're proud of.</p></div>
    <div class="grid g3">${C.features.map(f => '<div class="feat">' + ic(f[0]) + '<h3>' + f[1] + '</h3><p>' + f[2] + '</p></div>').join('')}</div>
  </div></section>
  <section><div class="wrap">
    <div class="sec-head"><h2>From blank page to finished resume</h2></div>
    <div class="grid g3 steps">${C.steps.map(s => '<div class="step"><h3>' + s[0] + '</h3><p>' + s[1] + '</p></div>').join('')}</div>
  </div></section>
  <section><div class="wrap">
    <div class="sec-head"><h2>Examples by career</h2><p>See how others in your field present their work.</p></div>
    <div class="grid g4">${C.cats.map(c => '<a href="#/resume-examples" class="cat">' + ic(c[0]) + c[1] + '</a>').join('')}</div>
  </div></section>
  <section><div class="wrap">
    <div class="sec-head"><h2>What early users say</h2><p>Sample testimonials with fictional identities.</p></div>
    <div class="grid g3">${C.quotes.map(q => '<figure class="quote"><p>' + q[0] + '</p><div class="who"><div class="av">' + q[1][0] + '</div><div><strong>' + q[1] + '</strong><small>' + q[2] + '</small></div></div></figure>').join('')}</div>
  </div></section>
  <section><div class="wrap">
    <div class="sec-head"><h2>Questions, answered</h2></div>
    ${RC.faqHtml()}
  </div></section>
  <section style="padding-top:0"><div class="wrap"><div class="final">
    <h2>Your next role starts with a better resume.</h2><p>Build your first draft in minutes.</p>
    <div class="cta-row" style="justify-content:center">
      <a href="#/resume-builder" class="btn btn-p">Create My Resume</a><a href="#/templates" class="btn btn-o">Explore Templates</a>
    </div>
  </div></div></section>`;
  if (RC.templates && RC.templates.fit) {
    RC.templates.fit(el.querySelector('#hm-tg'));
    requestAnimationFrame(function () { RC.templates.fit(el.querySelector('#hm-tg')); });
  }
};
RC.homeTplId = function (name) {
  var id = name.toLowerCase().replace(/\s+/g, '-');
  return RC.templates.get(id) ? id : RC.templates.DEFAULT_ID;
};
RC.faqHtml = function () {
  return '<div class="faq">' + RC.content.faq.map((f, i) => '<details' + (i === 0 ? ' open' : '') + '><summary>' + f[0] + '</summary><p>' + f[1] + '</p></details>').join('') + '</div>';
};
RC.bindFaq = function (el) {
  el.addEventListener('toggle', function (e) {
    if (e.target.open) el.querySelectorAll('.faq details').forEach(function (d) { if (d !== e.target) d.open = false; });
  }, true);
};
