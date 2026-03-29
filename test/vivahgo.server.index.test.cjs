const assert = require('node:assert/strict');
const http = require('node:http');
const net = require('node:net');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const Test = require('supertest/lib/test');

const { appPath, toFileUrl } = require('./helpers/testUtils.cjs');

async function loadServerModule() {
  return import(`${toFileUrl(appPath('server/index.js'))}?t=${Date.now()}`);
}

async function bootstrapCsrf(app) {
  const response = await request(app).get('/api/auth/csrf');
  return {
    csrfToken: response.body.csrfToken,
    cookies: response.headers['set-cookie'] || [],
  };
}

const originalHttpServerListen = http.Server.prototype.listen;
const originalNetServerListen = net.Server.prototype.listen;
const originalServerAddress = Test.prototype.serverAddress;
const itWithHttpServer = process.env.ALLOW_HTTP_SERVER_TESTS === 'true' ? it : it.skip;

describe('VivahGo/server/index.js', function () {
  before(function () {
    const patchedListen = function patchedListen(...args) {
      if (typeof args[0] === 'number' && args.length === 1) {
        return originalNetServerListen.call(this, args[0], '127.0.0.1');
      }
      if (typeof args[0] === 'number' && typeof args[1] === 'function') {
        return originalNetServerListen.call(this, args[0], '127.0.0.1', args[1]);
      }
      return originalNetServerListen.apply(this, args);
    };

    http.Server.prototype.listen = patchedListen;
    net.Server.prototype.listen = patchedListen;
    Test.prototype.serverAddress = function patchedServerAddress(app, path) {
      const addr = app.address();
      if (!addr) {
        this._server = app.listen(0, '127.0.0.1');
      }
      return `http://127.0.0.1:${app.address().port}${path}`;
    };
  });

  after(function () {
    http.Server.prototype.listen = originalHttpServerListen;
    net.Server.prototype.listen = originalNetServerListen;
    Test.prototype.serverAddress = originalServerAddress;
  });

  it('exports sanitizer/helper functions with expected behavior', async function () {
    const mod = await loadServerModule();

    const emptyPlanner = mod.buildEmptyPlanner();
    assert.equal(Array.isArray(emptyPlanner.marriages), true);
    assert.equal(emptyPlanner.marriages.length, 1);
    assert.ok(emptyPlanner.activePlanId);
    assert.deepEqual(emptyPlanner.customTemplates, []);
    assert.deepEqual(emptyPlanner.wedding, { bride: '', groom: '', date: '', venue: '', guests: '', budget: '' });
    assert.deepEqual(emptyPlanner.events, []);
    assert.deepEqual(emptyPlanner.expenses, []);
    assert.deepEqual(emptyPlanner.guests, []);
    assert.deepEqual(emptyPlanner.vendors, []);
    assert.deepEqual(emptyPlanner.tasks, []);

    assert.equal(mod.isRecord({}), true);
    assert.equal(mod.isRecord([]), false);
    assert.equal(mod.isRecord(null), false);

    assert.deepEqual(mod.sanitizeCollection([{ ok: true }, null, 'x', { y: 1 }]), [{ ok: true }, { y: 1 }]);

    const sanitized = mod.sanitizePlanner({
      wedding: { bride: 'Aarohi' },
      events: [{ id: 1 }, null],
      tasks: ['bad', { id: 2 }],
      customTemplates: [{ id: 'custom_template_a', name: 'Custom', events: [{ name: 'Haldi', emoji: '🌿' }] }],
    });

    assert.equal(sanitized.wedding.bride, 'Aarohi');
    assert.equal(sanitized.wedding.groom, '');
    assert.equal(sanitized.events.length, 1);
    assert.equal(sanitized.tasks.length, 1);
    assert.equal(sanitized.events[0].id, 1);
    assert.equal(sanitized.events[0].planId, sanitized.activePlanId);
    assert.equal(sanitized.tasks[0].id, 2);
    assert.equal(sanitized.tasks[0].planId, sanitized.activePlanId);
    assert.equal(sanitized.customTemplates.length, 1);
    assert.equal(sanitized.customTemplates[0].eventCount, 1);

    const normalizedCollaborators = mod.sanitizePlanner(
      {
        marriages: [
          {
            id: 'plan-owner',
            collaborators: [
              { email: 'owner@test.com', role: 'owner' },
              { email: 'duplicate@test.com', role: 'owner' },
            ],
          },
        ],
        activePlanId: 'plan-owner',
      },
      { ownerEmail: 'owner@test.com', ownerId: 'owner-sub' }
    );
    const owners = normalizedCollaborators.marriages[0].collaborators.filter(item => item.role === 'owner');
    assert.equal(owners.length, 1);
    assert.equal(owners[0].email, 'owner@test.com');
    assert.equal(
      normalizedCollaborators.marriages[0].collaborators.find(item => item.email === 'duplicate@test.com').role,
      'viewer'
    );
  });

  it('parses client origins and signs/verifies session token', async function () {
    const mod = await loadServerModule();

    assert.equal(mod.getClientOrigins(undefined), true);
    assert.deepEqual(mod.getClientOrigins('https://a.com, https://b.com'), ['https://a.com', 'https://b.com']);

    const token = mod.createSessionToken(
      { googleId: 'gid-1', email: 'user@example.com', name: 'User' },
      'test-secret'
    );
    const payload = jwt.verify(token, 'test-secret');
    assert.equal(payload.sub, 'gid-1');
    assert.equal(payload.email, 'user@example.com');
  });

  it('treats a quoted ADMIN_OWNER_EMAIL as the bootstrap owner', async function () {
    const previousAdminOwnerEmail = process.env.ADMIN_OWNER_EMAIL;
    process.env.ADMIN_OWNER_EMAIL = '"nikhilmundhra28@gmail.com"';

    const mod = await loadServerModule();

    if (previousAdminOwnerEmail !== undefined) {
      process.env.ADMIN_OWNER_EMAIL = previousAdminOwnerEmail;
    } else {
      delete process.env.ADMIN_OWNER_EMAIL;
    }

    assert.equal(mod.getBootstrapAdminEmail(), 'nikhilmundhra28@gmail.com');
    assert.equal(mod.resolveStaffRole('nikhilmundhra28@gmail.com', 'none'), 'owner');
  });

  it('auth middleware returns 401 for missing/invalid token and calls next for valid token', async function () {
    const mod = await loadServerModule();

    const resMissing = {
      code: null,
      body: null,
      status(code) {
        this.code = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };

    mod.authMiddleware({ headers: {} }, resMissing, () => {}, 'test-secret');
    assert.equal(resMissing.code, 401);
    assert.equal(resMissing.body.error, 'Authentication required.');

    const resInvalid = {
      code: null,
      body: null,
      status(code) {
        this.code = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };

    mod.authMiddleware({ headers: { authorization: 'Bearer invalid.token' } }, resInvalid, () => {}, 'test-secret');
    assert.equal(resInvalid.code, 401);

    const token = jwt.sign({ sub: 'gid-ok' }, 'test-secret');
    const req = { headers: { authorization: `Bearer ${token}` } };
    let called = false;
    mod.authMiddleware(req, { status() { return this; }, json() { return this; } }, () => { called = true; }, 'test-secret');
    assert.equal(called, true);
    assert.equal(req.auth.sub, 'gid-ok');

    const cookieReq = { headers: { cookie: `vivahgo_session=${encodeURIComponent(token)}` } };
    let cookieCalled = false;
    mod.authMiddleware(cookieReq, { status() { return this; }, json() { return this; } }, () => { cookieCalled = true; }, 'test-secret');
    assert.equal(cookieCalled, true);
    assert.equal(cookieReq.auth.sub, 'gid-ok');
  });

  it('csrf middleware rejects missing tokens and allows matching cookie/header pairs', async function () {
    const mod = await loadServerModule();

    const blockedRes = {
      code: null,
      body: null,
      status(code) {
        this.code = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };

    let allowed = false;
    mod.csrfProtectionMiddleware(
      { method: 'POST', path: '/api/feedback', headers: {} },
      blockedRes,
      () => {}
    );
    assert.equal(blockedRes.code, 403);
    assert.equal(blockedRes.body.code, 'CSRF_REQUIRED');

    mod.csrfProtectionMiddleware(
      {
        method: 'POST',
        path: '/api/feedback',
        headers: {
          cookie: 'vivahgo_csrf=test-csrf-token',
          'x-csrf-token': 'test-csrf-token',
        },
      },
      { status() { return this; }, json() { return this; } },
      () => {
        allowed = true;
      }
    );
    assert.equal(allowed, true);
  });

  itWithHttpServer('returns 500 for Google auth route when oauth client is not configured', async function () {
    const mod = await loadServerModule();
    const app = mod.createApp({ googleClientId: '', oauthClient: null, jwtSecret: 'test-secret' });
    const { csrfToken, cookies } = await bootstrapCsrf(app);
    const res = await request(app).post('/api/auth/google').set('Cookie', cookies).set('X-CSRF-Token', csrfToken).send({ credential: 'cred' });
    assert.equal(res.status, 500);
    assert.equal(res.body.error, 'Google auth is not configured on the server.');
  });

  itWithHttpServer('handles Google auth success path and creates planner/user response', async function () {
    const mod = await loadServerModule();

    const userDoc = {
      googleId: 'gid-123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'pic',
    };
    const plannerDoc = {
      toObject() {
        return {
          wedding: { bride: 'Aarohi' },
          events: [{ id: 1 }, null],
          expenses: [],
          guests: [],
          vendors: [],
          tasks: [],
        };
      },
    };

    const UserModel = {
      async findOneAndUpdate() {
        return userDoc;
      },
    };
    const PlannerModel = {
      async findOneAndUpdate() {
        return plannerDoc;
      },
    };
    const oauthClient = {
      async verifyIdToken() {
        return {
          getPayload() {
            return {
              sub: 'gid-123',
              email: 'test@example.com',
              name: 'Test User',
              picture: 'pic',
              email_verified: true,
            };
          },
        };
      },
    };

    const app = mod.createApp({
      googleClientId: 'google-client',
      jwtSecret: 'test-secret',
      oauthClient,
      UserModel,
      PlannerModel,
    });

    const { csrfToken, cookies } = await bootstrapCsrf(app);
    const res = await request(app).post('/api/auth/google').set('Cookie', cookies).set('X-CSRF-Token', csrfToken).send({ credential: 'cred-ok' });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.id, 'gid-123');
    assert.equal(res.body.planner.events.length, 1);
    assert.equal(res.body.planner.events[0].id, 1);
    assert.equal(typeof res.body.planner.events[0].planId, 'string');
    assert.ok(Array.isArray(res.headers['set-cookie']));
    assert.ok(res.headers['set-cookie'].some(cookie => /vivahgo_session=/.test(cookie)));
    assert.ok(res.headers['set-cookie'].some(cookie => /vivahgo_csrf=/.test(cookie)));
    assert.equal(res.body.token, undefined);
  });

  itWithHttpServer('handles Google auth failures and incomplete payload branches', async function () {
    const mod = await loadServerModule();

    const oauthThrows = {
      async verifyIdToken() {
        throw new Error('bad-token');
      },
    };

    const appThrow = mod.createApp({
      googleClientId: 'google-client',
      jwtSecret: 'test-secret',
      oauthClient: oauthThrows,
      UserModel: { async findOneAndUpdate() { throw new Error('unexpected'); } },
      PlannerModel: { async findOneAndUpdate() { throw new Error('unexpected'); } },
    });

    const throwCsrf = await bootstrapCsrf(appThrow);
    const resThrow = await request(appThrow)
      .post('/api/auth/google')
      .set('Cookie', throwCsrf.cookies)
      .set('X-CSRF-Token', throwCsrf.csrfToken)
      .send({ credential: 'cred' });
    assert.equal(resThrow.status, 401);

    const oauthIncomplete = {
      async verifyIdToken() {
        return {
          getPayload() {
            return { sub: 'gid-only' };
          },
        };
      },
    };

    const appIncomplete = mod.createApp({
      googleClientId: 'google-client',
      jwtSecret: 'test-secret',
      oauthClient: oauthIncomplete,
      UserModel: { async findOneAndUpdate() { throw new Error('unexpected'); } },
      PlannerModel: { async findOneAndUpdate() { throw new Error('unexpected'); } },
    });

    const incompleteCsrf = await bootstrapCsrf(appIncomplete);
    const resIncomplete = await request(appIncomplete)
      .post('/api/auth/google')
      .set('Cookie', incompleteCsrf.cookies)
      .set('X-CSRF-Token', incompleteCsrf.csrfToken)
      .send({ credential: 'cred' });
    assert.equal(resIncomplete.status, 400);
    assert.equal(resIncomplete.body.error, 'Google account details are incomplete.');

    const oauthUnverified = {
      async verifyIdToken() {
        return {
          getPayload() {
            return {
              sub: 'gid-verified',
              email: 'test@example.com',
              name: 'Test User',
              email_verified: false,
            };
          },
        };
      },
    };

    const appUnverified = mod.createApp({
      googleClientId: 'google-client',
      jwtSecret: 'test-secret',
      oauthClient: oauthUnverified,
      UserModel: { async findOneAndUpdate() { throw new Error('unexpected'); } },
      PlannerModel: { async findOneAndUpdate() { throw new Error('unexpected'); } },
    });

    const unverifiedCsrf = await bootstrapCsrf(appUnverified);
    const resUnverified = await request(appUnverified)
      .post('/api/auth/google')
      .set('Cookie', unverifiedCsrf.cookies)
      .set('X-CSRF-Token', unverifiedCsrf.csrfToken)
      .send({ credential: 'cred' });
    assert.equal(resUnverified.status, 400);
    assert.equal(resUnverified.body.error, 'Google account email must be verified.');
  });

  itWithHttpServer('removes related planner data on account delete', async function () {
    const mod = await loadServerModule();

    const userDeletes = [];
    const plannerDeletes = [];
    const collaboratorRemovals = [];
    const vendorDeletes = [];
    const receiptDeletes = [];

    const app = mod.createApp({
      jwtSecret: 'test-secret',
      UserModel: {
        async findOne() {
          return {
            toObject() {
              return {
                googleId: 'gid-delete',
                email: 'delete-me@example.com',
                name: 'Delete Me',
              };
            },
          };
        },
        async deleteOne(query) {
          userDeletes.push(query);
          return { acknowledged: true };
        },
      },
      PlannerModel: {
        async deleteOne(query) {
          plannerDeletes.push(query);
          return { acknowledged: true };
        },
        async updateMany(query, update) {
          collaboratorRemovals.push({ query, update });
          return { acknowledged: true };
        },
      },
      VendorModel: {
        async deleteOne(query) {
          vendorDeletes.push(query);
          return { acknowledged: true };
        },
      },
      BillingReceiptModel: {
        async deleteMany(query) {
          receiptDeletes.push(query);
          return { acknowledged: true };
        },
      },
    });

    const token = jwt.sign(
      {
        sub: 'gid-delete',
        email: 'delete-me@example.com',
        name: 'Delete Me',
      },
      'test-secret',
      { expiresIn: '7d' }
    );

    const { csrfToken, cookies } = await bootstrapCsrf(app);
    const res = await request(app)
      .delete('/api/auth/me')
      .set('Cookie', [...cookies, `vivahgo_session=${token}`])
      .set('X-CSRF-Token', csrfToken);

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(userDeletes.length, 1);
    assert.deepEqual(userDeletes[0], { googleId: 'gid-delete' });
    assert.equal(plannerDeletes.length, 1);
    assert.deepEqual(plannerDeletes[0], { googleId: 'gid-delete' });
    assert.equal(collaboratorRemovals.length, 1);
    assert.deepEqual(collaboratorRemovals[0].query, {
      googleId: { $ne: 'gid-delete' },
      'marriages.collaborators.email': 'delete-me@example.com',
    });
    assert.deepEqual(collaboratorRemovals[0].update, {
      $pull: {
        'marriages.$[].collaborators': { email: 'delete-me@example.com' },
      },
    });
    assert.equal(vendorDeletes.length, 1);
    assert.deepEqual(vendorDeletes[0], { googleId: 'gid-delete' });
    assert.equal(receiptDeletes.length, 1);
    assert.deepEqual(receiptDeletes[0], { googleId: 'gid-delete' });
  });

  itWithHttpServer('covers planner GET/PUT success plus error branches', async function () {
    const mod = await loadServerModule();

    let plannerShouldThrow = false;
    const PlannerModel = {
      async findOneAndUpdate(_query, update) {
        if (plannerShouldThrow) {
          throw new Error('db-failure');
        }
        if (update.$setOnInsert) {
          return {
            toObject() {
              return { wedding: {}, events: [], expenses: [], guests: [], vendors: [], tasks: [] };
            },
          };
        }
        return {
          toObject() {
            return {
              wedding: {},
              events: [{ ok: true }, 'bad'],
              expenses: [],
              guests: [],
              vendors: [],
              tasks: [],
            };
          },
        };
      },
    };

    const app = mod.createApp({
      googleClientId: 'google-client',
      jwtSecret: 'test-secret',
      oauthClient: null,
      UserModel: { async findOneAndUpdate() { throw new Error('unexpected'); } },
      PlannerModel,
    });

    const token = jwt.sign({ sub: 'gid-123' }, 'test-secret');

    const getRes = await request(app).get('/api/planner/me').set('Authorization', `Bearer ${token}`);
    assert.equal(getRes.status, 200);

    const putRes = await request(app)
      .put('/api/planner/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ planner: { events: [{ ok: true }, null] } });
    assert.equal(putRes.status, 200);
    assert.equal(putRes.body.planner.events.length, 1);
    assert.equal(putRes.body.planner.events[0].ok, true);
    assert.equal(typeof putRes.body.planner.events[0].planId, 'string');

    plannerShouldThrow = true;
    const getErr = await request(app).get('/api/planner/me').set('Authorization', `Bearer ${token}`);
    assert.equal(getErr.status, 500);

    const putErr = await request(app)
      .put('/api/planner/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ planner: {} });
    assert.equal(putErr.status, 500);
  });
});
