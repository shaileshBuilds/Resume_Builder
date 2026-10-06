/* Fictional demo resumes (all names, employers and contact details are made up). */
RC.sample = {
  experienced: {
    label: 'Experienced developer', name: 'Priya Sharma, Frontend Developer', templateId: 'modern-sidebar',
    personalInfo: { fullName: 'Priya Sharma', jobTitle: 'Senior Frontend Developer', email: 'priya.sharma@example.com', phone: '+91 98765 43210', location: 'Pune, Maharashtra', website: 'priyasharma.example.com', linkedin: 'linkedin.com/in/priya-sharma-example', github: 'github.com/priya-example', profilePhoto: '' },
    summary: 'Frontend developer with 7 years of experience building fast, accessible web apps for retail and fintech teams. Leads small squads, mentors juniors, and cares about performance and clear interfaces.',
    experience: [
      { company: 'Northwind Retail Tech', position: 'Senior Frontend Developer', location: 'Pune', startDate: '2022-04', endDate: '', current: true, description: 'Own the storefront UI used by 2 million shoppers a month.', achievements: ['Cut largest contentful paint from 3.8s to 1.9s by splitting bundles and lazy loading images', 'Led a 5-person squad that rebuilt checkout, lifting completion by 11%', 'Introduced an accessibility checklist that cleared all critical audit issues'] },
      { company: 'BlueLeaf Payments', position: 'Frontend Developer', location: 'Mumbai', startDate: '2019-06', endDate: '2022-03', current: false, description: 'Built dashboards for merchants to track settlements and refunds.', achievements: ['Shipped a reusable component library adopted by 4 product teams', 'Reduced support tickets about reports by 30% with clearer filters and exports'] },
      { company: 'Pixel Mill Studio', position: 'Junior Web Developer', location: 'Pune', startDate: '2018-07', endDate: '2019-05', current: false, description: 'Built marketing sites for small businesses.', achievements: ['Delivered 14 responsive sites on schedule'] }
    ],
    education: [{ institution: 'Savitribai Phule Pune University', degree: 'B.E.', field: 'Computer Engineering', startDate: '2014', endDate: '2018', description: 'First class with distinction.' }],
    skills: ['JavaScript:Expert:Languages', 'TypeScript:Advanced:Languages', 'HTML & CSS:Expert:Languages', 'React:Advanced:Frameworks', 'Vue:Intermediate:Frameworks', 'Webpack & Vite:Advanced:Tooling', 'Jest & Playwright:Advanced:Tooling', 'Figma:Intermediate:Design'].map(function (s) { s = s.split(':'); return { name: s[0], level: s[1], category: s[2] }; }),
    projects: [
      { name: 'Pattern Shelf', description: 'Open-source library of accessible UI patterns with live examples.', technologies: ['React', 'TypeScript', 'Storybook'], link: 'https://example.com/pattern-shelf' },
      { name: 'Budget Buddy', description: 'Offline-first expense tracker that syncs when you reconnect.', technologies: ['Vue', 'IndexedDB', 'PWA'], link: 'https://example.com/budget-buddy' }
    ],
    certifications: [{ name: 'Web Accessibility Specialist', issuer: 'International Accessibility Board', date: '2023-02', credentialUrl: 'https://example.com/cred/wa-1042' }, { name: 'Professional Scrum Master I', issuer: 'Scrum Alliance Sample', date: '2021-09', credentialUrl: '' }],
    languages: [{ name: 'English', proficiency: 'Fluent' }, { name: 'Hindi', proficiency: 'Native' }, { name: 'Marathi', proficiency: 'Native' }],
    awards: [{ title: 'Engineering Excellence Award', issuer: 'Northwind Retail Tech', date: '2023', description: 'For the checkout rebuild.' }],
    volunteer: [{ organization: 'CodeBridge Pune', role: 'Weekend Mentor', startDate: '2020', endDate: '', description: 'Teach web basics to first-year college students.' }],
    publications: [{ title: 'Making Forms Work for Everyone', publisher: 'Frontend Weekly (sample)', date: '2022-11', url: 'https://example.com/forms', description: 'Article on error messages and keyboard flows.' }],
    customSections: [{ title: 'Talks', items: [{ heading: 'Performance on a Budget', subheading: 'Pune Web Meetup', date: '2023', description: 'Practical ways to speed up pages on low-end phones.' }] }]
  },
  fresher: {
    label: 'Fresh graduate', name: 'Arjun Verma, Fresher', templateId: 'career-standard',
    personalInfo: { fullName: 'Arjun Verma', jobTitle: 'Junior Web Developer', email: 'arjun.verma@example.com', phone: '+91 91234 56789', location: 'Lucknow, Uttar Pradesh', website: '', linkedin: 'linkedin.com/in/arjun-verma-example', github: 'github.com/arjun-example', profilePhoto: '' },
    summary: 'Recent IT graduate who enjoys turning designs into clean, responsive pages. Built three projects and completed a 3-month internship.',
    experience: [{ company: 'Gomti Web Works', position: 'Web Development Intern', location: 'Lucknow', startDate: '2025-01', endDate: '2025-03', current: false, description: 'Worked with a small team on client websites.', achievements: ['Built 6 responsive pages from Figma designs', 'Fixed 20+ layout bugs across browsers'] }],
    education: [{ institution: 'Dr. A.P.J. Abdul Kalam Technical University (sample)', degree: 'B.Tech', field: 'Information Technology', startDate: '2021', endDate: '2025', description: 'CGPA 8.1. Final-year project on a campus event portal.' }],
    skills: ['HTML5', 'CSS3', 'JavaScript', 'Git', 'Responsive design'].map(function (n) { return { name: n, level: 'Intermediate', category: 'Web' }; }),
    projects: [{ name: 'Campus Events Portal', description: 'Event listings with search and filters.', technologies: ['HTML', 'CSS', 'JavaScript'], link: '' }, { name: 'Recipe Finder', description: 'Searches recipes by ingredient using a public API.', technologies: ['JavaScript', 'REST API'], link: '' }],
    certifications: [{ name: 'Responsive Web Design', issuer: 'Sample Learning Platform', date: '2024-06', credentialUrl: '' }],
    languages: [{ name: 'English', proficiency: 'Professional' }, { name: 'Hindi', proficiency: 'Native' }],
    awards: [{ title: 'Hackathon Runner-up', issuer: 'College Tech Fest', date: '2024', description: '' }]
  }
};
