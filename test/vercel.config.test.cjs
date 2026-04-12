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
});
