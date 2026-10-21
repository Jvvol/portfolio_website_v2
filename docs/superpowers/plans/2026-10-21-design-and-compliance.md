# Design Upgrade and Compliance Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cleaner UI on the existing aluminum/slate/mint theme, plus privacy, cookie, terms, and accessibility pages, a dormant consent manager, and form/footer compliance.

**Architecture:** Static site, no build. Four new root-level HTML pages share `styles.css`. `js/consent.js` injects its banner/dialog at runtime and gates `type="text/plain"` scripts. Dev-only Playwright + axe tests in `tests/` serve the repo with `http-server`.

**Tech Stack:** HTML, CSS custom properties, vanilla JS (IIFE, `'use strict'`, 4-space indent, matching `script.js`); dev: `@playwright/test`, `@axe-core/playwright`, `http-server`.

**Spec:** `docs/superpowers/specs/2026-10-21-design-and-compliance-design.md`

## Global Constraints

- No build step; site must run from any static server and from GitHub Pages at `/portfolio_website_v2/` (use relative URLs only).
- Keep theme: IBM Plex Sans (self-hosted), aluminum grey / slate ink / mint indicator lights. No new fonts or CDN assets.
- Keep all existing section ids and anchors: `#top #main #about #projects #music #bands #resume #contact`.
- No hard-coded colors outside the `:root` token blocks in `styles.css`.
- WCAG 2.1 AA: 4.5:1 text, 3:1 large text/UI/focus; targets ≥ 44px; all motion behind `prefers-reduced-motion: no-preference`.
- Consent storage key `consent.v1`; categories `necessary`, `functional`, `analytics`, `marketing`.
- Legal effective date: `October 21, 2026`. Contact: `jawolfe17@yahoo.com`. Governing law: West Virginia. No postal address ("available on request").
- Placeholders the owner must fill use the exact form `[TODO: ...]`, visible in page text.
- CSP meta tag stays on every page (same policy as `index.html`).
- Commit after each task with the attribution trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. `localStorage` throws (blocked storage / private mode) → theme toggle still works, consent fails closed, Cookie settings dialog still opens. Test in Task 4.
2. Corrupt or old-version `consent.v1` value → treated as no choice; banner shows when gated scripts exist; nothing optional loads. Test in Task 4.
3. JavaScript disabled → legal links in footer work, Cookie settings button hidden, contact form still submits via plain POST. Test in Task 5.
4. Keyboard-only use of the consent dialog → reachable from footer, switches operable with Space, Escape closes, focus returns to the opener. Test in Task 4.
5. 375px viewport → no horizontal overflow on any page. Test in Task 6.

---

### Task 1: Test harness and baseline smoke tests

**Files:**
- Create: `package.json`, `playwright.config.js`, `tests/smoke.spec.js`, `tests/network.spec.js`, `tests/helpers.js`
- Modify: `.gitignore` (add `test-results/`, `playwright-report/`)

**Interfaces:**
- Produces: `npm test` runs Playwright against `http://localhost:4173` (webServer: `npx http-server . -p 4173 -c-1 -s`). `tests/helpers.js` exports `PAGES = ['/index.html']` (Task 5 extends it) and `collectExternalRequests(page): string[]` (records request URLs whose origin ≠ `http://localhost:4173`).

- [ ] **Step 1:** `package.json` with `"private": true`, scripts `test` = `playwright test`, devDependencies `@playwright/test`, `@axe-core/playwright`, `http-server`. Run `npm install` and `npx playwright install chromium`.
- [ ] **Step 2: Write smoke tests** (`tests/smoke.spec.js`), each against `/index.html`:
  - `projects render`: `#projects-list article` count = 7; first has text `Featured`.
  - `music renders`: `#music-list > li` count = 3; `#band-list > li` count = 3; `#music-empty` hidden.
  - `theme toggles`: click `#theme-toggle` → `html[data-theme]` flips; reload → persists.
  - `mobile menu`: at 375×800, click `#menu-toggle` → `aria-expanded="true"`, `#nav-links` visible; Escape → `"false"`, focus on `#menu-toggle`.
  - `contact form success`: `page.route('https://formspree.io/**', r => r.fulfill({ status: 200, body: '{}' }))`; fill fields, submit → `#form-status` contains `Message sent`.
  - `contact form failure`: route fulfills `500` → `#form-status` has class `is-error`.
