// No page may scroll sideways at phone, tablet, or desktop widths.
// Screenshots land in test-results/screens/ for a visual check.
const { test, expect } = require('@playwright/test');
const { PAGES } = require('./helpers');

for (const width of [375, 768, 1280]) {
    for (const path of PAGES) {
        test(`${path} fits at ${width}px`, async ({ page }) => {
            await page.setViewportSize({ width, height: 900 });
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await page.goto(path);
            await page.waitForLoadState('networkidle');
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
            expect(overflow).toBeLessThanOrEqual(0);
            const name = path.replace(/^\//, '').replace('.html', '');
            await page.screenshot({ path: `test-results/screens/${name}-${width}.png`, fullPage: true });
        });
    }
}
