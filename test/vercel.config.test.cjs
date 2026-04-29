const assert = require('node:assert/strict');

const { readText } = require('./helpers/testUtils.cjs');

describe('vercel.json', function () {
  it('rewrites public auth endpoints to the shared auth handler', function () {
    const config = JSON.parse(readText('vercel.json'));
    const rewritesBySource = new Map(
      config.rewrites.map((rewrite) => [rewrite.source, rewrite.destination])
    );

    assert.equal(rewritesBySource.get('/api/auth/google'), '/api/auth?route=google');
    assert.equal(rewritesBySource.get('/api/auth/clerk'), '/api/auth?route=clerk');
    assert.equal(rewritesBySource.get('/api/auth/csrf'), '/api/auth?route=csrf');
    assert.equal(rewritesBySource.get('/api/auth/logout'), '/api/auth?route=logout');
    assert.equal(rewritesBySource.get('/api/auth/me'), '/api/auth?route=me');
  });

  it('serves planner root through the SEO page handler and leaves preview assets static', function () {
    const config = JSON.parse(readText('vercel.json'));
    const forumRootRewrite = config.rewrites.find((rewrite) => (
      rewrite.source === '/' &&
      rewrite.has?.some((condition) => condition.type === 'host' && condition.value === 'forums.vivahgo.com')
    ));
    const forumFallbackRewrite = config.rewrites.find((rewrite) => (
      rewrite.source === '/((?!api/).*)' &&
      rewrite.has?.some((condition) => condition.type === 'host' && condition.value === 'forums.vivahgo.com')
    ));
    const plannerRootRewrite = config.rewrites.find((rewrite) => (
      rewrite.source === '/' &&
      rewrite.has?.some((condition) => condition.type === 'host' && condition.value === 'planner.vivahgo.com')
    ));
    const plannerFallbackRewrite = config.rewrites.find((rewrite) => (
      rewrite.source === '/((?!api/).*)' &&
      rewrite.has?.some((condition) => condition.type === 'host' && condition.value === 'planner.vivahgo.com')
    ));
    const forumCategoryRewrite = config.rewrites.find((rewrite) => (
      rewrite.source === '/category/:cid/:slug' &&
      rewrite.has?.some((condition) => condition.type === 'host' && condition.value === 'forums.vivahgo.com')
    ));
    const dynamicWebsiteRewrite = config.rewrites.find((rewrite) => rewrite.destination === '/api/page?route=website&slug=:slug');

    assert.equal(forumRootRewrite.destination, '/api/page?route=forums');
    assert.equal(forumFallbackRewrite.destination, '/api/page?route=forums');
    assert.equal(forumCategoryRewrite.destination, '/api/page?route=forums&categoryCid=:cid&categorySlug=:slug');
    assert.equal(plannerRootRewrite.destination, '/api/page?route=planner');
    assert.equal(plannerFallbackRewrite.destination, '/api/page?route=planner');
    assert.match(dynamicWebsiteRewrite.source, /social-preview\\\.png/);
    assert.match(dynamicWebsiteRewrite.source, /planner-social-preview\\\.jpeg/);
  });
});
