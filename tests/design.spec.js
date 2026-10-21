// Guards for the design system: one clear primary action, colors only from tokens.
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

test('hero has one primary action pointing to projects', async ({ page }) => {
    await page.goto('/index.html');
    const primary = page.locator('.hero-actions .btn-primary');
    await expect(primary).toHaveCount(1);
    await expect(primary).toHaveAttribute('href', '#projects');
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
