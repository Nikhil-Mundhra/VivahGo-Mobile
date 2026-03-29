const assert = require('node:assert/strict');

const adminLibPath = require.resolve('../api/_lib/admin');
const b2LibPath = require.resolve('../api/_lib/b2');
const careersAdminLibPath = require.resolve('../api/_lib/careers-admin');
const corePath = require.resolve('../api/_lib/core');
const handlerPath = require.resolve('../api/admin');

function createResponseRecorder() {
  return {
    statusCode: null,
    body: null,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe('api/admin.js -> applications route', function () {
  const originalAdminLib = require(adminLibPath);
  const originalB2Lib = require(b2LibPath);
  const originalCareersAdminLib = require(careersAdminLibPath);
  const originalCore = require(corePath);

  afterEach(function () {
    require.cache[adminLibPath].exports = originalAdminLib;
    require.cache[b2LibPath].exports = originalB2Lib;
    require.cache[careersAdminLibPath].exports = originalCareersAdminLib;
    require.cache[corePath].exports = originalCore;
    delete require.cache[handlerPath];
  });

  it('returns career applications and the saved rejection template for an authorized admin session', async function () {
    require.cache[adminLibPath].exports = {
      ...originalAdminLib,
      requireAdminSession: async () => ({
        user: { email: 'admin@vivahgo.com', staffRole: 'viewer' },
        access: { role: 'viewer', canViewAdmin: true },
      }),
    };

    require.cache[corePath].exports = {
      ...originalCore,
      getCareerApplicationModel: () => ({
        find: () => ({
          select() {
            return this;
          },
          sort() {
            return this;
          },
          lean: async () => ([
            {
              _id: 'app-1',
              fullName: 'Aarav Sharma',
              email: 'aarav@example.com',
              jobId: 'full-stack-engineer',
              jobTitle: 'Full Stack Engineer',
              resumeFileId: 'careers/resumes/2026-03/file.pdf',
              resumeFileName: 'resume.pdf',
              resumeViewUrl: '',
              resumeDownloadUrl: '',
              resumeOriginalFileName: 'resume.pdf',
              resumeMimeType: 'application/pdf',
              resumeSize: 1024,
              status: 'new',
              createdAt: '2026-03-26T10:00:00.000Z',
              updatedAt: '2026-03-26T10:00:00.000Z',
            },
          ]),
        }),
      }),
      getCareerEmailTemplateModel: () => ({
        findOne: () => ({
          toObject() {
            return {
              subject: 'Thanks for applying to {{jobTitle}}',
              body: 'Hi {{firstName}},\n\nThanks for your time.',
            };
          },
        }),
      }),
    };

    const { handleAdminApplications } = require(handlerPath);
    const req = { method: 'GET', headers: { authorization: 'Bearer test' } };
    const res = createResponseRecorder();

    await handleAdminApplications(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.applications.length, 1);
    assert.equal(res.body.applications[0].jobTitle, 'Full Stack Engineer');
    assert.equal(res.body.applications[0].resumeFileId, 'careers/resumes/2026-03/file.pdf');
    assert.equal(res.body.rejectionEmailTemplate.subject, 'Thanks for applying to {{jobTitle}}');
  });

  it('saves an edited rejection draft for editors', async function () {
    let savedTemplate = null;

    require.cache[adminLibPath].exports = {
      ...originalAdminLib,
      requireAdminSession: async () => ({
        user: { email: 'editor@vivahgo.com', staffRole: 'editor' },
        access: { role: 'editor', canViewAdmin: true },
      }),
    };

    require.cache[corePath].exports = {
      ...originalCore,
      getCareerEmailTemplateModel: () => ({
        findOneAndUpdate: async (_query, update) => {
          savedTemplate = update.$set;
          return {
            templateKey: update.$set.templateKey,
            subject: update.$set.subject,
            body: update.$set.body,
            updatedBy: update.$set.updatedBy,
          };
        },
      }),
    };

    const { handleAdminApplications } = require(handlerPath);
    const req = {
      method: 'PATCH',
      headers: { authorization: 'Bearer test' },
      body: {
        action: 'save-rejection-template',
        subject: '  Update for {{jobTitle}}  ',
        body: '  Hi {{firstName}},\n\nThanks for applying.  ',
      },
    };
    const res = createResponseRecorder();

    await handleAdminApplications(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.ok, true);
    assert.equal(savedTemplate.subject, 'Update for {{jobTitle}}');
    assert.equal(savedTemplate.body, 'Hi {{firstName}},\n\nThanks for applying.');
    assert.equal(savedTemplate.updatedBy, 'editor@vivahgo.com');
  });

  it('rejects an application, emails the applicant, and removes the stored resume', async function () {
    let deletedKey = '';
    let sentPayload = null;
    let persistedTemplate = null;
    let updatePayload = null;
    const originalApplication = {
      _id: 'app-1',
      fullName: 'Aarav Sharma',
      email: 'AARAV@example.com',
      jobTitle: 'Full Stack Engineer',
      resumeFileId: 'careers/resumes/2026-03/file.pdf',
      resumeFileName: 'resume.pdf',
      resumeViewUrl: '',
      resumeDownloadUrl: '',
      resumeOriginalFileName: 'resume-original.pdf',
      resumeMimeType: 'application/pdf',
      resumeSize: 2048,
      status: 'new',
      createdAt: '2026-03-26T10:00:00.000Z',
      updatedAt: '2026-03-26T10:00:00.000Z',
    };

    require.cache[adminLibPath].exports = {
      ...originalAdminLib,
      requireAdminSession: async () => ({
        user: { email: 'editor@vivahgo.com', googleId: 'gid-editor', staffRole: 'editor' },
        access: { role: 'editor', canViewAdmin: true },
      }),
    };

    require.cache[b2LibPath].exports = {
      ...originalB2Lib,
      deleteB2Object: async (key) => {
        deletedKey = key;
        return { ok: true };
      },
    };

    require.cache[careersAdminLibPath].exports = {
      ...originalCareersAdminLib,
      sendCareerRejectionEmail: async (payload) => {
        sentPayload = payload;
        return {
          subject: 'Update on your VivahGo application for Full Stack Engineer',
          body: 'Hi Aarav,\n\nThank you for applying.',
          sentAt: '2026-03-29T12:00:00.000Z',
        };
      },
    };

    require.cache[corePath].exports = {
      ...originalCore,
      getCareerApplicationModel: () => ({
        findById: async (id) => (id === 'app-1' ? { ...originalApplication } : null),
        findByIdAndUpdate: async (_id, update) => {
          updatePayload = update.$set;
          return {
            ...originalApplication,
            ...update.$set,
          };
        },
      }),
      getCareerEmailTemplateModel: () => ({
        findOneAndUpdate: async (_query, update) => {
          persistedTemplate = update.$set;
          return {
            subject: update.$set.subject,
            body: update.$set.body,
          };
        },
      }),
    };

    const { handleAdminApplications } = require(handlerPath);
    const req = {
      method: 'PATCH',
      headers: { authorization: 'Bearer test' },
      body: {
        action: 'reject-application',
        applicationId: 'app-1',
        subject: 'Update on your VivahGo application for {{jobTitle}}',
        body: 'Hi {{firstName}},\n\nThank you for your time.',
      },
    };
    const res = createResponseRecorder();

    await handleAdminApplications(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.ok, true);
    assert.equal(persistedTemplate.subject, 'Update on your VivahGo application for {{jobTitle}}');
    assert.equal(sentPayload.toEmail, 'aarav@example.com');
    assert.equal(sentPayload.application.fullName, 'Aarav Sharma');
    assert.equal(deletedKey, 'careers/resumes/2026-03/file.pdf');
    assert.equal(updatePayload.status, 'rejected');
    assert.equal(updatePayload.rejectedBy, 'editor@vivahgo.com');
    assert.equal(updatePayload.resumeFileId, '');
    assert.equal(updatePayload.resumeFileName, '');
    assert.equal(updatePayload.resumeOriginalFileName, '');
    assert.equal(updatePayload.resumeMimeType, '');
    assert.equal(updatePayload.resumeSize, 0);
    assert.equal(res.body.application.status, 'rejected');
    assert.equal(res.body.application.resumeFileId, '');
    assert.equal(res.body.application.rejectionEmailSubject, 'Update on your VivahGo application for Full Stack Engineer');
    assert.equal(res.body.application.resumeDeletedAt instanceof Date, true);
  });
});
