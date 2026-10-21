const ORIGIN = 'http://localhost:4173';

// Every page the site serves. Later pages are added as they're built.
const PAGES = ['/index.html', '/privacy.html', '/cookies.html', '/terms.html', '/accessibility.html'];

// Records every request that leaves the local origin.
function collectExternalRequests(page) {
    const external = [];
    page.on('request', req => {
        const url = req.url();
        if (url.startsWith('data:') || url.startsWith('blob:')) return;
        if (new URL(url).origin !== ORIGIN) external.push(url);
    });
    return external;
}

module.exports = { ORIGIN, PAGES, collectExternalRequests };
