const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose');

const {
  applyRateLimit,
  buildEmptyPlanner,
  clearSessionCookie,
  connectDb,
  createSessionToken,
  ensureCsrfToken,
  getPlannerModel,
  getUserModel,
  getVendorModel,
  handlePreflight,
  normalizeEmail,
  normalizeStaffRole,
  requireCsrfProtection,
  resolveStaffRole,
  sanitizePlanner,
  setSessionCookie,
  setCorsHeaders,
  verifySession,
} = require('./_lib/core');

/******************************************************************************
 * Route Resolution
 ******************************************************************************/

function resolveAuthRoute(req) {
  return String(req.query?.route || '').trim().toLowerCase();
}

function isVerifiedGoogleEmail(payload) {
  return payload?.email_verified === true || payload?.email_verified === 'true';
}

/******************************************************************************
 * /api/auth/google
 *
 * Google sign-in remains isolated here so future auth providers can be added
 * beside it without mixing the token-verification flow with account deletion.
 ******************************************************************************/

async function handleGoogleAuth(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (requireCsrfProtection(req, res, { skipForBearer: false })) {
    return;
  }

  if (applyRateLimit(req, res, 'auth:google', {
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: 'Too many sign-in attempts. Please wait a few minutes and try again.',
  })) {
    return;
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
    if (!isVerifiedGoogleEmail(payload)) {
      return res.status(400).json({ error: 'Google account email must be verified.' });
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

    ensureCsrfToken(req, res, { refresh: true });
    setSessionCookie(req, res, createSessionToken(user));

    return res.status(200).json({
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
    if (error?.message === 'JWT_SECRET must be configured in production.') {
      return res.status(500).json({ error: 'Server auth is not configured.' });
    }
    return res.status(401).json({ error: 'Google sign-in could not be verified.' });
  }
}

/******************************************************************************
 * /api/auth/me
 *
 * Account deletion is intentionally separate from sign-in logic so future
 * profile/account endpoints can live in this section with their own methods.
 ******************************************************************************/

async function handleAuthMe(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (requireCsrfProtection(req, res)) {
    return;
  }

  const { auth, error, status = 401 } = verifySession(req);
  if (error) {
    return res.status(status).json({ error });
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

    clearSessionCookie(req, res);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('DELETE /auth/me error:', err);
    return res.status(500).json({ error: 'Failed to delete account. Please try again.' });
  }
}

async function handleAuthLogout(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (requireCsrfProtection(req, res)) {
    return;
  }

  clearSessionCookie(req, res);
  return res.status(200).json({ ok: true });
}

async function handleAuthCsrf(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const csrfToken = ensureCsrfToken(req, res, { refresh: true });
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ csrfToken });
}

/******************************************************************************
 * Main Entrypoint
 ******************************************************************************/

async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return;
  }

  setCorsHeaders(req, res);

  const route = resolveAuthRoute(req);

  if (route === 'google') {
    return handleGoogleAuth(req, res);
  }

  if (route === 'csrf') {
    return handleAuthCsrf(req, res);
  }

  if (route === 'me') {
    return handleAuthMe(req, res);
  }

  if (route === 'logout') {
    return handleAuthLogout(req, res);
  }

  res.setHeader('Allow', 'OPTIONS');
  return res.status(404).json({ error: 'Auth route not found.' });
}

module.exports = handler;
module.exports.handleAuthCsrf = handleAuthCsrf;
module.exports.handleGoogleAuth = handleGoogleAuth;
module.exports.handleAuthMe = handleAuthMe;
module.exports.handleAuthLogout = handleAuthLogout;
