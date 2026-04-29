import { useMemo } from "react";
import "../../../styles.css";
import "../../../marketing-home.css";
import forumsContent from "../../../shared/content/forums.js";
import MarketingSiteHeader from "../../../components/MarketingSiteHeader.jsx";
import LegalFooter from "../../../components/LegalFooter.jsx";

export default function ForumsPage() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/categories";
  const html = useMemo(() => forumsContent.buildForumsSnapshot({ pathname }), [pathname]);

  return (
    <div className="marketing-home-shell forums-page">
      <MarketingSiteHeader activePage="" session={null} />
      <div className="forums-shell" dangerouslySetInnerHTML={{ __html: html }} />
      <LegalFooter className="marketing-legal-footer" hasBottomNav={false} />
    </div>
  );
}
