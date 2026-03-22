const assert = require('node:assert/strict');

const { createRes } = require('./helpers/testUtils.cjs');

const handler = require('../api/planner/me');

describe('api/planner/me.js', function () {
  it('returns 405 for unsupported methods', async function () {
    const req = { method: 'POST', headers: {}, body: {} };
    const res = createRes();

    await handler(req, res);

    assert.equal(res.statusCode, 405);
    assert.equal(res.headers.Allow, 'GET, PUT, OPTIONS');
    assert.deepEqual(res.body, { error: 'Method not allowed.' });
  });

  it('returns 401 when auth header is missing', async function () {
    const req = { method: 'GET', headers: {}, body: {} };
    const res = createRes();

    await handler(req, res);

    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: 'Authentication required.' });
  });

  it('returns 401 when auth token is invalid', async function () {
    const req = {
      method: 'GET',
      headers: { authorization: 'Bearer invalid' },
      body: {},
    };
    const res = createRes();

    await handler(req, res);

    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: 'Session expired. Please sign in again.' });
  });
});
