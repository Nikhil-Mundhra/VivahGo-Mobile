const { connectDb, handlePreflight, setCorsHeaders, getVendorModel } = require('./_lib/core');
const { normalizeMediaList } = require('./_lib/r2');

module.exports = async function handler(req, res) {
  if (handlePreflight(req, res)) { return; }
  setCorsHeaders(req, res);

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    await connectDb();
    const Vendor = getVendorModel();

    const raw = await Vendor.find({ isApproved: true })
      .select('-__v')
      .lean();

    const vendors = raw.map(v => {
      const media = normalizeMediaList(v.media)
        .filter(item => item?.isVisible !== false)
        .sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0));
      const coverMedia = media.find(item => item?.isCover) || media[0] || null;

      return {
        id: `db_${v._id}`,
        name: v.businessName,
        type: v.type,
        subType: v.subType || '',
        bundledServices: Array.isArray(v.bundledServices) ? v.bundledServices : [],
        description: v.description || '',
        country: v.country || '',
        state: v.state || '',
        city: v.city || '',
        googleMapsLink: v.googleMapsLink || '',
        phone: v.phone || '',
        website: v.website || '',
        emoji: '🏷️',
        rating: 0,
        priceLevel: null,
        booked: false,
        locations: [
          [v.city, v.state, v.country].filter(Boolean).join(', '),
          ...(Array.isArray(v.coverageAreas)
            ? v.coverageAreas.map(item => [item.city, item.state, item.country].filter(Boolean).join(', '))
            : []),
        ].filter(Boolean),
        media,
        coverImageUrl: coverMedia?.type === 'IMAGE' ? coverMedia.url : '',
      };
    });

    return res.status(200).json({ vendors });
  } catch (error) {
    console.error('Approved vendors fetch failed:', error);
    return res.status(500).json({ error: 'Could not fetch vendors.' });
  }
};