- [ ] **Step 3: Write** `tests/network.spec.js`: for each of `PAGES`, fresh context, load, wait for `networkidle`, assert `collectExternalRequests` is `[]`.
- [ ] **Step 4:** Run `npm test`. Expected: all PASS against the current site (this is the regression baseline). If any fails, stop and report — do not change site code in this task.
- [ ] **Step 5:** Commit `test: add Playwright harness and baseline smoke tests`.

### Task 2: Design tokens and visual cleanup

Invoke the `frontend-design:frontend-design` skill before editing. Direction is fixed by the spec: same theme, less noise.

**Files:**
- Modify: `styles.css` (whole file), `index.html` (hero actions; class names only elsewhere), `script.js` (only if a class name it emits changes)

**Interfaces:**
- Produces: semantic tokens used by all later CSS: `--color-bg --color-surface --color-surface-sunken --color-text --color-text-muted --color-border --color-accent --color-accent-hover --color-on-accent --color-indicator --color-focus --color-danger --color-success`; plus `--step--1..--step-4`, `--space-1..--space-6`, `--radius-sm --radius --radius-lg`, `--shadow-1 --shadow-2`, `--dur-fast --dur --dur-slow`, `--ease`, `--z-header --z-overlay --z-skip`. Utility classes: `.panel-label` (uppercase tracked muted small label), `.link-btn` (button styled as a text link). Later tasks use these, not raw values.

- [ ] **Step 1: Write failing test** `tests/design.spec.js`:
  - `hero has one primary action`: `.hero-actions .btn-primary` count = 1, and links to `#projects`.
  - `no raw colors outside tokens`: read `styles.css` via `fs`; strip the `:root…{}` token blocks (selectors `:root`, `:root[data-theme="dark"]`, `:root:not([data-theme="light"])`); assert remaining text has no match for `/#[0-9a-f]{3,8}\b|rgb\(|hsl\(/i`.
- [ ] **Step 2:** Run `npx playwright test tests/design.spec.js`. Expected: FAIL (raw `#b3261e`/`#ffb4ab` and `rgb(0 0 0 / …)` exist; hero has one primary already — if that assertion passes, keep it as a guard).
- [ ] **Step 3: Restructure tokens** in `styles.css`: raw palette (`--grey-*`, `--slate-*`, `--mint-*`, `--red-*`), then semantic roles for light, then the two dark override blocks touching only semantic roles. Replace every component reference with semantic tokens.
- [ ] **Step 4: Clean up components** per spec: consistent card padding/radius; drop redundant borders where spacing already separates; `dt`s and `.card-meta`/`.resume-meta` use `.panel-label` styling; hero actions in `index.html` become `View projects` (`.btn-primary`), `Download resume` (`.btn`), then `Listen to music` and `Contact` as `.btn-quiet`; hover/active/focus-visible on every interactive class. Keep `.reveal` behavior.
- [ ] **Step 5:** Run `npm test`. Expected: all PASS (design + Task 1 smoke + network).
- [ ] **Step 6:** Screenshot `/index.html` at 375×800 and 1280×900 (light and dark) to `test-results/` and view them; fix any visual regressions.
- [ ] **Step 7:** Commit `style: consolidate design tokens and clean up UI`.

### Task 3: Contact form states and privacy notice

**Files:**
- Modify: `index.html:308-325` (form), `script.js` (contact form block), `styles.css` (form section)
- Test: `tests/form.spec.js`

**Interfaces:**
- Consumes: tokens `--color-danger --color-success --color-focus`.
- Produces: per-field error elements `<p class="field-error" id="<field>-error">` linked with `aria-describedby`; invalid fields get `aria-invalid="true"`. Submit button gets `aria-busy="true"` and class `is-loading` while sending. Notice `<p class="form-note">` containing link `privacy.html`.

- [ ] **Step 1: Write failing tests:**
  - `privacy notice links policy`: `#contact-form .form-note a[href="privacy.html"]` visible.
  - `errors only after interaction`: on load no `[aria-invalid="true"]`; submit empty form → `#name`, `#email`, `#message` have `aria-invalid="true"` and `#email-error` is non-empty and focus is on `#name`.
  - `invalid email message`: fill email `foo` and blur → `#email-error` text contains `email address`.
  - `loading state`: route Formspree with a 500ms delayed 200 → during request button has `aria-busy="true"`; after, attribute absent and status says `Message sent`.
