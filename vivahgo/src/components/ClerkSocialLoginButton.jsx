import { useMemo, useState } from 'react';
import { useClerk, useSignIn } from '@clerk/react';
import {
  CLERK_SSO_CALLBACK_PATH,
  getCurrentRedirectTarget,
  persistClerkSsoRedirectTarget,
} from '../clerkSso.js';

function getErrorMessage(error, fallbackMessage) {
  const primaryError = error?.errors?.[0];
  return primaryError?.longMessage || primaryError?.message || error?.message || fallbackMessage;
}

function shouldRetryWithMeta(error, currentStrategy) {
  if (currentStrategy !== 'oauth_facebook') {
    return false;
  }

  const message = getErrorMessage(error, '').toLowerCase();
  return message.includes('allowed values') && message.includes('strategy');
}

function ClerkSocialLoginButton({ strategy, label, onLoginError, disabled = false }) {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isReady = Boolean(clerk.loaded && signIn && import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
  const buttonLabel = useMemo(() => {
    if (loading) {
      return 'Redirecting...';
    }
    if (!isReady) {
      return 'Loading...';
    }
    return label;
  }, [isReady, label, loading]);

  async function handleClick() {
    if (!signIn || !isReady || disabled) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const redirectTarget = persistClerkSsoRedirectTarget(getCurrentRedirectTarget());
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${CLERK_SSO_CALLBACK_PATH}`
        : CLERK_SSO_CALLBACK_PATH;
      const redirectUrlComplete = typeof window !== 'undefined'
        ? `${window.location.origin}${redirectTarget}`
        : redirectTarget;

      let { error: ssoError } = await signIn.sso({
        strategy,
        redirectUrl,
        redirectCallbackUrl: redirectUrlComplete,
      });

      if (ssoError && shouldRetryWithMeta(ssoError, strategy)) {
        ({ error: ssoError } = await signIn.sso({
          strategy: 'oauth_meta',
          redirectUrl,
          redirectCallbackUrl: redirectUrlComplete,
        }));
      }

      if (ssoError) {
        throw ssoError;
      }
      // No error — Clerk is navigating the browser away; keep loading=true until unload.
    } catch (nextError) {
      setLoading(false);
      const message = getErrorMessage(nextError, 'Could not start social sign-in. Please try again.');
      setError(message);
      onLoginError?.(nextError);
    }
  }

  return (
    <div className="clerk-social-login">
      <button
        className="login-auth-option-btn login-auth-option-btn-facebook"
        type="button"
        onClick={handleClick}
        disabled={disabled || !isReady || loading}
      >
        <span className="login-auth-option-btn-badge" aria-hidden="true">f</span>
        <span>{buttonLabel}</span>
      </button>
      {error ? <div className="email-otp-error">{error}</div> : null}
    </div>
  );
}

export default ClerkSocialLoginButton;