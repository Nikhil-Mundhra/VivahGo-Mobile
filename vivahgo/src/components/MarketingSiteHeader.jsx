import { useEffect, useRef, useState } from "react";

export default function MarketingSiteHeader({
  activePage = "home",
  onContactUs,
  session = null,
  primaryCtaLabel = "Start Planning Now",
  mobileCtaLabel = "Plan Now",
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const dropdownRef = useRef(null);
  const firstName = session?.user?.given_name || session?.user?.name?.split(" ")[0] || "there";
  const profileInitial = firstName.trim().charAt(0).toUpperCase() || "Y";

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;

    if (mobileNavOpen) {
      body.style.overflow = "hidden";
    }

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleResize = () => {
      if (window.innerWidth > 720) {
        setMobileNavOpen(false);
        setMobileMoreOpen(false);
        setMoreOpen(false);
      }
    };

    const handlePointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
        setMobileMoreOpen(false);
        setMoreOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  function closeNavigationMenus() {
    setMobileNavOpen(false);
    setMobileMoreOpen(false);
    setMoreOpen(false);
  }

  function handleMobileMenuToggle() {
    setMoreOpen(false);
    setMobileNavOpen((current) => {
      const next = !current;
      if (!next) {
        setMobileMoreOpen(false);
      }
      return next;
    });
  }

  function handleContactUs() {
    closeNavigationMenus();
    if (typeof onContactUs === "function") {
      onContactUs();
    }
  }

  return (
    <>
      <header className="marketing-header">
        <button
          type="button"
          className="marketing-mobile-menu-toggle"
          aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileNavOpen}
          aria-controls="marketing-mobile-menu"
          onClick={handleMobileMenuToggle}
        >
          <span />
          <span />
          <span />
        </button>

        <a className="marketing-brand" href="/home" aria-label="VivahGo home page">
          <img src="/Thumbnail.png" alt="VivahGo" className="marketing-brand-mark" />
        </a>

        <nav className="marketing-nav marketing-page-toggle" aria-label="Marketing pages">
          <a className={activePage === "home" ? "marketing-nav-link-active" : ""} href="/home">Home</a>
          <a className={activePage === "pricing" ? "marketing-nav-link-active" : ""} href="/pricing">Pricing</a>
          <a className={activePage === "guides" ? "marketing-nav-link-active" : ""} href="/guides">Guides</a>

          <div className="marketing-nav-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className={`marketing-nav-button${activePage === "careers" ? " marketing-nav-link-active" : ""}`}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              onClick={() => setMoreOpen((current) => !current)}
            >
              More
            </button>

            {moreOpen ? (
              <div className="marketing-nav-dropdown-menu" role="menu" aria-label="More pages">
                <button type="button" className="marketing-nav-dropdown-action" role="menuitem" onClick={handleContactUs}>
                  Contact Us
                </button>
                <a
                  className={`marketing-nav-dropdown-link${activePage === "careers" ? " marketing-nav-dropdown-link-active" : ""}`}
                  href="/careers"
                  role="menuitem"
                  onClick={() => setMoreOpen(false)}
                >
                  Careers
                </a>
              </div>
            ) : null}
          </div>
        </nav>

        <div className="marketing-auth">
          <a className="marketing-header-link-button" href="/vendor">
            For Vendors
          </a>
          <a className="marketing-auth-button" href="/">
            <span className="marketing-auth-button-label marketing-auth-button-label-desktop">{primaryCtaLabel}</span>
            <span className="marketing-auth-button-label marketing-auth-button-label-mobile">{mobileCtaLabel}</span>
            {session?.user && (
              session.user.picture ? (
                <img
                  src={session.user.picture}
                  alt={`${firstName} profile`}
                  className="marketing-auth-avatar"
                />
              ) : (
                <span className="marketing-auth-avatar marketing-auth-avatar-fallback" aria-hidden="true">
                  {profileInitial}
                </span>
              )
            )}
          </a>
        </div>
      </header>

      {mobileNavOpen ? (
        <>
          <button
            type="button"
            className="marketing-mobile-menu-backdrop"
            aria-label="Close navigation menu"
            onClick={closeNavigationMenus}
          />
          <div id="marketing-mobile-menu" className="marketing-mobile-menu marketing-mobile-menu-open">
            <a href="/home" onClick={closeNavigationMenus}>Home</a>
            <a href="/pricing" onClick={closeNavigationMenus}>Pricing</a>
            <a href="/guides" onClick={closeNavigationMenus}>Guides</a>
            <div className="marketing-mobile-menu-group">
              <button
                type="button"
                className={`marketing-mobile-menu-trigger${mobileMoreOpen ? " marketing-mobile-menu-trigger-open" : ""}`}
                aria-expanded={mobileMoreOpen}
                aria-controls="marketing-mobile-more-menu"
                onClick={() => setMobileMoreOpen((current) => !current)}
              >
                <span>More</span>
                <span aria-hidden="true">{mobileMoreOpen ? "-" : "+"}</span>
              </button>
              {mobileMoreOpen ? (
                <div id="marketing-mobile-more-menu" className="marketing-mobile-submenu">
                  <a href="/careers" onClick={closeNavigationMenus}>Careers</a>
                  <button type="button" onClick={handleContactUs}>Contact Us</button>
                </div>
              ) : null}
            </div>
            <a href="/vendor" onClick={closeNavigationMenus}>Vendor Login</a>
          </div>
        </>
      ) : null}
    </>
  );
}
