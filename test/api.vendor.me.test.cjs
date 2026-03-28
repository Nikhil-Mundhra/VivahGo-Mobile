const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const { createRes } = require('./helpers/testUtils.cjs');

const corePath = require.resolve('../api/_lib/core');
const handlerPath = require.resolve('../api/vendor');

function makeToken(payload = {}) {
  return jwt.sign(
    { sub: 'vendor-123', email: 'vendor@test.com', name: 'Vendor Test', ...payload },
    'change-me-before-production',
    { expiresIn: '7d' }
  );
}

describe('api/vendor.js -> me route', function () {
  const originalCore = require(corePath);

  afterEach(function () {
    require.cache[corePath].exports = originalCore;
    delete require.cache[handlerPath];
  });

  it('rejects unsafe website URLs during vendor profile creation', async function () {
    require.cache[corePath].exports = {
      ...originalCore,
      connectDb: async () => {},
      getUserModel: () => ({
        findOneAndUpdate: async () => {
          throw new Error('Should not update user for invalid input.');
        },
      }),
      getVendorModel: () => ({
        findOne: async () => null,
        create: async () => {
          throw new Error('Should not create vendor for invalid input.');
        },
      }),
    };

    const { handleVendorMe: handler } = require(handlerPath);
    const req = {
      method: 'POST',
      headers: { authorization: `Bearer ${makeToken()}` },
      body: {
        businessName: 'Lotus Events',
        type: 'Venue',
        subType: 'Hotels',
        website: 'javascript:alert(1)',
      },
    };
    const res = createRes();

    await handler(req, res);

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { error: 'website and googleMapsLink must start with http:// or https://.' });
  });
});
