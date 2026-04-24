const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { createRes } = require('./helpers/testUtils.cjs');
const queryPages = require('../vivahgo/src/shared/content/query-pages.json');
const {
  buildGuideMetadata,
  canUseSourceHtmlFallback,
  buildMarketingMetadata,
  buildPlannerMetadata,
  buildQueryPageMetadata,
  buildRsvpMetadata,
  buildRouteSnapshot,
  buildWebsiteMetadata,
  createPageHandler,
  injectMetadataIntoHtml,
  injectRootMarkupIntoHtml,
  readBuiltHtmlTemplate,
  resetHtmlTemplateCache,
  resolveConfiguredSocialPreview,
} = require('../api/page');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('api/page.js', function () {
  afterEach(function () {
    resetHtmlTemplateCache();
  });

  it('uses the source html fallback only outside production-like environments', function () {
    assert.equal(canUseSourceHtmlFallback({ NODE_ENV: 'development', VERCEL_ENV: 'preview' }), true);
    assert.equal(canUseSourceHtmlFallback({ NODE_ENV: 'production' }), false);
    assert.equal(canUseSourceHtmlFallback({ VERCEL_ENV: 'production' }), false);
  });

  it('does not read source html when production cannot find a built shell', function () {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'api-page-prod-'));
    const sourceHtmlPath = path.join(tempRoot, 'vivahgo', 'index.html');

    try {
      fs.mkdirSync(path.dirname(sourceHtmlPath), { recursive: true });
      fs.writeFileSync(sourceHtmlPath, '<!doctype html><html><head><script type="module" src="/src/main.jsx"></script></head><body><div id="root"></div></body></html>');

      assert.throws(() => readBuiltHtmlTemplate({
        rootDir: tempRoot,
        env: { NODE_ENV: 'production' },
        useCache: false,
      }), /Could not locate the built app shell/);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it('can still use the source html fallback during local development', function () {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'api-page-dev-'));
    const sourceHtmlPath = path.join(tempRoot, 'vivahgo', 'index.html');
    const sourceHtml = '<!doctype html><html><head><script type="module" src="/src/main.jsx"></script></head><body><div id="root"></div></body></html>';

    try {
      fs.mkdirSync(path.dirname(sourceHtmlPath), { recursive: true });
      fs.writeFileSync(sourceHtmlPath, sourceHtml);

      assert.equal(readBuiltHtmlTemplate({
        rootDir: tempRoot,
        env: { NODE_ENV: 'development' },
        useCache: false,
      }), sourceHtml);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it('injects fresh metadata into the built app shell', function () {
    const html = injectMetadataIntoHtml(
      '<!doctype html><html><head><title>Old</title><meta name="description" content="Old" /><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>',
      {
        title: 'Asha & Rohan | Wedding Website',
        description: 'Celebrate with Asha & Rohan.',
        canonicalPath: '/asha-rohan-1',
        robots: 'noindex, nofollow',
      },
      { headers: { host: 'vivahgo.com', 'x-forwarded-proto': 'https' } }
    );

    assert.match(html, /Asha &amp; Rohan \| Wedding Website/);
    assert.match(html, /meta name="robots" content="noindex, nofollow"/);
    assert.match(html, /meta property="og:url" content="https:\/\/vivahgo\.com\/asha-rohan-1"/);
    assert.match(html, /meta property="og:image" content="https:\/\/vivahgo\.com\/social-preview\.png"/);
    assert.match(html, /meta property="og:image:secure_url" content="https:\/\/vivahgo\.com\/social-preview\.png"/);
    assert.match(html, /meta property="og:image:type" content="image\/png"/);
    assert.match(html, /meta property="og:image:width" content="640"/);
    assert.match(html, /meta property="og:image:height" content="467"/);
    assert.doesNotMatch(html, /<title>Old<\/title>/);
  });

  it('injects crawlable root markup into the app shell', function () {
    const html = injectRootMarkupIntoHtml(
      '<!doctype html><html><head></head><body><div id="root"></div></body></html>',
      '<main><h1>Wedding planner app</h1><p>Server snapshot</p></main>'
    );

    assert.match(html, /<div id="root"><main><h1>Wedding planner app<\/h1><p>Server snapshot<\/p><\/main><\/div>/);
  });

  it('builds marketing metadata for home, pricing, guides, and careers pages', function () {
    const req = { headers: { host: 'vivahgo.com', 'x-forwarded-proto': 'https' } };
    const plannerReq = { headers: { host: 'planner.vivahgo.com', 'x-forwarded-proto': 'https' } };

    assert.equal(buildMarketingMetadata(req, 'home').canonicalUrl, 'https://vivahgo.com/');
    assert.equal(buildMarketingMetadata(req, 'pricing').canonicalUrl, 'https://vivahgo.com/pricing');
    assert.equal(buildMarketingMetadata(req, 'guides').canonicalUrl, 'https://vivahgo.com/guides');
    assert.equal(buildMarketingMetadata(req, 'careers').canonicalUrl, 'https://vivahgo.com/careers');
    assert.equal(buildMarketingMetadata(plannerReq, 'home').canonicalUrl, 'https://vivahgo.com/');
    assert.equal(buildMarketingMetadata(plannerReq, 'pricing').canonicalUrl, 'https://vivahgo.com/pricing');
  });

  it('builds planner metadata with the planner social preview image', function () {
    const plannerMeta = buildPlannerMetadata();

    assert.equal(plannerMeta.canonicalUrl, 'https://planner.vivahgo.com/');
    assert.equal(plannerMeta.previewKey, 'planner');
    assert.equal(plannerMeta.robots, 'noindex, nofollow');
  });

  it('resolves social preview images from host and explicit preview keys', function () {
    assert.deepEqual(resolveConfiguredSocialPreview({
      hostname: 'vivahgo.com',
      pathname: '/pricing',
    }), {
      key: 'marketing',
      path: '/social-preview.png',
      type: 'image/png',
      width: '640',
      height: '467',
      alt: 'VivahGo wedding planner app homepage preview',
    });

    assert.deepEqual(resolveConfiguredSocialPreview({
      hostname: 'planner.vivahgo.com',
      pathname: '/',
    }), {
      key: 'planner',
      path: '/planner-social-preview.jpeg',
      type: 'image/jpeg',
      width: '640',
      height: '640',
      alt: 'VivahGo wedding planning preview',
    });

    assert.equal(resolveConfiguredSocialPreview({ previewKey: 'planner' }).path, '/planner-social-preview.jpeg');
  });

  it('builds guide metadata for a valid guide slug and noindexes missing guides', function () {
    const req = { headers: { host: 'vivahgo.com', 'x-forwarded-proto': 'https' } };
    const guideMeta = buildGuideMetadata(req, 'wedding-budget-planner', {
      guide: {
        slug: 'wedding-budget-planner',
        title: 'Indian Wedding Budget Planning Guide',
        seoDescription: 'Budget guide.',
        keywords: ['wedding budget planner'],
      },
    }, 200);
    const missingGuideMeta = buildGuideMetadata(req, 'missing-guide', { error: 'Guide not found.' }, 404);

    assert.match(guideMeta.title, /Budget Planning Guide/);
    assert.equal(guideMeta.canonicalPath, '/guides/wedding-budget-planner');
    assert.equal(missingGuideMeta.robots, 'noindex, nofollow');
  });

  it('builds query page metadata for a valid slug and noindexes missing pages', function () {
    const req = { headers: { host: 'vivahgo.com', 'x-forwarded-proto': 'https' } };
    const queryMeta = buildQueryPageMetadata(req, 'wedding-planner-app', {
      page: {
        slug: 'wedding-planner-app',
        title: 'Wedding Planner App',
        seoTitle: 'VivahGo Wedding Planner App',
        seoDescription: 'Query page description.',
        highlights: [{ title: 'One workspace' }],
        faqs: [{ question: 'Who is it for?', answer: 'Couples and planners.' }],
      },
    }, 200);
    const missingMeta = buildQueryPageMetadata(req, 'missing-page', { error: 'Planning page not found.' }, 404);

    assert.equal(queryMeta.canonicalPath, '/wedding-planner-app');
    assert.match(queryMeta.title, /Wedding Planner App/);
    assert.equal(missingMeta.robots, 'noindex, nofollow');
  });

  it('builds crawlable snapshots for indexable marketing routes', function () {
    const homeSnapshot = buildRouteSnapshot({ route: 'home', statusCode: 200, payload: null });
    const guideSnapshot = buildRouteSnapshot({
      route: 'guide',
      statusCode: 200,
      payload: {
        guide: {
          slug: 'wedding-budget-planner',
          title: 'Indian Wedding Budget Planning Guide',
          summary: 'Budget summary.',
          seoDescription: 'Budget SEO description.',
          sections: [
            {
              heading: 'Track the budget',
              paragraphs: ['Paragraph body.'],
              bullets: ['Watch pending balances.'],
            },
          ],
        },
      },
    });
    const querySnapshot = buildRouteSnapshot({
      route: 'query',
      statusCode: 200,
      payload: {
        page: {
          slug: 'wedding-planner-app',
          title: 'Wedding Planner App',
          heroKicker: 'Wedding planner app',
          heroTitle: 'The wedding planner app that keeps your wedding organized.',
          heroSummary: 'Summary.',
          heroBody: 'Body copy.',
          heroPrimaryLabel: 'Download free CSV',
          heroPrimaryHref: '/templates/wedding-budget-template.csv',
          heroPrimaryDownload: true,
          highlights: [{ title: 'One workspace', description: 'Description.' }],
          sections: [{ heading: 'Why it matters', paragraphs: ['Paragraph body.'], bullets: ['Bullet item.'] }],
          faqs: [{ question: 'Who is it for?', answer: 'Couples and planners.' }],
          relatedPageSlugs: [],
          relatedGuideSlugs: [],
        },
      },
    });

    assert.match(homeSnapshot, /One platform\. Every wedding\. Total control/);
    assert.match(homeSnapshot, /Ditch the chaos, master your wedding plan from Roka to Vidaai/);
    assert.match(homeSnapshot, /wedding checklist app/i);
    assert.match(guideSnapshot, /Indian Wedding Budget Planning Guide/);
    assert.match(guideSnapshot, /Watch pending balances/);
    assert.match(querySnapshot, /The wedding planner app that keeps your wedding organized/);
    assert.match(querySnapshot, /Bullet item/);
    assert.match(querySnapshot, /download/);
    assert.match(querySnapshot, /\/templates\/wedding-budget-template\.csv/);
  });

  it('builds wedding and rsvp metadata from planner payloads', function () {
    const req = { headers: { host: 'vivahgo.com', 'x-forwarded-proto': 'https' } };
    const websiteMeta = buildWebsiteMetadata(req, 'asha-rohan-1', {
      wedding: { bride: 'Asha', groom: 'Rohan', date: '12 Dec 2026', venue: 'Jaipur' },
      plan: { websiteSlug: 'asha-rohan-1' },
      events: [{ id: 1 }, { id: 2 }],
    }, 200);
    const rsvpMeta = buildRsvpMetadata(req, 'token-1', {
      wedding: { bride: 'Asha', groom: 'Rohan', date: '12 Dec 2026', venue: 'Jaipur' },
      plan: {},
      guest: { name: 'Rajesh Sharma' },
    }, 200);

    assert.match(websiteMeta.title, /Asha & Rohan/);
    assert.match(websiteMeta.description, /View 2 shared events/);
    assert.match(rsvpMeta.title, /Asha & Rohan/);
    assert.equal(rsvpMeta.robots, 'noindex, nofollow');
  });

  it('renders marketing html through the page handler', async function () {
    const handler = createPageHandler({
      loadHtmlTemplate: async () => '<!doctype html><html><head><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>',
      plannerHandlers: {},
    });
    const req = {
      method: 'GET',
      headers: { host: 'vivahgo.com', 'x-forwarded-proto': 'https' },
      query: { route: 'pricing' },
    };
    const res = createRes();

    await handler(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['Content-Type'], 'text/html; charset=utf-8');
    assert.equal(res.headers['Cache-Control'], 'public, s-maxage=3600, stale-while-revalidate=86400');
    assert.equal(res.headers['X-Content-Type-Options'], 'nosniff');
    assert.equal(res.headers['X-Frame-Options'], 'SAMEORIGIN');
    assert.match(res.headers['Content-Security-Policy'], /default-src 'self'/);
    assert.match(res.headers['Content-Security-Policy'], /style-src 'self' 'unsafe-inline' https:\/\/fonts\.googleapis\.com/);
    assert.match(res.headers['Content-Security-Policy'], /font-src 'self' data: https:\/\/fonts\.gstatic\.com/);
    assert.match(res.headers['Content-Security-Policy'], /script-src 'self' https:\/\/accounts\.google\.com https:\/\/apis\.google\.com https:\/\/www\.gstatic\.com https:\/\/www\.chatbase\.co/);
    assert.match(res.headers['Content-Security-Policy'], /connect-src 'self' https: http:\/\/localhost:\* http:\/\/127\.0\.0\.1:\* ws:\/\/localhost:\* ws:\/\/127\.0\.0\.1:\* https:\/\/www\.chatbase\.co/);
    assert.match(res.headers['Content-Security-Policy'], /frame-src 'self' https:\/\/www\.google\.com https:\/\/accounts\.google\.com https:\/\/www\.chatbase\.co/);
    assert.equal(res.headers['Strict-Transport-Security'], 'max-age=63072000; includeSubDomains; preload');
    assert.match(res.body, /VivahGo Pricing/);
    assert.match(res.body, /<link rel="canonical" href="https:\/\/vivahgo\.com\/pricing"/);
    assert.match(res.body, /application\/ld\+json/);
    assert.match(res.body, /Wedding Planner App Pricing/);
    assert.match(res.body, /Starter/);
  });

  it('renders crawlable home html through the page handler', async function () {
    const handler = createPageHandler({
      loadHtmlTemplate: async () => '<!doctype html><html><head><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>',
      plannerHandlers: {},
    });
    const req = {
      method: 'GET',
      headers: { host: 'vivahgo.com', 'x-forwarded-proto': 'https' },
      query: { route: 'home' },
    };
    const res = createRes();

    await handler(req, res);

    assert.equal(res.statusCode, 200);
    assert.match(res.body, /Wedding Planner App for Indian Weddings/);
    assert.match(res.body, /One platform\. Every wedding\. Total control/);
    assert.match(res.body, /Ditch the chaos, master your wedding plan from Roka to Vidaai/);
    assert.match(res.body, /SiteNavigationElement/);
    assert.match(res.body, /Planner Login/);
    assert.match(res.body, /Vendor Login/);
    assert.match(res.body, /wedding checklist app/i);
    assert.match(res.body, /https:\/\/vivahgo\.com\/guides\/indian-wedding-checklist/);
  });

  it('renders planner html with the planner preview image through the page handler', async function () {
    const handler = createPageHandler({
      loadHtmlTemplate: async () => '<!doctype html><html><head><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>',
      plannerHandlers: {},
    });
    const req = {
      method: 'GET',
      headers: { host: 'planner.vivahgo.com', 'x-forwarded-proto': 'https' },
      query: { route: 'planner' },
    };
    const res = createRes();

    await handler(req, res);

    assert.equal(res.statusCode, 200);
    assert.match(res.body, /VivahGo Planner \| Shared Wedding Workspace/);
    assert.match(res.body, /<link rel="canonical" href="https:\/\/planner\.vivahgo\.com\/"/);
    assert.match(res.body, /meta property="og:image" content="https:\/\/planner\.vivahgo\.com\/planner-social-preview\.jpeg"/);
    assert.match(res.body, /meta property="og:image:type" content="image\/jpeg"/);
    assert.match(res.body, /meta name="twitter:image" content="https:\/\/planner\.vivahgo\.com\/planner-social-preview\.jpeg"/);
    assert.match(res.body, /meta property="og:image:width" content="640"/);
    assert.match(res.body, /meta property="og:image:height" content="640"/);
  });

  it('renders crawlable vendor login html through the page handler', async function () {
    const handler = createPageHandler({
      loadHtmlTemplate: async () => '<!doctype html><html><head><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>',
      plannerHandlers: {},
    });
    const req = {
      method: 'GET',
      headers: { host: 'vivahgo.com', 'x-forwarded-proto': 'https' },
      query: { route: 'vendor' },
    };
    const res = createRes();

    await handler(req, res);

    assert.equal(res.statusCode, 200);
    assert.match(res.body, /VivahGo Vendor Login/);
    assert.match(res.body, /meta name="robots" content="index, follow"/);
    assert.match(res.body, /<link rel="canonical" href="https:\/\/vivahgo\.com\/vendor"/);
    assert.match(res.body, /Manage your wedding vendor profile on VivahGo/);
  });

  it('renders guide html for a valid guide slug', async function () {
    const handler = createPageHandler({
      loadHtmlTemplate: async () => '<!doctype html><html><head><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>',
      plannerHandlers: {},
    });
    const req = {
      method: 'GET',
      headers: { host: 'vivahgo.com', 'x-forwarded-proto': 'https' },
      query: { route: 'guide', slug: 'wedding-budget-planner' },
    };
    const res = createRes();

    await handler(req, res);

    assert.equal(res.statusCode, 200);
    assert.match(res.body, /Indian Wedding Budget Planning Guide/);
    assert.match(res.body, /https:\/\/vivahgo\.com\/guides\/wedding-budget-planner/);
    assert.match(res.body, /Budget by category and by ceremony/);
  });

  it('renders query page html for a valid query slug', async function () {
    const page = queryPages.find((item) => item.slug === 'wedding-planner-app');
    const handler = createPageHandler({
      loadHtmlTemplate: async () => '<!doctype html><html><head><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>',
      plannerHandlers: {},
    });
    const req = {
      method: 'GET',
      headers: { host: 'vivahgo.com', 'x-forwarded-proto': 'https' },
      query: { route: 'query', slug: 'wedding-planner-app' },
    };
    const res = createRes();

    await handler(req, res);

    assert.equal(res.statusCode, 200);
    assert.match(res.body, /VivahGo Wedding Planner App/);
    assert.match(res.body, new RegExp(escapeRegex(page.heroTitle)));
    assert.match(res.body, /https:\/\/vivahgo\.com\/wedding-planner-app/);
  });

  it('renders template query page html with a downloadable csv action', async function () {
    const handler = createPageHandler({
      loadHtmlTemplate: async () => '<!doctype html><html><head><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>',
      plannerHandlers: {},
    });
    const req = {
      method: 'GET',
      headers: { host: 'vivahgo.com', 'x-forwarded-proto': 'https' },
      query: { route: 'query', slug: 'indian-wedding-budget-template' },
    };
    const res = createRes();

    await handler(req, res);

    assert.equal(res.statusCode, 200);
    assert.match(res.body, /Free Indian Wedding Budget Template/);
    assert.match(res.body, /Indian Wedding Budget Template \(Free\) \+ Cost Breakdown 2025/);
    assert.match(res.body, /Download free CSV/);
    assert.match(res.body, /href="\/templates\/wedding-budget-template\.csv"/);
    assert.match(res.body, /download/);
    assert.match(res.body, /Rs\. 29\.6 lakh/);
    assert.match(res.body, /What does an Indian wedding cost in 2025/);
    assert.match(res.body, /Indian Wedding Cost Breakdown by Category/);
    assert.match(res.body, /Cost of Indian Wedding per Guest/);
    assert.match(res.body, /How to Create a Wedding Budget in India/);
    assert.match(res.body, /wedding guest list template/);
    assert.match(res.body, /Stop guessing your wedding budget/);
    assert.match(res.body, /application\/ld\+json/);
  });

  it('redirects missing query pages to the marketing home', async function () {
    const handler = createPageHandler({
      loadHtmlTemplate: async () => {
        throw new Error('html template should not load for redirects');
      },
      plannerHandlers: {},
    });
    const req = {
      method: 'GET',
      headers: { host: 'vivahgo.com', 'x-forwarded-proto': 'https' },
      query: { route: 'query', slug: 'missing-page' },
    };
    const res = createRes();

    await handler(req, res);

    assert.equal(res.statusCode, 302);
    assert.equal(res.headers.Location, '/');
    assert.equal(res.headers['Cache-Control'], 'no-store');
    assert.equal(res.body, null);
    assert.equal(res.ended, true);
  });

  it('redirects the old budget template slug to the canonical seo slug', async function () {
    const handler = createPageHandler({
      loadHtmlTemplate: async () => {
        throw new Error('html template should not load for redirects');
      },
      plannerHandlers: {},
    });
    const req = {
      method: 'GET',
      headers: { host: 'vivahgo.com', 'x-forwarded-proto': 'https' },
      query: { route: 'query', slug: 'free-wedding-budget-template' },
    };
    const res = createRes();

    await handler(req, res);

    assert.equal(res.statusCode, 302);
    assert.equal(res.headers.Location, '/indian-wedding-budget-template');
    assert.equal(res.headers['Cache-Control'], 'no-store');
    assert.equal(res.body, null);
    assert.equal(res.ended, true);
  });

  it('renders guide html and returns 404 for an unknown guide slug', async function () {
    const handler = createPageHandler({
      loadHtmlTemplate: async () => '<!doctype html><html><head><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>',
      plannerHandlers: {},
    });
    const req = {
      method: 'GET',
      headers: { host: 'vivahgo.com', 'x-forwarded-proto': 'https' },
      query: { route: 'guide', slug: 'missing-guide' },
    };
    const res = createRes();

    await handler(req, res);

    assert.equal(res.statusCode, 404);
    assert.match(res.body, /Guide Not Found/);
    assert.match(res.body, /noindex, nofollow/);
  });

  it('renders public website html from planner data', async function () {
    const handler = createPageHandler({
      loadHtmlTemplate: async () => '<!doctype html><html><head><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>',
      plannerHandlers: {
        handlePlannerPublic: async (_req, res) => {
          res.status(200).json({
            wedding: { bride: 'Asha', groom: 'Rohan', date: '12 Dec 2026', venue: 'Jaipur' },
            plan: { websiteSlug: 'asha-rohan-1' },
            events: [{ id: 1 }],
          });
        },
      },
    });
    const req = {
      method: 'GET',
      headers: { host: 'vivahgo.com', 'x-forwarded-proto': 'https' },
      query: { route: 'website', slug: 'asha-rohan-1' },
    };
    const res = createRes();

    await handler(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['Cache-Control'], 'public, s-maxage=600, stale-while-revalidate=3600');
    assert.match(res.body, /Asha &amp; Rohan \| Wedding Website/);
    assert.match(res.body, /https:\/\/vivahgo\.com\/asha-rohan-1/);
  });

  it('renders rsvp html with a 404 status when the token is invalid', async function () {
    const handler = createPageHandler({
      loadHtmlTemplate: async () => '<!doctype html><html><head><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>',
      plannerHandlers: {
        handlePlannerRsvp: async (_req, res) => {
          res.status(404).json({ error: 'Wedding invitation not found.' });
        },
      },
    });
    const req = {
      method: 'GET',
      headers: { host: 'vivahgo.com', 'x-forwarded-proto': 'https' },
      query: { route: 'rsvp', token: 'missing-token' },
    };
    const res = createRes();

    await handler(req, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.headers['Cache-Control'], 'no-store');
    assert.match(res.body, /RSVP Unavailable/);
    assert.match(res.body, /Wedding invitation not found/);
  });
});
