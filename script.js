(function () {
    'use strict';

    const config = window.SITE_CONFIG || { links: {} };
    const links = config.links || {};

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
                target: isEmail ? null : '_blank',
                rel: isEmail ? null : 'noopener noreferrer'
            }, icon(p.icon), p.label, !isEmail && el('span', { class: 'sr-only' }, ' (opens in a new tab)'));
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

    function linkList(items, className) {
        return items.length > 0 && el('div', { class: 'item-links' }, items.map(l => externalLink(l.href, l.label, className || 'btn btn-secondary')));
    }

    function slug(text) {
        return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    // Audio player for self-hosted clips: native <audio> underneath, our own controls on top.
    // Nothing loads until Play (preload="none"); only one player sounds at a time.
    // ------------------------------------------------------------------------
    const players = new Set();

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) return '0:00';
        const s = Math.max(0, Math.floor(seconds));
        return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }

    function audioPlayer(clip) {
        const audio = el('audio', { preload: 'none', src: clip.src });
        const playIcon = icon('play');
        const pauseIcon = icon('pause');
        pauseIcon.classList.add('is-hidden');
        const toggle = el('button', { type: 'button', class: 'player-toggle', 'aria-label': `Play ${clip.title}` }, playIcon, pauseIcon);
        const seek = el('input', {
            type: 'range', class: 'player-seek', min: 0, max: 100, step: 0.1, value: 0,
            'aria-label': `Seek in ${clip.title}`, 'aria-valuetext': '0:00', disabled: true
        });
        const time = el('span', { class: 'player-time' }, '0:00');
        const root = el('div', { class: 'player' },
            toggle,
            el('div', { class: 'player-main' },
                el('p', { class: 'player-title' }, clip.title),
                el('div', { class: 'player-track' }, seek, time)
            ),
            audio
        );

        function render() {
            const playing = !audio.paused;
            const duration = audio.duration;
            const progress = Number.isFinite(duration) && duration > 0 ? audio.currentTime / duration : 0;
            root.classList.toggle('is-playing', playing);
            playIcon.classList.toggle('is-hidden', playing);
            pauseIcon.classList.toggle('is-hidden', !playing);
            toggle.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${clip.title}`);
            root.style.setProperty('--progress', progress);
            if (document.activeElement !== seek) seek.value = progress * 100;
            const text = `${formatTime(audio.currentTime)} / ${formatTime(duration)}`;
            time.textContent = text;
            seek.setAttribute('aria-valuetext', `${formatTime(audio.currentTime)} of ${formatTime(duration)}`);
        }

        toggle.addEventListener('click', () => {
            if (audio.paused) {
                players.forEach(other => { if (other !== audio) other.pause(); });
                audio.play().catch(() => root.classList.add('is-error'));
            } else {
                audio.pause();
            }
        });
        seek.addEventListener('input', () => {
            if (Number.isFinite(audio.duration)) audio.currentTime = (seek.value / 100) * audio.duration;
        });
        audio.addEventListener('loadedmetadata', () => { seek.disabled = false; render(); });
        audio.addEventListener('waiting', () => root.classList.add('is-loading'));
        audio.addEventListener('playing', () => root.classList.remove('is-loading'));
        audio.addEventListener('error', () => {
            root.classList.add('is-error');
            time.textContent = 'Couldn’t load audio';
        });
        ['play', 'pause', 'timeupdate', 'ended', 'durationchange'].forEach(type => audio.addEventListener(type, render));
        players.add(audio);

        const transcript = clip.transcript && el('details', { class: 'player-transcript' },
            el('summary', null, 'What you’re hearing'), el('p', null, clip.transcript));
        return el('div', { class: 'player-wrap' }, root, transcript);
    }

    // Click-to-load embeds: nothing from Spotify or YouTube loads until the visitor asks.
    // ------------------------------------------------------------------------
    function embedSrc(embed) {
        if (embed.provider === 'spotify') return `https://open.spotify.com/embed/${embed.kind === 'album' ? 'album' : 'track'}/${encodeURIComponent(embed.id)}`;
        if (embed.provider === 'youtube') return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(embed.id)}`;
        return null;
    }

    const PROVIDER_NAMES = { spotify: 'Spotify', youtube: 'YouTube' };

    // `link` (optional) is the release's own page, offered beside the note so the card needs one button.
    function embedLoader(embed, title, link) {
        const src = embedSrc(embed);
        if (!src) return null;
        const provider = PROVIDER_NAMES[embed.provider];
        const button = el('button', { type: 'button', class: 'btn btn-secondary embed-load' },
            icon('play'), el('span', null, 'Play here'));
        const note = el('p', { class: 'embed-note' }, `Loads from ${provider}.`,
            link && link.url && ' ', link && link.url && externalLink(link.url, link.label || `Open in ${provider}`, 'text-link-external'));
        const slot = el('div', { class: `embed embed-${embed.provider}` }, button, note);
        button.addEventListener('click', () => {
            const frame = el('iframe', {
                src: embed.provider === 'youtube' ? `${src}?autoplay=1` : src,
                title: `${title} on ${provider}`,
                loading: 'lazy',
                allow: 'autoplay; clipboard-write; encrypted-media; picture-in-picture',
                allowfullscreen: embed.provider === 'youtube'
            });
            slot.replaceChildren(frame);
            slot.classList.add('is-loaded');
            frame.focus();
        });
        return slot;
    }

    // Projects: featured rows with a preview, then a compact list, with an area filter
    // ------------------------------------------------------------------------
    const AREAS = {
        both: { label: 'Audio + software', lit: true },
        audio: { label: 'Audio', lit: true },
        software: { label: 'Software', lit: false }
    };

    function areaOf(p) {
        return AREAS[p.area] ? p.area : 'software';
    }

    function areaLabel(p) {
        const area = AREAS[areaOf(p)];
        return el('p', { class: area.lit ? 'area is-lit' : 'area' }, area.label);
    }

    function tagList(tags) {
        return el('ul', { class: 'tags', 'aria-label': 'Built with' }, (tags || []).map(t => el('li', { class: 'tag' }, t)));
    }

    // Preview slot. Until real media exists, a quiet placeholder says so plainly.
    function preview(p) {
        const m = p.media;
        if (m && m.type === 'image' && m.src) {
            return el('figure', { class: 'preview' },
                el('img', { src: m.src, alt: m.alt || '', loading: 'lazy', decoding: 'async', width: 800, height: 500 }));
        }
        if (m && m.type === 'audio' && m.src) {
            return el('div', { class: 'preview preview-audio' }, signalLine(p.title), audioPlayer({ title: m.title || `${p.title} demo`, src: m.src, transcript: m.transcript }));
        }
        if (m && m.type === 'youtube' && m.id) {
            return el('div', { class: 'preview preview-video' }, embedLoader({ provider: 'youtube', id: m.id }, m.title || p.title));
        }
        const lit = AREAS[areaOf(p)].lit;
        return el('div', { class: 'preview preview-empty', 'aria-hidden': 'true' },
            lit ? signalLine(p.title) : el('span', { class: 'preview-stack' }, (p.tags || []).join(' · ')),
            el('span', { class: 'preview-note' }, lit ? 'Audio demo coming' : 'Screenshot coming'));
    }

    // A drawn waveform overview: mirrored bars, shaped by the title so each project gets its own.
    // Decorative only; a real demo replaces it.
    function signalLine(seedText) {
        let seed = 0;
        for (const ch of String(seedText)) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
        const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
        const bars = 56, pitch = 6, width = bars * pitch, mid = 50;
        let level = 0.5, d = '';
        for (let i = 0; i < bars; i++) {
            level += (rand() - 0.5) * 0.35;                       // slow random walk = phrase dynamics
            level = Math.min(1, Math.max(0.2, level));
            const swell = 0.35 + 0.65 * Math.sin(((i + 0.5) / bars) * Math.PI);
            const h = Math.max(2, 44 * level * swell * (0.8 + rand() * 0.2));
            const x = i * pitch + pitch / 2;
            d += `M${x} ${(mid - h).toFixed(1)}V${(mid + h).toFixed(1)}`;
        }
        const s = svg('svg', { class: 'signal', viewBox: `0 0 ${width} 100`, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
        s.append(svg('path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': '3', 'stroke-linecap': 'round' }));
        return s;
    }

    function bulletList(items) {
        const list = (items || []).filter(Boolean);
        return list.length > 0 && el('ul', { class: 'bullets' }, list.map(h => el('li', null, h)));
    }

    // Case study: the parts that exist, in a fixed order, behind a native disclosure.
    const CASE_PARTS = [
        ['problem', 'Problem'],
        ['role', 'My role'],
        ['approach', 'Approach'],
        ['challenges', 'Challenges'],
        ['results', 'Results']
    ];

    function hasCaseStudy(p) {
        return Boolean(p.caseStudy) && CASE_PARTS.some(([key]) => p.caseStudy[key]);
    }

    // A large row needs something to open; projects without a write-up go to the compact list.
    function isFeatured(p) {
        return Boolean(p.featured) && hasCaseStudy(p);
    }

    function caseStudy(p) {
        const study = p.caseStudy || {};
        const parts = CASE_PARTS.filter(([key]) => study[key]);
        if (parts.length === 0) return null;
        return el('details', { class: 'case-study' },
            el('summary', null, el('span', null, 'How it was built')),
            el('dl', { class: 'case-study-body' },
                parts.map(([key, label]) => el('div', null, el('dt', null, label), el('dd', null, study[key])))
            )
        );
    }

    function projectRow(p, index) {
        const meta = [p.context, p.year].filter(Boolean).join(', ');
        const projectLinks = (p.links || []).filter(l => l && l.href);

        return el('article', { class: index === 0 ? 'project is-lead' : 'project', id: slug(p.title), 'data-area': areaOf(p) },
            preview(p),
            el('div', { class: 'project-body' },
                areaLabel(p),
                el('h3', { class: 'project-title' }, p.title),
                meta && el('p', { class: 'project-meta' }, meta),
                el('p', { class: 'project-summary' }, p.summary),
                bulletList(p.highlights),
                tagList(p.tags),
                linkList(projectLinks),
                caseStudy(p)
            )
        );
    }

    function projectItem(p) {
        const meta = [p.context, p.year].filter(Boolean).join(', ');
        const projectLinks = (p.links || []).filter(l => l && l.href);
        return el('li', { class: 'project-item', id: slug(p.title), 'data-area': areaOf(p) },
            el('div', { class: 'project-item-head' },
                el('h4', { class: 'project-item-title' }, p.title),
                meta && el('p', { class: 'project-meta' }, meta),
                areaLabel(p)
            ),
            el('div', { class: 'project-item-body' },
                el('p', null, p.summary),
                bulletList(p.highlights),
                tagList(p.tags),
                linkList(projectLinks, 'text-link-external')
            )
        );
    }

    const projects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
    const featuredList = document.getElementById('projects-list');
    const moreList = document.getElementById('projects-more');
    const moreBlock = document.getElementById('projects-more-block');
    if (featuredList) featuredList.append(...projects.filter(isFeatured).map(projectRow));
    if (moreList) moreList.append(...projects.filter(p => !isFeatured(p)).map(projectItem));
    if (moreBlock && moreList && moreList.children.length === 0) moreBlock.hidden = true;

    // Filter: a toggle-button group. Hidden without JS, where every project shows.
    const filterBar = document.getElementById('project-filter');
    const filterStatus = document.getElementById('project-filter-status');
    const filterEmpty = document.getElementById('projects-empty');
    if (filterBar && projects.length > 0) {
        const present = Object.keys(AREAS).filter(key => projects.some(p => areaOf(p) === key));
        const options = [{ key: 'all', label: 'All', count: projects.length }]
            .concat(present.map(key => ({ key, label: AREAS[key].label, lit: AREAS[key].lit, count: projects.filter(p => areaOf(p) === key).length })));

        const buttons = options.map(o => el('button', {
            type: 'button', class: o.lit ? 'filter is-lit' : 'filter', 'data-filter': o.key, 'aria-pressed': String(o.key === 'all')
        }, el('span', null, o.label), el('span', { class: 'filter-count' }, String(o.count))));

        function applyFilter(key) {
            buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === key)));
            let shown = 0;
            document.querySelectorAll('#projects [data-area]').forEach(node => {
                const match = key === 'all' || node.dataset.area === key;
                node.hidden = !match;
                if (match) shown++;
            });
            if (moreBlock && moreList) moreBlock.hidden = ![...moreList.children].some(n => !n.hidden);
            if (featuredList) featuredList.hidden = ![...featuredList.children].some(n => !n.hidden);
            if (filterEmpty) filterEmpty.hidden = shown > 0;
            if (filterStatus) filterStatus.textContent = `Showing ${shown} of ${projects.length} projects`;
        }

        buttons.forEach(b => b.addEventListener('click', () => applyFilter(b.dataset.filter)));
        filterBar.append(...buttons);
        filterBar.hidden = false;
        const reset = document.getElementById('projects-empty-reset');
        if (reset) reset.addEventListener('click', () => { applyFilter('all'); buttons[0].focus(); });
    }

    // Music
    // ------------------------------------------------------------------------
    function roleList(roles, label) {
        return el('ul', { class: 'roles', 'aria-label': label }, (roles || []).map(r => el('li', { class: 'role' }, r)));
    }

    // Square cover art slot: the placeholder square sits underneath until the image loads.
    // Images load lazily, since the Music section starts well below the fold.
    function artwork(t) {
        const frame = el('div', { class: 'art-placeholder', 'aria-hidden': 'true' }, icon('note'));
        const figure = el('figure', { class: 'release-art' }, frame, t.status && badge(t.status));
        if (t.artwork && t.artwork.src) {
            const img = el('img', {
                src: t.artwork.src,
                alt: t.artwork.alt || `${t.title} cover art`,
                class: t.artwork.pixelated ? 'is-pixelated' : null,
                width: 640, height: 640,
                loading: 'lazy',
                decoding: 'async'
            });
            img.addEventListener('load', () => frame.remove());
            img.addEventListener('error', () => img.remove());
            frame.after(img);
        }
        return figure;
    }

    function releaseItem(t) {
        const kind = [t.kind, t.year].filter(Boolean).join(', ');
        const hasLink = t.link && t.link.url;
        return el('li', { class: 'release' },
            artwork(t),
            el('div', { class: 'release-body' },
                el('h4', { class: 'release-title' }, t.title),
                el('p', { class: 'release-meta' }, t.artist, t.artist && kind && el('br'), kind),
                roleList(t.roles, 'My role'),
                el('div', { class: 'release-actions' },
                    t.embed
                        ? embedLoader(t.embed, `${t.title} by ${t.artist}`, t.link)
                        : hasLink && linkList([{ href: t.link.url, label: t.link.label || 'Listen' }])
                )
            )
        );
    }

    function bandRow(b) {
        return el('li', { class: 'band' },
            el('h4', { class: 'band-name' }, b.name),
            roleList(b.roles, 'What I play'),
            b.instagram ? linkList([{ href: b.instagram, label: 'Instagram' }]) : el('span')
        );
    }

    const tracks = Array.isArray(window.MUSIC) ? window.MUSIC : [];
    const musicList = document.getElementById('music-list');
    if (musicList) musicList.append(...tracks.map(releaseItem));

    const bands = Array.isArray(window.BANDS) ? window.BANDS : [];
    const bandList = document.getElementById('band-list');
    if (bandList) bandList.append(...bands.map(bandRow));

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
