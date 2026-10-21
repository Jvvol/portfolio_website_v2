(function () {
    'use strict';

    const config = window.SITE_CONFIG || { links: {} };
    const links = config.links || {};
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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

    const SVG_NS = 'http://www.w3.org/2000/svg';
    function svg(tag, attrs) {
        const node = document.createElementNS(SVG_NS, tag);
        for (const [key, value] of Object.entries(attrs || {})) node.setAttribute(key, value);
        return node;
    }

    function icon(name) {
        const s = svg('svg', { class: 'icon', 'aria-hidden': 'true' });
        s.append(svg('use', { href: '#i-' + name }));
        return s;
    }

    function externalLink(href, label, className) {
        return el('a', { href, class: className, target: '_blank', rel: 'noopener noreferrer' },
            el('span', null, label), icon('external'), el('span', { class: 'sr-only' }, ' (opens in a new tab)'));
    }

    // Links from config
    // ------------------------------------------------------------------------
    document.querySelectorAll('[data-link]').forEach(a => {
        const key = a.dataset.link;
        const value = links[key];
        if (!value) {
            (a.closest('[data-link-item]') || a).remove();
            return;
        }
        a.href = key === 'email' ? `mailto:${value}` : value;
        const text = a.querySelector('[data-link-text]');
        if (text) text.textContent = value;
    });

    const PROFILES = [
        { key: 'github', label: 'GitHub', icon: 'github' },
        { key: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
        { key: 'email', label: 'Email', icon: 'mail' },
        { key: 'soundcloud', label: 'SoundCloud', icon: 'note' },
        { key: 'bandcamp', label: 'Bandcamp', icon: 'note' },
        { key: 'spotify', label: 'Spotify', icon: 'note' },
        { key: 'youtube', label: 'YouTube', icon: 'note' }
    ];
    const MUSIC_KEYS = ['soundcloud', 'bandcamp', 'spotify', 'youtube'];

    const footerLinks = document.getElementById('footer-links');
    if (footerLinks) {
        PROFILES.filter(p => links[p.key]).forEach(p => {
            const isEmail = p.key === 'email';
            const a = el('a', {
                href: isEmail ? `mailto:${links.email}` : links[p.key],
                'aria-label': p.label,
                title: p.label,
                target: isEmail ? null : '_blank',
                rel: isEmail ? null : 'noopener noreferrer'
            }, icon(p.icon));
            footerLinks.append(el('li', null, a));
        });
    }

    const musicPlatforms = document.getElementById('music-platforms');
    if (musicPlatforms) {
        PROFILES.filter(p => MUSIC_KEYS.includes(p.key) && links[p.key]).forEach(p => {
            musicPlatforms.append(el('li', null, externalLink(links[p.key], `Listen on ${p.label}`, 'btn')));
        });
    }

    // Status pill with an indicator light, e.g. "Featured", "In progress".
    function badge(text) {
        return el('span', { class: 'badge' }, text);
    }

    // Projects (text only, no screenshots)
    // ------------------------------------------------------------------------
    function projectCard(p) {
        const meta = [p.context, p.year].filter(Boolean).join(', ');
        const highlights = (p.highlights || []).filter(Boolean);
        const projectLinks = (p.links || []).filter(l => l && l.href);
        const featured = Boolean(p.featured);

        const bullets = highlights.length > 0 && el('ul', { class: 'bullets' }, highlights.map(h => el('li', null, h)));
        const linkRow = projectLinks.length > 0 && el('div', { class: 'card-links' }, projectLinks.map(l => externalLink(l.href, l.label, 'card-link')));
        const tags = el('ul', { class: 'tags', 'aria-label': 'Built with' }, (p.tags || []).map(t => el('li', { class: 'tag' }, t)));

        const head = [
            featured && badge('Featured'),
            el('h3', { class: 'card-title' }, p.title),
            meta && el('p', { class: 'card-meta' }, meta)
        ];

        if (featured) {
            // Summary on the left; highlights, links, and stack on the right.
            return el('article', { class: 'card project project-featured reveal' },
                el('div', { class: 'card-main' }, head, el('div', { class: 'card-body' }, el('p', null, p.summary))),
                el('div', { class: 'card-side' }, bullets, linkRow, tags)
            );
        }

        return el('article', { class: 'card project reveal' },
            el('div', { class: 'card-main' },
                head,
                el('div', { class: 'card-body' }, el('p', null, p.summary), bullets),
                linkRow,
                tags
            )
        );
    }

    const projectsList = document.getElementById('projects-list');
    if (projectsList && Array.isArray(window.PROJECTS)) {
        projectsList.append(...window.PROJECTS.map(projectCard));
    }

    // Music
    // ------------------------------------------------------------------------
    function roleList(roles, label) {
        return el('ul', { class: 'roles', 'aria-label': label }, (roles || []).map(r => el('li', { class: 'role' }, r)));
    }

    // Square cover art slot: a placeholder square until the image file loads.
    function artwork(t) {
        const frame = el('div', { class: 'art-placeholder', 'aria-hidden': 'true' }, icon('note'));
        const figure = el('figure', { class: 'release-art' }, frame);
        if (t.artwork && t.artwork.src) {
            const img = new Image();
            img.onload = () => {
                img.alt = t.artwork.alt || `${t.title} cover art`;
                frame.replaceWith(img);
            };
            img.src = t.artwork.src;
        }
        return figure;
    }

    function releaseCard(t) {
        const meta = [t.kind, t.artist, t.year].filter(Boolean).join(' · ');
        const hasLink = t.link && t.link.url;
        return el('li', { class: 'card release reveal' },
            artwork(t),
            el('div', { class: 'release-body' },
                t.status && badge(t.status),
                el('h4', { class: 'card-title' }, t.title),
                meta && el('p', { class: 'card-meta' }, meta),
                roleList(t.roles, 'My role'),
                t.upcoming && el('div', { class: 'release-upcoming' },
                    badge(t.upcoming.status || 'Coming soon'),
                    el('p', null, t.upcoming.text)
                ),
                hasLink && el('div', { class: 'track-foot' }, externalLink(t.link.url, t.link.label || 'Listen', 'card-link'))
            )
        );
    }

    function bandCard(b) {
        return el('li', { class: 'card band reveal' },
            el('h4', { class: 'card-title' }, b.name),
            roleList(b.roles, 'What I play'),
            b.instagram && el('div', { class: 'track-foot' }, externalLink(b.instagram, 'Instagram', 'card-link'))
        );
    }

    const tracks = Array.isArray(window.MUSIC) ? window.MUSIC : [];
    const musicList = document.getElementById('music-list');
    if (musicList) musicList.append(...tracks.map(releaseCard));

    const bands = Array.isArray(window.BANDS) ? window.BANDS : [];
    const bandList = document.getElementById('band-list');
    if (bandList) bandList.append(...bands.map(bandCard));

    // Only the "coming soon" note depends on the track list; the section itself always shows.
    const musicEmpty = document.getElementById('music-empty');
    if (musicEmpty && tracks.length > 0) musicEmpty.hidden = true;

    // Active section in the nav
    // ------------------------------------------------------------------------
    const navAnchors = new Map();
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(a => navAnchors.set(a.getAttribute('href').slice(1), a));

    function setActive(id) {
        navAnchors.forEach((a, key) => {
            if (key === id) a.setAttribute('aria-current', 'location');
            else a.removeAttribute('aria-current');
        });
    }

    if ('IntersectionObserver' in window && navAnchors.size) {
        const visible = new Set();
        const spy = new IntersectionObserver(entries => {
            entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target.id) : visible.delete(entry.target.id));
            // First section (in page order) crossing the middle band of the viewport wins.
            const active = [...navAnchors.keys()].find(id => visible.has(id));
            setActive(active || null);
        }, { rootMargin: '-45% 0px -50% 0px' });
        navAnchors.forEach((a, id) => {
            const section = document.getElementById(id);
            if (section) spy.observe(section);
        });
    }

    // Scroll reveal
    // ------------------------------------------------------------------------
    const revealEls = document.querySelectorAll('.reveal');
    if (!reduceMotion.matches && 'IntersectionObserver' in window) {
        const revealer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        revealEls.forEach(node => revealer.observe(node));
    } else {
        revealEls.forEach(node => node.classList.add('is-visible'));
    }

    // Contact form: send without leaving the page; plain POST still works without JS.
    // ------------------------------------------------------------------------
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    const COOLDOWN_MS = 5000;
    let lastSent = 0;

    const FIELD_MESSAGES = {
        name: 'Enter your name.',
        email: 'Enter a valid email address.',
        message: 'Enter a message.'
    };

    function showStatus(message, kind) {
        status.textContent = message;
        status.classList.toggle('is-error', kind === 'error');
        status.classList.toggle('is-success', kind === 'success');
    }

    // Shows or clears one field's inline error. Returns true when the field is valid.
    function checkField(field) {
        const error = document.getElementById(`${field.id}-error`);
        const valid = field.validity.valid;
        if (valid) field.removeAttribute('aria-invalid');
        else field.setAttribute('aria-invalid', 'true');
        if (error) error.textContent = valid ? '' : FIELD_MESSAGES[field.name] || 'Check this field.';
        return valid;
    }

    function setSending(button, sending) {
        button.disabled = sending;
        button.classList.toggle('is-loading', sending);
        if (sending) button.setAttribute('aria-busy', 'true');
        else button.removeAttribute('aria-busy');
    }

    if (form && status && window.fetch) {
        // Inline messages replace the browser's bubbles; without JS, native validation still runs.
        form.noValidate = true;
        const fields = [...form.querySelectorAll('input[required], textarea[required]')];

        fields.forEach(field => {
            // Only judge a field once the visitor has left it or tried to send.
            field.addEventListener('blur', () => { if (field.value || field.hasAttribute('aria-invalid')) checkField(field); });
            field.addEventListener('input', () => { if (field.hasAttribute('aria-invalid')) checkField(field); });
        });

        form.addEventListener('submit', async e => {
            e.preventDefault();
            const invalid = fields.filter(field => !checkField(field));
            if (invalid.length > 0) {
                showStatus('');
                invalid[0].focus();
                return;
            }
            if (Date.now() - lastSent < COOLDOWN_MS) {
                showStatus('Message already sent. Wait a few seconds before sending another.', 'error');
                return;
            }
            const button = form.querySelector('button[type="submit"]');
            setSending(button, true);
            showStatus('Sending…');
            try {
                const res = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { Accept: 'application/json' }
                });
                if (!res.ok) throw new Error(String(res.status));
                lastSent = Date.now();
                form.reset();
                showStatus('Message sent. I’ll reply by email.', 'success');
            } catch (err) {
                const fallback = links.email ? ` or email ${links.email}` : '';
                showStatus(`Your message didn’t send. Check your connection and try again${fallback}.`, 'error');
            } finally {
                setSending(button, false);
            }
        });
    }
})();
