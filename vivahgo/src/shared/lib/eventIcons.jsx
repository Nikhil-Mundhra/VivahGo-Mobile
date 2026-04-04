import { getEventIconSource } from "./eventIconSources.js";

export function EventIcon({ eventName, emoji = "✨", size = 28, className = "", style = {}, alt = "" }) {
  const iconSrc = getEventIconSource(eventName);
  const dimensionStyle = size == null
    ? {}
    : { width: size, height: size };

  if (iconSrc) {
    return (
      <img
        className={className}
        src={iconSrc}
        alt={alt}
        aria-hidden={alt ? undefined : "true"}
        style={{ ...dimensionStyle, objectFit: "contain", display: "block", ...style }}
      />
    );
  }

  return (
    <span
      className={className}
      aria-hidden={alt ? undefined : "true"}
      style={{ ...dimensionStyle, display: "inline-flex", alignItems: "center", justifyContent: "center", ...style }}
    >
      {emoji}
    </span>
  );
}
