import { useEffect, useState } from "react";
import "../../../styles.css";
import "../../../marketing-home.css";
import FeedbackModal from "../../../components/FeedbackModal";
import LegalFooter from "../../../components/LegalFooter";
import MarketingSiteHeader from "../../../components/MarketingSiteHeader.jsx";
import { readAuthSession } from "../../../authStorage";
import { usePageSeo } from "../../../seo.js";
import { getMarketingUrl } from "../../../siteUrls.js";

const privacySections = [
  {
    title: "1. Scope",
    paragraphs: [
      "This Privacy Policy applies to personal information collected through VivahGo's website, mobile application, wedding planning tools, public wedding website features, RSVP tools, vendor platform, subscriptions, customer support, feedback forms, and career application pages.",
    ],
  },
  {
    title: "2. Information We Collect",
    paragraphs: [
      "We may collect the following categories of information:",
    ],
    bullets: [
      "Information you provide directly, including your name, email address, phone number, profile details, wedding planning data, public wedding page content, support requests, billing details, vendor registration information, and career application materials.",
      "Information received through authentication providers such as your name, email address, profile image, and authentication identifiers.",
      "Information collected automatically, including IP address, browser and device details, app version, usage activity, referring URLs, cookies, local storage, and similar technologies.",
      "Information relating to guests, collaborators, vendors, family members, and other third parties that you choose to upload or share through the platform.",
    ],
    closing:
      "You are responsible for ensuring that you have the authority, notice, or consent required to share information relating to other individuals with us.",
  },
  {
    title: "3. How We Use Information",
    bullets: [
      "To create, maintain, and secure user accounts.",
      "To provide wedding planning tools, dashboards, collaboration features, public wedding pages, and RSVP tools.",
      "To operate vendor onboarding, listings, communications, and related marketplace features.",
      "To process subscriptions, bookings, quotes, and payment-related workflows.",
      "To communicate about your account, support matters, reminders, updates, and service notices.",
      "To personalize and improve the platform, feature offerings, reliability, and user experience.",
      "To detect, prevent, investigate, and respond to fraud, abuse, misuse, security incidents, and unlawful conduct.",
      "To maintain backups, logs, and technical records needed for platform operations.",
      "To comply with legal obligations, regulatory requests, dispute handling, and enforcement of our terms.",
      "To evaluate job applications and manage recruitment processes.",
      "To analyze product performance, usage trends, and service reliability.",
    ],
  },
  {
    title: "4. Legal Basis and Permission to Process",
    paragraphs: [
      "By using VivahGo and submitting information through the platform, you consent to the collection and processing of your information for the purposes described in this Privacy Policy, subject to applicable law.",
      "Where relevant, we may also process information where necessary for the performance of a contract or requested service, compliance with legal obligations, fraud prevention and platform integrity, and legitimate business and operational purposes to the extent permitted by law.",
    ],
  },
  {
    title: "5. Cookies and Similar Technologies",
    paragraphs: [
      "We may use cookies, SDKs, local storage, and similar technologies to keep you signed in, remember preferences, maintain session integrity, understand usage, support analytics and diagnostics, and enhance security and fraud prevention.",
      "You may be able to control certain cookie settings through your browser or device settings, but disabling some technologies may affect platform functionality.",
    ],
  },
  {
    title: "6. How We Share Information",
    paragraphs: [
      "We do not sell your personal information.",
      "We may share personal information with trusted third-party service providers that support cloud hosting, databases, storage, authentication, payment processing, analytics, communications, customer support tools, and document or media storage.",
      "These providers may use the information only as necessary to provide services to us, subject to contractual and operational safeguards.",
    ],
  },
  {
    title: "7. What Data Is Visible Publicly",
    paragraphs: [
      "VivahGo may allow users to create public-facing wedding websites and vendor profiles. Information made available through these features may be visible to invited guests, platform users, search engines, or members of the public depending on feature settings and how content is shared.",
      "Wedding websites are customizable, and any information a user chooses to publish or display there is shared voluntarily by that user.",
    ],
    bullets: [
      "Published wedding website content may include names, event details, dates, timings, venue names, locations, descriptions, messages, photos, videos, schedules, itinerary information, and RSVP-related details made visible by the website owner.",
      "Vendor profiles may include business name, service categories, descriptions, contact details where enabled, city or service areas, portfolio media, pricing, packages, offers, availability, and other listing information intended for promotion.",
      "Sensitive materials such as identity cards, verification documents, compliance documents, private account records, and internal moderation materials are not intended for public display unless expressly stated otherwise.",
      "If you request, book, or inquire about services through VivahGo, we may share relevant information with vendors, partners, or service providers to facilitate communication, proposals, bookings, fulfilment, support, payment handling, or dispute assistance.",
      "If you use public wedding pages, RSVP links, or collaboration features, information you choose to publish or share may be visible to invited guests, collaborators, vendors, or anyone with access to the relevant link or page.",
      "We may disclose information where required by law or reasonably necessary to comply with legal process, enforce our terms and policies, protect rights and systems, investigate misuse, or pursue or defend legal claims.",
      "Personal information may also be transferred as part of a merger, acquisition, reorganization, asset sale, investment transaction, or similar corporate event, subject to applicable law.",
    ],
  },
  {
    title: "8. Payments and Financial Data",
    paragraphs: [
      "Payments on VivahGo may be processed through third-party payment gateways or payment service providers. We do not store full card details unless expressly stated otherwise.",
      "We may receive and retain limited transaction information such as payer name, billing contact details, payment status, amount paid, transaction identifiers, subscription details, and invoice records.",
      "Off-platform payments made directly to vendors are governed primarily by arrangements between you and the relevant vendor, though VivahGo may retain limited records linked to support, dispute resolution, compliance, or commission tracking.",
    ],
  },
  {
    title: "9. Vendor and Verification Information",
    paragraphs: [
      "If you register as a vendor, we may collect business and verification information such as business name, services offered, contact details, portfolio content, identity or business proof, and other verification documents.",
    ],
    bullets: [
      "Create and manage your vendor profile.",
      "Review eligibility or verification status.",
      "Moderate or curate vendor listings.",
      "Investigate complaints or disputes.",
      "Comply with legal, operational, and fraud-prevention requirements.",
    ],
    closing:
      "Verification or review by VivahGo does not guarantee vendor quality or future performance.",
  },
  {
    title: "10. Data Retention",
    paragraphs: [
      "We retain personal information only for as long as reasonably necessary for the purposes described in this Privacy Policy, including to provide services, maintain account history, comply with legal and regulatory obligations, resolve disputes, enforce agreements, prevent fraud, and maintain security and backup records.",
      "Retention periods may vary depending on the type of information and the purpose for which it was collected.",
    ],
  },
  {
    title: "11. Account Deletion and Your Choices",
    paragraphs: [
      "You may access, update, or modify certain information through your account or platform settings.",
      "You may also request deletion of your account and associated data in accordance with VivahGo's account deletion process at https://vivahgo.com/data-deletion-instructions.",
      "Even after a deletion request, we may retain certain information where necessary for legal or regulatory compliance, tax or accounting requirements, fraud prevention and security, dispute resolution, enforcement of agreements, backup restoration cycles, and operational integrity.",
    ],
  },
  {
    title: "12. Data Security",
    paragraphs: [
      "We use reasonable technical, administrative, and organizational safeguards designed to protect personal information against unauthorized access, disclosure, alteration, misuse, or destruction.",
      "However, no internet-based service or storage system can be guaranteed to be completely secure. You use the platform at your own risk and should also protect your devices, login credentials, and records.",
    ],
  },
  {
    title: "13. Children's Privacy",
    paragraphs: [
      "VivahGo is not intended for use by children who are not legally capable of entering into a binding arrangement under applicable law without parental or guardian supervision. We do not knowingly collect personal information from children in violation of applicable law.",
      "If you believe that personal information of a child has been provided to us improperly, please contact us so that we can review and take appropriate action.",
    ],
  },
  {
    title: "14. Third-Party Links and Services",
    paragraphs: [
      "VivahGo may contain links to third-party websites, services, social logins, payment systems, maps, or partner tools. Our Privacy Policy does not apply to the privacy practices of such third parties, and we encourage you to review their policies before sharing information with them.",
    ],
  },
  {
    title: "15. International and Cross-Service Processing",
    paragraphs: [
      "Your information may be processed and stored using third-party service providers and infrastructure that may operate in different jurisdictions. By using VivahGo, you acknowledge that information may be transferred to and processed in locations where our service providers operate, subject to reasonable contractual and operational safeguards.",
    ],
  },
  {
    title: "16. Changes to This Privacy Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. The updated version will be posted on the platform with a revised effective date. Your continued use of VivahGo after such update will constitute your acceptance of the revised Privacy Policy to the extent permitted by law.",
      "Where required or appropriate, we may provide additional notice of material changes.",
    ],
  },
  {
    title: "17. Contact and Grievance",
    paragraphs: [
      "If you have questions, concerns, requests, or grievances regarding this Privacy Policy or the way your information is handled, you may contact VivahGo Planners (operating as VivahGo) at support@vivahgo.com.",
      "Address: 79, West Mukherjee Nagar, Kingsway Camp, New Delhi - 110009.",
      "Grievance Officer: Nikhil Mundhra.",
      "Email: grievance@vivahgo.com.",
      "The Grievance Officer shall acknowledge complaints within 48 hours and endeavour to resolve them within 30 days, in accordance with applicable law.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  const [session, setSession] = useState(() => readAuthSession());
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  usePageSeo({
    title: "VivahGo Privacy Policy",
    description: "Read how VivahGo collects, uses, stores, shares, and protects your information.",
    canonicalUrl: getMarketingUrl("/privacy-policy"),
  });

  useEffect(() => {
    const syncSession = () => {
      setSession(readAuthSession());
    };

    if (typeof window === "undefined") {
      return undefined;
    }

    window.addEventListener("storage", syncSession);
    window.addEventListener("focus", syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("focus", syncSession);
    };
  }, []);

  return (
    <div className="marketing-home-shell">
      <MarketingSiteHeader activePage="home" session={session} onContactUs={() => setShowFeedbackModal(true)} />

      <main className="marketing-main">
        <section className="marketing-section marketing-pricing-page-intro">
          <div className="marketing-section-heading">
            <p className="marketing-section-kicker">Legal</p>
            <h1>Privacy Policy</h1>
            <p>Effective date: April 2, 2026</p>
          </div>

          <div className="legal-content" style={{ maxWidth: 860, margin: "0 auto" }}>
            <p className="legal-text">
              This Privacy Policy explains how VivahGo Planners, operating under the brand name VivahGo, collects,
              uses, stores, shares, and protects your personal information when you access or use our website, mobile
              application, and related services.
            </p>
            <p className="legal-text">
              By using VivahGo, you agree to the collection and use of information in accordance with this Privacy
              Policy.
            </p>

            {privacySections.map((section) => (
              <div className="legal-section" key={section.title}>
                <h2 className="legal-section-title">{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p className="legal-text" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="legal-text" style={{ paddingLeft: 20, margin: "0 0 1rem" }}>
                    {section.bullets.map((item) => (
                      <li key={item} style={{ marginBottom: 8 }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {section.closing ? <p className="legal-text">{section.closing}</p> : null}
              </div>
            ))}
          </div>
        </section>
      </main>

      <LegalFooter className="marketing-legal-footer" hasBottomNav={false} onOpenFeedback={() => setShowFeedbackModal(true)} />
      {showFeedbackModal && <FeedbackModal onClose={() => setShowFeedbackModal(false)} />}
    </div>
  );
}
