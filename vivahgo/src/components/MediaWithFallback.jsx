import { useEffect, useState } from 'react';
import { getVendorMediaFallbackUrl } from '../utils';

function useFailoverSrc(src) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const fallbackSrc = getVendorMediaFallbackUrl(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  function handleError(event) {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }

    return event;
  }

  return { currentSrc, handleError };
}

export function FallbackImage({ src, onError, ...props }) {
  const { currentSrc, handleError } = useFailoverSrc(src);

  return (
    <img
      {...props}
      src={currentSrc}
      onError={event => {
        handleError(event);
        onError?.(event);
      }}
    />
  );
}

export function FallbackVideo({ src, onError, ...props }) {
  const { currentSrc, handleError } = useFailoverSrc(src);

  return (
    <video
      {...props}
      key={currentSrc}
      src={currentSrc}
      onError={event => {
        handleError(event);
        onError?.(event);
      }}
    />
  );
}
