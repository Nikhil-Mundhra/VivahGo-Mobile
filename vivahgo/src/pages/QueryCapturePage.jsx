import { useEffect, useMemo, useState } from "react";
import "../styles.css";
import "../marketing-home.css";
import FeedbackModal from "../components/FeedbackModal";
import LegalFooter from "../components/LegalFooter";
import TermsConditionsModal from "../components/TermsConditionsModal";
import MarketingSiteHeader from "../components/MarketingSiteHeader.jsx";
import { readAuthSession } from "../authStorage";
import { DEFAULT_SITE_URL, usePageSeo } from "../seo.js";
import { getMarketingUrl, getPlannerUrl } from "../siteUrls.js";
import guides from "../content/guides.json";
import queryPages from "../content/query-pages.json";

const QUERY_PAGE_BY_SLUG = new Map(queryPages.map((page) => [page.slug, page]));
const GUIDE_BY_SLUG = new Map(guides.map((guide) => [guide.slug, guide]));
const MARKETING_HOME_URL = getMarketingUrl("/");
const PLANNER_HOME_URL = getPlannerUrl("/");

function findQueryPageBySlug(slug = "") {
  return QUERY_PAGE_BY_SLUG.get(slug) || null;
}

function buildStructuredData(page, relatedGuides, relatedPages) {
  const canonicalUrl = getMarketingUrl(`/${page.slug}`);

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.seoTitle,
      url: canonicalUrl,
      description: page.seoDescription,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: MARKETING_HOME_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: page.title,
          item: canonicalUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${page.title} capabilities`,
      itemListElement: page.highlights.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${page.title} related resources`,
      itemListElement: [
        ...relatedPages.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.title,
          url: getMarketingUrl(`/${item.slug}`),
        })),
        ...relatedGuides.map((guide, index) => ({
          "@type": "ListItem",
          position: relatedPages.length + index + 1,
          name: guide.title,
          url: `${DEFAULT_SITE_URL}/guides/${guide.slug}`,
        })),
      ],
    },
  ];
}

