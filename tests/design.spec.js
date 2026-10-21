// Guards for the design system: one clear primary action, colors only from tokens.
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

test('every button on the page looks the same', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#music-list .btn').first()).toBeVisible();
    const looks = await page.locator('main .btn').evaluateAll(nodes => nodes.map(n => {
        const s = getComputedStyle(n);
        return [s.backgroundColor, s.color, s.borderColor, s.borderRadius, s.fontSize, s.fontWeight].join(' ');
    }));
    expect(looks.length).toBeGreaterThan(8);
    expect(new Set(looks).size).toBe(1);
});

test('release and project links are buttons', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#music-list a[href*="spotify"]').first()).toHaveClass(/\bbtn\b/);
    await expect(page.locator('#band-list a[href*="instagram"]').first()).toHaveClass(/\bbtn\b/);
});

test('section titles sit above their content, not in a side column', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/index.html');
    const head = await page.locator('#projects .section-head').boundingBox();
    const list = await page.locator('#projects-list').boundingBox();
    expect(head.y + head.height).toBeLessThanOrEqual(list.y);
    expect(await page.locator('#projects .section-head').evaluate(n => getComputedStyle(n).position)).not.toBe('sticky');
});

test('hero shows availability as a status readout', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('.hero .status')).toContainText('summer 2027');
});

test('no raw colors outside the token blocks', () => {
    const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
    // Drop every rule whose selector is a :root token block (incl. inside @media).
    const outside = css.replace(/:root(\[data-theme="dark"\]|:not\(\[data-theme="light"\]\))?\s*\{[^}]*\}/g, '');
    const raw = outside.match(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/gi) || [];
    expect(raw).toEqual([]);
});
