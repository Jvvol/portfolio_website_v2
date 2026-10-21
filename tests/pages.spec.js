// Legal pages and the footer every page shares.
const { test, expect } = require('@playwright/test');
const { PAGES } = require('./helpers');

const LEGAL = ['/privacy.html', '/cookies.html', '/terms.html', '/accessibility.html'];
const LEGAL_LINKS = { 'privacy.html': 'Privacy', 'cookies.html': 'Cookies', 'terms.html': 'Terms', 'accessibility.html': 'Accessibility' };

test('every page is listed for site-wide checks', () => {
    expect(PAGES).toEqual(expect.arrayContaining(['/index.html', ...LEGAL]));
});

for (const path of LEGAL) {
    test(`${path} has a title, effective date, skip link, and working contents list`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('.legal-effective')).toContainText('October 21, 2026');
        await expect(page.locator('a.skip-link')).toHaveAttribute('href', '#main');
        const targets = await page.locator('.legal-toc a').evaluateAll(as => as.map(a => a.getAttribute('href')));
        expect(targets.length).toBeGreaterThan(2);
        for (const href of targets) {
            expect(href).toMatch(/^#/);
            await expect(page.locator(href)).toHaveCount(1);
        }
    });

    test(`${path} nav points back to the home page sections`, async ({ page }) => {
        await page.goto(path);
        const hrefs = await page.locator('.nav-links a').evaluateAll(as => as.map(a => a.getAttribute('href')));
        expect(hrefs).toEqual(['index.html#about', 'index.html#projects', 'index.html#music', 'index.html#resume', 'index.html#contact']);
    });
}

for (const path of ['/index.html', ...LEGAL]) {
    test(`${path} footer links every legal page and cookie settings`, async ({ page }) => {
        await page.goto(path);
        const legal = page.locator('.site-footer nav[aria-label="Legal"]');
        for (const [href, label] of Object.entries(LEGAL_LINKS)) {
            await expect(legal.locator(`a[href="${href}"]`)).toHaveText(label);
        }
        await expect(legal.locator('[data-consent-open]')).toBeVisible();
        await expect(page.locator('.site-footer')).toContainText('© 2026 Jacob Wolfe');
    });

    test(`${path} theme toggle works`, async ({ page }) => {
        await page.goto(path);
        const before = await page.evaluate(() => document.documentElement.dataset.theme || 'unset');
        await page.click('#theme-toggle');
        await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme || 'unset')).not.toBe(before);
    });
}

test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    for (const path of ['/index.html', '/privacy.html']) {
        test(`${path} keeps legal links and hides cookie settings`, async ({ page }) => {
            await page.goto(path);
            const legal = page.locator('.site-footer nav[aria-label="Legal"]');
            await expect(legal.locator('a[href="privacy.html"]')).toBeVisible();
            await expect(legal.locator('[data-consent-open]')).toBeHidden();
        });
    }

    test('contact form still posts to Formspree with native validation', async ({ page }) => {
        await page.goto('/index.html');
        const form = page.locator('#contact-form');
        await expect(form).toHaveAttribute('action', /^https:\/\/formspree\.io\//);
        await expect(form).not.toHaveAttribute('novalidate', '');
    });
});

test.describe('policy content', () => {
    test('privacy policy covers the actual data flows and rights', async ({ page }) => {
        await page.goto('/privacy.html');
        const text = await page.locator('main').innerText();
        for (const phrase of ['Formspree', 'GitHub', 'Global Privacy Control', 'do not sell or share', '13', '24 months', 'jawolfe17@yahoo.com']) {
            expect(text).toContain(phrase);
        }
    });

    test('cookie policy lists every stored item', async ({ page }) => {
        await page.goto('/cookies.html');
        const rows = page.locator('table tbody tr');
        await expect(rows.filter({ hasText: 'theme' })).toHaveCount(1);
        await expect(rows.filter({ hasText: 'consent.v1' })).toHaveCount(1);
    });

    test('terms cover governing law and copyright notices', async ({ page }) => {
        await page.goto('/terms.html');
        const text = await page.locator('main').innerText();
        expect(text).toContain('West Virginia');
        expect(text).toContain('DMCA');
        expect(text).toContain('All rights reserved');
    });

    test('accessibility statement names the standard and a contact', async ({ page }) => {
        await page.goto('/accessibility.html');
        const text = await page.locator('main').innerText();
        expect(text).toContain('WCAG 2.1');
        expect(text).toContain('jawolfe17@yahoo.com');
        expect(text).toContain('5 business days');
    });

    test('no unfilled placeholders remain', async ({ page }) => {
        for (const path of LEGAL) {
            await page.goto(path);
            expect(await page.locator('main').innerText()).not.toMatch(/\[TODO/);
        }
    });
});
