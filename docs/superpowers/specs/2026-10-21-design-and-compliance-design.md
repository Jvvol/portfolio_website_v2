# Design upgrade and legal/compliance pass

Date: 2026-10-21
Branch: `design-and-compliance` (baseline commit `3bb6701` on `main`)

## Goal

Two workstreams on the static portfolio at https://jvvol.github.io/portfolio_website_v2/:

1. **Visual:** make the UI cleaner while keeping the existing aluminum grey / slate ink / mint "indicator light" theme and IBM Plex Sans.
2. **Compliance:** add what a small personal site reasonably needs (privacy, cookies/consent, terms, accessibility statement, form notice, footer links), written for what the site actually does.

Success = no existing content, sections, anchors, or behavior (theme toggle, mobile menu, scroll-spy, project/music rendering, contact form) is lost; all checks in "Verification" pass.

## Facts from the audit and the owner

- Stack: one static page (`index.html`), `styles.css`, `script.js`, data in `data/*.js`, links in `js/config.js`. No build, no framework, no tests. Hosted on GitHub Pages.
- Data touchpoints: Formspree contact form (`https://formspree.io/f/mblydvel`, submitted via `fetch`), GitHub Pages server logs, `localStorage['theme']`, `mailto:` link, plain outbound links. No analytics, ads, pixels, cookies, embeds, payments, accounts, or CDN fonts (IBM Plex is self-hosted). A CSP meta tag already restricts scripts to `'self'`.
- Owner: Jacob Wolfe, contact jawolfe17@yahoo.com. No postal address published ("available on request"). Nothing sold or paid on-site; session work is arranged off-site. No accounts. No data sold or shared, no targeted advertising. Not directed at children. Governing law: West Virginia.
- Audience: global. Policy covers GDPR/UK GDPR, US state laws including CCPA/CPRA, and Canada (PIPEDA).

## Architecture

- Remains static; no build step. Plain HTML pages added at the repo root: `privacy.html`, `cookies.html`, `terms.html`, `accessibility.html`.
- Header and footer markup is duplicated statically in each page (works without JS). Legal page nav links point back to `index.html#section`.
- New `js/consent.js`, loaded first (with `defer`, before `config.js`) on every page.
- Dev-only `package.json` + `tests/` (Playwright, `@axe-core/playwright`). Not referenced by the site. `node_modules/` already gitignored.

## Visual design

Direction: same studio-hardware identity, less visual noise.

