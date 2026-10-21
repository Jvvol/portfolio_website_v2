# Jacob Wolfe: portfolio

Personal site covering software engineering and music/audio work. Live at https://jvvol.github.io/portfolio_website_v2/

Plain HTML, CSS, and JavaScript. No framework, no build step.

## Run locally

Any static server works. From the repo root:

```sh
python -m http.server 8000
# or: npx serve .
```

Then open http://localhost:8000. Opening `index.html` directly also works, except the contact form, which needs to be served over http(s).

## Editing content

| What | Where |
| --- | --- |
| Projects | `data/projects.js` (one object per project, in display order) |
| Releases and bands | `data/music.js` (releases with roles/status/square artwork in `assets/img/music/`; bands with Instagram links) |
| Email and social/music profile links | `js/config.js` (blank values are hidden) |
| About, Session work blurb, Resume, Contact copy | `index.html` |
| Resume files | `assets/resume/` (keep the same filenames, or update the links in `index.html`) |

To regenerate the resume PDF after editing the .docx: open it in Word, then File > Save As > PDF.

## Structure

```
index.html          Single page: hero, About, Projects, Music, Resume, Contact
styles.css          Design tokens (light/dark), layout, components
script.js           Theme toggle, nav/scroll-spy, rendering projects and music, contact form
data/               Projects and music data
js/config.js        Links
assets/             Fonts (IBM Plex Sans, OFL), images, favicons (img/favicon/), resume files
```

## Deploy

The site is served by GitHub Pages from the root of `main`. Push to `main` and Pages redeploys within a minute or two. If the site ever moves to a different URL, update the canonical and `og:`/`twitter:` URLs in the `<head>` of `index.html`.

The contact form posts to Formspree (`https://formspree.io/f/mblydvel`).

---

© Jacob Wolfe
