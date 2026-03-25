const { handlePreflight, setCorsHeaders } = require('../_lib/core');
const { requireAdminSession, sanitizeStaffUser } = require('../_lib/admin');

module.exports = async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return;
  }
  setCorsHeaders(req, res);

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const session = await requireAdminSession(req, 'viewer');
    if (session.error) {
      return res.status(session.status).json({ error: session.error });
    }

    return res.status(200).json({
      user: sanitizeStaffUser(session.user),
      access: session.access,
    });
  } catch (error) {
    console.error('Admin session lookup failed:', error);
    return res.status(500).json({ error: 'Could not load admin access.' });
  }
};
