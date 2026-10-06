/* Part 20: Pricing, About, Contact, FAQ, Privacy, Terms, Career Blog, Resume Tips and Interview Tips.
   No payments or accounts exist: pricing is informational only. All text is plain static content. */
(function () {
  var U = RC.ui, P = RC.pages, C = RC.content, M = RC.model, e = M.esc;
  var wrap = function (h) { return '<div class="wrap pg">' + h + '</div>'; };
  var cta = function (p, l, k, i) { return U.button(l, { href: p, kind: k || 'btn-p', icon: i }); };
  var UPDATED = '6 October 2026';

  /* ---------------- Pricing ---------------- */
  var PLANS = [
    { n: 'Free', price: '₹0', sub: 'Everything available today', f: ['50+ resume templates', 'Unlimited resumes in this browser', 'Visual editor with undo and autosave', 'Design controls and presets', 'PDF, print and HTML export', 'Cover letters and career tools', 'JSON backup and restore'], b: 'Start free' },
    { n: 'Pro', price: '₹499', sub: 'Planned, not yet available', f: ['Everything in Free', 'Sync resumes across devices', 'Version history in the cloud', 'Priority email support', 'Early access to new templates'], hot: 1, b: 'Not available yet' },
    { n: 'Business', price: '₹1,499', sub: 'Planned, not yet available', f: ['Everything in Pro', 'Shared team workspace', 'Custom branding and templates', 'Admin controls', 'Bulk export for career services'], b: 'Not available yet' }
  ];
  var ROWS = [['Templates and editor', 1, 1, 1], ['Export to PDF / print / HTML', 1, 1, 1], ['JSON backup and restore', 1, 1, 1], ['Cover letters and career tools', 1, 1, 1], ['Cloud sync across devices', 0, 2, 2], ['Priority support', 0, 2, 2], ['Team workspace and branding', 0, 0, 2]];
  var mark = function (v) { return v === 1 ? '<span class="pr-y"><i data-lucide="check"></i>Included</span>' : v === 2 ? '<span class="pr-p">Planned</span>' : '<span class="pr-n">&mdash;</span>'; };
  P.pricing = function (el) {
    el.innerHTML = U.pageHeader('Pricing', 'Simple plans. Today, everything that works is free.') + wrap(
      '<p class="banner"><i data-lucide="info"></i>No payments are taken on this site. Pro and Business are planned and cannot be bought yet. Planned prices may change.</p>' +
      '<div class="grid g3">' + PLANS.map(function (p) {
        return '<div class="plan' + (p.hot ? ' hot' : '') + '"><h3>' + p.n + '</h3><div class="price">' + p.price + '<small>/month</small></div><p class="pr-sub">' + p.sub + '</p><ul>' + p.f.map(function (x) { return '<li><i data-lucide="check"></i>' + x + '</li>'; }).join('') + '</ul>' +
          (p.n === 'Free' ? '<a class="btn btn-p" href="#/resume-builder">' + p.b + '</a>' : '<button type="button" class="btn btn-o" data-plan="' + p.n + '">' + p.b + '</button>') + '</div>';
      }).join('') + '</div>' +
      '<h2 class="pr-h">Compare plans</h2><div class="pr-tw"><table class="pr-t"><thead><tr><th scope="col">Feature</th><th scope="col">Free</th><th scope="col">Pro</th><th scope="col">Business</th></tr></thead><tbody>' +
      ROWS.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th><td>' + mark(r[1]) + '</td><td>' + mark(r[2]) + '</td><td>' + mark(r[3]) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div class="prose" style="margin-top:36px"><h2>Pricing questions</h2><p><b>Will my free resumes stay free?</b> Yes. What works today stays available on the Free plan.</p><p><b>Is any card or payment detail collected?</b> No. There is no checkout, and nothing on this site asks for payment information.</p><p><b>Where do I send feedback about plans?</b> Use the <a href="#/contact">contact page</a>.</p></div>');
    el.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-plan]'); if (!b) return;
      U.modal({ title: b.dataset.plan + ' is not available yet', body: '<p>Paid plans are still being planned, so there is nothing to buy and no payment is collected. Everything in the Free plan works today.</p>', actions: [{ label: 'Close', kind: 'btn-o' }, { label: 'Start free', kind: 'btn-p', value: 'go' }], onClose: function (v) { if (v === 'go') location.hash = '#/resume-builder'; } });
    });
  };

  /* ---------------- About / Contact / FAQ / Privacy / Terms ---------------- */
  var prose = function (title, sub, secs, extra) {
    return function (el) { el.innerHTML = U.pageHeader(title, sub) + wrap('<div class="prose">' + secs.map(function (s) { return '<h2>' + s[0] + '</h2>' + [].concat(s[1]).map(function (t) { return '<p>' + t + '</p>'; }).join(''); }).join('') + (extra || '') + '</div>'); };
  };
  P.about = function (el) {
    prose('About ResumeCraft Studio', 'We make resumes easier to write and easier to read.', [
      ['What we are building', 'A resume builder where your content and your design stay separate. Change the template, colours or layout at any time and nothing you typed is lost.'],
      ['What we care about', ['<b>Clarity.</b> Layouts that recruiters can skim in seconds.', '<b>Privacy.</b> Your resumes live in your browser. There are no accounts, and we do not upload your content.', '<b>Honesty.</b> Examples are clearly fictional, pricing is clearly labelled, and unfinished features say so.']],
      ['Where we are today', 'ResumeCraft Studio is an early preview. Templates, the visual editor, design controls, exports, cover letters and career tools all work now. Cloud sync and teams are planned but not built.']
    ])(el);
    el.querySelector('.prose').insertAdjacentHTML('beforeend', '<div class="cta-row" style="margin-top:28px">' + cta('resume-builder', 'Start your resume', 'btn-p', 'file-pen-line') + cta('resume-examples', 'See examples', 'btn-o') + '</div>'); U.icons();
  };
  var oldContact = P.contact;
  P.contact = function (el) {
    oldContact(el);
    el.querySelector('.pg').insertAdjacentHTML('beforeend', '<div class="prose" style="margin-top:32px"><h2>Before you write</h2><p>Messages are not delivered yet because email is not connected to this preview, so nothing you type here is sent or stored. For common answers, see the <a href="#/faq">FAQ</a>.</p><h2>Helpful details to include</h2><p>Your browser and device, what you were doing, and what you expected to happen. Please do not include passwords or private resume content.</p></div>');
  };
  var EXTRA_FAQ = [
    ['Do I need an account?', 'No. There are no accounts. Your resumes are saved in this browser on your device.'],
    ['How do I back up my resumes?', 'Open Settings and choose Export all resumes. You get a JSON file you can import later, on this or another browser.'],
    ['How do I download a PDF?', 'Open your resume in the editor, choose Export, then Download PDF. Your browser print window opens; choose Save as PDF so the text stays selectable.'],
    ['What happens if I clear my browser data?', 'Resumes saved in this browser are removed with it. Export a backup from Settings first.'],
    ['Is the payment or pricing page real?', 'Pricing shows planned plans only. No payments are taken and nothing can be bought yet.'],
    ['Are the example resumes real people?', 'No. Every example uses made-up names, employers and contact details.']
  ];
  var oldFaq = P.faq;
  P.faq = function (el) { var base = C.faq; C.faq = base.concat(EXTRA_FAQ); try { oldFaq(el); } finally { C.faq = base; } };
  P.privacy = prose('Privacy', 'Last updated ' + UPDATED + '. Draft policy for the early preview.', [
    ['The short version', 'Your resumes stay in your browser. We do not run accounts, and ResumeCraft Studio does not send your resume content to a server.'],
    ['What is stored on your device', 'Resumes, cover letters, saved versions, your settings and your theme are saved in your browser’s local storage. You can export or erase all of it from <a href="#/settings">Settings</a>.'],
    ['Outside services', 'Fonts and icons load from third-party providers, which can see your IP address and browser details when they are fetched. If you connect an external writing assistant in a tool that offers one, the text you send goes to that provider under its own policy.'],
    ['Contact form and accounts', 'The contact, login and register forms are not connected, so nothing you type in them is sent or saved.'],
    ['Your choices', 'You can clear any stored item, export your data, or reset preferences at any time in Settings. Clearing browser data also removes it.'],
    ['Review needed', 'This is a starting draft. It should be reviewed by a qualified person before any public launch.']
  ]);
  P.terms = prose('Terms of use', 'Last updated ' + UPDATED + '. Draft terms for the early preview.', [
    ['Using the service', 'You may use ResumeCraft Studio to create and export your own resumes and letters. You are responsible for the accuracy of what you write.'],
    ['Your content', 'Your content belongs to you and stays on your device. Example resumes are fictional and provided for learning; replace every detail before you use one.'],
    ['Backups', 'Data is stored in your browser and can be lost if you clear it or lose the device. Export backups from Settings regularly.'],
    ['No guarantees', 'The preview is provided as is. We cannot guarantee interviews, job offers or that every employer system will read every file the same way.'],
    ['Plans and pricing', 'Paid plans are not available and no payments are collected. Planned plans and prices may change or never launch.'],
    ['Review needed', 'This is a starting draft and should be reviewed by a qualified person before any public launch.']
  ]);

  /* ---------------- Career Blog ---------------- */
  var POSTS = [
    { s: 'one-page-or-two', t: 'One page or two? How long your resume should be', c: 'Resume', d: '2 October 2026', m: 4, x: 'A simple rule for deciding, based on how many years of relevant work you have.', b: [
      ['Start with relevance, not length', 'Recruiters spend seconds on a first pass. Every line should help them decide to read the next one. If a line does not support the job you are applying for, it is a candidate for removal.'],
      ['A practical rule', 'Under ten years of experience: aim for one page. Ten years or more, or a field such as academia where publications matter: two pages is normal. Never fill a second page with filler to look senior.'],
      ['How to shorten', 'Cut older roles to a single line, merge similar jobs, drop skills everyone assumes, and turn paragraphs into two or three achievement bullets. Then check the page still reads easily, not cramped.']] },
    { s: 'achievements-not-duties', t: 'Write achievements, not job duties', c: 'Resume', d: '28 September 2026', m: 5, x: 'Turn “responsible for” into evidence a hiring manager can picture.', b: [
      ['Why duties fall flat', '“Responsible for customer emails” describes the job, not you. Anyone in the role could have the same line.'],
      ['A simple formula', 'Start with a strong verb, say what you did, then show the result: “Cut average reply time from 9 hours to 3 by writing reusable answers.” If you have no number, describe the scale or the outcome instead.'],
      ['Where to find numbers', 'Look at volumes, time saved, money handled, people trained, scores and deadlines met. A rough, honest estimate is better than none; never invent figures.']] },
    { s: 'first-resume-no-experience', t: 'Your first resume with no work experience', c: 'Fresher', d: '21 September 2026', m: 5, x: 'Projects, internships, volunteering and coursework can carry a first resume.', b: [
      ['Lead with what you have', 'Put education first, then projects, internships, volunteering and any leadership. Treat a college project like a job: say what you built, with what, and what happened.'],
      ['Show skills with proof', 'Instead of listing “good communicator”, mention the society you ran or the talk you gave. Tools and software you actually used belong in a short skills section.'],
      ['Keep it honest and tidy', 'One page, a clear template, a professional email address and no photo unless the employer asks. Ask a teacher or friend to proofread it.']] },
    { s: 'beat-the-ats', t: 'How applicant tracking systems read your resume', c: 'ATS', d: '14 September 2026', m: 4, x: 'What parsing software can and cannot handle, and how to avoid common traps.', b: [
      ['What an ATS does', 'Many employers store applications in software that extracts your text into fields and lets recruiters search it. Clear structure helps that extraction work.'],
      ['Common traps', 'Text inside images, unusual section names, tables that scramble order, and icons used instead of words. Use standard headings such as Experience, Education and Skills.'],
      ['Keywords without stuffing', 'Mirror the language of the job post where it is true for you, and include the full name of tools once. Repeating a word dozens of times does not help and reads badly to people.']] },
    { s: 'career-change', t: 'Changing careers: framing your past for a new role', c: 'Career', d: '7 September 2026', m: 5, x: 'How to keep a switch from looking like a gap in your story.', b: [
      ['Find the bridge', 'List the skills your last job shares with the new one: handling customers, analysing data, managing deadlines. Those become the top of your summary.'],
      ['Reorder, do not hide', 'Put a skills or projects section above older, unrelated roles and keep job titles accurate. A short summary can explain the move in one sentence.'],
      ['Prove the new direction', 'A course, a small project or volunteer work in the new field shows commitment more than a statement of interest.']] },
    { s: 'follow-up-after-applying', t: 'Following up after you apply', c: 'Job search', d: '30 August 2026', m: 3, x: 'When and how to send a polite follow-up that helps rather than annoys.', b: [
      ['Wait the right amount', 'If the post gives a timeline, wait until it passes. Otherwise a week to ten days is reasonable for a first follow-up.'],
      ['Keep it short', 'Mention the role, say you remain interested, add one new relevant detail, and ask if they need anything more. Three or four sentences is enough.'],
      ['Know when to stop', 'One follow-up, and at most one more after a couple of weeks. Then spend your energy on the next application.']] }
  ];
  function postId() { var m = /[?&]a=([^&]+)/.exec(location.hash); return m ? decodeURIComponent(m[1]) : ''; }
  P['career-blog'] = function (el) {
    var id = postId(), p = id && POSTS.filter(function (x) { return x.s === id; })[0];
    if (id && !p) { el.innerHTML = U.pageHeader('Career Blog', '') + wrap(U.empty('search-x', 'We can\'t find that article', 'It may have moved.', cta('career-blog', 'All articles'))); U.icons(); return; }
    if (p) {
      el.innerHTML = U.pageHeader(p.t, p.c + ' · ' + p.d + ' · ' + p.m + ' min read') + wrap('<p style="margin-bottom:12px"><a class="btn btn-g btn-sm" href="#/career-blog"><i data-lucide="arrow-left"></i>All articles</a></p><article class="prose bl-art">' + p.b.map(function (s) { return '<h2>' + e(s[0]) + '</h2><p>' + e(s[1]) + '</p>'; }).join('') +
        '<div class="cta-row" style="margin-top:28px">' + cta('resume-builder', 'Build your resume', 'btn-p', 'file-pen-line') + cta('resume-tips', 'More resume tips', 'btn-o') + '</div></article>'); U.icons(); return;
    }
    el.innerHTML = U.pageHeader('Career Blog', 'Practical, plain-language advice for your job search.') + wrap('<div class="grid g3">' + POSTS.map(function (x) {
      return '<a class="bl-c" href="#/career-blog?a=' + x.s + '"><span class="bl-t">' + x.c + '</span><h3>' + e(x.t) + '</h3><p>' + e(x.x) + '</p><small>' + x.d + ' · ' + x.m + ' min read</small></a>';
    }).join('') + '</div>');
  };

  /* ---------------- Resume Tips ---------------- */
  var RT = [
    ['Content', 'file-text', [['Tailor to each job', 'Reorder bullets and adjust your summary so the most relevant evidence comes first for every application.'], ['Lead with results', 'Say what changed because of you: time saved, revenue, quality, scale. Use real numbers you can explain.'], ['Start bullets with strong verbs', 'Built, led, reduced, launched, trained. Avoid “responsible for” and “worked on”.'], ['Keep the summary short', 'Two to four sentences: who you are, your strongest proof, and the role you want.']]],
    ['Formatting', 'layout-template', [['Use one clean template', 'Plenty of white space, one or two fonts, and consistent dates and spacing everywhere.'], ['Choose readable sizes', 'Body text between 10 and 12 pt, headings clearly larger, and margins of at least 10 mm.'], ['Keep to one or two pages', 'Cut older or unrelated detail rather than shrinking the font.'], ['Export to PDF', 'A PDF keeps layout stable. Save it with a clear name such as your-name-role.pdf.']]],
    ['ATS and keywords', 'scan-search', [['Use standard headings', 'Experience, Education, Skills and Projects are understood by almost every system.'], ['Match the job language', 'Use the exact terms from the job post when they truly describe you, including tool names.'], ['Avoid text in images', 'Logos, icons and charts as pictures cannot be read by parsers. Keep key facts as real text.'], ['Spell out abbreviations once', 'Write “Search Engine Optimisation (SEO)” the first time so both forms are searchable.']]],
    ['Before you send', 'check-circle-2', [['Proofread twice', 'Read it aloud, then have someone else read it. Check names, dates and contact details.'], ['Check your links', 'Make sure every link opens and points to current work.'], ['Use a professional email', 'A simple name-based address looks credible and is easy to type.'], ['Save a master copy', 'Keep one complete resume and make shorter tailored copies from it.']]]
  ];
  P['resume-tips'] = function (el) {
    el.innerHTML = U.pageHeader('Resume Tips', 'Clear habits that make a resume easier to read and easier to trust.') + wrap(RT.map(function (g) {
      return '<section class="tp-g"><h2><i data-lucide="' + g[1] + '"></i>' + g[0] + '</h2><div class="grid g2">' + g[2].map(function (t) { return '<div class="tp-c"><h3>' + t[0] + '</h3><p>' + t[1] + '</p></div>'; }).join('') + '</div></section>';
    }).join('') + '<div class="cta-row" style="margin-top:12px">' + cta('resume-builder', 'Start a resume', 'btn-p', 'file-pen-line') + cta('ats-checker', 'Run the ATS checker', 'btn-o', 'scan-search') + cta('interview-tips', 'Interview tips', 'btn-g') + '</div>');
  };

  /* ---------------- Interview Tips ---------------- */
  var IT = [
    ['Before', 'calendar-check', [['Research the company', 'Read the site and recent news. Know what they sell, who they serve and what the team does.'], ['Match your stories to the role', 'Pick three or four examples from your resume that show the skills in the job post.'], ['Prepare questions', 'Ask about the first 90 days, how success is measured and how the team works together.'], ['Test your setup', 'For video calls, check camera, sound, lighting and your internet 15 minutes early. For in-person, plan the route and arrive early.']]],
    ['During', 'message-circle', [['Answer with structure', 'Use situation, task, action, result (STAR). Keep most answers under two minutes.'], ['Be specific', 'Name the tool, the number or the outcome. Concrete detail is more convincing than adjectives.'], ['Listen and clarify', 'If a question is unclear, ask. Take a moment to think; a short pause is fine.'], ['Be honest about gaps', 'Say what you do not know yet and how you would learn it.']]],
    ['After', 'mail-check', [['Send a thank-you note', 'Within a day, thank them, mention one thing you enjoyed discussing, and restate your interest.'], ['Write notes', 'Record questions asked and what you would answer differently. It helps your next interview.'], ['Follow up politely', 'If you hear nothing by the promised date, one short check-in is appropriate.']]]
  ];
  var QS = [
    ['Tell me about yourself.', 'They want a short, relevant story.', 'Give present, past, future in under a minute: your current focus, one or two proof points, and why this role.'],
    ['Why do you want this job?', 'They are testing interest and fit.', 'Connect something specific about the company or role to what you do well and want to grow in.'],
    ['What is your biggest strength?', 'They want a relevant skill with evidence.', 'Pick one strength the job needs and back it with a short example and result.'],
    ['What is a weakness of yours?', 'They are checking self-awareness.', 'Name a real, non-critical weakness, then show what you are doing about it and the progress so far.'],
    ['Describe a time you faced a problem at work or college.', 'They want to see how you act under pressure.', 'Use STAR. Spend most of the time on your actions and what you learned.'],
    ['Tell me about a time you disagreed with someone.', 'They are looking at how you handle conflict.', 'Show that you listened, kept it respectful and moved to a shared goal.'],
    ['Where do you see yourself in five years?', 'They want ambition that fits the role.', 'Talk about skills you want to build and the kind of responsibility you hope to earn, without naming rivals’ jobs.'],
    ['Do you have any questions for us?', 'They are measuring curiosity.', 'Always have two or three ready, such as how success is measured in the first six months.']
  ];
  P['interview-tips'] = function (el) {
    el.innerHTML = U.pageHeader('Interview Tips', 'Prepare once, then walk in calm and clear.') + wrap(IT.map(function (g) {
      return '<section class="tp-g"><h2><i data-lucide="' + g[1] + '"></i>' + g[0] + ' the interview</h2><div class="grid g2">' + g[2].map(function (t) { return '<div class="tp-c"><h3>' + t[0] + '</h3><p>' + t[1] + '</p></div>'; }).join('') + '</div></section>';
    }).join('') + '<section class="tp-g"><h2><i data-lucide="help-circle"></i>Common questions and how to answer them</h2><div class="tp-q">' + QS.map(function (q) {
      return '<details><summary>' + e(q[0]) + '</summary><p><b>What they are really asking:</b> ' + e(q[1]) + '</p><p><b>How to answer:</b> ' + e(q[2]) + '</p></details>';
    }).join('') + '</div></section><div class="cta-row" style="margin-top:12px">' + cta('resume-tips', 'Resume tips', 'btn-o') + cta('cover-letter', 'Write a cover letter', 'btn-p', 'mail') + '</div>');
  };
})();
