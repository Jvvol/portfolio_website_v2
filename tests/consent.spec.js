// Consent manager: nothing optional loads until the visitor says yes.
const { test, expect } = require('@playwright/test');

const FIXTURE = '/tests/fixtures/consent-test.html';
const TRACKER = 'https://analytics.example.test/**';

// Serves the fake tracker and counts how often it's fetched.
async function trackHits(page) {
    const hits = { count: 0 };
    await page.route(TRACKER, route => {
        hits.count += 1;
        route.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.__analyticsLoaded = true;' });
    });
    return hits;
}

async function storedConsent(page) {
    return page.evaluate(() => JSON.parse(localStorage.getItem('consent.v1')));
}

test('real site shows no banner but offers cookie settings', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('[data-consent-open]')).toBeVisible();
    await expect(page.locator('#consent-banner')).toHaveCount(0);
});

test('tracker is blocked before a choice', async ({ page }) => {
    const hits = await trackHits(page);
    await page.goto(FIXTURE);
    await expect(page.locator('#consent-banner')).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(hits.count).toBe(0);
});

test('accept all loads the tracker and remembers the choice', async ({ page }) => {
    const hits = await trackHits(page);
    await page.goto(FIXTURE);
    await page.click('#consent-banner [data-consent-action="accept"]');
    await expect.poll(() => hits.count).toBe(1);
    expect(await page.evaluate(() => window.__analyticsLoaded)).toBe(true);
    await expect(page.locator('#consent-banner')).toBeHidden();
    await page.reload();
    await expect(page.locator('#consent-banner')).toBeHidden();
    await expect.poll(() => hits.count).toBe(2);
});

test('reject all keeps the tracker blocked across reloads', async ({ page }) => {
    const hits = await trackHits(page);
    await page.goto(FIXTURE);
    await page.click('#consent-banner [data-consent-action="reject"]');
    await expect(page.locator('#consent-banner')).toBeHidden();
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#consent-banner')).toBeHidden();
    expect(hits.count).toBe(0);
    expect((await storedConsent(page)).choices).toEqual({ functional: false, analytics: false, marketing: false });
});

test('accept and reject are equally prominent', async ({ page }) => {
    await page.goto(FIXTURE);
    const accept = page.locator('#consent-banner [data-consent-action="accept"]');
    const reject = page.locator('#consent-banner [data-consent-action="reject"]');
    const look = el => el.evaluate(n => {
        const s = getComputedStyle(n);
        return { h: n.getBoundingClientRect().height, bg: s.backgroundColor, color: s.color, weight: s.fontWeight, size: s.fontSize };
    });
    expect(await look(accept)).toEqual(await look(reject));
});

test('customize saves granular choices', async ({ page }) => {
    const hits = await trackHits(page);
    await page.goto(FIXTURE);
    await page.click('#consent-banner [data-consent-action="customize"]');
    await expect(page.locator('#consent-dialog')).toHaveAttribute('open', '');
    await page.check('input[name="consent-analytics"]');
    await page.click('#consent-dialog [data-consent-action="save"]');
    await expect.poll(() => hits.count).toBe(1);
    const saved = await storedConsent(page);
    expect(saved.version).toBe(1);
    expect(saved.choices).toEqual({ functional: false, analytics: true, marketing: false });
});

test('Global Privacy Control forces analytics and marketing off', async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true }));
    const hits = await trackHits(page);
    await page.goto(FIXTURE);
    // GPC already answers for analytics, so there is nothing to ask.
    await expect(page.locator('#consent-banner')).toHaveCount(0);
    await page.evaluate(() => window.Consent.acceptAll());
    await page.waitForLoadState('networkidle');
    expect(hits.count).toBe(0);
    await page.click('[data-consent-open]');
    await expect(page.locator('input[name="consent-analytics"]')).toBeDisabled();
    await expect(page.locator('input[name="consent-marketing"]')).toBeDisabled();
    await expect(page.locator('#consent-dialog')).toContainText('Global Privacy Control');
});

for (const [label, value] of [['garbage', 'garbage'], ['old version', JSON.stringify({ version: 0, choices: { analytics: true } })]]) {
    test(`stored value "${label}" counts as no choice`, async ({ page }) => {
        await page.addInitScript(v => localStorage.setItem('consent.v1', v), value);
        const hits = await trackHits(page);
        await page.goto(FIXTURE);
        await expect(page.locator('#consent-banner')).toBeVisible();
        await page.waitForLoadState('networkidle');
        expect(hits.count).toBe(0);
    });
}

function blockStorage() {
    const fail = () => { throw new DOMException('blocked', 'SecurityError'); };
    Storage.prototype.getItem = fail;
    Storage.prototype.setItem = fail;
}

test('blocked storage fails closed but still lets the visitor choose', async ({ page }) => {
    await page.addInitScript(blockStorage);
    const hits = await trackHits(page);
    await page.goto(FIXTURE);
    await expect(page.locator('#consent-banner')).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(hits.count).toBe(0);
    await page.click('#consent-banner [data-consent-action="accept"]');
    await expect.poll(() => hits.count).toBe(1);
    await page.click('[data-consent-open]');
    await expect(page.locator('#consent-dialog')).toHaveAttribute('open', '');
});

test('blocked storage leaves the theme toggle working', async ({ page }) => {
    await page.addInitScript(blockStorage);
    await page.goto('/index.html');
    const before = await page.evaluate(() => document.documentElement.dataset.theme || 'unset');
    await page.click('#theme-toggle');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme || 'unset')).not.toBe(before);
});

test('dialog works from the keyboard and explains when there is nothing to choose', async ({ page }) => {
    await page.goto('/index.html');
    const trigger = page.locator('[data-consent-open]');
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.locator('#consent-dialog');
    await expect(dialog).toHaveAttribute('open', '');
    await expect(dialog).toContainText('use any optional cookies or trackers');
    await page.keyboard.press('Escape');
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();
});

test('category switches toggle with the keyboard', async ({ page }) => {
    await page.goto(FIXTURE);
    await page.click('#consent-banner [data-consent-action="customize"]');
    const analytics = page.locator('input[name="consent-analytics"]');
    await analytics.focus();
    await page.keyboard.press('Space');
    await expect(analytics).toBeChecked();
});
