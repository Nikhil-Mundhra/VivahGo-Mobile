import { useState, useEffect } from "react";
import Mandala from "../../../components/Mandala";

function SplashScreen({ onStart, onSkip, showSkip = false }) {
  const [show, setShow] = useState(false);
  const isSetupFlow = showSkip;
  const stageLabel = isSetupFlow ? "Before your questionnaire" : "Welcome back";
  const title = isSetupFlow
    ? "A quick bridge into your wedding planner."
    : "Your wedding workspace is ready to pick up again.";
  const subtitle = isSetupFlow
    ? "We will guide you through a few simple prompts, then build a planner shaped around your celebration."
    : "Open your planner to continue with your tasks, guests, budget, and ceremonies without losing your flow.";
  const previewMessage = isSetupFlow
    ? "VivahGo AI will ask about your template, names, date, venue, and guest plan. Everything can be edited later."
    : "Your planner is already set up, so you can go straight back into your dashboard and keep planning.";
  const ctaLabel = isSetupFlow ? "Start My Setup ✨" : "Open My Planner ✨";
  const previewItems = isSetupFlow
    ? [
        { kicker: "Step 1", title: "Pick a starting template", description: "Choose a setup style or begin with a blank planning canvas." },
        { kicker: "Step 2", title: "Add your essentials", description: "Names, date, and venue help shape your first planner view." },
        { kicker: "Step 3", title: "Let VivahGo organize it", description: "We prepare your checklist, ceremonies, and planning structure." },
      ]
    : [
        { kicker: "Ready", title: "Jump into your dashboard", description: "Continue with your latest tasks, events, and shared updates." },
        { kicker: "Update", title: "Refine details anytime", description: "Guest counts, budget, and wedding details stay editable." },
        { kicker: "Plan", title: "Keep momentum going", description: "Everything is in one place so you can move faster with less chaos." },
      ];

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="splash">
      <div className="splash-glow splash-glow-left" />
      <div className="splash-glow splash-glow-right" />
      <Mandala size={500} style={{ position: "absolute", top: -50, left: -50 }} />
      <Mandala
        size={400}
        style={{
          position: "absolute",
          bottom: -80,
          right: -80,
          opacity: 0.05,
          animation: "rotateSlow 60s linear infinite reverse",
        }}
      />
      <div className={`splash-content${show ? " is-visible" : ""}`}>
        <div className="splash-shell">
          <section className="splash-hero-card">
            <div className="splash-stage-pill">{stageLabel}</div>
            <div className="splash-brand-wrap">
              <img src="/Thumbnail.png" alt="VivahGo" className="splash-logo-image" />
            </div>
            <p className="splash-kicker">Planner Setup</p>
            <h1 className="splash-title">{title}</h1>
            <p className="splash-subtitle">{subtitle}</p>
            <div className="splash-divider">
              <div className="splash-divider-line" />
              <div className="splash-divider-diamond" />
              <div className="splash-divider-line" />
            </div>
            <div className="splash-trust-row">
              <span>Guided by VivahGo AI</span>
              <span>Editable later</span>
              <span>{isSetupFlow ? "About 2 minutes" : "Planner ready now"}</span>
            </div>
            <div className="splash-actions">
              <button className="btn-primary splash-primary-btn" onClick={onStart}>
                {ctaLabel}
              </button>
              {showSkip && (
                <button
                  type="button"
                  className="splash-skip-btn"
                  onClick={onSkip}
                >
                  Skip setup and start with a blank template
                </button>
              )}
              <p className="splash-powered-text">Powered by VivahGo AI</p>
            </div>
          </section>

          <aside className="splash-preview-card">
            <div className="splash-preview-top">
              <div>
                <p className="splash-preview-kicker">What happens next</p>
                <h2 className="splash-preview-title">
                  {isSetupFlow ? "A softer handoff into onboarding" : "Your planner stays close at hand"}
                </h2>
              </div>
              <div className="splash-preview-progress" aria-hidden="true">
                {previewItems.map((item) => (
                  <span key={item.title} className="splash-preview-dot" />
                ))}
              </div>
            </div>

            <div className="splash-ai-note">
              <span className="splash-ai-note-icon">✨</span>
              <p>{previewMessage}</p>
            </div>

            <div className="splash-step-list">
              {previewItems.map((item, index) => (
                <div
                  className="splash-step-card"
                  key={item.title}
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="splash-step-number">{String(index + 1).padStart(2, "0")}</div>
                  <div>
                    <div className="splash-step-kicker">{item.kicker}</div>
                    <div className="splash-step-title">{item.title}</div>
                    <p className="splash-step-description">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="splash-preview-footer">
              <div className="ornament">✦ ✦ ✦</div>
              <p className="splash-footer-text">Shubh Vivah</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