- [ ] **Step 2:** Run `npx playwright test tests/form.spec.js`. Expected: FAIL.
- [ ] **Step 3:** Implement: add `novalidate` only when JS runs (set from `script.js`, so no-JS keeps native validation); validate with `input.validity`; copy: name `Enter your name.`, email `Enter a valid email address.`, message `Enter a message.`; notice copy: `I’ll only use this to reply to you. See the <a href="privacy.html" class="text-link">Privacy Policy</a>.` Spinner is a CSS pseudo-element on `.btn.is-loading` (static when reduced motion).
- [ ] **Step 4:** Run `npm test`. Expected: all PASS.
- [ ] **Step 5:** Commit `feat: contact form validation states and privacy notice`.

### Task 4: Consent manager

**Files:**
- Create: `js/consent.js`, `tests/consent.spec.js`, `tests/fixtures/consent-test.html`
- Modify: `index.html` (load `js/consent.js` first among deferred scripts; footer button), `styles.css` (banner, dialog, switch)

**Interfaces:**
- Consumes: `.link-btn`, tokens, `--z-overlay`.
- Produces:
  - `window.Consent.open(): void`, `.get(category: string): boolean`, `.acceptAll(): void`, `.rejectAll(): void`, `.save(choices: {functional: boolean, analytics: boolean, marketing: boolean}): void`.
  - Stored value: `localStorage['consent.v1'] = JSON.stringify({ version: 1, timestamp: <ISO string>, choices: {...} })`.
  - Event: `document` dispatches `consent:change` with `detail = choices`.
  - DOM (injected): `#consent-banner` (`role="region"`, `aria-label="Cookie consent"`), `#consent-dialog` (`<dialog aria-labelledby="consent-title">`), buttons `[data-consent-action="accept|reject|customize|save"]`, switches `input[type=checkbox][role=switch][name="consent-<category>"]`.
  - Footer trigger on every page: `<button type="button" class="link-btn" data-consent-open hidden>Cookie settings</button>`; `consent.js` removes `hidden` and wires it.
  - Gated script contract: `<script type="text/plain" data-consent="<category>" data-src="<url>">` (or inline body). Activation clones `src`/text into a new `<script>` inserted after the placeholder; each placeholder activates at most once.

- [ ] **Step 1: Fixture** `tests/fixtures/consent-test.html`: same head/footer as `index.html` minus CSP, plus `<script type="text/plain" data-consent="analytics" data-src="https://analytics.example.test/a.js"></script>` and `js/consent.js` via `../../js/consent.js`.
- [ ] **Step 2: Write failing tests** (all routes `https://analytics.example.test/**` to fulfill `window.__analyticsLoaded = true` and record hits):
  - `no banner on real site`: `/index.html` → `#consent-banner` absent; `[data-consent-open]` visible.
  - `blocks before choice`: fixture → banner visible; 0 hits after `networkidle`.
  - `accept loads`: click accept → 1 hit; `window.__analyticsLoaded === true`; reload → no banner, 1 more hit.
  - `reject blocks`: click reject → 0 hits; reload → no banner, 0 hits.
  - `buttons equal prominence`: accept and reject have equal `getBoundingClientRect().height` and identical computed `background-color`, `color`, `font-weight`.
  - `customize saves granular`: customize → dialog open; toggle analytics on, save → 1 hit; stored `choices.analytics === true`, `marketing === false`.
  - `GPC forces off`: `addInitScript` defines `navigator.globalPrivacyControl = true`; click accept → 0 hits; dialog analytics/marketing switches `disabled` and dialog text contains `Global Privacy Control`.
  - `corrupt storage = no choice` (Review Focus 2): init script sets `consent.v1` to `"garbage"`, then separately to `{"version":0,...}` → banner visible, 0 hits.
  - `storage blocked fails closed` (Review Focus 1): init script makes `Storage.prototype.getItem/setItem` throw → banner visible, accept loads for this page only (1 hit), `#theme-toggle` click still flips `data-theme`, footer button opens dialog.
  - `keyboard dialog` (Review Focus 4): on `/index.html`, focus `[data-consent-open]`, Enter → `#consent-dialog[open]`; dialog says `no optional cookies or trackers`; Escape → closed and `document.activeElement` is the trigger. On fixture: Tab to analytics switch, Space → `checked`.
