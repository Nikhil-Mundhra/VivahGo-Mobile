import { Fragment } from 'react';
import GoogleLoginButton from './GoogleLoginButton';
import EmailOtpLogin from './EmailOtpLogin';
import ClerkSocialLoginButton from './ClerkSocialLoginButton';

const AUTH_OPTION_RENDERERS = {
  google: function renderGoogle(option) {
    return (
      <div className="google-login-wrap">
        <GoogleLoginButton onLoginSuccess={option.onLoginSuccess} onLoginError={option.onLoginError} />
      </div>
    );
  },
  'clerk-social': function renderClerkSocial(option) {
    return (
      <ClerkSocialLoginButton
        strategy={option.strategy}
        label={option.label}
        onLoginError={option.onLoginError}
        disabled={option.disabled}
      />
    );
  },
  'email-otp': function renderEmailOtp(option) {
    return <EmailOtpLogin onLoginSuccess={option.onLoginSuccess} onLoginError={option.onLoginError} />;
  },
};

function AuthOptionList({ options = [] }) {
  return (
    <div className="login-auth-options">
      {options.map((option) => {
        const renderOption = AUTH_OPTION_RENDERERS[option.type];
        if (!renderOption) {
          return null;
        }

        return (
          <Fragment key={option.id}>
            {option.separatorBeforeLabel ? (
              <div className="login-auth-divider">
                <div className="divider-line"></div>
                <span className="divider-text">{option.separatorBeforeLabel}</span>
                <div className="divider-line"></div>
              </div>
            ) : null}
            <div className="login-auth-option">{renderOption(option)}</div>
          </Fragment>
        );
      })}
    </div>
  );
}

export default AuthOptionList;