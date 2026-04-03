const assert = require('node:assert/strict');

const { appPath, toFileUrl } = require('./helpers/testUtils.cjs');

async function load() {
  return import(`${toFileUrl(appPath('src/vendorPricing.js'))}?t=${Date.now()}`);
}

describe('VivahGo/src/vendorPricing.js', function () {
  it('normalizes missing, partial, and out-of-order budget ranges', async function () {
    const mod = await load();

    assert.deepEqual(
      mod.normalizeVendorBudgetRange(),
      { min: 100000, max: 300000 }
    );
    assert.deepEqual(
      mod.normalizeVendorBudgetRange({ min: 250000 }),
      { min: 250000, max: 300000 }
    );
    assert.deepEqual(
      mod.normalizeVendorBudgetRange({ min: 500000, max: 100000 }),
      { min: 100000, max: 500000 }
    );
    assert.deepEqual(
      mod.normalizeVendorBudgetRange({ min: 1, max: 200000000 }),
      { min: 10000, max: 150000001 }
    );
  });

  it('updates min and max ranges while preserving a valid price window', async function () {
    const mod = await load();

    assert.deepEqual(
      mod.updateVendorBudgetRange({ min: 100000, max: 300000 }, 'min', 450000),
      { min: 300000, max: 300000 }
    );
    assert.deepEqual(
      mod.updateVendorBudgetRange({ min: 100000, max: 300000 }, 'max', 50000),
      { min: 100000, max: 100000 }
    );
    assert.equal(
      mod.updateVendorBudgetRange({ min: 100000, max: 300000 }, 'min', 'invalid'),
      null
    );
  });

  it('exposes the shared slider model used by both vendor pricing forms', async function () {
    const mod = await load();

    assert.equal(mod.VENDOR_BUDGET_SLIDER_POINTS[0], 10000);
    assert.equal(mod.VENDOR_BUDGET_SLIDER_POINTS.at(-1), 150000000);
    assert.equal(mod.findNearestVendorBudgetPointIndex(205000) >= 0, true);
    assert.equal(mod.formatVendorBudgetInr(1234567), '₹12,34,567');
  });
});
