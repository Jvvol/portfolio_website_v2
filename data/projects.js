// Projects shown in the Projects section, in display order.
// To add one, copy an entry and edit it. Fields:
//   title      Project name
//   context    Where it came from (course, hackathon, independent), shown under the title
//   year       Optional
//   summary    One or two sentences: what it is and why it matters
//   highlights Optional bullet points: what you did, with outcomes
//   tags       Tech stack
//   links      Optional [{ label, href }], each opens in a new tab
//   area       'both' (audio + software, e.g. plugins) or 'software'. Drives the filter
//              and the indicator light: 'both' is lit. 'audio' also works if you add one.
//   featured   Optional: true shows a large row with a preview. The first featured project
//              leads the list. Others appear under "More projects".
//   media      Optional preview for featured projects. Until set, a placeholder shows.
//                { type: 'image', src, alt }                        screenshot or photo (16:10 works best)
//                { type: 'audio', src, title, transcript }          self-hosted clip, plays on the page
//                { type: 'youtube', id, title }                     click-to-load video
//              Put files in assets/img/projects/ or assets/audio/.
window.PROJECTS = [
    {
        title: 'Etherius',
        context: 'Independent project, audio plugin',
        year: null, // TODO: year started/released
        area: 'both',
        featured: true,
        // TODO: add a short dry vs. processed audio demo, e.g.
        // media: { type: 'audio', src: 'assets/audio/etherius-demo.mp3', title: 'Etherius demo: dry, then wet', transcript: 'Guitar, dry for 8 seconds, then through Etherius.' },
        media: null,
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
        area: 'both',
        featured: true,
        media: null, // TODO: audio demo or a screenshot of the plugin UI
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
        area: 'software',
        featured: true,
        media: null, // TODO: screenshot of the portal (16:10), if the client allows it
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
        area: 'software',
        featured: true,
        media: null, // TODO: app screenshot
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
        area: 'software',
        featured: true,
        media: null, // TODO: screenshot, and a repo or demo link if public
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
        area: 'software',
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
        area: 'software',
        summary: 'The site you’re on: plain HTML, CSS, and JavaScript with no framework or build step. Projects and music render from small data files, so adding one doesn’t mean touching the HTML.',
        highlights: [],
        tags: ['HTML', 'CSS', 'JavaScript', 'GitHub Pages'],
        links: [
            { label: 'Source on GitHub', href: 'https://github.com/Jvvol/portfolio_website_v2' }
        ]
    }
];
