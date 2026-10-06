/* Part 20: Resume Examples. 12 fictional example resumes (all people, employers and contact details are made up).
   List view: #/resume-examples   Detail view: #/resume-examples?r=<slug>   "Use This Example" copies one into the store. */
(function () {
  var U = RC.ui, M = RC.model, S = RC.store, P = RC.pages, e = M.esc;
  var LEVELS = ['Fresher', 'Entry level', 'Mid level', 'Senior'];
  var SEC = { summary: 'Summary', experience: 'Experience', education: 'Education', skills: 'Skills', projects: 'Projects', certifications: 'Certifications', languages: 'Languages', awards: 'Achievements', volunteer: 'Volunteer', publications: 'Publications', customSections: 'Custom' };

  /* X(): compact builder. exp rows: [company, position, location, start, end('' = current), [bullets]]; edu rows: [school, degree, field, start, end, note] */
  function X(name, title, loc, summary, exp, edu, skills, extra) {
    var first = name.split(' ')[0].toLowerCase(), last = name.split(' ').pop().toLowerCase();
    var d = {
      personalInfo: { fullName: name, jobTitle: title, email: first + '.' + last + '@example.com', phone: '+91 90000 0' + (10000 + name.length * 137 % 89999), location: loc, website: '', linkedin: 'linkedin.com/in/' + first + '-' + last + '-example', github: '' },
      summary: summary,
      experience: exp.map(function (x) { return { company: x[0], position: x[1], location: x[2], startDate: x[3], endDate: x[4], current: !x[4], description: '', achievements: x[5] }; }),
      education: edu.map(function (x) { return { institution: x[0], degree: x[1], field: x[2], startDate: x[3], endDate: x[4], description: x[5] || '' }; }),
      skills: skills
    };
    Object.keys(extra || {}).forEach(function (k) { d[k] = extra[k]; });
    return d;
  }
  var pr = function (n, d, t) { return { name: n, description: d, technologies: t, link: '' }; };
  var cert = function (n, i, d) { return { name: n, issuer: i, date: d, credentialUrl: '' }; };

  var EX = [
    { s: 'fresher', role: 'Fresher (First Job)', level: 'Fresher', icon: 'graduation-cap', tpl: 'fresher-start',
      sections: ['summary', 'education', 'projects', 'skills', 'certifications', 'volunteer', 'languages'],
      tip: 'With no job history, lead with education and projects. Name what you built, the tools you used and a result.',
      d: X('Ananya Rao', 'Management Trainee', 'Lucknow, Uttar Pradesh', 'Commerce graduate with strong Excel and presentation skills. Ran a college fundraiser that raised ₹1.2 lakh and completed a 2-month internship in operations. Looking for a trainee role in business operations.',
        [['Gomti Traders (sample)', 'Operations Intern', 'Lucknow', '2026-05', '2026-07', ['Tracked daily stock for 300+ items in Excel and cut counting errors by 20%', 'Prepared weekly sales summaries for the owner', 'Helped onboard 4 new delivery partners']]],
        [['University of Lucknow (sample)', 'B.Com', 'Accounting and Finance', '2023', '2026', 'First class, 78%. Treasurer of the Commerce Society.']],
        ['Microsoft Excel:Advanced:Tools', 'Data entry:Advanced:Tools', 'PowerPoint:Intermediate:Tools', 'Communication:Advanced:Soft skills', 'Teamwork:Advanced:Soft skills', 'Tally Prime:Intermediate:Tools'],
        { projects: [pr('Campus Fundraiser', 'Planned and ran a 3-day charity drive with a team of 12 volunteers.', ['Budgeting', 'Event planning']), pr('Price Survey', 'Compared prices at 40 local shops and presented findings to faculty.', ['Excel', 'Surveys'])],
          certifications: [cert('Excel for Business', 'Online Learning Hub (sample)', '2025-11')], languages: [{ name: 'Hindi', proficiency: 'Native' }, { name: 'English', proficiency: 'Professional' }],
          volunteer: [{ organization: 'Kitaab Dost (sample NGO)', role: 'Reading volunteer', startDate: '2024', endDate: '', description: 'Weekend reading sessions for primary school children.' }] }) },
    { s: 'software-developer', role: 'Software Developer', level: 'Senior', icon: 'code-2', tpl: 'software-engineer',
      sections: ['summary', 'experience', 'skills', 'projects', 'education', 'certifications', 'awards'],
      tip: 'Show scale and impact: users, latency, uptime, cost saved. Group skills by language, framework and tooling.',
      d: X('Rohan Mehta', 'Senior Backend Developer', 'Bengaluru, Karnataka', 'Backend developer with 8 years of experience building payment and logistics services in Java and Node.js. Reduced API latency by 45% at scale and mentors a team of 5 engineers.',
        [['Zenith Logistics (sample)', 'Senior Backend Developer', 'Bengaluru', '2021-03', '', ['Redesigned the order service, cutting p95 latency from 820 ms to 450 ms', 'Led migration of 14 services to Kubernetes with zero downtime', 'Mentor 5 engineers through code review and design docs']], ['PayLoop (sample)', 'Software Developer', 'Pune', '2017-08', '2021-02', ['Built the settlement engine processing 2M transactions a day', 'Raised unit test coverage from 41% to 82%']]],
        [['VIT Vellore (sample)', 'B.Tech', 'Computer Science', '2013', '2017', '']],
        ['Java:Expert:Languages', 'Node.js:Advanced:Languages', 'PostgreSQL:Advanced:Data', 'Kafka:Advanced:Data', 'Docker & Kubernetes:Advanced:Tooling', 'System design:Advanced:Practices', 'AWS:Intermediate:Cloud'],
        { projects: [pr('RateGuard', 'Open-source rate limiter used by 300+ teams.', ['Go', 'Redis'])], certifications: [cert('AWS Solutions Architect Associate', 'Cloud Academy (sample)', '2024-01')], awards: [{ title: 'Engineer of the Year', issuer: 'Zenith Logistics', date: '2024', description: 'For the order service redesign.' }] }) },
    { s: 'web-developer', role: 'Web Developer', level: 'Entry level', icon: 'globe', tpl: 'modern-sidebar',
      sections: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
      tip: 'Link to live work. Mention performance, accessibility and the devices you tested on.',
      d: X('Meera Nair', 'Web Developer', 'Kochi, Kerala', 'Web developer with 2 years of experience building responsive sites for small businesses. Focus on accessible HTML, fast pages and clear handoff to clients.',
        [['Backwater Digital (sample)', 'Web Developer', 'Kochi', '2024-06', '', ['Delivered 18 client websites with an average Lighthouse score of 94', 'Moved 6 sites to a headless CMS so owners can edit content themselves', 'Fixed keyboard and screen-reader issues across the agency template']]],
        [['Cochin University (sample)', 'B.Sc', 'Computer Science', '2020', '2023', '']],
        ['HTML & CSS:Expert:Frontend', 'JavaScript:Advanced:Frontend', 'React:Intermediate:Frontend', 'WordPress:Advanced:CMS', 'Figma handoff:Intermediate:Design', 'Accessibility (WCAG):Advanced:Practices'],
        { projects: [pr('Spice Route Bakery', 'Ordering site with a menu, cart and WhatsApp checkout.', ['React', 'Netlify']), pr('Portfolio Kit', 'Reusable portfolio template for students.', ['HTML', 'CSS'])], certifications: [cert('Responsive Web Design', 'Open Web Academy (sample)', '2023-09')] }) },
    { s: 'it-support', role: 'IT Support', level: 'Entry level', icon: 'headset', tpl: 'it-specialist',
      sections: ['summary', 'skills', 'experience', 'certifications', 'education'],
      tip: 'Quote ticket volumes, response times and satisfaction scores. List the systems and tools you support.',
      d: X('Imran Qureshi', 'IT Support Engineer', 'Hyderabad, Telangana', 'IT support engineer with 3 years of experience supporting 400+ users across Windows, Microsoft 365 and office networks. Resolves most tickets within the first call.',
        [['Charminar Health Group (sample)', 'IT Support Engineer', 'Hyderabad', '2023-02', '', ['Resolve 35 tickets a week with a 96% satisfaction score', 'Set up 120 laptops with a repeatable imaging process, saving 2 hours per device', 'Wrote 25 help articles that reduced repeat tickets by 30%']], ['NetPoint Services (sample)', 'Helpdesk Technician', 'Hyderabad', '2021-06', '2023-01', ['Handled first-line calls for 6 client offices', 'Reset accounts and permissions in Active Directory']]],
        [['Osmania University (sample)', 'B.Sc', 'Electronics', '2018', '2021', '']],
        ['Windows & macOS:Advanced:Systems', 'Microsoft 365 admin:Advanced:Systems', 'Active Directory:Intermediate:Systems', 'Networking basics:Intermediate:Network', 'Ticketing (Jira Service):Advanced:Tools', 'Customer service:Advanced:Soft skills'],
        { certifications: [cert('CompTIA A+', 'CompTIA (sample listing)', '2022-04'), cert('Microsoft 365 Fundamentals', 'Microsoft (sample listing)', '2023-08')] }) },
    { s: 'data-analyst', role: 'Data Analyst', level: 'Mid level', icon: 'bar-chart-3', tpl: 'data-professional',
      sections: ['summary', 'experience', 'skills', 'projects', 'education', 'certifications'],
      tip: 'Pair each analysis with the business decision it changed. Name the tools and the size of the data.',
      d: X('Kavya Iyer', 'Data Analyst', 'Chennai, Tamil Nadu', 'Data analyst with 4 years of experience turning sales and customer data into clear dashboards. Uses SQL, Python and Power BI to help teams decide what to fix first.',
        [['Marina Retail (sample)', 'Data Analyst', 'Chennai', '2022-05', '', ['Built a weekly sales dashboard used by 40 store managers', 'Found a pricing gap that lifted margin by 3.5% on 120 products', 'Automated 6 manual reports, saving 15 hours a week']], ['Insight Labs (sample)', 'Junior Analyst', 'Chennai', '2020-07', '2022-04', ['Cleaned and joined data from 5 sources for client reports', 'Ran A/B test analysis for 8 campaigns']]],
        [['Anna University (sample)', 'B.E.', 'Statistics and Computing', '2016', '2020', '']],
        ['SQL:Expert:Data', 'Python (pandas):Advanced:Data', 'Power BI:Advanced:Visualisation', 'Excel:Expert:Visualisation', 'A/B testing:Advanced:Methods', 'Storytelling with data:Advanced:Soft skills'],
        { projects: [pr('Churn Early Warning', 'Model that flags customers likely to leave, with 78% recall.', ['Python', 'scikit-learn'])], certifications: [cert('Data Analytics Professional', 'Open Analytics Institute (sample)', '2022-02')] }) },
    { s: 'designer', role: 'Designer (UI/UX)', level: 'Mid level', icon: 'palette', tpl: 'designer-edge',
      sections: ['summary', 'projects', 'experience', 'skills', 'education', 'awards'],
      tip: 'Put your best case studies first. For each, state the problem, your role and a measurable outcome.',
      d: X('Aditi Kapoor', 'Product Designer', 'Mumbai, Maharashtra', 'Product designer with 5 years of experience shaping mobile apps for fintech and health. Works from research to polished handoff and measures success by task completion.',
        [['Finch Money (sample)', 'Product Designer', 'Mumbai', '2022-01', '', ['Redesigned onboarding, lifting sign-up completion from 54% to 71%', 'Built a design system of 60 components used by 4 squads', 'Ran 25 usability sessions that shaped the 2024 roadmap']], ['Studio Nine (sample)', 'UI Designer', 'Mumbai', '2019-06', '2021-12', ['Designed 12 websites and 3 apps for small brands', 'Worked directly with clients through review rounds']]],
        [['National Institute of Design (sample)', 'B.Des', 'Interaction Design', '2015', '2019', '']],
        ['Figma:Expert:Tools', 'Prototyping:Advanced:Tools', 'User research:Advanced:Methods', 'Design systems:Advanced:Methods', 'Information architecture:Advanced:Methods', 'Accessibility:Intermediate:Practices'],
        { projects: [pr('Onboarding Redesign', 'Case study: simplifying KYC for first-time investors.', ['Research', 'Figma']), pr('Pill Reminder App', 'Personal project for elderly users with large type and voice prompts.', ['Figma', 'Usability testing'])], awards: [{ title: 'Best Mobile UX (sample award)', issuer: 'Design Forum India', date: '2023', description: 'For the onboarding redesign.' }] }) },
    { s: 'marketing', role: 'Digital Marketing', level: 'Mid level', icon: 'megaphone', tpl: 'contemporary-pro',
      sections: ['summary', 'experience', 'skills', 'projects', 'certifications', 'education'],
      tip: 'Use numbers from campaigns: reach, cost per lead, conversion and revenue. Say which channels you owned.',
      d: X('Karan Malhotra', 'Digital Marketing Manager', 'Gurugram, Haryana', 'Digital marketer with 6 years of experience in paid search, email and content for consumer brands. Cut cost per lead by 38% while growing monthly leads to 4,500.',
        [['Urban Nest Furniture (sample)', 'Digital Marketing Manager', 'Gurugram', '2022-02', '', ['Manage a ₹18 lakh monthly ad budget across search and social', 'Reduced cost per lead from ₹420 to ₹260 in 6 months', 'Built an email programme with a 34% open rate']], ['BrightPath Media (sample)', 'Marketing Executive', 'Delhi', '2019-08', '2022-01', ['Wrote and scheduled content for 9 brand accounts', 'Grew a client Instagram audience from 8k to 41k']]],
        [['Delhi University (sample)', 'BBA', 'Marketing', '2015', '2018', '']],
        ['Google Ads:Expert:Channels', 'Meta Ads:Advanced:Channels', 'Email marketing:Advanced:Channels', 'SEO basics:Advanced:Channels', 'Google Analytics 4:Advanced:Analytics', 'Copywriting:Advanced:Content'],
        { certifications: [cert('Google Ads Search', 'Google Skillshop (sample listing)', '2023-03')], projects: [pr('Festive Sale Campaign', 'Multi-channel campaign that delivered 3.2x return on ad spend.', ['Google Ads', 'Email'])] }) },
    { s: 'sales', role: 'Sales', level: 'Mid level', icon: 'handshake', tpl: 'professional-prime',
      sections: ['summary', 'experience', 'awards', 'skills', 'education', 'certifications'],
      tip: 'Lead with quota attainment and revenue. Mention deal size, sales cycle and the customers you served.',
      d: X('Neha Gupta', 'Senior Sales Executive', 'Jaipur, Rajasthan', 'B2B sales professional with 6 years of experience selling software to small and mid-size businesses. Consistently above 110% of quota and trusted for long-term accounts.',
        [['CloudLedger (sample)', 'Senior Sales Executive', 'Jaipur', '2021-04', '', ['Closed ₹2.4 crore in annual contract value, 118% of quota', 'Shortened the average sales cycle from 45 to 32 days', 'Trained 6 new hires on discovery calls']], ['RetailBridge (sample)', 'Sales Executive', 'Jaipur', '2018-06', '2021-03', ['Opened 70 new accounts in two years', 'Kept customer renewals at 92%']]],
        [['Rajasthan University (sample)', 'MBA', 'Marketing', '2016', '2018', '']],
        ['Consultative selling:Expert:Sales', 'Pipeline management:Advanced:Sales', 'CRM (HubSpot):Advanced:Tools', 'Negotiation:Advanced:Sales', 'Presentations:Advanced:Soft skills', 'Account planning:Advanced:Sales'],
        { awards: [{ title: 'Top Performer, North Region', issuer: 'CloudLedger', date: '2024', description: '118% of annual quota.' }] }) },
    { s: 'finance', role: 'Finance', level: 'Mid level', icon: 'landmark', tpl: 'corporate-minimal',
      sections: ['summary', 'experience', 'skills', 'education', 'certifications', 'awards'],
      tip: 'Show the size of what you managed: budgets, portfolios, closes. Name your tools and standards.',
      d: X('Vikram Joshi', 'Financial Analyst', 'Ahmedabad, Gujarat', 'Financial analyst with 5 years of experience in budgeting, forecasting and month-end reporting for a manufacturing group. Improves forecast accuracy and speeds up the close.',
        [['Sabarmati Industries (sample)', 'Financial Analyst', 'Ahmedabad', '2021-09', '', ['Own the ₹85 crore annual budget model for 3 plants', 'Improved forecast accuracy from 88% to 95%', 'Cut month-end close from 9 days to 6']], ['Mehta & Co. (sample)', 'Audit Associate', 'Ahmedabad', '2019-07', '2021-08', ['Audited 20+ client accounts', 'Flagged ₹40 lakh in misposted expenses']]],
        [['Gujarat University (sample)', 'M.Com', 'Finance', '2017', '2019', ''], ['Institute of Chartered Accountants of India (sample)', 'CA Intermediate', 'Accounting', '2016', '2019', '']],
        ['Financial modelling:Expert:Analysis', 'Excel & VBA:Expert:Tools', 'Budgeting & forecasting:Advanced:Analysis', 'SAP FICO:Intermediate:Tools', 'Variance analysis:Advanced:Analysis', 'Ind AS / IFRS:Intermediate:Standards'],
        { certifications: [cert('Financial Modeling Professional', 'Finance Institute (sample)', '2022-10')] }) },
    { s: 'hr', role: 'Human Resources', level: 'Mid level', icon: 'users', tpl: 'ats-professional',
      sections: ['summary', 'experience', 'skills', 'education', 'certifications', 'volunteer'],
      tip: 'Show hiring volume, time to hire and retention. Mention the policies and systems you ran.',
      d: X('Pooja Deshmukh', 'HR Business Partner', 'Nagpur, Maharashtra', 'HR professional with 7 years of experience in hiring, onboarding and employee relations for a 600-person company. Focused on fair processes and fast, friendly hiring.',
        [['Orange City Foods (sample)', 'HR Business Partner', 'Nagpur', '2020-10', '', ['Hired 140 people in 2024, with time to hire down from 41 to 28 days', 'Rolled out a structured onboarding plan; 90-day attrition fell from 14% to 6%', 'Resolved 50+ employee cases with documented outcomes']], ['Talent Bridge Staffing (sample)', 'Recruiter', 'Nagpur', '2018-05', '2020-09', ['Placed 85 candidates across sales and operations', 'Built a screening checklist adopted by the team']]],
        [['Nagpur University (sample)', 'MBA', 'Human Resources', '2016', '2018', '']],
        ['Talent acquisition:Expert:Hiring', 'Onboarding:Advanced:Employee experience', 'Employee relations:Advanced:Employee experience', 'HRIS (Zoho People):Advanced:Tools', 'Labour law basics:Intermediate:Compliance', 'Interviewing:Advanced:Hiring'],
        { certifications: [cert('SHRM-style HR Practitioner (sample)', 'HR Learning Council (sample)', '2021-06')], volunteer: [{ organization: 'Skill Saathi (sample NGO)', role: 'Interview coach', startDate: '2021', endDate: '', description: 'Mock interviews for first-generation graduates.' }] }) },
    { s: 'teacher', role: 'Teacher', level: 'Mid level', icon: 'book-open', tpl: 'academic-classic',
      sections: ['summary', 'education', 'experience', 'certifications', 'skills', 'awards', 'volunteer'],
      tip: 'Show student outcomes, the classes and boards you taught, and any extra roles like mentoring or clubs.',
      d: X('Sunita Verma', 'Mathematics Teacher (Grades 8–10)', 'Bhopal, Madhya Pradesh', 'Mathematics teacher with 9 years of experience teaching CBSE grades 8 to 10. Known for clear explanations, activity-based lessons and steady board-exam results.',
        [['Narmada Public School (sample)', 'Mathematics Teacher', 'Bhopal', '2018-04', '', ['Grade 10 average rose from 71% to 82% over four years', 'Started a weekly maths club with 60 members', 'Coordinate the school Olympiad team']], ['Sunrise Academy (sample)', 'Assistant Teacher', 'Bhopal', '2015-07', '2018-03', ['Taught grades 6 to 8 and prepared practice papers', 'Mentored 25 students through scholarship exams']]],
        [['Barkatullah University (sample)', 'B.Ed', 'Mathematics Education', '2014', '2015', ''], ['Barkatullah University (sample)', 'M.Sc', 'Mathematics', '2012', '2014', '']],
        ['Lesson planning:Expert:Teaching', 'Classroom management:Advanced:Teaching', 'Activity-based learning:Advanced:Teaching', 'Google Classroom:Advanced:Tools', 'Assessment design:Advanced:Teaching', 'Parent communication:Advanced:Soft skills'],
        { certifications: [cert('CTET Paper II (sample listing)', 'CBSE (sample)', '2015-03')], awards: [{ title: 'Best Teacher Award (sample)', issuer: 'Narmada Public School', date: '2023', description: 'Voted by students and staff.' }] }) },
    { s: 'engineer', role: 'Engineer (Mechanical)', level: 'Senior', icon: 'settings', tpl: 'professional-timeline',
      sections: ['summary', 'experience', 'skills', 'education', 'certifications', 'projects', 'awards'],
      tip: 'Quantify cost, quality and cycle-time gains. List the standards, software and plant processes you know.',
      d: X('Arvind Nair', 'Senior Mechanical Design Engineer', 'Coimbatore, Tamil Nadu', 'Mechanical design engineer with 10 years of experience in pump and valve design. Cut part cost by 12% and led design reviews for 20+ new products.',
        [['Kovai Flow Systems (sample)', 'Senior Design Engineer', 'Coimbatore', '2019-01', '', ['Redesigned a pump housing, saving ₹38 lakh a year in material', 'Lead design reviews for a team of 8 engineers', 'Reduced field returns by 22% through tolerance analysis']], ['Precision Works (sample)', 'Design Engineer', 'Coimbatore', '2016-06', '2018-12', ['Produced 300+ drawings to ASME standards', 'Supported prototype testing and root-cause reports']]],
        [['PSG College of Technology (sample)', 'B.E.', 'Mechanical Engineering', '2012', '2016', '']],
        ['SolidWorks:Expert:Software', 'AutoCAD:Advanced:Software', 'ANSYS (FEA):Advanced:Software', 'GD&T:Advanced:Methods', 'DFMEA:Advanced:Methods', 'Project coordination:Advanced:Management'],
        { certifications: [cert('Certified SolidWorks Professional (sample listing)', 'Dassault Training (sample)', '2020-05'), cert('Six Sigma Green Belt', 'Quality Council (sample)', '2022-03')], projects: [pr('Low-Noise Valve', 'Redesigned valve seat that cut noise by 6 dB.', ['SolidWorks', 'CFD'])] }) }
  ];

  function resumeFor(x) {
    var d = JSON.parse(JSON.stringify(x.d)), rest = Object.keys(SEC).filter(function (k) { return k !== 'customSections' && x.sections.indexOf(k) < 0; });
    d.sectionOrder = x.sections.concat(rest).concat(['customSections']);
    d.templateId = RC.templates && RC.templates.get(x.tpl) ? x.tpl : (RC.templates && RC.templates.DEFAULT_ID) || x.tpl;
    d.name = x.d.personalInfo.fullName + ', ' + x.role + ' example';
    return M.normalize(d);
  }
  function skillName(s) { return String(s).split(':')[0]; }
  function pv(x) { return '<div class="ex-pvw" data-pv="' + x.s + '">' + RC.templates.preview(resumeFor(x), resumeFor(x).templateId) + '</div>'; }
  function slugFromHash() { var m = /[?&]r=([^&]+)/.exec(location.hash); return m ? decodeURIComponent(m[1]) : ''; }

  function useExample(x) {
    var r = resumeFor(x), res = S.create({ name: r.name, data: r, templateId: r.templateId });
    if (!res.ok || !res.resume) { U.toast(res.error || 'Could not create the resume.'); return; }
    if (res.persisted === false) U.toast('Created for this session only. Browser storage is unavailable.');
    location.hash = '#/editor?id=' + encodeURIComponent(res.resume.id);
  }

  function list(el) {
    var cur = 'All', q = '';
    el.innerHTML = U.pageHeader('Resume Examples', 'Pick a role to see how others present their work. Every example is fictional and fully editable.') +
      '<div class="wrap pg"><div class="ex-tools"><div class="chips" role="group" aria-label="Filter by experience level">' + ['All'].concat(LEVELS).map(function (l, i) { return '<button type="button" class="chip' + (i ? '' : ' on') + '" data-lv="' + l + '">' + l + '</button>'; }).join('') + '</div>' +
      '<label class="ex-q"><span class="fm-sr">Search roles</span><input type="search" id="ex-q" placeholder="Search roles or skills" autocomplete="off"></label></div><div class="grid g3" id="ex-grid"></div></div>';
    function draw() {
      var items = EX.filter(function (x) { return (cur === 'All' || x.level === cur) && (!q || (x.role + ' ' + x.d.skills.join(' ')).toLowerCase().indexOf(q) > -1); });
      el.querySelector('#ex-grid').innerHTML = items.length ? items.map(function (x) {
        return '<article class="ex-card"><a class="ex-th" href="#/resume-examples?r=' + x.s + '" aria-label="View the ' + e(x.role) + ' example">' + pv(x) + '</a><div class="ex-in"><div class="ex-top"><span class="ex-ic"><i data-lucide="' + x.icon + '"></i></span><div><h3>' + e(x.role) + '</h3><span class="ex-lv">' + x.level + '</span></div></div>' +
          '<div class="ex-sk">' + x.d.skills.slice(0, 4).map(function (s) { return '<span>' + e(skillName(s)) + '</span>'; }).join('') + '</div>' +
          '<div class="ex-act"><a class="btn btn-o btn-sm" href="#/resume-examples?r=' + x.s + '">View example</a><button type="button" class="btn btn-p btn-sm" data-use="' + x.s + '">Use this example</button></div></div></article>';
      }).join('') : '<div style="grid-column:1/-1">' + U.empty('search-x', 'No examples match', 'Try another level or a shorter search.') + '</div>';
      RC.templates.fit(el.querySelector('#ex-grid')); U.icons();
    }
    el.addEventListener('click', function (ev) {
      var c = ev.target.closest('[data-lv]'), u = ev.target.closest('[data-use]');
      if (c) { cur = c.dataset.lv; el.querySelectorAll('[data-lv]').forEach(function (b) { b.classList.toggle('on', b === c); }); draw(); }
      if (u) useExample(EX.filter(function (x) { return x.s === u.dataset.use; })[0]);
    });
    el.querySelector('#ex-q').addEventListener('input', function (ev) { q = ev.target.value.trim().toLowerCase(); draw(); });
    draw();
  }

  function detail(el, x) {
    el.innerHTML = U.pageHeader(x.role + ' resume example', 'A fictional ' + x.level.toLowerCase() + ' example. Use it as a starting point and replace every detail with your own.') +
      '<div class="wrap pg"><p style="margin-bottom:20px"><a class="btn btn-g btn-sm" href="#/resume-examples"><i data-lucide="arrow-left"></i>All examples</a></p><div class="ex-det"><div class="ex-big">' + pv(x) + '</div><aside class="ex-side">' +
      '<dl><dt>Role</dt><dd>' + e(x.role) + '</dd><dt>Experience level</dt><dd>' + x.level + '</dd></dl>' +
      '<h3>Key skills</h3><div class="ex-sk">' + x.d.skills.map(function (s) { return '<span>' + e(skillName(s)) + '</span>'; }).join('') + '</div>' +
      '<h3>Recommended sections</h3><ol class="ex-secs">' + x.sections.map(function (k) { return '<li>' + SEC[k] + '</li>'; }).join('') + '</ol>' +
      '<h3>Writing tip</h3><p class="ex-tip">' + e(x.tip) + '</p>' +
      '<button type="button" class="btn btn-p" id="ex-use"><i data-lucide="file-plus-2"></i>Use This Example</button><p class="ex-fine">Creates a copy in this browser that you can edit freely. Nothing is shared.</p></aside></div></div>';
    el.querySelector('#ex-use').onclick = function () { useExample(x); };
    RC.templates.fit(el); U.icons();
  }

  P['resume-examples'] = function (el) {
    var s = slugFromHash(), x = s && EX.filter(function (y) { return y.s === s; })[0];
    if (!RC.templates) { el.innerHTML = U.pageHeader('Resume Examples', '') + '<div class="wrap pg">' + U.empty('alert-triangle', 'Examples could not load', 'Reload the page to try again.') + '</div>'; return; }
    if (s && !x) { el.innerHTML = U.pageHeader('Resume Examples', '') + '<div class="wrap pg">' + U.empty('search-x', 'We can\'t find that example', 'It may have been renamed.', U.button('See all examples', { href: 'resume-examples' })) + '</div>'; U.icons(); return; }
    x ? detail(el, x) : list(el);
  };
  RC.examples = { list: function () { return EX.slice(); }, build: resumeFor };
})();
