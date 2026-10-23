// Design refresh: project filter, click-to-load players, header resume link.
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
});

test('header links straight to the resume PDF', async ({ page }) => {
    await expect(page.locator('.site-header a.nav-resume')).toHaveAttribute('href', 'assets/resume/Jacob_Wolfe_Resume_SWE.pdf');
});

test('area filter narrows projects and announces the count', async ({ page }) => {
    const filters = page.locator('#project-filter .filter');
    await expect(filters).toHaveCount(3);
    await expect(filters.first()).toHaveAttribute('aria-pressed', 'true');

    await page.locator('#project-filter [data-filter="both"]').click();
    await expect(page.locator('#project-filter [data-filter="both"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#projects [data-area]:visible')).toHaveCount(2);
    await expect(page.locator('#projects-more-block')).toBeHidden();
    await expect(page.locator('#project-filter-status')).toHaveText('Showing 2 of 7 projects');
    await expect(page.locator('#projects-empty')).toBeHidden();

    await page.locator('#project-filter [data-filter="software"]').click();
    await expect(page.locator('#projects [data-area]:visible')).toHaveCount(5);
    await expect(page.locator('#projects-more-block')).toBeVisible();

    await page.locator('#project-filter [data-filter="all"]').click();
    await expect(page.locator('#projects [data-area]:visible')).toHaveCount(7);
});

test('filter buttons work from the keyboard', async ({ page }) => {
    await page.locator('#project-filter [data-filter="all"]').focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('#project-filter .filter').nth(1)).toHaveAttribute('aria-pressed', 'true');
});

test('Spotify player loads only after Play here is pressed', async ({ page }) => {
    const requested = [];
    await page.route('https://open.spotify.com/**', route => { requested.push(route.request().url()); route.fulfill({ status: 200, body: '<!doctype html><title>stub</title>' }); });
    const release = page.locator('#music-list > li', { hasText: 'Temporary' });
    await expect(release.locator('iframe')).toHaveCount(0);
    expect(requested).toEqual([]);

    await release.getByRole('button', { name: 'Play here' }).click();
    const frame = release.locator('iframe');
    await expect(frame).toHaveAttribute('src', 'https://open.spotify.com/embed/track/3ggyZEOIxEzwvvdO1oOsAE');
    await expect(frame).toHaveAttribute('title', 'Temporary by LVNARY on Spotify');
    await expect.poll(() => requested.length).toBeGreaterThan(0);
});

test('nothing autoplays: no audio or iframes on load', async ({ page }) => {
    await expect(page.locator('main iframe')).toHaveCount(0);
    const playing = await page.locator('audio').evaluateAll(nodes => nodes.filter(a => !a.paused).length);
    expect(playing).toBe(0);
});