export default function QueryCapturePage({ pageSlug = "" }) {
  const [session, setSession] = useState(() => readAuthSession());
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const page = useMemo(() => findQueryPageBySlug(pageSlug), [pageSlug]);
  const relatedPages = useMemo(
    () => (page?.relatedPageSlugs || []).map((slug) => QUERY_PAGE_BY_SLUG.get(slug)).filter(Boolean),
    [page]
  );
  const relatedGuides = useMemo(
    () => (page?.relatedGuideSlugs || []).map((slug) => GUIDE_BY_SLUG.get(slug)).filter(Boolean),
    [page]
  );

  usePageSeo(
    page
      ? {
        title: page.seoTitle,
        description: page.seoDescription,
        canonicalUrl: getMarketingUrl(`/${page.slug}`),
        structuredData: buildStructuredData(page, relatedGuides, relatedPages),
      }
      : {
        title: "Page Not Found | VivahGo",
        description: "The requested planning page could not be found.",
        path: `/${pageSlug}`,
        noindex: true,
      }
  );

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

  if (!page) {
    return (
      <div className="marketing-home-shell">
        <MarketingSiteHeader activePage="home" session={session} onContactUs={() => setShowFeedbackModal(true)} />
        <main className="marketing-main">
          <section className="marketing-section marketing-pricing-page-intro">
            <div className="marketing-section-heading">
              <p className="marketing-section-kicker">Page Not Found</p>
              <h1>This planning page is not available.</h1>
              <p>Return to the homepage or browse the guides to find the right planning resource.</p>
            </div>
            <div className="marketing-hero-actions marketing-final-actions">
              <a className="marketing-primary-action" href="/">Back to Home</a>
              <a className="marketing-secondary-action" href="/guides">Browse Guides</a>
            </div>
          </section>
        </main>
        <LegalFooter
          className="marketing-legal-footer"
          hasBottomNav={false}
          onOpenTerms={() => setShowTermsModal(true)}
          onOpenFeedback={() => setShowFeedbackModal(true)}
        />
        {showTermsModal && <TermsConditionsModal onClose={() => setShowTermsModal(false)} />}
        {showFeedbackModal && <FeedbackModal onClose={() => setShowFeedbackModal(false)} />}
      </div>
    );
  }

  return (
    <div className="marketing-home-shell">
      <MarketingSiteHeader activePage="home" session={session} onContactUs={() => setShowFeedbackModal(true)} />

      <main className="marketing-main">
        <section className="marketing-hero">
          <div className="marketing-hero-copy">
            <p className="marketing-kicker">{page.heroKicker}</p>
            <h1>{page.heroTitle}</h1>
            <p className="marketing-summary">{page.heroSummary}</p>
            <p className="marketing-summary">{page.heroBody}</p>

            <div className="marketing-hero-actions">
              <a className="marketing-primary-action" href={PLANNER_HOME_URL}>
                Start Planning Free
              </a>
              <a className="marketing-secondary-action marketing-secondary-action-gold" href="/pricing">
                See Pricing
              </a>
            </div>
          </div>
        </section>

        <section className="marketing-section" aria-labelledby="query-page-highlights-title">
          <div className="marketing-section-heading">
            <p className="marketing-section-kicker">Why This Page Matters</p>
            <h2 id="query-page-highlights-title">{page.title} features that solve real wedding planning problems.</h2>
          </div>

          <div className="marketing-feature-grid">
            {page.highlights.map((item) => (
              <article className="marketing-feature-card marketing-feature-card-left" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        {page.sections.map((section) => (
          <section className="marketing-section" key={section.heading}>
            <div className="marketing-section-heading">
              <h2>{section.heading}</h2>
            </div>
            <div className="marketing-guide-body">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {Array.isArray(section.bullets) && section.bullets.length ? (
                <ul className="marketing-guide-list">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}

        <section className="marketing-section" id="query-page-faqs">
          <div className="marketing-section-heading">
            <p className="marketing-section-kicker">FAQs</p>
            <h2>Questions people ask about {page.title.toLowerCase()} choices.</h2>
          </div>

          <div className="marketing-faq-list">
            {page.faqs.map((item) => (
              <details className="marketing-faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {relatedPages.length ? (
          <section className="marketing-section" aria-labelledby="related-query-pages-title">
            <div className="marketing-section-heading">
              <p className="marketing-section-kicker">Related Planning Pages</p>
              <h2 id="related-query-pages-title">Compare nearby planning workflows.</h2>
            </div>

            <div className="marketing-guides-grid">
              {relatedPages.map((item) => (
                <a className="marketing-guide-card marketing-guide-card-link" href={`/${item.slug}`} key={item.slug}>
                  <div className="marketing-guide-card-body">
                    <div className="marketing-guide-card-meta">
                      <span>Query Page</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.heroSummary}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {relatedGuides.length ? (
          <section className="marketing-section" aria-labelledby="related-guides-title">
            <div className="marketing-section-heading">
              <p className="marketing-section-kicker">Related Guides</p>
              <h2 id="related-guides-title">Read supporting guides before you start planning.</h2>
            </div>

            <div className="marketing-guides-grid">
              {relatedGuides.map((guide) => (
                <a className="marketing-guide-card marketing-guide-card-link" href={`/guides/${guide.slug}`} key={guide.slug}>
                  <div className="marketing-guide-card-body">
                    <div className="marketing-guide-card-meta">
                      <span>{guide.readTime}</span>
                    </div>
                    <h3>{guide.title}</h3>
                    <p>{guide.summary}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <section className="marketing-section marketing-final-cta">
          <div className="marketing-section-heading">
            <h2 className="marketing-final-cta-title">Turn this planning topic into a working wedding system.</h2>
            <p>Move from reading about the workflow to running it inside a shared VivahGo workspace.</p>
          </div>
          <div className="marketing-hero-actions marketing-final-actions">
            <a className="marketing-primary-action" href={PLANNER_HOME_URL}>
              Start Planning Free
            </a>
            <a className="marketing-secondary-action marketing-secondary-action-gold" href="/guides">
              Read More Guides
            </a>
          </div>
        </section>
      </main>

      <LegalFooter
        className="marketing-legal-footer"
        hasBottomNav={false}
        onOpenTerms={() => setShowTermsModal(true)}
        onOpenFeedback={() => setShowFeedbackModal(true)}
      />

      {showTermsModal && <TermsConditionsModal onClose={() => setShowTermsModal(false)} />}
      {showFeedbackModal && <FeedbackModal onClose={() => setShowFeedbackModal(false)} />}
    </div>
  );
}
