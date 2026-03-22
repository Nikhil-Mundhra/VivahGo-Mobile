function TermsConditionsModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal legal-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Terms &amp; Conditions</div>

        <div className="legal-content">
          <p className="legal-intro">
            Effective date: March 22, 2026
          </p>

          <div className="legal-section">
            <h3 className="legal-section-title">1. Using VivahGo</h3>
            <p className="legal-text">
              You may use VivahGo for personal wedding planning purposes. You are responsible for the accuracy of
              information you enter, including events, guests, budgets, and vendor details.
            </p>
          </div>

          <div className="legal-section">
            <h3 className="legal-section-title">2. Account Access</h3>
            <p className="legal-text">
              If you sign in with Google, you agree to use an account you are authorized to access. Keep your device
              and account secure to protect your planner information.
            </p>
          </div>

          <div className="legal-section">
            <h3 className="legal-section-title">3. Data and Backups</h3>
            <p className="legal-text">
              We try to keep your planning data available and accurate, but we cannot guarantee uninterrupted service
              or perfect backup behavior in all circumstances.
            </p>
          </div>

          <div className="legal-section">
            <h3 className="legal-section-title">4. Vendor and Cost Information</h3>
            <p className="legal-text">
              Vendor listings, prices, and estimates in the app may change and should be independently verified before
              making bookings or payments.
            </p>
          </div>

          <div className="legal-section">
            <h3 className="legal-section-title">5. Limitation of Liability</h3>
            <p className="legal-text">
              VivahGo is provided on an as-is basis. To the maximum extent allowed by law, VivahGo is not liable for
              indirect or consequential losses related to app use.
            </p>
          </div>

          <div className="legal-section">
            <h3 className="legal-section-title">6. Updates to Terms</h3>
            <p className="legal-text">
              We may update these terms over time. Continued use of the app after updates means you accept the revised
              terms.
            </p>
          </div>
        </div>

        <button className="btn-primary" onClick={onClose}>I Understand</button>
      </div>
    </div>
  );
}

export default TermsConditionsModal;
