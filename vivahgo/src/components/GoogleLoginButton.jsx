import { useEffect, useRef, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

function GoogleLoginButton({ onLoginSuccess, onLoginError }) {
  const buttonWrapRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(null);

  useEffect(() => {
    const container = buttonWrapRef.current;
    if (!container || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const updateWidth = () => {
      const nextWidth = Math.floor(container.getBoundingClientRect().width);
      setButtonWidth(nextWidth > 0 ? nextWidth : null);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return (
      <div ref={buttonWrapRef} className="google-button-inner-wrap">
        <button className="login-secondary-btn" type="button" disabled>
          Google sign-in is temporarily unavailable
        </button>
      </div>
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
    <div ref={buttonWrapRef} className="google-button-inner-wrap">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        size="large"
        text="continue_with"
        shape="rectangular"
        theme="outline"
        logo_alignment="center"
        width={buttonWidth ? String(buttonWidth) : undefined}
      />
    </div>
  );
}

export default GoogleLoginButton;
