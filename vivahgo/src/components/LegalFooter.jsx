function LegalFooter({ hasBottomNav, isVisible = true, onOpenTerms, onOpenAbout, onOpenFeedback }) {
  return (
    <div
      className={`legal-footer-slot${hasBottomNav ? " legal-footer-with-nav" : ""}${isVisible ? "" : " legal-footer-slot-hidden"}`}
    >
      <footer className={`legal-footer${isVisible ? "" : " legal-footer-hidden"}`}>
        <div className="legal-footer-links">
          <button type="button" className="legal-footer-link" onClick={onOpenTerms}>
            Terms &amp; Conditions
          </button>
          <span className="legal-footer-divider">|</span>
          <button type="button" className="legal-footer-link" onClick={onOpenAbout}>
            About
          </button>
          <span className="legal-footer-divider">|</span>
          <button type="button" className="legal-footer-link" onClick={onOpenFeedback}>
            Feedback
          </button>
        </div>
        <div className="legal-footer-copy">Copyright © 2026 VivahGo - All Rights Reserved</div>
      </footer>
    </div>
  );
}

export default LegalFooter;
