const assert = require('node:assert/strict');

const { appPath, toFileUrl } = require('./helpers/testUtils.cjs');

describe('VivahGo/server/models/BillingReceipt.js', function () {
  it('exports a mongoose model with expected paths', async function () {
    const mod = await import(toFileUrl(appPath('server/models/BillingReceipt.js')));
    const BillingReceipt = mod.default;

    assert.equal(typeof BillingReceipt, 'function');
    assert.ok(BillingReceipt.schema.path('googleId'));
    assert.ok(BillingReceipt.schema.path('receiptNumber'));
    assert.ok(BillingReceipt.schema.path('plan'));
    assert.ok(BillingReceipt.schema.path('amount'));
  });
});
