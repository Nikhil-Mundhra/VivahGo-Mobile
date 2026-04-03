const modalSections = [
  {
    title: "1. About VivahGo",
    text: "VivahGo is a digital wedding planning and wedding services platform for Indian weddings. It may provide planning tools, public wedding pages, RSVP tools, vendor listings, premium features, and access to wedding-related services directly or through vendors and partners.",
  },
  {
    title: "2. Eligibility and Accounts",
    text: "You may use VivahGo only if you are legally capable of entering into a binding contract under applicable law. If you sign in through Google or another provider, you must use an account you are authorized to use and keep your login credentials and device access secure.",
  },
  {
    title: "3. Acceptable Use",
    text: "You may use VivahGo only for lawful purposes. You must not upload unlawful or misleading content, impersonate others, interfere with the platform, access systems without authorization, scrape or exploit the platform unlawfully, spam other users, or upload harmful code.",
  },
  {
    title: "4. Planner Data and Public Sharing",
    text: "You retain ownership of the content you upload, but you grant VivahGo a limited license to host, store, process, reproduce, and display it solely to operate and improve the platform. You are responsible for the legality, accuracy, permissions, and consents related to guest information, collaborator access, public wedding pages, and RSVP content.",
  },
  {
    title: "5. Vendors, Payments, and Bookings",
    text: "Vendor information, quotes, pricing, availability, and booking details may change and should be independently verified. Some payments and bookings may happen through VivahGo-managed flows, while others may occur directly with vendors. Off-platform transactions are solely between you and the vendor.",
  },
  {
    title: "6. Data, Availability, and Liability",
    text: "We use reasonable safeguards, but we do not guarantee uninterrupted availability, perfect data integrity, or error-free operation. To the fullest extent permitted by law, VivahGo is provided on an as-is and as-available basis and limits liability as described in the full Terms and Conditions.",
  },
  {
    title: "7. Changes and Contact",
    text: "We may update these Terms from time to time. Continued use of VivahGo after an update constitutes acceptance of the revised Terms to the extent permitted by law. Contact: support@vivahgo.com. Grievance Officer: Nikhil Mundhra, grievance@vivahgo.com.",
  },
];

function TermsConditionsModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal legal-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Terms &amp; Conditions</div>

        <div className="legal-content">
          <p className="legal-intro">Effective date: April 2, 2026</p>
          <p className="legal-text">
            These Terms govern your use of VivahGo's website, mobile application, and related services. By continuing,
            you agree to the full Terms and Conditions available at /terms.
          </p>

          {modalSections.map((section) => (
            <div className="legal-section" key={section.title}>
              <h3 className="legal-section-title">{section.title}</h3>
              <p className="legal-text">{section.text}</p>
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={onClose}>I Understand</button>
      </div>
    </div>
  );
}

export default TermsConditionsModal;
