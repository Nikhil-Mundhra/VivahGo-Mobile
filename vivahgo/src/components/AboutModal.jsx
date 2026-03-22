function AboutModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal legal-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">About VivahGo</div>

        <div className="legal-content">
          <p className="legal-text">
            VivahGo is your smart wedding planning companion, built to simplify event planning, budget tracking,
            guest management, and vendor coordination in one place.
          </p>
          <p className="legal-text" style={{ marginTop: 10 }}>
            Version: 1.0.0
          </p>
          <p className="legal-text" style={{ marginTop: 10 }}>
            Made with care for modern Indian weddings.
          </p>
        </div>

        <button className="btn-primary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default AboutModal;
