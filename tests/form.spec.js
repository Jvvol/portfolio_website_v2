// Contact form: privacy notice, inline validation, and loading state.
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
});

test('privacy notice links the policy', async ({ page }) => {
    await expect(page.locator('#contact-form .form-note a[href="privacy.html"]')).toBeVisible();
});

test('errors appear only after interaction', async ({ page }) => {
    await expect(page.locator('#contact-form [aria-invalid="true"]')).toHaveCount(0);
    await page.click('#contact-form button[type="submit"]');
    for (const id of ['#name', '#email', '#message']) {
        await expect(page.locator(id)).toHaveAttribute('aria-invalid', 'true');
    }
    await expect(page.locator('#email-error')).not.toBeEmpty();
    await expect(page.locator('#name')).toBeFocused();
});

test('invalid email gets a specific message on blur', async ({ page }) => {
    await page.fill('#email', 'foo');
    await page.locator('#email').blur();
    await expect(page.locator('#email-error')).toContainText('email address');
    await expect(page.locator('#email')).toHaveAttribute('aria-describedby', /email-error/);
});

test('fixing a field clears its error', async ({ page }) => {
    await page.click('#contact-form button[type="submit"]');
    await page.fill('#name', 'Test Person');
    await expect(page.locator('#name')).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#name-error')).toBeEmpty();
});

test('submit shows a loading state while sending', async ({ page }) => {
    let release;
    const gate = new Promise(r => { release = r; });
    await page.route('https://formspree.io/**', async route => {
        await gate;
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await page.fill('#name', 'Test Person');
    await page.fill('#email', 'test@example.com');
    await page.fill('#message', 'Hello there');
    const button = page.locator('#contact-form button[type="submit"]');
    await button.click();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveClass(/is-loading/);
    release();
    await expect(page.locator('#form-status')).toContainText('Message sent');
    await expect(button).not.toHaveAttribute('aria-busy', 'true');
});
