/* AI service abstraction (Part 18).
   UI code only calls RC.ai.run(action, ctx). Providers are plug-ins:
   - "smart": local Smart Suggestions (role-based data, no network, nothing leaves the browser). Default.
   - "proxy": optional. POSTs {action, ctx} to YOUR server endpoint (saved in this browser). The API key lives on that server, never in this frontend.
   Rules for every provider: use only information the person provided; never invent jobs, companies, degrees, certificates or achievements. */
RC.ai = (function () {
  var providers = {}, active = 'smart', EP = 'rc-ai-endpoint';
  var ACTIONS = [
    ['objective', 'Generate Career Objective', 'summary'], ['summary', 'Generate Professional Summary', 'summary'], ['improveSummary', 'Improve Summary', 'summary'],
    ['responsibilities', 'Generate Experience Responsibilities', 'experience'], ['rewriteExperience', 'Rewrite Experience', 'experience'], ['achievements', 'Generate Achievement Bullets', 'experience'],
    ['techSkills', 'Suggest Technical Skills', 'skills'], ['softSkills', 'Suggest Soft Skills', 'skills'],
    ['projectDesc', 'Generate Project Description', 'projects'], ['improveProject', 'Improve Project', 'projects'],
    ['coverLetter', 'Generate Cover Letter', 'cover'], ['improveCoverLetter', 'Improve Cover Letter', 'cover'],
    ['atsKeywords', 'Suggest ATS Keywords', 'keywords'], ['tailor', 'Tailor Resume to Job Description', 'keywords']
  ];
  var R = {
    web: { n: 'Web Developer', re: /web dev|full.?stack|website|wordpress/i, tech: ['HTML5', 'CSS3', 'JavaScript', 'Responsive design', 'Git', 'REST APIs', 'Web accessibility', 'Browser DevTools'], soft: ['Problem solving', 'Attention to detail', 'Communication', 'Time management', 'Teamwork', 'Adaptability'], duties: ['Build and maintain responsive web pages and features', 'Convert designs into clean, accessible code', 'Test pages across browsers and devices', 'Fix bugs and improve page performance', 'Work with designers and teammates to deliver features', 'Use version control to manage code changes'], kw: ['responsive design', 'cross-browser', 'accessibility', 'performance', 'REST API', 'version control', 'debugging', 'UI'] },
    fe: { n: 'Frontend Developer', re: /front.?end|ui developer|react|angular|vue/i, tech: ['JavaScript', 'TypeScript', 'React', 'HTML5', 'CSS3', 'Responsive design', 'Git', 'Web accessibility'], soft: ['Collaboration', 'Attention to detail', 'Communication', 'Problem solving', 'Adaptability', 'Receiving feedback'], duties: ['Build user interfaces from design specifications', 'Create reusable components', 'Improve page speed and accessibility', 'Connect interfaces to APIs', 'Test and debug across browsers', 'Review code with teammates'], kw: ['UI components', 'responsive', 'state management', 'accessibility', 'API integration', 'performance', 'testing', 'design systems'] },
    swe: { n: 'Software Engineer', re: /software|developer|programmer|backend|back.?end|engineer/i, tech: ['Data structures', 'Algorithms', 'Git', 'REST APIs', 'SQL', 'Unit testing', 'Debugging', 'Agile / Scrum'], soft: ['Problem solving', 'Teamwork', 'Communication', 'Learning quickly', 'Ownership', 'Time management'], duties: ['Design, write and test code for new features', 'Debug and fix defects', 'Review code and share feedback', 'Document technical decisions', 'Work with product and QA teammates', 'Maintain and improve existing systems'], kw: ['software development', 'APIs', 'unit testing', 'version control', 'debugging', 'agile', 'databases', 'code review'] },
    it: { n: 'IT Support', re: /\bit\b.*support|help.?desk|desktop support|technical support|sysadmin|system admin|service desk/i, tech: ['Windows & macOS support', 'Troubleshooting', 'Active Directory', 'Networking basics', 'Ticketing systems', 'Hardware repair', 'Microsoft 365', 'Remote support tools'], soft: ['Patience', 'Clear communication', 'Customer service', 'Problem solving', 'Documentation', 'Prioritization'], duties: ['Respond to and resolve user support tickets', 'Set up and maintain computers and peripherals', 'Troubleshoot software, network and printer issues', 'Create and reset user accounts', 'Document fixes in a knowledge base', 'Escalate complex issues to the right team'], kw: ['troubleshooting', 'help desk', 'ticketing', 'Active Directory', 'networking', 'customer support', 'hardware', 'documentation'] },
    da: { n: 'Data Analyst', re: /data|analytics|business intelligence|\bbi\b/i, tech: ['SQL', 'Excel', 'Python', 'Data visualization', 'Power BI', 'Tableau', 'Data cleaning', 'Statistics'], soft: ['Analytical thinking', 'Curiosity', 'Communication', 'Attention to detail', 'Storytelling with data', 'Problem solving'], duties: ['Collect, clean and organize data from different sources', 'Write queries to answer business questions', 'Build charts and dashboards', 'Summarize findings for non-technical readers', 'Check data for errors and gaps', 'Document methods so work can be repeated'], kw: ['SQL', 'dashboards', 'data cleaning', 'reporting', 'KPIs', 'visualization', 'Excel', 'statistics'] },
    des: { n: 'Designer', re: /design|ux|ui\/ux|graphic|creative|illustrat/i, tech: ['Figma', 'Wireframing', 'Prototyping', 'Typography', 'Color theory', 'Adobe Photoshop', 'Adobe Illustrator', 'Design systems'], soft: ['Creativity', 'Receiving feedback', 'Communication', 'Empathy', 'Time management', 'Collaboration'], duties: ['Create layouts, mockups and visual assets', 'Turn briefs into clear design concepts', 'Build prototypes to test ideas', 'Keep designs consistent with brand guidelines', 'Share files and specs with developers', 'Adjust designs based on feedback'], kw: ['UX', 'UI', 'wireframes', 'prototyping', 'brand identity', 'user research', 'visual design', 'design systems'] },
    mkt: { n: 'Marketing', re: /market|seo|content|social media|brand|digital media/i, tech: ['SEO basics', 'Social media management', 'Content writing', 'Google Analytics', 'Email marketing', 'Canva', 'Campaign planning', 'Copywriting'], soft: ['Creativity', 'Communication', 'Adaptability', 'Curiosity', 'Teamwork', 'Time management'], duties: ['Plan and publish content for social and web channels', 'Support campaigns from idea to launch', 'Track performance with analytics tools', 'Research audiences and competitors', 'Write copy for posts, emails and pages', 'Coordinate with designers and sales teams'], kw: ['campaigns', 'SEO', 'content strategy', 'analytics', 'social media', 'email marketing', 'audience', 'engagement'] },
    sal: { n: 'Sales', re: /sales|business development|account exec|retail|\bbd\b/i, tech: ['CRM software', 'Lead generation', 'Prospecting', 'Negotiation', 'Product demos', 'Pipeline management', 'Cold outreach', 'Sales reporting'], soft: ['Persuasion', 'Active listening', 'Resilience', 'Relationship building', 'Communication', 'Goal focus'], duties: ['Reach out to leads and follow up on enquiries', 'Present products and answer customer questions', 'Keep customer records updated in the CRM', 'Prepare quotes and proposals', 'Work toward sales targets', 'Maintain relationships with existing customers'], kw: ['lead generation', 'CRM', 'pipeline', 'closing', 'customer relationships', 'targets', 'negotiation', 'account management'] },
    hr: { n: 'HR', re: /\bhr\b|human resource|recruit|talent|people ops/i, tech: ['Recruitment', 'Onboarding', 'HRIS software', 'Interview scheduling', 'Employee records', 'Job posting', 'Policy documentation', 'MS Excel'], soft: ['Confidentiality', 'Empathy', 'Communication', 'Organization', 'Conflict resolution', 'Active listening'], duties: ['Post jobs and screen applications', 'Schedule interviews and coordinate candidates', 'Prepare onboarding documents', 'Maintain accurate employee records', 'Answer employee questions about policies', 'Support HR events and programs'], kw: ['recruitment', 'onboarding', 'talent acquisition', 'employee relations', 'HRIS', 'compliance', 'screening', 'confidentiality'] },
    fin: { n: 'Finance', re: /financ|account|audit|bookkeep|tax|payroll|banking/i, tech: ['MS Excel', 'Financial reporting', 'Bookkeeping', 'Tally / QuickBooks', 'Budgeting', 'Reconciliation', 'Accounts payable/receivable', 'Financial analysis'], soft: ['Accuracy', 'Integrity', 'Attention to detail', 'Time management', 'Communication', 'Analytical thinking'], duties: ['Record and reconcile financial transactions', 'Prepare routine reports and statements', 'Support budgeting and forecasting', 'Process invoices and payments', 'Check figures for accuracy', 'Keep records organized for audits'], kw: ['reconciliation', 'financial reporting', 'budgeting', 'accounts payable', 'accounts receivable', 'Excel', 'compliance', 'forecasting'] },
    tea: { n: 'Teacher', re: /teach|tutor|lecturer|educator|instructor|professor/i, tech: ['Lesson planning', 'Classroom management', 'Curriculum design', 'Assessment & grading', 'Google Classroom', 'Differentiated instruction', 'Student engagement', 'Parent communication'], soft: ['Patience', 'Communication', 'Empathy', 'Organization', 'Adaptability', 'Motivating others'], duties: ['Plan and deliver lessons for the class', 'Assess student work and give feedback', 'Keep a respectful, organized classroom', 'Adapt activities to different learning needs', 'Communicate progress to parents or guardians', 'Work with colleagues on planning'], kw: ['lesson planning', 'classroom management', 'curriculum', 'assessment', 'student engagement', 'differentiation', 'feedback', 'communication'] },
    stu: { n: 'Student', re: /student|intern|fresher|graduate|trainee|entry/i, tech: ['MS Office', 'Research', 'Presentation skills', 'Written communication', 'Teamwork on projects', 'Basic data entry', 'Time management', 'Google Workspace'], soft: ['Eagerness to learn', 'Teamwork', 'Communication', 'Time management', 'Adaptability', 'Initiative'], duties: ['Complete coursework and group projects', 'Research topics and present findings', 'Take part in college clubs or events', 'Work with classmates to meet deadlines', 'Learn new tools quickly', 'Keep organized notes and schedules'], kw: ['coursework', 'projects', 'teamwork', 'research', 'communication', 'internship', 'learning', 'initiative'] }
  };
  var GENERIC = { n: '', tech: [], soft: ['Communication', 'Teamwork', 'Problem solving', 'Time management', 'Adaptability', 'Attention to detail'], duties: [], kw: [] };
  function roleOf(text) { var t = String(text || ''); var order = ['fe', 'web', 'da', 'it', 'des', 'mkt', 'sal', 'hr', 'fin', 'tea', 'swe', 'stu']; for (var i = 0; i < order.length; i++) if (R[order[i]].re.test(t)) return R[order[i]]; return null; }

  var list = function (a) { return Array.isArray(a) ? a : String(a || '').split(/[,\n;]/); };
  var clean = function (a) { var seen = {}; return list(a).map(function (x) { return String(x).trim(); }).filter(function (x) { var k = x.toLowerCase(); if (!x || seen[k]) return false; seen[k] = 1; return true; }); };
  var cap = function (s) { s = String(s || '').trim(); return s.charAt(0).toUpperCase() + s.slice(1); };
  var join = function (a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; };
  var rot = function (a, n) { n = a.length ? (n || 0) % a.length : 0; return a.slice(n).concat(a.slice(0, n)); };
  var LEVEL = { fresher: 'Entry-level', junior: 'Junior', mid: 'Mid-level', senior: 'Senior' };
  var lv = function (c) { return LEVEL[c.level] || ''; };
  var WEAK = [[/\bresponsible for\b/gi, 'handled'], [/\bworked on\b/gi, 'contributed to'], [/\bhelped (to )?/gi, 'supported '], [/\bwas involved in\b/gi, 'took part in'], [/\bdid\b/gi, 'completed'], [/\bin charge of\b/gi, 'managed'], [/\bvery\b\s*/gi, ''], [/\breally\b\s*/gi, ''], [/\bhard.?working\b/gi, 'dedicated'], [/\bteam player\b/gi, 'collaborative colleague']];
  function polish(t) {
    t = String(t || '').replace(/[ \t]+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').replace(/\bi\b/g, 'I').trim();
    WEAK.forEach(function (w) { t = t.replace(w[0], w[1]); });
    t = t.replace(/(^|[.!?]\s+)([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); });
    if (t && !/[.!?]$/.test(t) && !/\n/.test(t)) t += '.'; return t;
  }
  var firstSentences = function (t, n) { var s = String(t).match(/[^.!?]+[.!?]+/g) || [t]; return s.slice(0, n).join(' ').trim(); };
  var need = function (m) { return { needs: m }; };
  var G = 'Generic suggestion: edit it so it matches what is true for you.';

  /* ---------- JD analysis ---------- */
  var KNOWN = 'javascript typescript python java c++ c# php ruby go rust sql mysql postgresql mongodb react angular vue node.js express django flask spring html css sass tailwind bootstrap git github docker kubernetes aws azure gcp linux rest graphql api figma sketch photoshop illustrator excel power bi tableau looker google analytics seo sem crm salesforce hubspot jira confluence slack tally quickbooks sap oracle workday hris agile scrum kanban ci/cd jenkins selenium jest testing photoshop canva wordpress shopify active directory microsoft 365 office 365 zendesk servicenow powerpoint word outlook google workspace lesson planning curriculum'.split(' ');
  var MULTI = ['node.js', 'power bi', 'google analytics', 'active directory', 'microsoft 365', 'office 365', 'google workspace', 'lesson planning', 'ci/cd', 'c++', 'c#'];
  var TOOLS = ['git', 'github', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jira', 'confluence', 'slack', 'figma', 'sketch', 'photoshop', 'illustrator', 'excel', 'power bi', 'tableau', 'looker', 'google analytics', 'salesforce', 'hubspot', 'tally', 'quickbooks', 'sap', 'oracle', 'workday', 'jenkins', 'selenium', 'jest', 'wordpress', 'shopify', 'canva', 'zendesk', 'servicenow', 'powerpoint', 'word', 'outlook', 'microsoft 365', 'office 365', 'google workspace', 'active directory'];
  var STOP = 'the and for with that this from will have are you your our their they who not but can all any more other such into than also about able must should work working team teams role job position candidate looking years year experience skills strong ability including etc using use used new well good great high make across within over per its it\'s has been being would could may what when where which while these those them then there here only own both each very most some many much'.split(' ');
  function findTerms(t, terms) { var low = ' ' + t.toLowerCase().replace(/[^a-z0-9+#./ \n-]/g, ' ') + ' ', out = []; terms.forEach(function (k) { var re = new RegExp('(^|[^a-z0-9+#])' + k.replace(/[.+/]/g, '\\$&') + '(?![a-z0-9+#])', 'i'); if (re.test(low) && out.indexOf(k) < 0) out.push(k); }); return out; }
  var title = function (k) { return k.split(' ').map(function (w) { return /^(sql|aws|api|rest|seo|sem|crm|sap|hris|gcp|css|html|php|bi|ci\/cd)$/i.test(w) ? w.toUpperCase() : w === 'javascript' ? 'JavaScript' : w === 'typescript' ? 'TypeScript' : w === 'github' ? 'GitHub' : w === 'mysql' ? 'MySQL' : w === 'postgresql' ? 'PostgreSQL' : w === 'mongodb' ? 'MongoDB' : w === 'node.js' ? 'Node.js' : cap(w); }).join(' '); };
  function analyzeJD(text) {
    text = String(text || '').trim(); if (text.length < 40) return null;
    var lines = text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean), jt = '';
    var m = /(?:job title|position|role)\s*[:\-–]\s*(.{3,80})/i.exec(text) || /(?:hiring|looking for|seeking|need)\s+(?:an?\s+)?([A-Z][\w/&+ -]{3,60}?)(?:\s+(?:to|who|with|for|at|in)\b|[.,\n])/.exec(text);
    if (m) jt = m[1].trim(); else if (lines[0] && lines[0].length <= 70 && !/[.!?]$/.test(lines[0])) jt = lines[0];
    var skills = findTerms(text, KNOWN).map(title), tools = findTerms(text, TOOLS).map(title);
    var freq = {}; text.toLowerCase().replace(/[^a-z0-9+#/ -]/g, ' ').split(/\s+/).forEach(function (w) { if (w.length >= 4 && STOP.indexOf(w) < 0 && !/^\d+$/.test(w)) freq[w] = (freq[w] || 0) + 1; });
    var keywords = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a] || a.length - b.length; }).filter(function (w) { return freq[w] >= 2; }).slice(0, 14);
    var resp = lines.filter(function (l) { return /^[-•*·\d.)\s]*(manage|develop|build|design|create|maintain|support|lead|coordinate|prepare|analy[sz]e|deliver|collaborate|work with|ensure|implement|monitor|handle|plan|write|test|respond|assist|conduct|report|own|drive|improve)/i.test(l) && l.length > 20 && l.length < 220; }).map(function (l) { return l.replace(/^[-•*·\d.)\s]+/, ''); }).slice(0, 8);
    var exp = []; (text.match(/[^.\n]*\b\d{1,2}\s*\+?\s*(?:[-–to]+\s*\d{1,2}\s*)?(?:years?|yrs?)\b[^.\n]*/gi) || []).forEach(function (s) { s = s.trim().replace(/^[-•*\s]+/, ''); if (s.length < 200 && exp.indexOf(s) < 0) exp.push(s); });
    (text.match(/[^.\n]*\b(bachelor|master|degree|diploma|certification|certified)\b[^.\n]*/gi) || []).slice(0, 2).forEach(function (s) { s = s.trim().replace(/^[-•*\s]+/, ''); if (s.length < 200) exp.push(s); });
    return { title: jt, skills: skills, tools: tools, keywords: keywords, responsibilities: resp, experience: exp.slice(0, 6), role: roleOf(jt + ' ' + text.slice(0, 400)) };
  }
  function resumeBlob(r) {
    if (!r) return ''; var p = r.personalInfo || {};
    return [p.jobTitle, r.summary].concat((r.skills || []).map(function (s) { return s.name; })).concat((r.experience || []).map(function (x) { return [x.position, x.description].concat(x.achievements || []).join(' '); })).concat((r.projects || []).map(function (x) { return [x.name, x.description].concat(x.technologies || []).join(' '); })).join(' \n ').toLowerCase();
  }
  var hasTerm = function (blob, t) { return findTerms(blob, [t.toLowerCase()]).length > 0; };
  function compare(jd, r) {
    var blob = resumeBlob(r), all = clean(jd.skills.concat(jd.tools)), have = [], miss = [];
    all.forEach(function (t) { (hasTerm(blob, t) ? have : miss).push(t); });
    var kwHave = [], kwMiss = []; jd.keywords.forEach(function (k) { (blob.indexOf(k) > -1 ? kwHave : kwMiss).push(k); });
    var projects = (r.projects || []).map(function (p) { var pb = [p.name, p.description].concat(p.technologies || []).join(' ').toLowerCase(); var hits = all.filter(function (t) { return hasTerm(pb, t); }).concat(jd.keywords.filter(function (k) { return pb.indexOf(k) > -1; })); return { name: p.name, hits: clean(hits) }; });
    return { have: have, miss: miss, kwHave: kwHave, kwMiss: kwMiss, projects: projects };
  }
  function jdAdvice(jd, r) {
    var c = r ? compare(jd, r) : null, out = { summary: [], skills: [], keywords: [], experience: [], projects: [] };
    var who = jd.title ? 'the “' + jd.title + '” role' : 'this role';
    if (!r) {
      out.summary.push('Open your summary with a role title close to ' + who + ' (only if it describes you honestly).');
      out.skills.push('Pick a resume to compare, and this section will show which of these skills you already list.');
      out.keywords.push('Use these words naturally where they truthfully describe your work: ' + (jd.keywords.slice(0, 8).join(', ') || 'none found') + '.');
      out.experience.push('For each past role, lead with the duties that match: ' + (jd.responsibilities[0] || 'the responsibilities listed above') + '.');
      out.projects.push('Choose projects that show the listed skills and tools, and name those tools in the description.'); return out;
    }
    if (c.have.length) out.summary.push('Mention your real strengths that the posting asks for: ' + c.have.slice(0, 5).join(', ') + '.'); else out.summary.push('Your resume does not yet mention the main skills in this posting. Only add the ones you truly have.');
    if (jd.title) out.summary.push('Use a headline or summary opening close to “' + jd.title + '” if it matches your actual work.');
    if (c.have.length) out.skills.push('Move these up in your skills list (you already have them): ' + c.have.join(', ') + '.');
    if (c.miss.length) out.skills.push('Mentioned in the posting but not on your resume: ' + c.miss.join(', ') + '. Add them only if you genuinely have this experience.');
    if (c.kwMiss.length) out.keywords.push('Words repeated in the posting that your resume does not use: ' + c.kwMiss.join(', ') + '. Work them in only where they describe what you did.');
    if (c.kwHave.length) out.keywords.push('Already covered: ' + c.kwHave.join(', ') + '.');
    if (jd.responsibilities.length) out.experience.push('Reorder or reword your experience bullets so the ones closest to these duties come first: “' + jd.responsibilities.slice(0, 2).join('” / “') + '”.');
    if (jd.experience.length) out.experience.push('Check the stated requirement against your history: ' + jd.experience.slice(0, 2).join(' | '));
    var rel = c.projects.filter(function (p) { return p.hits.length; }).sort(function (a, b) { return b.hits.length - a.hits.length; });
    rel.forEach(function (p) { out.projects.push('“' + p.name + '” is relevant (matches: ' + p.hits.slice(0, 5).join(', ') + '). Feature it near the top.'); });
    if (!rel.length) out.projects.push((r.projects || []).length ? 'None of your projects mention the posting’s skills. If one used them, say so in its description.' : 'You have no projects listed. If you have real project work that uses these skills, add it.');
    return out;
  }

  /* ---------- Smart Suggestions provider ---------- */
  function smart(action, c) {
    c = c || {}; var seed = c.seed || 0, role = roleOf(c.role) || roleOf(c.jd) || null, data = role || GENERIC, rn = (c.role || '').trim(), sk = clean(c.skills), text = String(c.text || '').trim(), ind = (c.industry || '').trim(), goal = (c.goal || '').trim();
    var L = lv(c), tech = sk.length ? sk : data.tech.slice(0, 4), generic = !sk.length, tone = c.tone || 'professional';
    var V = function (label, t, o) { return Object.assign({ label: label, text: t, generic: false, apply: 'summary' }, o || {}); };
    switch (action) {
      case 'objective': {
        if (!rn) return need('Add a target role so the objective can name it.');
        var g = goal || 'contribute reliably and keep growing my skills';
        return { variants: [
          V('Professional', 'Motivated ' + (L ? L.toLowerCase() + ' ' : '') + rn.toLowerCase() + ' seeking a position' + (ind ? ' in the ' + ind + ' sector' : '') + ' where I can apply ' + (tech.length ? join(tech.slice(0, 3)) : 'my skills') + ' and ' + g + '.', { generic: generic, note: generic ? G : '' }),
          V('ATS-Friendly', 'Seeking ' + cap(rn) + ' role' + (ind ? ' in ' + ind : '') + '. Key skills: ' + (tech.join(', ') || 'to be added') + '. Goal: ' + g + '.', { generic: generic, note: generic ? G : '' }),
          V('Simple & Modern', 'I want to work as a ' + rn.toLowerCase() + ' and ' + g + '. ' + (tech.length ? 'I bring ' + join(tech.slice(0, 3)) + '.' : ''), { generic: generic, note: generic ? G : '' })] };
      }
      case 'summary': {
        if (!rn) return need('Add a target role so the summary can describe you.');
        var lead = (L ? L + ' ' : '') + rn;
        var soft = tone === 'friendly' ? 'Enjoys working with people and learning new things.' : tone === 'confident' ? 'Focused on delivering clear, dependable results.' : 'Committed to clear communication and steady, quality work.';
        return { variants: [
          V('Professional', lead + (ind ? ' in the ' + ind + ' field' : '') + ' with working knowledge of ' + join(tech.slice(0, 4)) + '. ' + soft + (goal ? ' Looking to ' + goal + '.' : ''), { generic: generic, note: generic ? G + ' Skills were suggested because you did not enter any.' : 'Built only from the details you entered. Soft-skill sentence is generic: edit or remove it.' }),
          V('ATS-Friendly', lead + (ind ? ' | ' + ind : '') + '. Skills: ' + tech.join(', ') + '.' + (goal ? ' Career goal: ' + goal + '.' : ''), { generic: generic, note: generic ? G : '' }),
          V('Simple & Modern', 'I’m a ' + lead.toLowerCase() + ' who works with ' + join(tech.slice(0, 3)) + '.' + (goal ? ' I want to ' + goal + '.' : ' I like clear, useful work.'), { generic: generic, note: generic ? G : '' })] };
      }
      case 'improveSummary': case 'improveProject': case 'improveCoverLetter': {
        if (text.length < 15) return need('Paste the text you want improved (at least a sentence).');
        var p = polish(text), ap = action === 'improveSummary' ? 'summary' : action === 'improveProject' ? 'description' : 'coverLetter';
        var long = p.length > 330, tips = [];
        if (/\b(i am|i'm|my name)\b/i.test(text)) tips.push('Avoid starting every sentence with “I”.');
        if (!/\d/.test(text)) tips.push('If you have a real number (users, hours saved, items handled), add it.');
        if (long && action !== 'improveCoverLetter') tips.push('This is long. Aim for 2–4 sentences.');
        var vs = [V('Professional', p, { apply: ap, note: 'Same meaning, cleaner wording. Check that nothing changed in fact.' }), V('ATS-Friendly', p + (sk.length ? ' Skills: ' + sk.join(', ') + '.' : ''), { apply: ap, note: sk.length ? 'Keywords added are the skills you entered.' : 'Add your skills in the form to append them as keywords.' }),
          V('Simple & Modern', action === 'improveCoverLetter' ? p.split(/\n{2,}/).map(function (x) { return firstSentences(x, 2); }).join('\n\n') : firstSentences(p, 2), { apply: ap, note: 'Shortened version.' })];
        return { variants: vs, tips: tips };
      }
      case 'responsibilities': {
        if (!data.duties.length) return need('Add a target role such as Web Developer, Data Analyst or Teacher to get role-based duties.');
        var d = rot(data.duties, seed);
        return { variants: [
          V('Professional', d.slice(0, 5).join('\n'), { apply: 'bullets', generic: true, note: G + ' Keep only the lines that match what you really did.' }),
          V('ATS-Friendly', d.slice(0, 5).map(function (x, i) { return x + (sk[i] ? ' using ' + sk[i] : ''); }).join('\n'), { apply: 'bullets', generic: true, note: G + ' Tools were added only from your skills list.' }),
          V('Simple & Modern', d.slice(0, 3).map(function (x) { return x.replace(/^(\w+) and (\w+)/, '$1'); }).join('\n'), { apply: 'bullets', generic: true, note: G })] };
      }
      case 'rewriteExperience': {
        if (text.length < 10) return need('Paste or choose the experience text to rewrite.');
        var lines = text.split(/\n+/).map(function (x) { return polish(x.replace(/^[-•*\s]+/, '')); }).filter(Boolean);
        return { variants: [V('Professional', lines.join('\n'), { apply: 'bullets' }), V('ATS-Friendly', lines.map(function (x) { return x.replace(/\.$/, ''); }).join('\n') + (sk.length ? '\nTools: ' + sk.join(', ') : ''), { apply: 'bullets' }), V('Simple & Modern', lines.slice(0, 3).join('\n'), { apply: 'bullets' })], tips: ['Wording was tightened only. No facts were added. Review each line.'] };
      }
      case 'achievements': {
        var s0 = sk[0] || 'a key tool', r0 = rn || 'my role';
        var T = rot(['Improved [process or result] by [number]% by using ' + s0, 'Completed [number] [tasks, tickets, or projects] per [week/month] while keeping quality high', 'Reduced [time, errors, or cost] by [amount] through [what you changed]', 'Helped [team or customers] by [what you did], leading to [result]', 'Delivered [project or feature] on time using ' + s0], seed);
        return { variants: [V('Professional', T.slice(0, 4).join('\n'), { apply: 'bullets', generic: true, note: 'Template bullets. Replace every [bracket] with a TRUE fact or delete the line. Do not publish numbers you cannot back up.' }), V('ATS-Friendly', T.slice(0, 3).map(function (x) { return x + (rn ? ' (' + r0 + ')' : ''); }).join('\n'), { apply: 'bullets', generic: true, note: 'Template bullets. Fill in real details.' }), V('Simple & Modern', T.slice(0, 2).join('\n'), { apply: 'bullets', generic: true, note: 'Template bullets. Fill in real details.' })] };
      }
      case 'techSkills': case 'softSkills': {
        var src = action === 'techSkills' ? data.tech : data.soft, have = clean(c.have).map(function (x) { return x.toLowerCase(); });
        var items = rot(src, seed).filter(function (x) { return have.indexOf(x.toLowerCase()) < 0; });
        if (!items.length) return need(action === 'techSkills' && !role ? 'Add a target role (for example Web Developer or Data Analyst) to get technical skill ideas.' : 'You already have every skill this tool suggests for the role.');
        return { variants: [{ label: action === 'techSkills' ? 'Suggested technical skills' : 'Suggested soft skills', items: items, apply: 'skills', generic: true, note: 'Suggestions for the role. Add only skills you can honestly claim.' }] };
      }
      case 'projectDesc': {
        if (!text) return need('Enter the project name or a one-line note about what it is.');
        var nm = text.split(/\n/)[0].slice(0, 80), tc = sk.length ? join(sk.slice(0, 4)) : '';
        return { variants: [
          V('Professional', nm + ' is a project' + (tc ? ' built with ' + tc : '') + (goal ? ' to ' + goal : '') + '. [Add one sentence on what you personally built or decided.]', { apply: 'description', note: 'Only the name, tools and goal you entered were used. Fill in the bracket with what you really did.' }),
          V('ATS-Friendly', nm + (tc ? ' | Technologies: ' + sk.join(', ') : '') + (goal ? ' | Purpose: ' + goal : '') + ' | [Your role and result]', { apply: 'description', note: 'Fill in the bracket with real details.' }),
          V('Simple & Modern', 'I made ' + nm + (tc ? ' using ' + tc : '') + (goal ? ' to ' + goal : '') + '. [What it does or what you learned.]', { apply: 'description', note: 'Fill in the bracket with real details.' })] };
      }
      case 'coverLetter': {
        if (!c.company && !rn) return need('Add the company and the role you are applying for.');
        var co = c.company || 'your company', ro = rn || 'the open position', sf = sk.length ? join(sk.slice(0, 3)) : '', me = c.name || '';
        var op = 'I am writing to apply for the ' + ro + ' position at ' + co + '.', close = 'Thank you for your time and consideration. I would welcome the chance to discuss how I can contribute.';
        var mk = function (mid) { return [op, mid, close].join('\n\n'); };
        return { variants: [
          V('Professional', mk((sf ? 'I have working knowledge of ' + sf + ', which I understand is relevant to this role. ' : '') + (goal ? 'My goal is to ' + goal + '. ' : '') + 'I take care to communicate clearly and finish work I start.' + (sk.length ? '' : ' [Add one or two real examples from your experience.]')), { apply: 'coverLetter', generic: !sk.length, note: 'Uses only details you entered. Add real examples before sending.' }),
          V('ATS-Friendly', mk('Relevant skills: ' + (sk.join(', ') || '[add your real skills]') + '. ' + (ind ? 'Industry: ' + ind + '. ' : '') + 'I am interested in ' + co + ' and the ' + ro + ' role. [Add one real accomplishment that fits the job description.]'), { apply: 'coverLetter', note: 'Fill the brackets with real details.' }),
          V('Simple & Modern', [op, (sf ? 'I work with ' + sf + '. ' : '') + (goal ? 'I want to ' + goal + '.' : 'I like learning fast and doing careful work.') + ' [Add a real example.]', 'Thanks for reading. I’d love to talk.'].join('\n\n'), { apply: 'coverLetter', note: 'Fill the bracket with a real example.' })] };
      }
      case 'atsKeywords': {
        var jd = c.jd ? analyzeJD(c.jd) : null, base = data.kw.slice(), fromJd = jd ? clean(jd.skills.concat(jd.tools, jd.keywords)) : [];
        if (!base.length && !fromJd.length) return need('Add a target role or paste a job description to get keyword ideas.');
        var out = [];
        if (fromJd.length) out.push({ label: 'From the job description', items: fromJd.slice(0, 20), apply: 'none', note: 'Use a word only where it truthfully describes your work.' });
        if (base.length) out.push({ label: 'Common for ' + (role ? role.n : 'this role'), items: base, apply: 'none', generic: true, note: 'Common keywords for the role. Not a guarantee of any result in any ATS.' });
        return { variants: out };
      }
      case 'tailor': {
        var an = analyzeJD(c.jd); if (!an) return need('Paste the full job description (at least a few lines).');
        var cp = c.resume ? compare(an, c.resume) : null, mine = cp ? cp.have : sk.map(title), vs2 = [];
        if (rn || (c.resume && c.resume.personalInfo && c.resume.personalInfo.jobTitle)) {
          var rl = rn || c.resume.personalInfo.jobTitle;
          vs2.push(V('Tailored summary (draft)', cap(rl) + (an.title && an.title.toLowerCase() !== rl.toLowerCase() ? ' interested in the ' + an.title + ' role' : '') + (mine.length ? ' with experience in ' + join(mine.slice(0, 4)) : '') + '.' + (goal ? ' Looking to ' + goal + '.' : '') + ' [Add one real strength that fits this posting.]', { note: 'Only skills found on your resume or entered by you were used.' }));
        }
        var ad = jdAdvice(an, c.resume || null);
        Object.keys(ad).forEach(function (k) { if (ad[k].length) vs2.push({ label: { summary: 'Summary', skills: 'Skills to highlight', keywords: 'Keyword opportunities', experience: 'Experience', projects: 'Project relevance' }[k], items: ad[k], apply: 'none' }); });
        return { variants: vs2, analysis: an };
      }
    }
    return need('Unknown action.');
  }
  providers.smart = { id: 'smart', name: 'Smart Suggestions (local)', available: function () { return true; }, run: function (a, c) { return new Promise(function (ok, no) { setTimeout(function () { try { ok(smart(a, c)); } catch (e) { no(e); } }, 350); }); } };
  providers.proxy = {
    id: 'proxy', name: 'Your AI server (proxy)', endpoint: function () { try { return localStorage.getItem(EP) || ''; } catch (e) { return ''; } },
    available: function () { return !!this.endpoint(); },
    run: function (a, c) {
      var u = this.endpoint(); if (!/^https:\/\//i.test(u)) return Promise.reject(new Error('The AI server address must start with https://'));
      var cc = Object.assign({}, c); if (cc.resume) cc.resume = { personalInfo: { jobTitle: (cc.resume.personalInfo || {}).jobTitle }, skills: (cc.resume.skills || []).map(function (s) { return { name: s.name }; }) };
      return fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: a, ctx: cc, rules: 'Use only facts supplied. Never invent jobs, companies, degrees, certifications or achievements. Label generic suggestions.' }) })
        .then(function (r) { if (!r.ok) throw new Error('The AI server answered with an error (' + r.status + ').'); return r.json(); })
        .then(function (d) { if (!d || (!d.variants && !d.needs)) throw new Error('The AI server sent an unexpected response.'); return d; });
    }
  };
  return {
    ACTIONS: ACTIONS, ROLES: R, roleOf: roleOf, analyzeJD: analyzeJD, compare: compare, jdAdvice: jdAdvice, polish: polish,
    register: function (p) { if (p && p.id && typeof p.run === 'function') providers[p.id] = p; },
    providers: function () { return Object.keys(providers).map(function (k) { return { id: k, name: providers[k].name, available: !!providers[k].available() }; }); },
    setProvider: function (id) { if (providers[id] && providers[id].available()) { active = id; return true; } return false; },
    provider: function () { return active; },
    setEndpoint: function (u) { try { u ? localStorage.setItem(EP, u) : localStorage.removeItem(EP); } catch (e) {} },
    getEndpoint: function () { return providers.proxy.endpoint(); },
    /* Always resolves to { variants:[…] } or { needs:'…' }. Rejects with an Error on failure (UI shows retry). */
    run: function (action, ctx) { var p = providers[active]; if (!p || !p.available()) { active = 'smart'; p = providers.smart; } return p.run(action, ctx || {}); }
  };
})();
