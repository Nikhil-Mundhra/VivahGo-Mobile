import GoogleLoginButton from './GoogleLoginButton';

function LoginScreen({ onGoogleLogin, onDemoLogin, onLoginError, isLoggingIn, errorMessage }) {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">💍</div>
          <h1 className="login-title">Welcome to VivahGo</h1>
          <p className="login-subtitle">Your personal wedding planning assistant</p>
        </div>

        <div className="login-content">
          <div className="login-benefits">
            <div className="benefit-item">
              <span className="benefit-icon">📅</span>
              <span className="benefit-text">Plan your perfect wedding</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💰</span>
              <span className="benefit-text">Track budget & expenses</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">👥</span>
              <span className="benefit-text">Manage guests & vendors</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✅</span>
              <span className="benefit-text">Stay organized with tasks</span>
            </div>
          </div>

          <div className="login-divider">
            <div className="divider-line"></div>
            <span className="divider-text">Continue with</span>
            <div className="divider-line"></div>
          </div>

          <div className="login-actions">
            <GoogleLoginButton onLoginSuccess={onGoogleLogin} onLoginError={onLoginError} />
            <button className="login-secondary-btn" type="button" onClick={onDemoLogin} disabled={isLoggingIn}>
              Try Demo Planner With Sample Data
            </button>
          </div>

          <div className="login-oauth-help">
            Use a <strong>Web application</strong> OAuth client, then add <strong>{currentOrigin}</strong> to Authorized JavaScript origins. If you see <strong>invalid_client</strong> or <strong>no registered origin</strong>, the Google Cloud OAuth client is not configured for this local frontend yet.
          </div>

          {isLoggingIn && <div className="login-status">Signing you in and loading your planner...</div>}
          {errorMessage && <div className="login-error">{errorMessage}</div>}
        </div>

        <div className="login-footer">
          <p className="login-footer-text">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;