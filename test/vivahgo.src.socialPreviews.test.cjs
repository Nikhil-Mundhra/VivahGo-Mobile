const assert = require('node:assert/strict');

const { appPath, toFileUrl } = require('./helpers/testUtils.cjs');

async function loadSocialPreviewsModule() {
  return import(`${toFileUrl(appPath('src/socialPreviews.js'))}?t=${Date.now()}`);
}

describe('VivahGo/src/socialPreviews.js', function () {
  it('resolves configured preview assets by host and explicit preview key', async function () {
    const mod = await loadSocialPreviewsModule();

    assert.equal(
      mod.resolveSocialPreview({ hostname: 'vivahgo.com', pathname: '/guides' }).path,
      '/social-preview.png'
    );
    assert.equal(
      mod.resolveSocialPreview({ hostname: 'planner.vivahgo.com', pathname: '/' }).path,
      '/planner-social-preview.jpeg'
    );
    assert.equal(
      mod.resolveSocialPreview({ previewKey: 'planner', hostname: 'localhost', pathname: '/planner' }).path,
      '/planner-social-preview.jpeg'
    );
  });
});
