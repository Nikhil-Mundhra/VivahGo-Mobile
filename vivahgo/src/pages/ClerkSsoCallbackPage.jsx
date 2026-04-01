import { HandleSSOCallback } from '@clerk/react';
import LoadingBar from '../components/LoadingBar';
import { consumeClerkSsoRedirectTarget } from '../clerkSso.js';

function navigateToPath(path) {
  if (typeof window === 'undefined') {
    return;
  }

  window.location.assign(path);
}

function resolveDestination() {
  return consumeClerkSsoRedirectTarget();
}

export default function ClerkSsoCallbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <p className="text-gray-700 text-sm">Completing sign in...</p>
        <div className="mt-4">
          <LoadingBar label="Finishing Facebook sign in..." compact />
        </div>
        <HandleSSOCallback
          navigateToApp={() => {
            navigateToPath(resolveDestination());
          }}
          navigateToSignIn={() => {
            navigateToPath(resolveDestination());
          }}
          navigateToSignUp={() => {
            navigateToPath(resolveDestination());
          }}
        />
      </div>
    </div>
  );
}