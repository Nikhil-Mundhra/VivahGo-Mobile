const assert = require('node:assert/strict');

const adminLibPath = require.resolve('../api/_lib/admin');
const handlerPath = require.resolve('../api/admin');
const corePath = require.resolve('../api/_lib/core');

describe('api/admin.js -> subscribers route', function () {
  const originalAdminLib = require(adminLibPath);
  const originalCore = require(corePath);

  afterEach(function () {
    require.cache[adminLibPath].exports = originalAdminLib;
    require.cache[corePath].exports = originalCore;
    delete require.cache[handlerPath];
  });

  it('returns subscribers with latest receipt details for an authorized admin session', async function () {
    require.cache[adminLibPath].exports = {
      ...originalAdminLib,
      requireAdminSession: async () => ({
        user: { email: 'admin@vivahgo.com', staffRole: 'viewer' },
        access: { role: 'viewer', canViewAdmin: true },
        User: {
          find: () => ({
            select: () => ({
              sort: () => ({
                lean: async () => ([
                  {
                    _id: 'user-1',
                    googleId: 'sub-1',
                    name: 'Asha',
                    email: 'asha@example.com',
                    subscriptionTier: 'premium',
                    subscriptionStatus: 'active',
                    subscriptionCurrentPeriodEnd: '2026-09-26T23:59:59.000Z',
                    subscriptionId: 'rcpt_1',
                  },
                ]),
              }),
            }),
          }),
        },
      }),
    };

    require.cache[corePath].exports = {
      ...originalCore,
      getBillingReceiptModel: () => ({
        find: () => ({
          select: () => ({
            sort: () => ({
              lean: async () => ([
                {
                  _id: 'receipt-1',
                  googleId: 'sub-1',
                  receiptNumber: 'VGP-1',
                  plan: 'premium',
                  billingCycle: 'monthly',
                  amount: 0,
                  couponCode: 'VIVAHGO100',
                  emailDeliveryStatus: 'sent',
                  paymentProvider: 'internal',
                  issuedAt: '2026-03-26T10:00:00.000Z',
                },
              ]),
            }),
          }),
        }),
      }),
    };

    const handler = require(handlerPath);
    const req = { method: 'GET', query: { route: 'subscribers' }, headers: {} };
    const res = {
      statusCode: 200,
      headers: {},
      body: null,
      setHeader(name, value) { this.headers[name] = value; },
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.body = payload; return this; },
      end() { return this; },
    };

    await handler(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(Array.isArray(res.body.subscribers), true);
    assert.equal(res.body.subscribers.length, 1);
    assert.equal(res.body.subscribers[0].email, 'asha@example.com');
    assert.equal(res.body.subscribers[0].latestReceipt.receiptNumber, 'VGP-1');
    assert.equal(res.body.subscribers[0].latestReceipt.couponCode, 'VIVAHGO100');
  });

  it('falls back to subscribers without receipts when receipt lookup fails', async function () {
    require.cache[adminLibPath].exports = {
      ...originalAdminLib,
      requireAdminSession: async () => ({
        user: { email: 'admin@vivahgo.com', staffRole: 'viewer' },
        access: { role: 'viewer', canViewAdmin: true },
        User: {
          find: () => ({
            select: () => ({
              sort: () => ({
                lean: async () => ([
                  {
                    _id: 'user-1',
                    googleId: 'sub-1',
                    name: 'Asha',
                    email: 'asha@example.com',
                    subscriptionTier: 'premium',
                    subscriptionStatus: 'active',
                    subscriptionCurrentPeriodEnd: '2026-09-26T23:59:59.000Z',
                    subscriptionId: 'rcpt_1',
                  },
                ]),
              }),
            }),
          }),
        },
      }),
    };

    require.cache[corePath].exports = {
      ...originalCore,
      getBillingReceiptModel: () => ({
        find: () => ({
          select: () => ({
            sort: () => ({
              lean: async () => {
                throw new Error('receipts unavailable');
              },
            }),
          }),
        }),
      }),
    };

    const handler = require(handlerPath);
    const req = { method: 'GET', query: { route: 'subscribers' }, headers: {} };
    const res = {
      statusCode: 200,
      headers: {},
      body: null,
      setHeader(name, value) { this.headers[name] = value; },
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.body = payload; return this; },
      end() { return this; },
    };

    await handler(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(Array.isArray(res.body.subscribers), true);
    assert.equal(res.body.subscribers.length, 1);
    assert.equal(res.body.subscribers[0].email, 'asha@example.com');
    assert.equal(res.body.subscribers[0].latestReceipt, null);
  });
});
