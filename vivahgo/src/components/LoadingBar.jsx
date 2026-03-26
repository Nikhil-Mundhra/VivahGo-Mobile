function LoadingBar({ label = "", compact = false, className = "" }) {
  return (
    <div
      className={`loading-bar-block${compact ? " loading-bar-block-compact" : ""}${className ? ` ${className}` : ""}`}
      role="status"
      aria-live="polite"
    >
      {label ? <div className="loading-bar-label">{label}</div> : null}
      <div className="loading-bar-track" aria-hidden="true">
        <div className="loading-bar-fill" />
      </div>
    </div>
  );
}

export default LoadingBar;
