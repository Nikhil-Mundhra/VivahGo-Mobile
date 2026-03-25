const { handlePreflight, normalizeEmail, normalizeStaffRole, setCorsHeaders } = require('../_lib/core');
const { requireAdminSession, sanitizeStaffUser } = require('../_lib/admin');

async function resolveLean(result) {
  if (!result) {
    return null;
  }
  if (typeof result.lean === 'function') {
    return result.lean();
  }
  if (typeof result.toObject === 'function') {
    return result.toObject();
  }
  return result;
}

module.exports = async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return;
  }
  setCorsHeaders(req, res);

  try {
    if (req.method === 'GET') {
      const session = await requireAdminSession(req, 'owner');
      if (session.error) {
        return res.status(session.status).json({ error: session.error });
      }

      const users = await session.User.find({ staffRole: { $in: ['owner', 'editor', 'viewer'] } })
        .select('-__v')
        .sort({ staffRole: 1, email: 1 })
        .lean();

      return res.status(200).json({
        staff: users.map(sanitizeStaffUser),
      });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const session = await requireAdminSession(req, 'owner');
      if (session.error) {
        return res.status(session.status).json({ error: session.error });
      }

      const email = normalizeEmail(req.body?.email);
      const staffRole = normalizeStaffRole(req.body?.staffRole);

      if (!email) {
        return res.status(400).json({ error: 'email is required.' });
      }
      if (!['editor', 'viewer'].includes(staffRole)) {
        return res.status(400).json({ error: 'staffRole must be viewer or editor.' });
      }
      if (email === normalizeEmail(session.user.email)) {
        return res.status(400).json({ error: 'Use the bootstrap owner account as the permanent owner.' });
      }

      const updated = await session.User.findOneAndUpdate(
        { email },
        {
          $set: {
            email,
            staffRole,
            staffAddedBy: session.user.googleId,
            staffGrantedAt: new Date(),
          },
        },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ error: 'User must sign in once with Google before staff access can be granted.' });
      }

      return res.status(200).json({
        staffUser: sanitizeStaffUser(await resolveLean(updated)),
      });
    }

    if (req.method === 'DELETE') {
      const session = await requireAdminSession(req, 'owner');
      if (session.error) {
        return res.status(session.status).json({ error: session.error });
      }

      const email = normalizeEmail(req.query?.email || req.body?.email);
      if (!email) {
        return res.status(400).json({ error: 'email is required.' });
      }
      if (email === normalizeEmail(session.user.email)) {
        return res.status(400).json({ error: 'The bootstrap owner cannot be removed.' });
      }

      const updated = await session.User.findOneAndUpdate(
        { email },
        {
          $set: {
            staffRole: 'none',
            staffAddedBy: '',
            staffGrantedAt: null,
          },
        },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ error: 'Staff member not found.' });
      }

      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('Admin staff management failed:', error);
    return res.status(500).json({ error: 'Could not manage staff.' });
  }
};
