const {
  buildEmptyPlanner,
  connectDb,
  getCollaboratorRoleForPlan,
  getPlannerModel,
  getPlanFromPlanner,
  handlePreflight,
  normalizeEmail,
  normalizePlannerOwnership,
  sanitizePlanner,
  setCorsHeaders,
  verifySession,
} = require('../_lib/core');

module.exports = async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return;
  }

  setCorsHeaders(req, res);

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { auth, error } = verifySession(req);
  if (error) {
    return res.status(401).json({ error });
  }

  try {
    await connectDb();
    const Planner = getPlannerModel();
    const email = normalizeEmail(auth.email);

    const ownPlanner = await Planner.findOneAndUpdate(
      { googleId: auth.sub },
      {
        $setOnInsert: {
          googleId: auth.sub,
          ...buildEmptyPlanner({ ownerEmail: email, ownerId: auth.sub }),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const sharedPlanners = email
      ? await Planner.find({
        googleId: { $ne: auth.sub },
        'marriages.collaborators.email': email,
      })
      : [];

    const allPlanners = [ownPlanner, ...sharedPlanners]
      .filter(Boolean)
      .map(doc => {
        const planner = sanitizePlanner(normalizePlannerOwnership(doc.toObject(), email, doc.googleId), {
          ownerEmail: email,
          ownerId: doc.googleId,
        });
        const activePlan = getPlanFromPlanner(planner, planner.activePlanId);
        const role = getCollaboratorRoleForPlan(activePlan, email) || 'owner';
        return {
          plannerOwnerId: doc.googleId,
          activePlanId: planner.activePlanId,
          activePlanName: activePlan ? `${activePlan.bride || 'Bride'} & ${activePlan.groom || 'Groom'}` : 'Wedding Plan',
          role,
        };
      });

    const deduped = [];
    const seen = new Set();
    for (const item of allPlanners) {
      const ownerId = item.plannerOwnerId || auth.sub;
      if (seen.has(ownerId)) {
        continue;
      }
      seen.add(ownerId);
      deduped.push({
        ...item,
        plannerOwnerId: ownerId,
      });
    }

    return res.status(200).json({ planners: deduped });
  } catch (err) {
    console.error('Planner access API failed:', err);
    return res.status(500).json({ error: 'Failed to load accessible planners.' });
  }
};
