const assert = require('node:assert/strict');

const { createRes } = require('./helpers/testUtils.cjs');

const adminLibPath = require.resolve('../api/_lib/admin');
const corePath = require.resolve('../api/_lib/core');
const handlerPath = require.resolve('../api/admin');

describe('api/admin.js -> vendors route', function () {
  const originalAdminLib = require(adminLibPath);
  const originalCore = require(corePath);

  afterEach(function () {
    require.cache[adminLibPath].exports = originalAdminLib;
    require.cache[corePath].exports = originalCore;
    delete require.cache[handlerPath];
  });

  it('updates a vendor by googleId when the provided vendorId is not a Mongo ObjectId', async function () {
    const receivedFilters = [];

    require.cache[adminLibPath].exports = {
      ...originalAdminLib,
      requireAdminSession: async () => ({
        user: { email: 'editor@vivahgo.com', googleId: 'staff-1', staffRole: 'editor' },
        access: { role: 'editor', canViewAdmin: true, canManageVendors: true },
      }),
    };

    require.cache[corePath].exports = {
      ...originalCore,
      getVendorModel: () => ({
        findOneAndUpdate: async (filter, update) => {
          receivedFilters.push(filter);
          return {
            _id: '507f1f77bcf86cd799439011',
            googleId: 'vendor-legacy-1',
            businessName: 'Legacy Lens',
            type: 'Photography',
            isApproved: Boolean(update.$set.isApproved),
            tier: 'Free',
            verificationStatus: 'submitted',
            verificationNotes: '',
            verificationDocuments: [],
            media: [],
            createdAt: '2026-04-03T00:00:00.000Z',
            updatedAt: '2026-04-03T01:00:00.000Z',
          };
        },
      }),
    };

    const { handleAdminVendors } = require(handlerPath);
    const req = {
      method: 'PATCH',
      headers: { authorization: 'Bearer test' },
      body: {
        vendorId: 'vendor-legacy-1',
        vendorGoogleId: 'vendor-legacy-1',
        isApproved: true,
      },
    };
    const res = createRes();

    await handleAdminVendors(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(receivedFilters, [{ googleId: 'vendor-legacy-1' }]);
    assert.equal(res.body.vendor.id, '507f1f77bcf86cd799439011');
    assert.equal(res.body.vendor.googleId, 'vendor-legacy-1');
    assert.equal(res.body.vendor.isApproved, true);
  });

  it('returns 404 instead of 500 when a non-ObjectId vendor identifier does not match any vendor', async function () {
    const receivedFilters = [];

    require.cache[adminLibPath].exports = {
      ...originalAdminLib,
      requireAdminSession: async () => ({
        user: { email: 'editor@vivahgo.com', googleId: 'staff-1', staffRole: 'editor' },
        access: { role: 'editor', canViewAdmin: true, canManageVendors: true },
      }),
    };

    require.cache[corePath].exports = {
      ...originalCore,
      getVendorModel: () => ({
        findOneAndUpdate: async (filter) => {
          receivedFilters.push(filter);
          return null;
        },
      }),
    };

    const { handleAdminVendors } = require(handlerPath);
    const req = {
      method: 'PATCH',
      headers: { authorization: 'Bearer test' },
      body: {
        vendorId: 'vendor-legacy-missing',
        isApproved: true,
      },
    };
    const res = createRes();

    await handleAdminVendors(req, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'Vendor not found.');
    assert.deepEqual(receivedFilters, [{ googleId: 'vendor-legacy-missing' }]);
  });
});
