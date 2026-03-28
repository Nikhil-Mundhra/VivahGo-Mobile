const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const MEDIA_VIVAHGO_FALLBACK_URL = 'https://pub-47c8cf1fe5da4a1b89c93045916376d7.r2.dev/';

function createR2Client() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 environment variables (R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) are not configured.');
  }

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

/**
 * Generate a presigned PUT URL for uploading a file directly to Cloudflare R2.
 * @param {string} key - The object key (path) in the bucket.
 * @param {string} contentType - The MIME type of the file.
 * @param {number} [expiresIn=3600] - URL expiry in seconds.
 * @returns {Promise<string>} The presigned PUT URL.
 */
function normalizePutUrlOptions(options) {
  if (typeof options === 'number') {
    return { expiresIn: options };
  }

  if (!options || typeof options !== 'object') {
    return {};
  }

  return options;
}

async function createPresignedPutUrl(key, contentType, options = 3600) {
  const normalizedOptions = normalizePutUrlOptions(options);
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    throw new Error('R2_BUCKET_NAME is not configured.');
  }

  const contentLength = Number(normalizedOptions.contentLength);
  const client = createR2Client();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ...(Number.isFinite(contentLength) && contentLength >= 0
      ? { ContentLength: Math.trunc(contentLength) }
      : {}),
  });

  const expiresIn = Number.isFinite(Number(normalizedOptions.expiresIn))
    ? Math.max(1, Math.trunc(Number(normalizedOptions.expiresIn)))
    : 3600;

  return getSignedUrl(client, command, { expiresIn });
}

async function createPresignedGetUrl(key, expiresIn = 900) {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    throw new Error('R2_BUCKET_NAME is not configured.');
  }

  const client = createR2Client();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: normalizeObjectKey(key),
  });

  return getSignedUrl(client, command, { expiresIn });
}

function getPublicBaseUrl() {
  const publicBase = (process.env.R2_PUBLIC_URL || '').trim();
  if (!publicBase) {
    throw new Error('R2_PUBLIC_URL is not configured.');
  }

  try {
    return new URL(publicBase.endsWith('/') ? publicBase : `${publicBase}/`);
  } catch {
    throw new Error('R2_PUBLIC_URL must be a valid absolute URL.');
  }
}

function normalizeObjectKey(key) {
  if (!key || typeof key !== 'string') {
    throw new Error('Object key must be a non-empty string.');
  }

  return key.replace(/^\/+/, '');
}

function buildScopedObjectPrefix(scope, ownerId) {
  const normalizedScope = typeof scope === 'string' ? scope.replace(/^\/+|\/+$/g, '') : '';
  const normalizedOwnerId = typeof ownerId === 'string' ? ownerId.trim().replace(/^\/+|\/+$/g, '') : '';

  if (!normalizedScope || !normalizedOwnerId) {
    return '';
  }

  return `${normalizedScope}/${normalizedOwnerId}/`;
}

function objectKeyMatchesScope(key, scope, ownerId) {
  try {
    const normalizedKey = normalizeObjectKey(key);
    const prefix = buildScopedObjectPrefix(scope, ownerId);
    return Boolean(prefix && normalizedKey.startsWith(prefix));
  } catch {
    return false;
  }
}

function createPublicObjectUrl(key) {
  const baseUrl = getPublicBaseUrl();
  return new URL(normalizeObjectKey(key), baseUrl).toString();
}

function getAcceptedPublicBaseUrls() {
  const primaryBaseUrl = getPublicBaseUrl();
  const acceptedBaseUrls = [primaryBaseUrl];

  if (
    primaryBaseUrl.origin === 'https://media.vivahgo.com' &&
    primaryBaseUrl.pathname.replace(/\/+$/, '') === '/portfolio'
  ) {
    acceptedBaseUrls.push(new URL(MEDIA_VIVAHGO_FALLBACK_URL));
  }

  return acceptedBaseUrls;
}

function extractObjectKeyFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  let objectUrl;
  try {
    objectUrl = new URL(url);
  } catch {
    return '';
  }

  let baseUrls;
  try {
    baseUrls = getAcceptedPublicBaseUrls();
  } catch {
    return '';
  }

  for (const baseUrl of baseUrls) {
    if (objectUrl.origin !== baseUrl.origin) {
      continue;
    }

    const basePath = baseUrl.pathname.endsWith('/') ? baseUrl.pathname : `${baseUrl.pathname}/`;
    if (!objectUrl.pathname.startsWith(basePath)) {
      continue;
    }

    return decodeURIComponent(objectUrl.pathname.slice(basePath.length));
  }

  return '';
}

function normalizeMediaItem(item) {
  if (!item || typeof item !== 'object') {
    return item;
  }

  const key = typeof item.key === 'string' && item.key
    ? item.key
    : extractObjectKeyFromUrl(item.url);

  let publicUrl = item.url;
  if (key) {
    try {
      publicUrl = createPublicObjectUrl(key);
    } catch {
      publicUrl = item.url;
    }
  }

  return {
    ...item,
    key,
    url: publicUrl,
  };
}

function normalizeMediaList(media) {
  if (!Array.isArray(media)) {
    return [];
  }

  return media.map(normalizeMediaItem);
}

module.exports = {
  createPresignedGetUrl,
  createPresignedPutUrl,
  createPublicObjectUrl,
  buildScopedObjectPrefix,
  extractObjectKeyFromUrl,
  normalizeMediaItem,
  normalizeMediaList,
  objectKeyMatchesScope,
};
