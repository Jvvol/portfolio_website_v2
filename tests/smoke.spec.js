// Existing behavior that the redesign must not break.
const { test, expect } = require('@playwright/test');

const FORMSPREE = 'https://formspree.io/**';

test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
});

test('projects render: featured rows with previews, the rest in a compact list', async ({ page }) => {
    const rows = page.locator('#projects-list article');
    await expect(rows).toHaveCount(5);
    await expect(rows.first()).toHaveClass(/is-lead/);
    await expect(rows.first()).toContainText('Etherius');
    await expect(rows.first().locator('.area')).toHaveText('Audio + software');
    await expect(page.locator('#projects-list .preview')).toHaveCount(5);
    await expect(page.locator('#projects-more > li')).toHaveCount(2);
});

test('music renders', async ({ page }) => {
    await expect(page.locator('#music-list > li')).toHaveCount(4);
    await expect(page.locator('#band-list > li')).toHaveCount(3);
    await expect(page.locator('#music-empty')).toBeHidden();
});

test('every release shows its cover art', async ({ page }) => {
    const covers = page.locator('#music-list .release-art img');
    await expect(covers).toHaveCount(4);
    for (const img of await covers.all()) {
        expect(await img.evaluate(n => n.naturalWidth)).toBeGreaterThan(0);
        await expect(img).toHaveAttribute('alt', /.+/);
    }
});

test('pixel-art covers stay crisp', async ({ page }) => {
    const godStomp = page.locator('#music-list img[src$="god-stomp.png"]');
    await expect(godStomp).toHaveCSS('image-rendering', 'pixelated');
});

test('theme toggles and persists', async ({ page }) => {
    const html = page.locator('html');
    const before = await page.evaluate(() =>
        document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    const after = before === 'dark' ? 'light' : 'dark';
    await page.click('#theme-toggle');
    await expect(html).toHaveAttribute('data-theme', after);
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', after);
});

test('mobile menu opens and closes with Escape', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const toggle = page.locator('#menu-toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#nav-links')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
});

async function fillContactForm(page) {
    await page.fill('#name', 'Test Person');
    await page.fill('#email', 'test@example.com');
    await page.fill('#message', 'Hello there');
}

test('contact form reports success', async ({ page }) => {
    await page.route(FORMSPREE, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    await fillContactForm(page);
    await page.click('#contact-form button[type="submit"]');
    await expect(page.locator('#form-status')).toContainText('Message sent');
});

test('contact form reports failure', async ({ page }) => {
    await page.route(FORMSPREE, r => r.fulfill({ status: 500, body: '' }));
    await fillContactForm(page);
    await page.click('#contact-form button[type="submit"]');
    await expect(page.locator('#form-status')).toHaveClass(/is-error/);
});
