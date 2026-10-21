// Releases shown in the Music section, in display order.
// While this list is empty, the Music section shows a "Music coming soon" note.
//
// Fields:
//   title     Release title
//   kind      What it is, e.g. 'Game soundtrack', 'Single'
//   artist    Artist, band, or game developer
//   roles     What you did on it (shown as pills)
//   status    Optional badge, e.g. 'In progress', 'Coming soon'
//   year      Optional
//   artwork   Optional square cover image: { src, alt }. Until set, a square placeholder shows.
//             Put files in assets/img/music/ (square, 800x800 or so).
//   link      Optional: { url, label }
//   upcoming  Optional note about a new version: { status, text }
window.MUSIC = [
    {
        title: 'God Stomp',
        kind: 'Game soundtrack',
        artist: 'Game by Owen',
        roles: ['Composed', 'Mixed', 'Mastered'],
        artwork: null, // e.g. { src: 'assets/img/music/god-stomp.jpg', alt: 'God Stomp cover art' }
        link: { url: 'https://owenmakesgames22.itch.io/god-stomp', label: 'Play on itch.io' }
    },
    {
        title: 'Scratchtastic',
        kind: 'Game soundtrack',
        artist: 'Game by Owen',
        roles: ['Composing', 'Producing'],
        status: 'In progress',
        artwork: null, // e.g. { src: 'assets/img/music/scratchtastic.jpg', alt: 'Scratchtastic cover art' }
        link: null
    },
    {
        title: 'Temporary',
        kind: 'Single',
        artist: 'LVNARY',
        roles: ['Guitar', 'Vocals', 'Mastered'],
        status: 'Out now',
        artwork: { src: 'assets/img/music/lvnary-temporary.jpg', alt: 'Cover art for Temporary by LVNARY' },
        link: { url: 'https://open.spotify.com/track/3ggyZEOIxEzwvvdO1oOsAE', label: 'Listen on Spotify' },
        upcoming: {
            status: 'Coming soon',
            text: 'A new version that I’m recording, producing, and mixing myself, and will likely master too.'
        }
    }
];

// Bands shown under "Bands" in the Music section.
window.BANDS = [
    { name: 'LVNARY', roles: ['Guitar', 'Vocals'], instagram: 'https://www.instagram.com/wearelvnary/' },
    { name: 'Bulge', roles: ['Drums'], instagram: 'https://www.instagram.com/morgantowns.bulge/' },
    { name: 'Koal', roles: ['Guitar'], instagram: 'https://www.instagram.com/koalbandwv/' }
];
