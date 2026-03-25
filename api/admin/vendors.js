const { getVendorModel, handlePreflight, setCorsHeaders } = require('../_lib/core');
const { requireAdminSession } = require('../_lib/admin');
const { normalizeMediaList } = require('../_lib/r2');

function serializeAdminVendor(vendor = {}) {
  const media = normalizeMediaList(vendor.media)
    .sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0));

  return {
    id: String(vendor._id || ''),
    googleId: vendor.googleId || '',
    businessName: vendor.businessName || '',
    type: vendor.type || '',
    subType: vendor.subType || '',
    description: vendor.description || '',
    country: vendor.country || '',
    state: vendor.state || '',
    city: vendor.city || '',
    phone: vendor.phone || '',
    website: vendor.website || '',
    googleMapsLink: vendor.googleMapsLink || '',
    bundledServices: Array.isArray(vendor.bundledServices) ? vendor.bundledServices : [],
    coverageAreas: Array.isArray(vendor.coverageAreas) ? vendor.coverageAreas : [],
    budgetRange: vendor.budgetRange || null,
    isApproved: Boolean(vendor.isApproved),
    mediaCount: media.length,
    media,
    createdAt: vendor.createdAt || null,
    updatedAt: vendor.updatedAt || null,
  };
}

module.exports = async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return;
  }
  setCorsHeaders(req, res);

  try {
    if (req.method === 'GET') {
      const session = await requireAdminSession(req, 'viewer');
      if (session.error) {
        return res.status(session.status).json({ error: session.error });
      }

      const Vendor = getVendorModel();
      const vendors = await Vendor.find({})
        .select('-__v')
        .sort({ isApproved: 1, updatedAt: -1, createdAt: -1 })
        .lean();

      return res.status(200).json({
        vendors: vendors.map(serializeAdminVendor),
      });
    }

    if (req.method === 'PATCH') {
      const session = await requireAdminSession(req, 'editor');
      if (session.error) {
        return res.status(session.status).json({ error: session.error });
      }

      const vendorId = String(req.body?.vendorId || '').trim();
      const isApproved = req.body?.isApproved;

      if (!vendorId) {
        return res.status(400).json({ error: 'vendorId is required.' });
      }
      if (typeof isApproved !== 'boolean') {
        return res.status(400).json({ error: 'isApproved must be true or false.' });
      }

      const Vendor = getVendorModel();
      const vendor = await Vendor.findByIdAndUpdate(
        vendorId,
        {
          $set: {
            isApproved,
          },
        },
        { new: true }
      );

      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found.' });
      }

      return res.status(200).json({
        vendor: serializeAdminVendor(vendor.toObject()),
      });
    }

    res.setHeader('Allow', 'GET, PATCH, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('Admin vendor management failed:', error);
    return res.status(500).json({ error: 'Could not manage vendors.' });
  }
};
