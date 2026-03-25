import { useMemo, useState } from 'react';

function appendCacheBust(url, token) {
  if (!url || !token) {
    return url;
  }

  const join = url.includes('?') ? '&' : '?';
  return `${url}${join}vgimg=${token}`;
}

export default function VendorMediaImage({
  src,
  alt,
  className,
  style,
  loading = 'lazy',
  fallbackLabel = 'Image unavailable',
}) {
  const [retryState, setRetryState] = useState({ src: '', token: '' });
  const [failedSrc, setFailedSrc] = useState('');
  const hasRetriedCurrentSrc = retryState.src === src;
  const failed = failedSrc === src;
  const resolvedSrc = useMemo(
    () => appendCacheBust(src, hasRetriedCurrentSrc ? retryState.token : ''),
    [src, hasRetriedCurrentSrc, retryState.token]
  );

  if (!src || failed) {
    return (
      <div
        className={className}
        style={style}
        role="img"
        aria-label={alt || fallbackLabel}
      />
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={loading}
      className={className}
      style={style}
      onError={() => {
        if (!hasRetriedCurrentSrc) {
          setRetryState({ src, token: `${Date.now()}` });
          return;
        }
        setFailedSrc(src);
      }}
    />
  );
}
