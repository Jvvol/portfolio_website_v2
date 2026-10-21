// Regressions found in the final branch review.
const { execFileSync } = require('child_process');
const path = require('path');
const { test, expect } = require('@playwright/test');

const FIXTURE = '/tests/fixtures/consent-test.html';

async function trackHits(page) {
    const hits = { count: 0 };
    await page.route('https://analytics.example.test/**', route => {
        hits.count += 1;
        route.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.__analyticsLoaded = true;' });
    });
    return hits;
}

test('.env files stay out of git', () => {
    const root = path.join(__dirname, '..');
    // Exits non-zero (and throws) when the path is not ignored.
    const out = execFileSync('git', ['check-ignore', '.env'], { cwd: root, encoding: 'utf8' });
    expect(out.trim()).toBe('.env');
});

test('clicking inside the dialog keeps it open and keeps unsaved choices', async ({ page }) => {
    await page.goto(FIXTURE);
    await page.click('#consent-banner [data-consent-action="customize"]');
    const dialog = page.locator('#consent-dialog');
    await page.check('input[name="consent-analytics"]');
    const box = await dialog.boundingBox();
    await page.mouse.click(box.x + 6, box.y + 6);   // padding area, inside the dialog
    await expect(dialog).toHaveAttribute('open', '');
    await expect(page.locator('input[name="consent-analytics"]')).toBeChecked();
});

test('clicking the backdrop closes the dialog', async ({ page }) => {
    await page.goto('/index.html');
    await page.click('[data-consent-open]');
    await page.mouse.click(5, 5);
    await expect(page.locator('#consent-dialog')).not.toHaveAttribute('open', '');
});

test('withdrawing consent stops a tracker that already loaded', async ({ page }) => {
    const hits = await trackHits(page);
    await page.goto(FIXTURE);
    await page.click('#consent-banner [data-consent-action="accept"]');
    await expect.poll(() => hits.count).toBe(1);
    await page.click('[data-consent-open]');
    await page.click('#consent-dialog [data-consent-action="reject"]');
    // The page reloads so the tracker is no longer running.
    await expect.poll(() => page.evaluate(() => window.__analyticsLoaded === true)).toBe(false);
    await page.waitForLoadState('networkidle');
    expect(hits.count).toBe(1);
});

test('banner buttons share one size and style', async ({ page }) => {
    await page.goto(FIXTURE);
    const look = sel => page.locator(`#consent-banner [data-consent-action="${sel}"]`).evaluate(n => {
        const s = getComputedStyle(n);
        return { h: n.getBoundingClientRect().height, bg: s.backgroundColor, color: s.color, weight: s.fontWeight, border: s.borderColor };
    });
    const accept = await look('accept');
    expect(await look('reject')).toEqual(accept);
    expect(await look('customize')).toEqual(accept);
});

test('home footer keeps the back-to-top link', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('.site-footer a[href="#top"]')).toHaveText('Back to top');
});

test('accessibility statement only claims what was done', async ({ page }) => {
    await page.goto('/accessibility.html');
    await expect(page.locator('main')).not.toContainText('before changes go live');
});

test.describe('without JavaScript on a phone', () => {
    test.use({ javaScriptEnabled: false, viewport: { width: 375, height: 800 } });

    for (const p of ['/index.html', '/privacy.html']) {
        test(`${p} nav links are reachable`, async ({ page }) => {
            await page.goto(p);
            await expect(page.locator('#nav-links a').first()).toBeVisible();
            await expect(page.locator('#menu-toggle')).toBeHidden();
            await expect(page.locator('#theme-toggle')).toBeHidden();   // can't work without JS
        });
    }
});

// Second review (/code-review): activation fidelity, focus, and when the banner should ask.
test.describe('gated script activation', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('https://analytics.example.test/lib.js', async route => {
            await new Promise(r => setTimeout(r, 300));   // slow library
            await route.fulfill({ contentType: 'text/javascript', body: 'window.__libLoaded = true;' });
        });
        await page.route('https://analytics.example.test/m.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
        await page.goto('/tests/fixtures/consent-edge.html');
        await page.click('#consent-banner [data-consent-action="accept"]');
    });

    test('runs gated scripts in document order', async ({ page }) => {
        await expect.poll(() => page.evaluate(() => window.__order)).toBe('lib-first');
    });

    test('keeps the original attributes, including integrity', async ({ page }) => {
        const lib = page.locator('script#lib');
        await expect(lib).toHaveCount(1);
        await expect(lib).not.toHaveAttribute('type', 'text/plain');
        await expect(lib).toHaveAttribute('crossorigin', 'anonymous');
        await expect(lib).toHaveAttribute('data-config', 'site-1');
        await expect(page.locator('script[src$="m.js"]')).toHaveAttribute('integrity', 'sha384-test');
    });
});

test('banner choice moves focus to cookie settings, not the page top', async ({ page }) => {
    await page.goto(FIXTURE);
    await page.locator('#consent-banner [data-consent-action="reject"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-consent-open]')).toBeFocused();
});

test('no banner when Global Privacy Control already decides every gated category', async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true }));
    await page.goto(FIXTURE);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#consent-banner')).toHaveCount(0);
});

test('no banner for a category no choice can enable', async ({ page }) => {
    await page.goto('/tests/fixtures/consent-unknown.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#consent-banner')).toHaveCount(0);
});
