export default function PlannerUpgradeModal({ isOpen, message, pricingUrl, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Upgrade Required ✨</div>
        <p style={{ color: "var(--color-light-text)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          {message}
        </p>
        <a
          className="btn-primary"
          href={pricingUrl}
          style={{ display: "block", textAlign: "center", textDecoration: "none" }}
          onClick={onClose}
        >
          View Premium Plans
        </a>
        <button className="btn-secondary" onClick={onClose}>
          Maybe Later
        </button>
      </div>
    </div>
  );
}
