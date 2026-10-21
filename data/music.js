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
//   artwork   Optional square cover image: { src, alt, pixelated }. Until set, a square placeholder shows.
//             pixelated: true keeps pixel art crisp when scaled.
//             Put files in assets/img/music/ (square, 800x800 or so).
//   link      Optional: { url, label }
//   upcoming  Optional note about a new version: { status, text }
window.MUSIC = [
    {
        title: 'God Stomp',
        kind: 'Game soundtrack',
        artist: 'Game by Owen',
        roles: ['Composed', 'Mixed', 'Mastered'],
        artwork: { src: 'assets/img/music/god-stomp.png', alt: 'God Stomp title art: the game logo above five pixel-art portraits of the hero in different colored headbands', pixelated: true },
        link: { url: 'https://owenmakesgames22.itch.io/god-stomp', label: 'Play on itch.io' }
    },
    {
        title: 'Scratch Fever',
        kind: 'Game soundtrack',
        artist: 'Game by Owen',
        roles: ['Composing', 'Producing'],
        status: 'In progress',
        artwork: { src: 'assets/img/music/scratch-fever.png', alt: 'Scratch Fever capsule art: a red-lit cartoon skull with its jaw open' },
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
    },
    {
        title: 'Knuckle Dragger',
        kind: 'Single',
        artist: 'Dreamkiller 276 feat. Bulge',
        year: 2026,
        roles: ['Recorded vocals', 'Produced vocals'],
        status: 'Out now',
        artwork: { src: 'assets/img/music/knuckle-dragger.jpg', alt: 'Cover art for Knuckle Dragger by Dreamkiller 276 featuring Bulge: a family watching an old TV, with the title in spiky blue lettering' },
        link: { url: 'https://open.spotify.com/album/5ucNEEsBSzftSpstvfKm16', label: 'Listen on Spotify' }
    }
];

// Bands shown under "Bands" in the Music section.
window.BANDS = [
    { name: 'LVNARY', roles: ['Guitar', 'Vocals'], instagram: 'https://www.instagram.com/wearelvnary/' },
    { name: 'Bulge', roles: ['Drums'], instagram: 'https://www.instagram.com/morgantowns.bulge/' },
    { name: 'Koal', roles: ['Guitar'], instagram: 'https://www.instagram.com/koalbandwv/' }
];
