const {
  connectDb,
  getStaffAccess,
  getUserModel,
  hasStaffRole,
  normalizeEmail,
  normalizeStaffRole,
  resolveStaffRole,
  verifySession,
} = require('./core');

async function resolveLeanUser(User, query) {
  if (!User || typeof User.findOne !== 'function') {
    return null;
  }

  const result = await User.findOne(query);
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

async function requireAdminSession(req, minimumRole = 'viewer') {
  const { auth, error, status = 401 } = verifySession(req);
  if (error) {
    return { status, error };
  }

  await connectDb();
  const User = getUserModel();
  const user = await resolveLeanUser(User, { googleId: auth.sub });

  if (!user) {
    return { status: 401, error: 'Account not found.' };
  }

  const resolvedStaffRole = resolveStaffRole(user.email || auth.email, user.staffRole);
  if (resolvedStaffRole !== user.staffRole && typeof User.updateOne === 'function') {
    await User.updateOne(
      { googleId: user.googleId },
      {
        $set: {
          staffRole: resolvedStaffRole,
          ...(resolvedStaffRole === 'owner' ? { staffGrantedAt: user.staffGrantedAt || new Date() } : {}),
        },
      }
    );
  }

  const hydratedUser = {
    ...user,
    email: normalizeEmail(user.email || auth.email),
    staffRole: resolvedStaffRole,
  };
  const access = getStaffAccess(resolvedStaffRole);

  if (!hasStaffRole(resolvedStaffRole, minimumRole)) {
    return { status: 403, error: 'Staff access required.' };
  }

  return {
    auth,
    access,
    user: hydratedUser,
    User,
  };
}

function sanitizeStaffUser(user = {}) {
  const staffRole = normalizeStaffRole(user.staffRole);
  return {
    id: String(user._id || user.googleId || ''),
    googleId: user.googleId || '',
    email: normalizeEmail(user.email || ''),
    name: user.name || '',
    picture: user.picture || '',
    staffRole,
    staffAddedBy: user.staffAddedBy || '',
    staffGrantedAt: user.staffGrantedAt || null,
    isBootstrapOwner: resolveStaffRole(user.email, user.staffRole) === 'owner' && normalizeEmail(user.email) === normalizeEmail(process.env.ADMIN_OWNER_EMAIL || 'nikhilmundhra28@gmail.com'),
  };
}

module.exports = {
  requireAdminSession,
  sanitizeStaffUser,
};
