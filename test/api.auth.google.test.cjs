const assert = require('node:assert/strict');

const { createRes } = require('./helpers/testUtils.cjs');

const handler = require('../api/auth/google');

describe('api/auth/google.js', function () {
  it('returns 405 for methods other than POST', async function () {
    const req = { method: 'GET', headers: {}, body: {} };
    const res = createRes();

    await handler(req, res);

    assert.equal(res.statusCode, 405);
    assert.equal(res.headers.Allow, 'POST, OPTIONS');
    assert.deepEqual(res.body, { error: 'Method not allowed.' });
  });

  it('returns 500 when GOOGLE_CLIENT_ID is missing', async function () {
    const oldId = process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_ID;

    const req = { method: 'POST', headers: {}, body: { credential: 'dummy' } };
    const res = createRes();

    await handler(req, res);

    if (oldId !== undefined) {
      process.env.GOOGLE_CLIENT_ID = oldId;
    }

    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, { error: 'Google auth is not configured on the server.' });
  });

  it('returns 400 when credential is missing while config exists', async function () {
    const oldId = process.env.GOOGLE_CLIENT_ID;
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';

    const req = { method: 'POST', headers: {}, body: {} };
    const res = createRes();

    await handler(req, res);

    if (oldId !== undefined) {
      process.env.GOOGLE_CLIENT_ID = oldId;
    } else {
      delete process.env.GOOGLE_CLIENT_ID;
    }

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { error: 'Missing Google credential.' });
  });
});
