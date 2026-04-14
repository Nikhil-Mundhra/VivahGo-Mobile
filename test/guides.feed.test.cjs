const assert = require('node:assert/strict');
const path = require('node:path');

const { ROOT, readText } = require('./helpers/testUtils.cjs');

const {
  buildGuidesFeed,
  OUTPUT_PATH,
} = require('../scripts/generate-guides-feed.cjs');
const guides = require('../vivahgo/src/shared/content/guides.json');

describe('guides RSS feed', function () {
  it('matches the generated XML from the current guide library', function () {
    const expectedXml = buildGuidesFeed(guides);
    const actualXml = readText(path.relative(ROOT, OUTPUT_PATH));

    assert.equal(actualXml, expectedXml);
  });

  it('includes the main feed metadata and every guide URL', function () {
    const xml = readText(path.relative(ROOT, OUTPUT_PATH));

    assert.match(xml, /<title>VivahGo Guides<\/title>/);
    assert.match(xml, /<atom:link href="https:\/\/vivahgo\.com\/guides\/feed\.xml" rel="self" type="application\/rss\+xml" \/>/);
    assert.match(xml, /xmlns:media="http:\/\/search\.yahoo\.com\/mrss\/"/);

    for (const guide of guides) {
      const escapedImagePath = guide.coverImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      assert.match(xml, new RegExp(`<link>https://vivahgo\\.com/guides/${guide.slug}</link>`));
      assert.match(xml, new RegExp(`<pubDate>${new Date(`${guide.publishedAt}T00:00:00.000Z`).toUTCString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</pubDate>`));
      assert.match(xml, new RegExp(`<enclosure url="https://[^"]+${escapedImagePath.split('/').pop()}" type="image/(png|jpeg)" length="0" />`));
      assert.match(xml, new RegExp(`<media:content url="https://[^"]+${escapedImagePath.split('/').pop()}" medium="image" type="image/(png|jpeg)">`));
      assert.match(xml, new RegExp(`<media:thumbnail url="https://[^"]+${escapedImagePath.split('/').pop()}" />`));
    }
  });
});
