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
//   embed     Optional on-page player, loaded only when the visitor presses Play:
//               { provider: 'spotify', kind: 'track' | 'album', id }
//               { provider: 'youtube', id }
//             The id is the last part of the share URL.
window.MUSIC = [
    {
        title: 'God Stomp',
        kind: 'Game soundtrack',
        artist: 'Game by Owen',
        roles: ['Composed', 'Mixed', 'Mastered'],
        status: 'Out now',
        artwork: { src: 'assets/img/music/god-stomp.png', alt: 'God Stomp title art: the game logo above five pixel-art portraits of the hero in different colored headbands', pixelated: true },
        link: { url: 'https://owenmakesgames22.itch.io/god-stomp', label: 'Play on itch.io' }
        // TODO: the soundtrack isn't playable on this site yet. Add a YouTube or Spotify embed
        // here if it's uploaded anywhere, e.g. embed: { provider: 'youtube', id: '...' }
    },
    {
        title: 'Scratch Fever',
        kind: 'Game soundtrack',
        artist: 'Game by Owen',
        roles: ['Composing', 'Producing'],
        status: 'In progress',
        artwork: { src: 'assets/img/music/scratch-fever.jpg', alt: 'Scratch Fever capsule art: a red-lit cartoon skull with its jaw open' },
        // TODO: a short soundtrack excerpt would let visitors hear this one before release
        // (self-hosted, or a YouTube upload as embed: { provider: 'youtube', id }).
        // On release: set status to 'Out now' and replace null with the store link:
        // { url: 'https://store.steampowered.com/app/APP_ID/', label: 'Get it on Steam' }
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
        embed: { provider: 'spotify', kind: 'track', id: '3ggyZEOIxEzwvvdO1oOsAE' }
    },
    {
        title: 'Knuckle Dragger',
        kind: 'Single',
        artist: 'Dreamkiller 276 feat. Bulge',
        roles: ['Recorded vocals', 'Produced vocals'],
        status: 'Out now',
        artwork: { src: 'assets/img/music/knuckle-dragger.jpg', alt: 'Cover art for Knuckle Dragger by Dreamkiller 276 featuring Bulge: a family watching an old TV, with the title in spiky blue lettering' },
        link: { url: 'https://open.spotify.com/album/5ucNEEsBSzftSpstvfKm16', label: 'Listen on Spotify' },
        embed: { provider: 'spotify', kind: 'album', id: '5ucNEEsBSzftSpstvfKm16' }
    }
];

// Bands shown under "Bands" in the Music section.
window.BANDS = [
    { name: 'LVNARY', roles: ['Guitar', 'Vocals'], instagram: 'https://www.instagram.com/wearelvnary/' },
    { name: 'Bulge', roles: ['Drums'], instagram: 'https://www.instagram.com/morgantowns.bulge/' },
    { name: 'Koal', roles: ['Guitar'], instagram: 'https://www.instagram.com/koalbandwv/' }
];
