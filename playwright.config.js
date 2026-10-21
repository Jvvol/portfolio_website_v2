// Dev-only browser checks. Serves the repo as-is (no build) and runs Chromium.
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: 'tests',
    fullyParallel: true,
    reporter: [['list']],
    use: {
        baseURL: 'http://localhost:4173',
        browserName: 'chromium'
    },
    webServer: {
        command: 'npx http-server . -p 4173 -c-1 -s',
        url: 'http://localhost:4173/index.html',
        reuseExistingServer: true
    }
});
