const assert = require('node:assert/strict');

const { createRes } = require('./helpers/testUtils.cjs');

const adminLibPath = require.resolve('../api/_lib/admin');
const b2Path = require.resolve('../api/_lib/b2');
const corePath = require.resolve('../api/_lib/core');
const handlerPath = require.resolve('../api/admin');

describe('api/admin.js -> vendors route', function () {
  const originalAdminLib = require(adminLibPath);
  const originalB2 = require(b2Path);
  const originalCore = require(corePath);

  afterEach(function () {
    require.cache[adminLibPath].exports = originalAdminLib;
    require.cache[b2Path].exports = originalB2;
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

  it('keeps the vendors queue available when one vendor record fails during serialization', async function () {
    require.cache[adminLibPath].exports = {
      ...originalAdminLib,
      requireAdminSession: async () => ({
        user: { email: 'viewer@vivahgo.com', googleId: 'staff-1', staffRole: 'viewer' },
        access: { role: 'viewer', canViewAdmin: true, canManageVendors: false },
      }),
    };

    const brokenVendor = {
      _id: '507f1f77bcf86cd799439099',
      googleId: 'vendor-broken-1',
      businessName: 'Broken Vendor',
      type: 'Photography',
      isApproved: false,
      tier: 'Plus',
      verificationStatus: 'submitted',
      verificationNotes: 'Needs review',
      createdAt: '2026-04-03T00:00:00.000Z',
      updatedAt: '2026-04-03T01:00:00.000Z',
    };
    Object.defineProperty(brokenVendor, 'media', {
      get() {
        throw new Error('legacy media payload is unreadable');
      },
    });

    require.cache[corePath].exports = {
      ...originalCore,
      getVendorModel: () => ({
        find: () => ({
          select: () => ({
            sort: () => ({
              lean: async () => ([
                brokenVendor,
                {
                  _id: '507f1f77bcf86cd799439011',
                  googleId: 'vendor-healthy-1',
                  businessName: 'Healthy Vendor',
                  type: 'Venue',
                  isApproved: false,
                  tier: 'Free',
                  verificationStatus: 'not_submitted',
                  verificationNotes: '',
                  verificationDocuments: [],
                  media: [],
                  createdAt: '2026-04-03T00:00:00.000Z',
                  updatedAt: '2026-04-03T01:00:00.000Z',
                },
              ]),
            }),
          }),
        }),
      }),
    };

    const { handleAdminVendors } = require(handlerPath);
    const req = {
      method: 'GET',
      headers: { authorization: 'Bearer test' },
    };
    const res = createRes();

    await handleAdminVendors(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.vendors.length, 2);
    assert.deepEqual(res.body.vendors[0], {
      id: '507f1f77bcf86cd799439099',
      googleId: 'vendor-broken-1',
      businessName: 'Broken Vendor',
      type: 'Photography',
      subType: '',
      description: '',
      country: '',
      state: '',
      city: '',
      phone: '',
      website: '',
      googleMapsLink: '',
      bundledServices: [],
      coverageAreas: [],
      budgetRange: null,
      isApproved: false,
      tier: 'Plus',
      verificationStatus: 'submitted',
      verificationNotes: 'Needs review',
      verificationReviewedAt: null,
      verificationReviewedBy: '',
      verificationDocuments: [],
      verificationDocumentCount: 0,
      mediaCount: 0,
      media: [],
      createdAt: '2026-04-03T00:00:00.000Z',
      updatedAt: '2026-04-03T01:00:00.000Z',
    });
    assert.equal(res.body.vendors[1].businessName, 'Healthy Vendor');
  });

  it('signs vendor verification document access urls from B2', async function () {
    require.cache[adminLibPath].exports = {
      ...originalAdminLib,
      requireAdminSession: async () => ({
        user: { email: 'viewer@vivahgo.com', googleId: 'staff-1', staffRole: 'viewer' },
        access: { role: 'viewer', canViewAdmin: true, canManageVendors: false },
      }),
    };

    require.cache[b2Path].exports = {
      ...originalB2,
      createB2PresignedGetUrl: async (key) => `https://private.example.com/${encodeURIComponent(key)}`,
    };

    require.cache[corePath].exports = {
      ...originalCore,
      getVendorModel: () => ({
        find: () => ({
          select: () => ({
            sort: () => ({
              lean: async () => ([
                {
                  _id: '507f1f77bcf86cd799439011',
                  googleId: 'vendor-123',
                  businessName: 'Healthy Vendor',
                  type: 'Venue',
                  isApproved: true,
                  tier: 'Free',
                  verificationStatus: 'submitted',
                  verificationNotes: '',
                  verificationDocuments: [
                    {
                      _id: 'd1',
                      key: 'vendor-verification/vendor-123/pan.pdf',
                      filename: 'pan.pdf',
                      size: 1200,
                      contentType: 'application/pdf',
                      documentType: 'PAN',
                      uploadedAt: '2026-04-03T00:00:00.000Z',
                    },
                  ],
                  media: [],
                  createdAt: '2026-04-03T00:00:00.000Z',
                  updatedAt: '2026-04-03T01:00:00.000Z',
                },
              ]),
            }),
          }),
        }),
      }),
    };

    const { handleAdminVendors } = require(handlerPath);
    const req = {
      method: 'GET',
      headers: { authorization: 'Bearer test' },
    };
    const res = createRes();

    await handleAdminVendors(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.vendors[0].verificationDocuments[0].accessUrl, 'https://private.example.com/vendor-verification%2Fvendor-123%2Fpan.pdf');
  });
});
