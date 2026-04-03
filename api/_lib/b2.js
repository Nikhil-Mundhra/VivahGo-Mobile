const crypto = require('crypto');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

function createB2Client() {
  const endpoint = process.env.B2_ENDPOINT;
  const accessKeyId = process.env.B2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.B2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('B2 environment variables (B2_ENDPOINT, B2_ACCESS_KEY_ID, B2_SECRET_ACCESS_KEY) are not configured.');
  }

  return new S3Client({
    region: 'auto',
    endpoint: endpoint.startsWith('https://') ? endpoint : `https://${endpoint}`,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

function buildResumeFilename({ fullName, jobId, originalFilename }) {
  const safeName = String(fullName || 'candidate')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'candidate';
  const safeJob = String(jobId || 'role')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'role';
  const ext = String(originalFilename || '').toLowerCase().endsWith('.pdf') ? '.pdf' : '.pdf';

  return `${new Date().toISOString().slice(0, 10)}-${safeJob}-${safeName}${ext}`;
}

function buildResumeKey({ fullName, jobId, originalFilename }) {
  const filename = buildResumeFilename({ fullName, jobId, originalFilename });
  const randomSuffix = crypto.randomBytes(6).toString('hex');
  const month = new Date().toISOString().slice(0, 7);
  return `careers/resumes/${month}/${randomSuffix}-${filename}`;
}

async function uploadResumeToB2({ buffer, filename, fullName, jobId }) {
  const bucket = process.env.B2_BUCKET_NAME;
  if (!bucket) {
    throw new Error('B2_BUCKET_NAME is not configured.');
  }

  const key = buildResumeKey({ fullName, jobId, originalFilename: filename });
  const client = createB2Client();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: 'application/pdf',
    ContentLength: buffer.length,
  });

  await client.send(command);

  return {
    id: key,
    name: buildResumeFilename({ fullName, jobId, originalFilename: filename }),
    viewUrl: '',
    downloadUrl: '',
    mimeType: 'application/pdf',
  };
}

async function createB2PresignedGetUrl(key, expiresIn = 3600, options = {}) {
  const bucket = process.env.B2_BUCKET_NAME;
  if (!bucket) {
    throw new Error('B2_BUCKET_NAME is not configured.');
  }

  const client = createB2Client();
  const contentDisposition = typeof options.contentDisposition === 'string' ? options.contentDisposition.trim() : '';
  const contentType = typeof options.contentType === 'string' ? options.contentType.trim() : '';
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: normalizeB2ObjectKey(key),
    ...(contentDisposition ? { ResponseContentDisposition: contentDisposition } : {}),
    ...(contentType ? { ResponseContentType: contentType } : {}),
  });

  return getSignedUrl(client, command, { expiresIn });
}

function normalizeB2ObjectKey(key) {
  if (!key || typeof key !== 'string') {
    throw new Error('A B2 object key is required.');
  }

  return key.trim().replace(/^\/+/, '');
}

function getB2PublicBaseUrl() {
  const publicBase = String(process.env.B2_PUBLIC_URL || '').trim();
  if (!publicBase) {
    throw new Error('B2_PUBLIC_URL is not configured.');
  }

  try {
    return new URL(publicBase.endsWith('/') ? publicBase : `${publicBase}/`);
  } catch {
    throw new Error('B2_PUBLIC_URL must be a valid absolute URL.');
  }
}

async function createB2PresignedPutUrl(key, contentType, options = {}) {
  const bucket = process.env.B2_BUCKET_NAME;
  if (!bucket) {
    throw new Error('B2_BUCKET_NAME is not configured.');
  }

  const normalizedKey = normalizeB2ObjectKey(key);
  const contentLength = Number(options?.contentLength);
  const expiresIn = Number.isFinite(Number(options?.expiresIn))
    ? Math.max(1, Math.trunc(Number(options.expiresIn)))
    : 3600;

  const client = createB2Client();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: normalizedKey,
    ContentType: contentType,
    ...(Number.isFinite(contentLength) && contentLength >= 0
      ? { ContentLength: Math.trunc(contentLength) }
      : {}),
  });

  return getSignedUrl(client, command, { expiresIn });
}

function createB2PublicObjectUrl(key) {
  return new URL(normalizeB2ObjectKey(key), getB2PublicBaseUrl()).toString();
}

async function deleteB2Object(key) {
  const bucket = process.env.B2_BUCKET_NAME;
  if (!bucket) {
    throw new Error('B2_BUCKET_NAME is not configured.');
  }

  const client = createB2Client();
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: normalizeB2ObjectKey(key),
  });

  await client.send(command);
  return { ok: true };
}

module.exports = {
  uploadResumeToB2,
  createB2PresignedGetUrl,
  createB2PresignedPutUrl,
  createB2PublicObjectUrl,
  deleteB2Object,
};
