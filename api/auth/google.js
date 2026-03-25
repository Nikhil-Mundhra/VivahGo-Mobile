const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose');

const {
  buildEmptyPlanner,
  connectDb,
  createSessionToken,
  getPlannerModel,
  getUserModel,
  handlePreflight,
  normalizeEmail,
  normalizeStaffRole,
  resolveStaffRole,
  sanitizePlanner,
  setCorsHeaders,
} = require('../_lib/core');

module.exports = async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return;
  }

  setCorsHeaders(req, res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    return res.status(500).json({ error: 'Google auth is not configured on the server.' });
  }

  const oauthClient = new OAuth2Client(googleClientId);
  const credential = req.body?.credential;

  if (!credential) {
    return res.status(400).json({ error: 'Missing Google credential.' });
  }

  try {
    await connectDb();
    const User = getUserModel();
    const Planner = getPlannerModel();

    const ticket = await oauthClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || !payload.name) {
      return res.status(400).json({ error: 'Google account details are incomplete.' });
    }

    const normalizedEmail = normalizeEmail(payload.email);
    let existingUser = null;

    if (mongoose.connection.readyState > 0 && typeof User.findOne === 'function') {
      const result = await User.findOne({ googleId: payload.sub });
      existingUser = typeof result?.lean === 'function' ? await result.lean() : result;
    }

    const staffRole = resolveStaffRole(normalizedEmail, normalizeStaffRole(existingUser?.staffRole));

    const user = await User.findOneAndUpdate(
      { googleId: payload.sub },
      {
        $set: {
          googleId: payload.sub,
          email: normalizedEmail,
          name: payload.name,
          picture: payload.picture || '',
          staffRole,
          staffGrantedAt: staffRole === 'owner' ? existingUser?.staffGrantedAt || new Date() : existingUser?.staffGrantedAt || null,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const planner = await Planner.findOneAndUpdate(
      { googleId: payload.sub },
      {
        $setOnInsert: {
          googleId: payload.sub,
          ...buildEmptyPlanner({ ownerEmail: payload.email, ownerId: payload.sub }),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      token: createSessionToken(user),
      user: {
        id: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture,
        staffRole: resolveStaffRole(user.email, user.staffRole),
      },
      planner: sanitizePlanner(planner.toObject(), { ownerEmail: user.email, ownerId: user.googleId }),
      plannerOwnerId: user.googleId,
    });
  } catch (error) {
    console.error('Google auth failed:', error);
    return res.status(401).json({ error: 'Google sign-in could not be verified.' });
  }
};
