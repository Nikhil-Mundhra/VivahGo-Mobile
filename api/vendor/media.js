const { connectDb, handlePreflight, setCorsHeaders, verifySession, getVendorModel } = require('../_lib/core');

const ALLOWED_MEDIA_TYPES = ['IMAGE', 'VIDEO'];

module.exports = async function handler(req, res) {
  if (handlePreflight(req, res)) { return; }
  setCorsHeaders(req, res);

  const { auth, error: authError } = verifySession(req);
  if (authError) {
    return res.status(401).json({ error: authError });
  }

  try {
    await connectDb();
    const Vendor = getVendorModel();

    if (req.method === 'POST') {
      const { url, type, sortOrder, filename, size } = req.body || {};

      if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        return res.status(400).json({ error: 'A valid url is required.' });
      }
      if (!ALLOWED_MEDIA_TYPES.includes(type)) {
        return res.status(400).json({ error: 'type must be IMAGE or VIDEO.' });
      }

      const vendor = await Vendor.findOneAndUpdate(
        { googleId: auth.sub },
        {
          $push: {
            media: {
              url,
              type,
              sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
              filename: typeof filename === 'string' ? filename.slice(0, 255) : '',
              size: typeof size === 'number' && size >= 0 ? size : 0,
            },
          },
        },
        { new: true }
      );

      if (!vendor) {
        return res.status(404).json({ error: 'No vendor profile found.' });
      }
      return res.status(201).json({ vendor });
    }

    if (req.method === 'DELETE') {
      const { mediaId } = req.body || {};

      if (!mediaId || typeof mediaId !== 'string') {
        return res.status(400).json({ error: 'mediaId is required.' });
      }

      const vendor = await Vendor.findOneAndUpdate(
        { googleId: auth.sub },
        // Mongoose uses the _id field name from the embedded document
        { $pull: { media: { _id: mediaId } } },
        { new: true }
      );

      if (!vendor) {
        return res.status(404).json({ error: 'No vendor profile found.' });
      }
      return res.status(200).json({ vendor });
    }

    res.setHeader('Allow', 'POST, DELETE, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('Vendor media error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};
