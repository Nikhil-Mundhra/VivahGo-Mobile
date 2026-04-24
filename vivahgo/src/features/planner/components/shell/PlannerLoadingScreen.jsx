import LoadingBar from "../../../../components/LoadingBar";

export default function PlannerLoadingScreen() {
  return (
    <div className="app-shell">
      <div className="login-screen">
        <div className="login-container" style={{ textAlign: "center" }}>
          <div className="login-logo">
            <img
              className="login-logo-image"
              src="/Thumbnail.png"
              alt="Vivah Go"
              style={{ maxWidth: 140, margin: "0 auto" }}
            />
          </div>
          <h1 className="login-title">Loading your planner</h1>
          <p className="login-subtitle">Checking your saved session and wedding data.</p>
          <LoadingBar className="login-hero-loading-bar" />
        </div>
      </div>
    </div>
  );
}
