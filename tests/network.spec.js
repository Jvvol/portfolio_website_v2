// Nothing on the site may contact a third party just by loading a page.
const { test, expect } = require('@playwright/test');
const { PAGES, collectExternalRequests } = require('./helpers');

for (const path of PAGES) {
    test(`no third-party requests on load: ${path}`, async ({ page }) => {
        const external = collectExternalRequests(page);
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        expect(external).toEqual([]);
    });
}
