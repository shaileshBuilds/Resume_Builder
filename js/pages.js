/* Page renderers for every route except Home (see home.js). Each takes a container element. */
(function () {
  var P = RC.pages, U = RC.ui, C = RC.content;
  var wrap = function (h) { return '<div class="wrap pg">' + h + '</div>'; };
  var go = function (p, l, k, i) { return U.button(l, { href: p, kind: k || 'btn-p', icon: i }); };

  P.templates = function (el) {
    var cat = { 'Executive Classic': 'Executive', 'Modern Sidebar': 'Modern', 'Creative Split': 'Creative', 'ATS Clean': 'ATS-friendly', 'Fresher Start': 'Fresher', 'Director Resume': 'Executive' };
    var tags = ['All', 'ATS-friendly', 'Modern', 'Creative', 'Fresher', 'Executive'];
    el.innerHTML = U.pageHeader('Templates', 'Preview layouts and pick a starting point. More designs are on the way.') +
      wrap('<div class="chips" role="group" aria-label="Filter templates">' + tags.map(function (t, i) { return '<button type="button" class="chip' + (i ? '' : ' on') + '" data-t="' + t + '">' + t + '</button>'; }).join('') + '</div><div class="grid g4" id="tg"></div>');
    function draw(t) { el.querySelector('#tg').innerHTML = C.templates.filter(function (x) { return t === 'All' || cat[x.n] === t; }).map(U.tcard).join(''); }
    draw('All');
    el.querySelector('.chips').addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      el.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('on', c === b); }); draw(b.dataset.t);
    });
  };

  P['resume-builder'] = function (el) {
    el.innerHTML = U.pageHeader('Resume Builder', 'Write once, change the design any time.') +
      wrap(U.empty('file-pen-line', 'The editor is not available yet', 'You will build and edit your resume here. For now, look through the templates to choose a direction.', go('templates', 'Browse templates', 'btn-p', 'layout-template') + go('dashboard', 'Go to dashboard', 'btn-o')));
  };
  P['cover-letter'] = function (el) {
    el.innerHTML = U.pageHeader('Cover Letter', 'Match your letter to your resume.') +
      wrap(U.empty('mail', 'Cover letters are coming soon', 'You will be able to write a letter that shares your resume\'s style.', go('resume-builder', 'Go to Resume Builder', 'btn-p')));
  };
  P['resume-examples'] = function (el) {
    el.innerHTML = U.pageHeader('Resume Examples', 'Pick a career to see how others present their work.') +
      wrap('<div class="grid g4">' + C.cats.map(function (c) { return '<button type="button" class="cat" data-c="' + c[1] + '"><i data-lucide="' + c[0] + '"></i>' + c[1] + '</button>'; }).join('') + '</div>');
    el.addEventListener('click', function (e) { var b = e.target.closest('[data-c]'); if (b) U.toast(b.dataset.c + ' examples are coming soon.'); });
  };
  P['career-tools'] = function (el) {
    var tools = [['scan-search', 'ATS Checker', 'See how software reads your resume.', 'ats-checker'], ['mail', 'Cover Letter', 'Write a matching letter.', 'cover-letter'], ['key-round', 'Keyword Finder', 'Spot missing keywords in a job post.'], ['pen-line', 'Summary Writer', 'Draft a clear professional summary.'], ['messages-square', 'Interview Prep', 'Practise common questions.']];
    el.innerHTML = U.pageHeader('Career Tools', 'Small helpers for the rest of your job search.') +
      wrap('<div class="grid g3">' + tools.map(function (t) {
        return '<div class="feat"><i data-lucide="' + t[0] + '"></i><h3>' + t[1] + '</h3><p>' + t[2] + '</p>' +
          (t[3] ? '<a class="btn btn-o" style="margin-top:16px" href="#/' + t[3] + '">Open</a>' : '<button type="button" class="btn btn-o" style="margin-top:16px" data-soon="' + t[1] + '">Coming soon</button>') + '</div>';
      }).join('') + '</div>');
    el.addEventListener('click', function (e) { var b = e.target.closest('[data-soon]'); if (b) U.toast(b.dataset.soon + ' is not available yet.'); });
  };
  P['ats-checker'] = function (el) {
    el.innerHTML = U.pageHeader('ATS Checker', 'Find out whether hiring software can read your resume.') +
      wrap(U.empty('scan-search', 'Nothing to check yet', 'Create a resume first. The checker will review it here.', go('resume-builder', 'Go to Resume Builder', 'btn-p')));
  };
  P.dashboard = function (el) {
    el.innerHTML = U.pageHeader('Dashboard', 'Your saved resumes appear here.') + wrap(U.loading('Loading your resumes…'));
    setTimeout(function () {
      if (!el.querySelector('.loading')) return;
      el.querySelector('.pg').innerHTML = U.empty('folder-open', 'No resumes yet', 'Resumes you create are saved in this browser. Start your first one.', go('resume-builder', 'Create a resume', 'btn-p', 'plus'));
      U.icons();
    }, 350);
  };
  P.pricing = function (el) {
    var plans = [['Free', '₹0', ['Browse all templates', 'One draft', 'Basic export'], 'Start free'], ['Pro', '₹499', ['Unlimited drafts', 'All templates', 'ATS checker', 'Cover letters'], 'Choose Pro', 1], ['Team', '₹999', ['Everything in Pro', 'Shared libraries', 'Priority support'], 'Choose Team']];
    el.innerHTML = U.pageHeader('Pricing', 'Sample pricing for preview. Billing is not connected yet.') +
      wrap('<div class="grid g3">' + plans.map(function (p) {
        return '<div class="plan' + (p[4] ? ' hot' : '') + '"><h3>' + p[0] + '</h3><div class="price">' + p[1] + '<small>/month</small></div><ul>' +
          p[2].map(function (x) { return '<li><i data-lucide="check"></i>' + x + '</li>'; }).join('') + '</ul><button type="button" class="btn ' + (p[4] ? 'btn-p' : 'btn-o') + '" data-plan="' + p[0] + '">' + p[3] + '</button></div>';
      }).join('') + '</div>');
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-plan]'); if (!b) return;
      b.dataset.plan === 'Free' ? (location.hash = '#/resume-builder') : U.toast('Billing is not available yet.');
    });
  };
  var prose = function (title, sub, secs) {
    return function (el) {
      el.innerHTML = U.pageHeader(title, sub) + wrap('<div class="prose">' + secs.map(function (s) { return '<h2>' + s[0] + '</h2><p>' + s[1] + '</p>'; }).join('') + '</div>');
    };
  };
  P.about = prose('About ResumeCraft Studio', 'We make resumes easier to write and easier to read.', [
    ['What we are building', 'A resume builder where your content and your design stay separate, so you can change the look without retyping anything.'],
    ['What we care about', 'Clear layouts, readable text and tools that respect your privacy. In this early version, everything stays in your browser.']]);
  P.privacy = prose('Privacy', 'Draft policy for the early preview.', [
    ['Your data', 'Resumes and settings are stored in your browser on your own device. We do not run accounts or servers for them yet.'],
    ['Third-party files', 'Fonts and icons load from external providers, which may see your IP address when they are fetched.'],
    ['Review needed', 'This text is a starting draft and should be reviewed before a public launch.']]);
  P.terms = prose('Terms', 'Draft terms for the early preview.', [
    ['Using the service', 'You are responsible for the accuracy of what you put in your resume.'],
    ['No guarantees', 'The preview is provided as is. We cannot guarantee interview or job outcomes.'],
    ['Review needed', 'This text is a starting draft and should be reviewed before a public launch.']]);
  P.faq = function (el) {
    el.innerHTML = U.pageHeader('Frequently asked questions', 'Quick answers about how ResumeCraft Studio works.') + wrap(RC.faqHtml()); RC.bindFaq(el);
  };

  function field(id, label, type, extra) {
    return '<div class="fld"><label for="' + id + '">' + label + '</label>' + (type === 'textarea' ? '<textarea id="' + id + '" rows="5" ' + (extra || '') + '></textarea>' : '<input id="' + id + '" type="' + type + '" ' + (extra || '') + '>') + '<small class="err" id="' + id + '-e"></small></div>';
  }
  function validate(form, rules) {
    var ok = true;
    rules.forEach(function (r) {
      var i = form.querySelector('#' + r[0]), e = form.querySelector('#' + r[0] + '-e'), v = i.value.trim(), m = '';
      if (!v) m = r[1]; else if (r[2] && !r[2].test(v)) m = r[3];
      e.textContent = m; i.setAttribute('aria-invalid', !!m); if (m) ok = false;
    });
    return ok;
  }
  var mail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  P.contact = function (el) {
    el.innerHTML = U.pageHeader('Contact', 'Questions or feedback? Write to us.') +
      wrap('<form class="card-form" novalidate>' + field('c-name', 'Name', 'text', 'autocomplete="name"') + field('c-mail', 'Email', 'email', 'autocomplete="email"') + field('c-msg', 'Message', 'textarea') + '<button class="btn btn-p" type="submit">Send message</button></form>');
    el.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (validate(e.target, [['c-name', 'Enter your name.'], ['c-mail', 'Enter your email.', mail, 'Enter a valid email.'], ['c-msg', 'Write a message.']]))
        U.modal({ title: 'Messages are not connected yet', body: '<p>Your message was not sent. Email delivery will be set up in a later version.</p>', actions: [{ label: 'Got it', kind: 'btn-p' }] });
    });
  };
  function auth(kind) {
    var reg = kind === 'register';
    return function (el) {
      el.innerHTML = U.pageHeader(reg ? 'Create an account' : 'Log in', reg ? 'Accounts are not available yet.' : 'Accounts are not available yet. Your resumes are saved in this browser.') +
        wrap('<form class="card-form" novalidate>' + (reg ? field('a-name', 'Full name', 'text', 'autocomplete="name"') : '') + field('a-mail', 'Email', 'email', 'autocomplete="email"') + field('a-pw', 'Password', 'password', 'autocomplete="' + (reg ? 'new' : 'current') + '-password"') +
          '<button class="btn btn-p" type="submit">' + (reg ? 'Create account' : 'Log in') + '</button><p class="alt">' + (reg ? 'Have an account? <a href="#/login">Log in</a>' : 'New here? <a href="#/register">Create an account</a>') + '</p></form>');
      el.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        var r = [['a-mail', 'Enter your email.', mail, 'Enter a valid email.'], ['a-pw', 'Enter a password.']]; if (reg) r.unshift(['a-name', 'Enter your name.']);
        if (validate(e.target, r)) U.modal({ title: 'Accounts are not available yet', body: '<p>Nothing was sent or saved. You can still build resumes without signing in.</p>', actions: [{ label: 'Continue to builder', kind: 'btn-p', value: 'go' }], onClose: function (v) { if (v === 'go') location.hash = '#/resume-builder'; } });
      });
    };
  }
  P.login = auth('login'); P.register = auth('register');

  P.settings = function (el) {
    var cur = document.documentElement.getAttribute('data-theme');
    el.innerHTML = U.pageHeader('Settings', 'Preferences are saved in this browser.') +
      wrap('<div class="card-form"><h2 style="font-size:1.1rem;margin-bottom:12px">Appearance</h2><div class="chips" id="th">' +
        ['light', 'dark'].map(function (t) { return '<button type="button" class="chip' + (t === cur ? ' on' : '') + '" data-th="' + t + '">' + t[0].toUpperCase() + t.slice(1) + '</button>'; }).join('') +
        '</div><h2 style="font-size:1.1rem;margin:28px 0 8px">Saved preferences</h2><p class="lead" style="margin-bottom:14px">Remove your saved theme choice. Your resumes are not affected.</p>' + U.button('Reset preferences', { kind: 'btn-d', attrs: 'id="reset"' }) + '</div>');
    el.querySelector('#th').addEventListener('click', function (e) {
      var b = e.target.closest('[data-th]'); if (!b) return; RC.setTheme(b.dataset.th);
      el.querySelectorAll('[data-th]').forEach(function (x) { x.classList.toggle('on', x === b); });
    });
    el.querySelector('#reset').addEventListener('click', function () {
      U.confirm({ title: 'Reset preferences?', text: 'Your saved theme choice will be removed.', ok: 'Reset', danger: true }).then(function (y) {
        if (!y) return; try { localStorage.removeItem('rc-theme'); } catch (e) {}
        U.toast('Preferences reset.', 'ok');
      });
    });
  };

  P.notFound = function (el) {
    el.innerHTML = '<div class="wrap pg nf"><div class="big">404</div>' + U.empty('compass', 'We can\'t find that page', 'The link may be broken or the page may have moved.', go('', 'Back to home', 'btn-p', 'home') + go('templates', 'Browse templates', 'btn-o')) + '</div>';
  };
})();
