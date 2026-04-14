const assert = require('node:assert/strict');
const path = require('node:path');

const {
  OUTPUT_JSON_PATH,
  buildPublicAssetMap,
  resolveBlobListTimeoutMs,
  shouldUseExistingAssetMapFallback,
} = require('../scripts/generate-public-asset-map.cjs');

describe('generate-public-asset-map', function () {
  it('falls back to the checked-in asset map when the Blob token is unavailable', async function () {
    const assetMap = await buildPublicAssetMap({
      listBlobs: async () => {
        throw new Error('BLOB_READ_WRITE_TOKEN is not configured in the environment or an .env file.');
      },
    });
    const existingAssetMap = require(path.resolve(OUTPUT_JSON_PATH));

    assert.deepEqual(assetMap.assets, existingAssetMap.assets);
    assert.equal(assetMap.count, existingAssetMap.count);
  });

  it('falls back to the checked-in asset map when Blob listing times out', async function () {
    const assetMap = await buildPublicAssetMap({
      listBlobs: async () => {
        throw new Error('Vercel Blob listing timed out after 10000ms.');
      },
    });
    const existingAssetMap = require(path.resolve(OUTPUT_JSON_PATH));

    assert.deepEqual(assetMap.assets, existingAssetMap.assets);
    assert.equal(assetMap.count, existingAssetMap.count);
  });

  it('uses a bounded Blob listing timeout by default and from configuration', function () {
    assert.equal(resolveBlobListTimeoutMs(), 10000);
    assert.equal(resolveBlobListTimeoutMs({ timeoutMs: 250 }), 250);
    assert.equal(resolveBlobListTimeoutMs({ timeoutMs: 'invalid' }), 10000);
  });

  it('only uses the existing asset map fallback for expected offline cases', function () {
    assert.equal(
      shouldUseExistingAssetMapFallback(new Error('BLOB_READ_WRITE_TOKEN is not configured in the environment or an .env file.')),
      true
    );
    assert.equal(
      shouldUseExistingAssetMapFallback(new Error('Vercel Blob listing timed out after 10000ms.')),
      true
    );
    assert.equal(
      shouldUseExistingAssetMapFallback(Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' })),
      true
    );
    assert.equal(shouldUseExistingAssetMapFallback(new Error('Unauthorized')), false);
  });
});
