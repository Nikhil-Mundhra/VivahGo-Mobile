import { GoogleLogin } from '@react-oauth/google';

function GoogleLoginButton({ onLoginSuccess, onLoginError }) {
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return (
      <button className="login-secondary-btn" type="button" disabled>
        Add VITE_GOOGLE_CLIENT_ID to enable Google sign-in
      </button>
    );
  }

  const handleSuccess = (credentialResponse) => {
    onLoginSuccess(credentialResponse);
  };

  const handleError = () => {
    const error = new Error('Google login failed');
    onLoginError?.(error);
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      size="large"
      text="continue_with"
      shape="rectangular"
      theme="outline"
      width="280"
    />
  );
}

export default GoogleLoginButton;