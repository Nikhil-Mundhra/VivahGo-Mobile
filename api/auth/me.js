const {
  connectDb,
  getPlannerModel,
  getUserModel,
  getVendorModel,
  handlePreflight,
  setCorsHeaders,
  verifySession,
} = require('../_lib/core');

module.exports = async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return;
  }

  setCorsHeaders(req, res);

  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { auth, error } = verifySession(req);
  if (error) {
    return res.status(401).json({ error });
  }

  try {
    await connectDb();
    const User = getUserModel();
    const Planner = getPlannerModel();
    const Vendor = getVendorModel();

    await Promise.all([
      User.deleteOne({ googleId: auth.sub }),
      Planner.deleteOne({ googleId: auth.sub }),
      Vendor.deleteOne({ googleId: auth.sub }),
    ]);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('DELETE /auth/me error:', err);
    return res.status(500).json({ error: 'Failed to delete account. Please try again.' });
  }
};