- [ ] **Step 3:** Run `npx playwright test tests/consent.spec.js`. Expected: FAIL.
- [ ] **Step 4:** Implement `js/consent.js` (IIFE, `'use strict'`). Banner copy: `This site would like to use optional cookies for {categories}. You can accept, reject, or choose.` Category descriptions: functional `Remember extra preferences and enable embedded content.`; analytics `Help me understand how the site is used.`; marketing `Measure or personalize ads.` Empty-state copy: `This site doesn’t use any optional cookies or trackers, so there’s nothing to turn on or off. Your theme choice is stored on your device only because you asked for it.` Link to `cookies.html` in banner and dialog. Banner is non-modal (doesn't trap focus); dialog uses `showModal()`.
- [ ] **Step 5:** Run `npm test`. Expected: all PASS.
- [ ] **Step 6:** Commit `feat: consent manager with script gating and GPC`.

### Task 5: Legal pages, shared header/footer

**Files:**
- Create: `privacy.html`, `cookies.html`, `terms.html`, `accessibility.html`, `tests/pages.spec.js`
- Modify: `index.html` (footer), `styles.css` (`.legal` layout, `.footer-legal`), `tests/helpers.js` (`PAGES` += 4 pages), `README.md` (pages list; "Adding a tracker" section incl. CSP change)

**Interfaces:**
- Consumes: `data-consent-open` trigger contract (Task 4), tokens, `.panel-label`.
- Produces: footer markup used identically on all 5 pages: `<nav class="footer-legal" aria-label="Legal">` with links `privacy.html` `Privacy`, `cookies.html` `Cookies`, `terms.html` `Terms`, `accessibility.html` `Accessibility`, then the Cookie settings button; copyright `© <span data-year>2026</span> Jacob Wolfe`. Legal pages load only `js/consent.js` and a minimal shared script for theme toggle/menu/year — extract those from `script.js` into `js/site.js` and load `js/site.js` on all pages (index keeps `script.js` for rendering).

- [ ] **Step 1: Write failing tests** (`tests/pages.spec.js`), for each legal page:
  - has exactly one `h1`, a `.legal-effective` containing `October 21, 2026`, a skip link to `#main`, and a TOC whose every `href="#x"` resolves to an element id on the page.
  - footer on all 5 pages has the four legal links and `[data-consent-open]`.
  - nav links on legal pages point to `index.html#about` … `index.html#contact`.
  - `no-JS` (Review Focus 3): context with `javaScriptEnabled: false` on `/index.html` and `/privacy.html` → legal links visible, `[data-consent-open]` hidden, `#contact-form` has `action` starting `https://formspree.io/` and no `novalidate`.
  - content checks: privacy page contains `Formspree`, `GitHub`, `Global Privacy Control`, `do not sell or share`, `13`; cookies page has a table with rows `theme` and `consent.v1`; terms contains `West Virginia` and `DMCA`; accessibility contains `WCAG 2.1` and `jawolfe17@yahoo.com`.
- [ ] **Step 2:** Run `npx playwright test tests/pages.spec.js`. Expected: FAIL.
- [ ] **Step 3:** Extract theme/menu/year/header-scroll into `js/site.js`; `script.js` keeps rendering, scroll-spy, reveal, form. Run `npm test` → Task 1–4 tests still PASS.
- [ ] **Step 4:** Write the four pages with the content listed in the spec's "Legal pages" section. Required `[TODO: ...]` placeholders: retention period for contact messages (privacy); code license decision (terms); none other unless a fact is unknown — ask the owner rather than invent. Each page opens with a visible note: `This is a plain-language policy for a personal portfolio site.`
- [ ] **Step 5:** Run `npm test`. Expected: all PASS, including `network.spec.js` over all 5 pages.
- [ ] **Step 6:** Commit `feat: privacy, cookie, terms, and accessibility pages`.

### Task 6: Accessibility and layout verification

**Files:**
- Create: `tests/a11y.spec.js`, `tests/layout.spec.js`

- [ ] **Step 1: Write tests:**
  - `a11y.spec.js`: for each of `PAGES` in light and dark (`emulateMedia({ colorScheme })`), `new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()` → no violations with impact `serious` or `critical`. Also with the consent dialog open on `/index.html`.
  - `layout.spec.js` (Review Focus 5): for each page at widths 375, 768, 1280 → `document.documentElement.scrollWidth <= window.innerWidth`; save full-page screenshots to `test-results/screens/<page>-<width>.png`.
- [ ] **Step 2:** Run `npm test`. Fix any violations in site code (not by disabling rules). Re-run until PASS.
- [ ] **Step 3:** Run Lighthouse accessibility for `/index.html` and `/privacy.html`: `npx --yes lighthouse http://localhost:4173/<page> --only-categories=accessibility,best-practices --quiet --chrome-flags="--headless" --output=json --output-path=test-results/lh-<page>.json` (server started with `npx http-server . -p 4173 -c-1 -s`). Record scores.
- [ ] **Step 4:** View the screenshots; fix layout defects found.
- [ ] **Step 5:** Commit `test: accessibility and responsive layout checks`.
