// Guards for the design system: one clear primary action, colors only from tokens.
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

test('two button styles: one filled primary in the hero, every secondary alike', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#music-list .btn').first()).toBeVisible();
    await expect(page.locator('.hero .btn:not(.btn-secondary)')).toHaveCount(1);
    await expect(page.locator('.hero .btn:not(.btn-secondary)')).toHaveAttribute('href', '#projects');
    const look = sel => page.locator(sel).evaluateAll(nodes => nodes.map(n => {
        const s = getComputedStyle(n);
        return [s.backgroundColor, s.color, s.borderColor, s.borderRadius, s.fontWeight].join(' ');
    }));
    const secondary = await look('main .btn.btn-secondary:visible');
    expect(secondary.length).toBeGreaterThan(5);
    expect(new Set(secondary).size).toBe(1);
    expect(new Set(await look('main .btn:not(.btn-secondary):visible')).size).toBe(1);
});

test('release and band links are reachable: buttons, or a link beside Play here', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#music-list a[href*="itch.io"]').first()).toHaveClass(/\bbtn\b/);
    await expect(page.locator('#music-list a[href*="spotify"]')).toHaveCount(2);
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

for (const width of [375, 760, 1000, 1280]) {
    test(`release cards match at ${width}px: even rows, actions lined up, no extra notes`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/index.html');
        await expect(page.locator('#music-list .btn').first()).toBeVisible();
        await expect(page.locator('#music-list .release-upcoming')).toHaveCount(0);
        const cards = await page.locator('#music-list > li').evaluateAll(nodes => nodes.map(n => {
            const actions = n.querySelector('.release-actions');
            const filled = actions && actions.children.length > 0;
            return { top: Math.round(n.getBoundingClientRect().top), height: n.getBoundingClientRect().height, gap: filled ? n.getBoundingClientRect().bottom - actions.getBoundingClientRect().bottom : null };
        }));
        // Cards in the same row share a height.
        const rows = new Map();
        for (const c of cards) rows.set(c.top, (rows.get(c.top) || new Set()).add(Math.round(c.height)));
        for (const heights of rows.values()) expect(heights.size).toBe(1);
        // Actions sit at the bottom of each card, so they line up across a row.
        for (const c of cards) if (c.gap !== null) expect(Math.round(c.gap)).toBe(0);
    });
}
