# Jacob Wolfe: portfolio

Personal site covering software engineering and music/audio work. Live at https://jvvol.github.io/portfolio_website_v2/

Plain HTML, CSS, and JavaScript. No framework, no build step.

## Run locally

Any static server works. From the repo root:

```sh
python -m http.server 8000
# or: npm run serve   (http://localhost:4173)
```

Then open http://localhost:8000. Opening `index.html` directly also works, except the contact form, which needs to be served over http(s).

## Editing content

| What | Where |
| --- | --- |
| Projects | `data/projects.js` (one object per project, in display order; area, preview media, and case study fields are documented at the top) |
| Releases and bands | `data/music.js` (releases with roles/status/square artwork in `assets/img/music/` and optional click-to-load Spotify/YouTube players; bands with Instagram links) |
| Email and social/music profile links | `js/config.js` (blank values are hidden) |
| About, Session work blurb, Resume, Contact copy | `index.html` |
| Resume files | `assets/resume/` (keep the same filenames, or update the links in `index.html`) |
| Privacy, Cookie, Terms, Accessibility pages | `privacy.html`, `cookies.html`, `terms.html`, `accessibility.html`. Update the "Effective" date when you change one. |

To regenerate the resume PDF after editing the .docx: open it in Word, then File > Save As > PDF.

The header and footer are repeated in each HTML page so they work without JavaScript. If you change a nav or footer link, change it in all five pages.

## Structure

```
index.html          Home page: hero, Projects, Music, About, Resume, Contact
privacy.html        Privacy Policy
cookies.html        Cookie Policy
terms.html          Terms of Use
accessibility.html  Accessibility Statement
styles.css          Design tokens (palette → semantic roles → scale), layout, components
script.js           Home page only: scroll-spy, rendering projects and music, contact form
js/site.js          Every page: theme toggle, header border, mobile menu, footer year
js/consent.js       Every page: cookie consent manager and "Cookie settings" dialog
js/config.js        Links
data/               Projects and music data
assets/             Fonts (IBM Plex Sans, OFL), images, favicons (img/favicon/), resume files
tests/              Dev-only browser checks (not used by the site)
```

## Design tokens

Colors live only in the `:root` blocks at the top of `styles.css`: a raw palette (`--grey-*`, `--slate-*`, `--mint-*`, `--red-*`), then semantic roles (`--color-text`, `--color-accent`, `--color-indicator`, …) that components use. Dark mode overrides only the semantic roles, in two places (the `[data-theme="dark"]` block and the `prefers-color-scheme` block); keep them identical. A test fails if a raw color appears anywhere else.

## Privacy and cookies

The site sets no cookies, loads nothing from other companies' servers until a visitor presses "Play here" on an embedded Spotify or YouTube player, and has no analytics. It stores two settings in local storage: `theme` and `consent.v1`. If that changes, update `privacy.html` and `cookies.html`.

### Adding an analytics or other optional script later

1. Add it as a gated placeholder so it can't run before consent:
   ```html
   <script type="text/plain" data-consent="analytics" data-src="https://example.com/tag.js"></script>
   ```
   Categories: `functional`, `analytics`, `marketing`. Inline code also works (put it inside the tag instead of `data-src`).
2. Add the script's domains to the Content-Security-Policy `<meta>` in every page (`script-src`, and `connect-src`/`img-src` if it sends data).
3. Add every cookie it sets to the table in `cookies.html`, and the provider to "Who receives it" in `privacy.html`.
4. Bump `VERSION` in `js/consent.js` if earlier choices shouldn't carry over.

The consent banner appears automatically on any page with a gated script, with equal Accept all / Reject all buttons. Global Privacy Control keeps analytics and marketing off. `window.Consent.get('analytics')` reports the current choice.

## Tests

Dev-only. Needs Node.js.

```sh
npm install
npx playwright install chromium
npm test
```

Covers existing behavior, the contact form, the consent manager (using `tests/fixtures/consent-test.html` with a fake tracker), the legal pages, that no page contacts a third party on load, accessibility (axe), and layout at phone, tablet, and desktop widths.

## Deploy

The site is served by GitHub Pages from the root of `main`. Push to `main` and Pages redeploys within a minute or two. If the site ever moves to a different URL, update the canonical and `og:`/`twitter:` URLs in the `<head>` of each page.

The contact form posts to Formspree (`https://formspree.io/f/mblydvel`).

---

© Jacob Wolfe
