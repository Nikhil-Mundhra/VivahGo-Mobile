export default function PlannerTopBar({
  marriages,
  activePlanId,
  onOpenPlanSelector,
  onOpenWeddingDetailsEditor,
  planAccess,
  wedding,
  authMode,
  saveLabel,
  onOpenAccountSettings,
  user,
  avatarLoadError,
  onAvatarError,
  accountName,
  accountFirstName,
}) {
  const activeMarriage = marriages.find((item) => item.id === activePlanId);

  return (
    <div className="top-bar">
      <div className="top-bar-pattern">🪔</div>
      <div className="top-bar-greeting">Your Wedding</div>
      <div className="top-bar-names" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <div style={{ display: "grid", justifyItems: "center", gap: 6 }}>
          <button
            type="button"
            onClick={onOpenPlanSelector}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 28,
              fontWeight: 700,
              color: "var(--color-gold)",
            }}
            title="Manage marriage plans"
          >
            <span>
              {activeMarriage?.bride || "Bride"} &amp; {activeMarriage?.groom || "Groom"}
            </span>
            <span
              style={{
                fontSize: 12,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-gold)",
                fontWeight: 700,
              }}
            />
          </button>
        </div>
      </div>
      <div className="top-bar-meta">
        <button
          type="button"
          className="top-bar-chip top-bar-chip-button"
          onClick={onOpenWeddingDetailsEditor}
          disabled={!planAccess.canEdit}
          style={{
            cursor: planAccess.canEdit ? "pointer" : "not-allowed",
            opacity: planAccess.canEdit ? 1 : 0.6,
          }}
        >
          Edit Wedding Plan
        </button>
        {wedding.date ? (
          <button type="button" className="top-bar-chip top-bar-chip-button" onClick={onOpenWeddingDetailsEditor}>
            📅 {wedding.date}
          </button>
        ) : null}
        {wedding.venue ? (
          <button type="button" className="top-bar-chip top-bar-chip-button" onClick={onOpenWeddingDetailsEditor}>
            📍 {wedding.venue}
          </button>
        ) : null}
        {(authMode === "google" || authMode === "clerk") && saveLabel ? <div className="top-bar-chip">☁️ {saveLabel}</div> : null}
        {(authMode === "google" || authMode === "clerk") && !planAccess.canEdit ? <div className="top-bar-chip">View only</div> : null}
      </div>
      <div className="top-bar-user">
        <button
          type="button"
          className="account-settings-trigger"
          onClick={onOpenAccountSettings}
          title="Account settings"
          aria-label="Open account settings"
        >
          {user?.picture && !avatarLoadError ? (
            <img
              src={user.picture}
              alt={user?.name || "Profile"}
              className="user-avatar"
              onError={onAvatarError}
            />
          ) : (
            <span className="user-avatar user-avatar-fallback" aria-hidden="true">
              {(user?.name || "V").slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="account-settings-name account-settings-name-full">{accountName}</span>
          <span className="account-settings-name account-settings-name-first">{accountFirstName}</span>
        </button>
      </div>
    </div>
  );
}