- **Tokens:** restructure `:root` into (a) raw palette (`--grey-*`, `--slate-*`, `--mint-*`, `--red-*`), (b) semantic roles (`--color-bg`, `--color-surface`, `--color-surface-sunken`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-accent`, `--color-accent-hover`, `--color-on-accent`, `--color-indicator`, `--color-focus`, `--color-danger`, `--color-success`), (c) type scale, spacing, radius, shadow, motion durations/easing, z-index. Dark theme overrides only the semantic layer (two blocks remain: `[data-theme="dark"]` and the `prefers-color-scheme` fallback, since there's no build to share them). No hard-coded colors outside the token blocks.
- **Cleaner:** fewer borders competing; consistent card padding/radius; uppercase tracked "panel labels" (small, muted) for `dt`s and metadata; consistent section rhythm; capped line lengths.
- **Hierarchy:** hero actions become one primary (View projects), one secondary (Download resume), and quiet text links (Listen to music, Contact).
- **States:** hover, `:focus-visible`, active on all interactive elements; contact form: loading spinner + `aria-busy` on submit, per-field invalid styling with error text after interaction, success/error status styles; existing music empty state kept; project cards without links render cleanly.
- **Motion:** subtle and gated behind `prefers-reduced-motion: no-preference`.
- **Contrast:** all text/background token pairs meet WCAG AA (4.5:1 body, 3:1 large text and UI boundaries/focus).
- **Responsive:** verified at 375, 768, 1280 px. No horizontal scroll.

## Consent manager (`js/consent.js`)

- Categories: `necessary` (always on, not toggleable), `functional`, `analytics`, `marketing`.
- Gating: non-essential scripts are authored as `<script type="text/plain" data-consent="<category>" data-src="<url>">` (or inline body). On grant, the manager creates a real `<script>` with that `src`/body. Nothing is ever fetched before grant.
- Banner: shown only when the page contains at least one gated script **and** no valid stored choice exists. Today: never shown. Buttons: Accept all, Reject all, Customize — same size and style weight.
- Preferences dialog: native `<dialog>`, labelled, per-category switches (`<input type="checkbox" role="switch">`), Save / Accept all / Reject all, Escape closes, focus returns to the opener. When no gated scripts exist, the dialog states that the site uses no optional cookies or trackers.
- Storage: `localStorage['consent.v1']` = `{ version: 1, timestamp, choices: { functional, analytics, marketing } }`. Unknown/older versions are treated as no choice. Storage failures fail closed (nothing optional loads).
- GPC: if `navigator.globalPrivacyControl === true`, `analytics` and `marketing` are forced off and their switches disabled with an explanation.
- Persistent access: footer "Cookie settings" button on every page opens the dialog. Public API: `window.Consent.open()`, `window.Consent.get(category)`.
- README documents how to add a tracker later, including the CSP change required.

## Legal pages

All are drafts (not legal advice), each with an effective date of 2026-10-21 and a short table of contents.

- **Privacy Policy:** who is responsible; data collected (contact form fields + technical metadata via Formspree, emails you send, GitHub Pages server logs, theme preference, consent choice); purposes and GDPR legal bases (legitimate interests in replying; pre-contract steps for session-work inquiries); processors (Formspree, GitHub, Yahoo Mail) and international transfers; retention ([TODO] confirm period); rights by jurisdiction (GDPR/UK GDPR, CCPA/CPRA and other US states, PIPEDA) and how to exercise them, including right to complain to a supervisory authority; no sale/sharing and no targeted advertising (so no "Do Not Sell or Share" link); GPC honored; children's privacy; security; changes; contact.
- **Cookie Policy:** what cookies/storage are; table by category listing every item (`theme`, `consent.v1`; note that Formspree is called only on submit and sets no cookies on this site); how to change choices (Cookie settings, browser controls); GPC.
- **Terms of Use:** acceptance; acceptable use; IP (site code under the repo's license or all rights reserved — [TODO] confirm; music, recordings, artwork, and photos all rights reserved, owned by respective rights holders); copyright/DMCA notice and takedown contact; third-party links; no warranty; limitation of liability; indemnity (light); West Virginia governing law and venue; termination/changes; session work governed by separate agreement.
- **Accessibility Statement:** commitment to WCAG 2.1 AA; measures taken; known limitations; compatibility; feedback contact and target response time; date of last review.

## Forms

- Contact form gains a notice near the submit button linking to the Privacy Policy. No consent checkbox: there is no marketing list, and replying to a message the visitor chose to send rests on legitimate interests. If a newsletter is ever added, it needs a separate, unchecked opt-in.

## Footer (all pages)

`© <year> Jacob Wolfe` · Privacy · Cookies · Terms · Accessibility · Cookie settings (button). Existing profile icon links kept on the home page.

## Accessibility (WCAG 2.1 AA)

Keep and extend existing measures: skip link on every page, semantic landmarks and heading order, alt text, labelled fields with `aria-describedby` for errors, visible focus, keyboard-operable menu/dialog, `aria-current` on nav, reduced motion, sufficient contrast, 44px targets.

## Verification

- Playwright (Chromium): on each page with empty storage, record all network requests; assert none go to a non-self origin. Fixture page `tests/fixtures/consent-test.html` with a gated fake analytics script (served locally): banner appears; script not requested before choice; requested after Accept all; not requested after Reject all; not requested with GPC simulated; choice persists across reload; Cookie settings reopens dialog.
- axe-core on all five pages (light and dark), zero serious/critical violations. Lighthouse accessibility score if available locally.
- Screenshots at 375 and 1280 px of each page for review.
- Existing behavior smoke test: projects and music render, theme toggles, mobile menu opens/closes, contact form shows validation and status states (Formspree request mocked).

## Out of scope

Analytics, newsletter, embeds, new content, changes to resume files, deploying/pushing.

## Items for a lawyer

Formspree's processing terms and DPA; retention period; US transfer mechanism for EU/UK visitors; omission of a postal address; IP/licensing language for code vs. music and photos; whether session-work inquiries need additional terms.
