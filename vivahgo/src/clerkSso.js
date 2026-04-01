export const CLERK_SSO_CALLBACK_PATH = '/auth/sso-callback';
export const CLERK_SSO_REDIRECT_STORAGE_KEY = 'vivahgo.clerkSsoRedirect';

function getSessionStorage(sessionStorageRef) {
  if (sessionStorageRef) {
    return sessionStorageRef;
  }

  if (typeof window !== 'undefined') {
    return window.sessionStorage;
  }

  return null;
}

export function getCurrentRedirectTarget(locationRef = typeof window !== 'undefined' ? window.location : null) {
  if (!locationRef) {
    return '/';
  }

  const pathname = typeof locationRef.pathname === 'string' && locationRef.pathname ? locationRef.pathname : '/';
  const search = typeof locationRef.search === 'string' ? locationRef.search : '';
  const hash = typeof locationRef.hash === 'string' ? locationRef.hash : '';
  return `${pathname}${search}${hash}`;
}

export function isSafeRedirectTarget(target) {
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//');
}

export function persistClerkSsoRedirectTarget(target, options = {}) {
  const storage = getSessionStorage(options.sessionStorageRef);
  const nextTarget = isSafeRedirectTarget(target) ? target : '/';

  if (!storage || typeof storage.setItem !== 'function') {
    return nextTarget;
  }

  storage.setItem(CLERK_SSO_REDIRECT_STORAGE_KEY, nextTarget);
  return nextTarget;
}

export function readClerkSsoRedirectTarget(options = {}) {
  const storage = getSessionStorage(options.sessionStorageRef);
  if (!storage || typeof storage.getItem !== 'function') {
    return '/';
  }

  const storedTarget = storage.getItem(CLERK_SSO_REDIRECT_STORAGE_KEY);
  return isSafeRedirectTarget(storedTarget) ? storedTarget : '/';
}

export function clearClerkSsoRedirectTarget(options = {}) {
  const storage = getSessionStorage(options.sessionStorageRef);
  if (!storage || typeof storage.removeItem !== 'function') {
    return;
  }

  storage.removeItem(CLERK_SSO_REDIRECT_STORAGE_KEY);
}

export function consumeClerkSsoRedirectTarget(options = {}) {
  const target = readClerkSsoRedirectTarget(options);
  clearClerkSsoRedirectTarget(options);
  return target;
}