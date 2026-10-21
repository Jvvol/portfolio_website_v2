// Projects shown in the Projects section, in display order.
// To add one, copy an entry and edit it. Fields:
//   title      Project name
//   context    Where it came from (course, hackathon, independent), shown under the title
//   year       Optional
//   summary    One or two sentences: what it is and why it matters
//   highlights Optional bullet points: what you did, with outcomes
//   tags       Tech stack
//   links      Optional [{ label, href }], each opens in a new tab
//   featured   Optional: true renders a full-width card with a "Featured" badge (use for one project)
// Project cards are text only: no screenshots or photos.
window.PROJECTS = [
    {
        title: 'Etherius',
        context: 'Independent project, audio plugin',
        year: null, // TODO: year started/released
        featured: true,
        summary: 'A delay plugin that started from how analog bucket-brigade (BBD) delays work and has grown into a broader sound-design tool. It handles clean, musical repeats, and it can also modulate, smear into something almost reverb-like, or break up into glitchier textures.',
        highlights: [
            'Written in C++ with JUCE, using the framework’s audio processor and editor classes to keep the DSP and the UI separate.'
            // TODO: plugin format(s) (VST3 / AU / standalone) and which DAWs you’ve tested it in.
        ],
        tags: ['C++', 'JUCE', 'DSP', 'Audio plugin'],
        links: [
            // TODO: add a repo link, an audio demo, and/or a download, e.g.
            // { label: 'Source on GitHub', href: 'https://github.com/Jvvol/...' },
            // { label: 'Hear a demo', href: 'https://soundcloud.com/...' }
        ]
    },
    {
        title: 'Granulus',
        context: 'Independent project, audio plugin',
        year: null, // TODO: year started/released
        summary: 'A granular texture processor. It chops incoming audio into small grains and rebuilds it into anything from smooth, evolving pads to glitchy textures to rhythmic stutters.',
        highlights: [
            // TODO: a bullet or two on how it's built, and plugin format(s) / DAWs tested.
        ],
        tags: ['C++', 'JUCE', 'DSP', 'Audio plugin'],
        links: [
            // TODO: repo, demo, or download link
        ]
    },
    {
        title: 'WVU Cyber Sandbox Portal',
        context: 'Senior capstone',
        year: 2026,
        summary: 'A web portal for the WVU Cyber Sandbox, built by a three-person Agile team over five-plus sprints.',
        highlights: [
            'Building the application and server-side logic in Ruby on Rails (MVC).',
            'Deploying the backend on AWS-hosted infrastructure while staying within strict cloud cost limits.'
        ],
        tags: ['Ruby on Rails', 'AWS'],
        links: []
    },
    {
        // TODO: confirm the name. The resume says "Byte Syzed"; the old site said "Byte-Sized".
        title: 'Byte Syzed',
        context: 'Advanced Software Engineering course',
        year: null,
        summary: 'A mobile dietary-safety app that filters 20 to 35 local Morgantown restaurants against 10+ allergen and diet filters.',
        highlights: [
            'Built REST API endpoints in Node.js on a four-table PostgreSQL database.',
            'Implemented bitmask allergen filtering and weighted safety rankings.',
            'Worked with a six-person Agile team across three sprints, using Git/GitHub workflows and Docker for development and deployment.'
        ],
        tags: ['TypeScript', 'Flutter', 'Dart', 'Node.js', 'PostgreSQL', 'Docker'],
        links: []
    },
    {
        title: 'Votr',
        context: 'SteelHacks hackathon',
        year: 2026,
        summary: 'A web app that encourages Gen Z voter turnout with unbiased voting information, built by a four-person team in a 24-plus-hour hackathon.',
        highlights: [
            'Implemented the PostgreSQL backend on Neon serverless Postgres, with TypeScript application logic on top of the data layer.'
        ],
        tags: ['TypeScript', 'PostgreSQL', 'Neon'],
        links: []
    },
    {
        title: 'MapChat',
        context: 'Software Engineering course',
        year: null,
        summary: 'A social media-style web app with built-in weather. I added the weather features, working in the PHP backend and MySQL database.',
        highlights: [
            'Hosted the full application on a Raspberry Pi as a mock demo deployment and presented it live to a panel of three judges.'
        ],
        tags: ['PHP', 'MySQL', 'JavaScript', 'HTML/CSS', 'Raspberry Pi'],
        links: []
    },
    {
        title: 'This portfolio',
        context: 'Personal project',
        year: null,
        summary: 'The site you’re on: plain HTML, CSS, and JavaScript with no framework or build step. Projects and music render from small data files, so adding one doesn’t mean touching the HTML.',
        highlights: [],
        tags: ['HTML', 'CSS', 'JavaScript', 'GitHub Pages'],
        links: [
            { label: 'Source on GitHub', href: 'https://github.com/Jvvol/portfolio_website_v2' }
        ]
    }
];
