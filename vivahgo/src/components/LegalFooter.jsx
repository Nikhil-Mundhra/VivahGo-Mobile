function LegalFooter({
  hasBottomNav,
  isVisible = true,
  onOpenFeedback,
  termsHref = "/terms",
  privacyHref = "/privacy-policy",
  dataDeletionHref = "/data-deletion-instructions",
  aboutHref = "/",
  aboutLabel = "About",
  className = "",
}) {
  return (
    <div
      className={`legal-footer-slot${hasBottomNav ? " legal-footer-with-nav" : ""}${isVisible ? "" : " legal-footer-slot-hidden"}${className ? ` ${className}` : ""}`}
    >
      <footer className={`legal-footer${isVisible ? "" : " legal-footer-hidden"}`}>
        <div className="legal-footer-links">
          <a href={termsHref} className="legal-footer-link">
            Terms &amp; Conditions
          </a>
          <span className="legal-footer-divider">|</span>
          <a href={privacyHref} className="legal-footer-link">
            Privacy Policy
          </a>
          <span className="legal-footer-divider">|</span>
          <a href={dataDeletionHref} className="legal-footer-link">
            Data Deletion Instructions
          </a>
          <span className="legal-footer-divider">|</span>
          <a href={aboutHref} className="legal-footer-link">
            {aboutLabel}
          </a>
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
