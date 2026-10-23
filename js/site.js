// Behavior every page shares: theme toggle, header border, mobile menu, footer year.
(function () {
    'use strict';

    // Theme
    // ------------------------------------------------------------------------
    const root = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

    function currentTheme() {
        return root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
    }

    function syncThemeButton() {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        themeToggle.setAttribute('aria-label', `Switch to ${next} theme`);
    }

    if (themeToggle) {
        syncThemeButton();
        themeToggle.addEventListener('click', () => {
            const next = currentTheme() === 'dark' ? 'light' : 'dark';
            root.dataset.theme = next;
            try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked: theme still applies for this visit */ }
            syncThemeButton();
        });
        systemDark.addEventListener('change', syncThemeButton);
    }

    // Footer year
    // ------------------------------------------------------------------------
    document.querySelectorAll('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });

    // Header: border once scrolled
    // ------------------------------------------------------------------------
    const header = document.querySelector('.site-header');
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    if (header) {
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Mobile menu
    // ------------------------------------------------------------------------
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const mobileQuery = window.matchMedia('(max-width: 900px)');

    function setMenu(open) {
        navLinks.classList.toggle('is-open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('is-open')));
        navLinks.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
                setMenu(false);
                menuToggle.focus();
            }
        });
        document.addEventListener('click', e => {
            if (navLinks.classList.contains('is-open') && !e.target.closest('.nav')) setMenu(false);
        });
        mobileQuery.addEventListener('change', () => setMenu(false));
    }
})();
