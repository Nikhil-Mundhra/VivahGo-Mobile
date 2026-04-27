#!/usr/bin/env node

const DEFAULT_TIMEOUT_MS = 15000;

function normalizeDeploymentUrl(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) {
    return "";
  }

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function extractAssetUrls(html, deploymentUrl) {
  const urls = new Set();
  const pattern = /<(script|link)\b[^>]+(?:src|href)=["']([^"'#?]+(?:\?[^"'#]*)?)["'][^>]*>/gi;
  let match = pattern.exec(html);

  while (match) {
    const [, , rawUrl] = match;
    try {
      const normalizedUrl = new URL(rawUrl, deploymentUrl);
      if (normalizedUrl.origin === deploymentUrl.origin && normalizedUrl.pathname.startsWith("/assets/")) {
        urls.add(normalizedUrl.href);
      }
    } catch {
      // ignore malformed asset URLs
    }
    match = pattern.exec(html);
  }

  return [...urls];
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "user-agent": "vivahgo-deploy-verifier",
        ...(options.headers || {}),
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function assertOk(url, options = {}) {
  const response = await fetchWithTimeout(url, options);
  if (!response.ok) {
    throw new Error(`Expected ${url} to return 2xx, received ${response.status}`);
  }
  return response;
}

async function main() {
  const deploymentUrl = normalizeDeploymentUrl(process.argv[2]);
  if (!deploymentUrl) {
    throw new Error("Usage: node scripts/verify-deployed-assets.cjs <deployment-url>");
  }

  const deployment = new URL(deploymentUrl);
  const homepageResponse = await assertOk(deployment.href);
  const homepageHtml = await homepageResponse.text();
  const assetUrls = extractAssetUrls(homepageHtml, deployment);

  if (!assetUrls.length) {
    throw new Error(`No same-origin /assets/* references found in ${deployment.href}`);
  }

  for (const assetUrl of assetUrls) {
    await assertOk(assetUrl);
  }

  process.stdout.write(`Verified ${assetUrls.length} asset references for ${deployment.href}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
