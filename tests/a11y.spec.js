// WCAG 2.1 A/AA checks with axe on every page, in both themes.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { PAGES } = require('./helpers');

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

// Short, readable summary of serious and critical violations.
function serious(results) {
    return results.violations
        .filter(v => v.impact === 'serious' || v.impact === 'critical')
        .map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`);
}

for (const colorScheme of ['light', 'dark']) {
    for (const path of PAGES) {
        test(`${path} has no serious axe violations (${colorScheme})`, async ({ page }) => {
            await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
            await page.goto(path);
            await page.waitForLoadState('networkidle');
            const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
            expect(serious(results)).toEqual([]);
        });
    }

    test(`cookie settings dialog has no serious axe violations (${colorScheme})`, async ({ page }) => {
        await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
        await page.goto('/index.html');
        await page.click('[data-consent-open]');
        const results = await new AxeBuilder({ page }).include('#consent-dialog').withTags(TAGS).analyze();
        expect(serious(results)).toEqual([]);
    });

    test(`consent banner and form errors have no serious axe violations (${colorScheme})`, async ({ page }) => {
        await page.route('https://analytics.example.test/**', r => r.fulfill({ body: '' }));
        await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
        await page.goto('/tests/fixtures/consent-test.html');
        const banner = await new AxeBuilder({ page }).include('#consent-banner').withTags(TAGS).analyze();
        expect(serious(banner)).toEqual([]);

        await page.goto('/index.html');
        await page.click('#contact-form button[type="submit"]');
        const form = await new AxeBuilder({ page }).include('#contact-form').withTags(TAGS).analyze();
        expect(serious(form)).toEqual([]);
    });
}
