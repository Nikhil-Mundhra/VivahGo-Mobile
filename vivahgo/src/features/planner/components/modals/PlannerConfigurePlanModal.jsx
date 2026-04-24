import { useSwipeDown } from "../../../../shared/hooks/useSwipeDown.js";

export default function PlannerConfigurePlanModal({
  plan,
  isOpen,
  authMode,
  accessibleWorkspaces,
  plannerOwnerId,
  user,
  isSwitchingWorkspace,
  onWorkspaceSwitch,
  onShare,
  onClose,
}) {
  const swipe = useSwipeDown(onClose);

  if (!isOpen || !plan) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" {...swipe.modalProps} onClick={(event) => event.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Configure Plan</div>
        <div style={{ color: "var(--color-light-text)", fontSize: 13, marginBottom: 12 }}>
          {plan.bride || "Bride"} &amp; {plan.groom || "Groom"}
        </div>
        {authMode === "google" && accessibleWorkspaces.length > 1 ? (
          <div className="input-group">
            <div className="input-label">Workspace</div>
            <select
              className="input-field"
              value={plannerOwnerId}
              onChange={(event) => onWorkspaceSwitch(event.target.value)}
              disabled={isSwitchingWorkspace}
            >
              {accessibleWorkspaces.map((workspace) => (
                <option key={workspace.plannerOwnerId} value={workspace.plannerOwnerId}>
                  {workspace.plannerOwnerId === user?.id ? "My Plans" : "Shared"} - {workspace.activePlanName} ({workspace.role})
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <button className="btn-primary" onClick={onShare}>
          Share
        </button>
        <button className="btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
