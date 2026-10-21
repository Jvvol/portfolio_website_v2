// Cookie consent manager.
//
// Optional scripts never load until the visitor allows their category. Write them as:
//   <script type="text/plain" data-consent="analytics" data-src="https://example.com/tag.js"></script>
// (or put the code inside the tag instead of data-src). Categories: functional, analytics, marketing.
// Other attributes (integrity, crossorigin, id, data-*) carry over, and gated scripts run in page order.
// Each page's Content-Security-Policy must also allow the script's origin, or the browser blocks it.
//
// The banner only appears on pages that contain such a script and only until the visitor
// chooses. "Cookie settings" ([data-consent-open]) opens the preferences at any time.
// A Global Privacy Control signal keeps analytics and marketing off.
(function () {
    'use strict';

    const KEY = 'consent.v1';
    const VERSION = 1;
    const OPTIONAL = ['functional', 'analytics', 'marketing'];
    const GPC_BLOCKS = ['analytics', 'marketing'];
    const CATEGORIES = {
        functional: { title: 'Functional', text: 'Remember extra preferences and enable embedded content.' },
        analytics: { title: 'Analytics', text: 'Help me understand how the site is used.' },
        marketing: { title: 'Marketing', text: 'Measure or personalize ads.' }
    };

    const gpc = navigator.globalPrivacyControl === true;
    // Resolve the policy link from this file's location so it works from any page depth.
    const scriptSrc = document.currentScript && document.currentScript.src;
    const policyUrl = scriptSrc ? new URL('../cookies.html', scriptSrc).href : 'cookies.html';

    let choices = read();   // null until the visitor decides
    let banner = null;
    let dialog = null;
    let opener = null;

    // Small DOM helper: el('p', { class: 'x' }, 'text', childNode)
    function el(tag, attrs, ...children) {
        const node = document.createElement(tag);
        for (const [key, value] of Object.entries(attrs || {})) {
            if (value === null || value === undefined || value === false) continue;
            node.setAttribute(key, value === true ? '' : value);
        }
        for (const child of children.flat()) {
            if (child === null || child === undefined || child === false) continue;
            node.append(child instanceof Node ? child : document.createTextNode(String(child)));
        }
        return node;
    }

    // Storage
    // ------------------------------------------------------------------------
    function read() {
        try {
            const saved = JSON.parse(localStorage.getItem(KEY));
            if (!saved || saved.version !== VERSION || typeof saved.choices !== 'object') return null;
            return normalize(saved.choices);
        } catch (e) {
            return null;    // missing, corrupt, or blocked storage: treat as no choice
        }
    }

    function write(next) {
        try {
            localStorage.setItem(KEY, JSON.stringify({ version: VERSION, timestamp: new Date().toISOString(), choices: next }));
        } catch (e) { /* storage blocked: the choice applies to this page only */ }
    }

    // Every optional category as a strict boolean, with GPC applied.
    function normalize(raw) {
        const out = {};
        OPTIONAL.forEach(cat => { out[cat] = raw[cat] === true && !(gpc && GPC_BLOCKS.includes(cat)); });
        return out;
    }

    // Gated scripts
    // ------------------------------------------------------------------------
    function gatedScripts() {
        return [...document.querySelectorAll('script[type="text/plain"][data-consent]')];
    }

    // Categories a visitor's choice can actually turn on for this page (GPC may already have decided).
    function askableCategories() {
        return [...new Set(gatedScripts().map(s => s.dataset.consent))]
            .filter(cat => CATEGORIES[cat] && !(gpc && GPC_BLOCKS.includes(cat)));
    }

    const SKIP_ATTRS = ['type', 'data-consent', 'data-src', 'data-consent-activated'];
    // Each activation waits for the one before it, so a library always loads before code that uses it.
    let queue = Promise.resolve();

    function activate(placeholder) {
        if (placeholder.dataset.consentActivated) return;
        placeholder.dataset.consentActivated = 'true';
        const script = document.createElement('script');
        for (const { name, value } of [...placeholder.attributes]) {
            if (!SKIP_ATTRS.includes(name)) script.setAttribute(name, value);
        }
        placeholder.removeAttribute('id');   // the real script takes over the id
        const src = placeholder.dataset.src;
        if (src) script.src = src;
        else script.text = placeholder.text;
        queue = queue.then(() => new Promise(done => {
            if (src) script.onload = script.onerror = done;
            placeholder.after(script);
            if (!src) done();
        }));
    }

    function applyChoices() {
        if (!choices) return;
        gatedScripts().forEach(s => { if (choices[s.dataset.consent]) activate(s); });
    }

    // Public API
    // ------------------------------------------------------------------------
    // True when a category that already loaded a script is being switched off.
    function revokesLoaded(next) {
        const running = new Set(gatedScripts().filter(s => s.dataset.consentActivated).map(s => s.dataset.consent));
        return OPTIONAL.some(cat => get(cat) && !next[cat] && running.has(cat));
    }

    function save(next) {
        const normalized = normalize(next || {});
        const reload = revokesLoaded(normalized);
        choices = normalized;
        write(choices);
        // A script can't be unloaded, so start the page fresh without it.
        if (reload) { location.reload(); return; }
        applyChoices();
        if (banner) banner.hidden = true;
        document.dispatchEvent(new CustomEvent('consent:change', { detail: { ...choices } }));
    }

    function all(value) {
        const next = {};
        OPTIONAL.forEach(cat => { next[cat] = value; });
        return next;
    }

    function acceptAll() { save(all(true)); }
    function rejectAll() { save(all(false)); }

    function get(category) {
        if (category === 'necessary') return true;
        return Boolean(choices && choices[category]);
    }

    // Banner
    // ------------------------------------------------------------------------
    function actionButton(action, label) {
        return el('button', { type: 'button', class: 'btn', 'data-consent-action': action }, label);
    }

    function listOf(words) {
        if (words.length < 2) return words.join('');
        return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
    }

    function buildBanner() {
        const used = askableCategories().map(cat => CATEGORIES[cat].title.toLowerCase());
        banner = el('section', { id: 'consent-banner', class: 'consent-banner', 'aria-label': 'Cookie consent' },
            el('p', { class: 'consent-text' },
                `This site would like to use optional cookies for ${listOf(used)}. You can accept, reject, or choose. `,
                el('a', { href: policyUrl, class: 'text-link' }, 'Cookie Policy')),
            el('div', { class: 'consent-actions' },
                actionButton('accept', 'Accept all'),
                actionButton('reject', 'Reject all'),
                actionButton('customize', 'Customize'))
        );
        banner.addEventListener('click', e => {
            const action = e.target.closest('[data-consent-action]');
            if (!action) return;
            if (action.dataset.consentAction === 'customize') { open(action); return; }
            if (action.dataset.consentAction === 'accept') acceptAll();
            else rejectAll();
            // The banner just hid the focused button; keep keyboard users on the way back in.
            const settings = document.querySelector('[data-consent-open]:not([hidden])');
            if (settings) settings.focus();
        });
        const skip = document.querySelector('.skip-link');
        if (skip) skip.after(banner);
        else document.body.prepend(banner);
    }

    // Preferences dialog
    // ------------------------------------------------------------------------
    function categoryRow(cat) {
        const blocked = gpc && GPC_BLOCKS.includes(cat);
        const id = `consent-${cat}`;
        return el('li', { class: 'consent-category' },
            el('div', { class: 'consent-category-text' },
                el('label', { for: id, class: 'consent-category-title' }, CATEGORIES[cat].title),
                el('p', { id: `${id}-desc` }, CATEGORIES[cat].text)),
            el('input', {
                type: 'checkbox', role: 'switch', class: 'switch', id, name: id,
                'aria-describedby': `${id}-desc`,
                checked: get(cat), disabled: blocked
            })
        );
    }

    function buildDialog() {
        const hasOptional = gatedScripts().length > 0;
        const intro = hasOptional
            ? el('p', null, 'Choose which optional cookies this site may use. You can change this at any time from “Cookie settings” at the bottom of each page. If you turn off something that’s already running, the page reloads without it.')
            : el('p', null, 'This site doesn’t use any optional cookies or trackers, so there’s nothing to turn on or off. Your theme choice is stored on your device only because you asked for it.');

        const necessary = el('li', { class: 'consent-category' },
            el('div', { class: 'consent-category-text' },
                el('span', { class: 'consent-category-title' }, 'Strictly necessary'),
                el('p', null, 'Remember your theme and your cookie choices. Always on.')));

        dialog = el('dialog', { id: 'consent-dialog', class: 'consent-dialog', 'aria-labelledby': 'consent-title' },
            el('h2', { id: 'consent-title' }, 'Cookie settings'),
            intro,
            gpc && hasOptional && el('p', { class: 'consent-gpc' },
                'Your browser sent a Global Privacy Control signal, so analytics and marketing stay off.'),
            el('ul', { class: 'consent-categories' }, necessary, hasOptional && OPTIONAL.map(categoryRow)),
            el('p', { class: 'consent-policy' }, 'Details are in the ', el('a', { href: policyUrl, class: 'text-link' }, 'Cookie Policy'), '.'),
            el('div', { class: 'consent-actions' },
                hasOptional
                    ? [actionButton('save', 'Save choices'), actionButton('accept', 'Accept all'), actionButton('reject', 'Reject all')]
                    : actionButton('close', 'Close'))
        );

        dialog.addEventListener('click', e => {
            if (e.target === dialog && outside(e, dialog)) { close(); return; }   // click on the backdrop
            const action = e.target.closest('[data-consent-action]');
            if (!action) return;
            const name = action.dataset.consentAction;
            if (name === 'accept') acceptAll();
            else if (name === 'reject') rejectAll();
            else if (name === 'save') {
                const next = {};
                OPTIONAL.forEach(cat => {
                    const input = dialog.querySelector(`[name="consent-${cat}"]`);
                    next[cat] = Boolean(input && input.checked);
                });
                save(next);
            }
            close();
        });
        // Escape fires "cancel"; close our way so focus goes back to the opener.
        dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
        document.body.append(dialog);
    }

    // Clicks on the dialog's own padding also target the dialog; only the backdrop is outside its box.
    function outside(e, node) {
        const r = node.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    }

    function syncSwitches() {
        OPTIONAL.forEach(cat => {
            const input = dialog.querySelector(`[name="consent-${cat}"]`);
            if (input) input.checked = get(cat);
        });
    }

    function open(trigger) {
        opener = trigger || document.activeElement;
        if (!dialog) buildDialog();
        syncSwitches();
        dialog.showModal();
    }

    function close() {
        if (dialog && dialog.open) dialog.close();
        const target = opener && opener.isConnected && !opener.closest('[hidden]')
            ? opener
            : document.querySelector('[data-consent-open]');
        if (target) target.focus();
        opener = null;
    }

    // Start
    // ------------------------------------------------------------------------
    function init() {
        document.querySelectorAll('[data-consent-open]').forEach(button => {
            button.hidden = false;
            button.addEventListener('click', () => open(button));
        });
        applyChoices();
        if (!choices && askableCategories().length > 0) buildBanner();
    }

    window.Consent = { open, get, acceptAll, rejectAll, save };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
