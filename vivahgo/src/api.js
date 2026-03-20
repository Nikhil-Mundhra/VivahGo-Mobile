const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');

async function request(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
}

export function loginWithGoogle(credential) {
  return request('/auth/google', {
    method: 'POST',
    body: { credential },
  });
}

export function fetchPlanner(token) {
  return request('/planner/me', { token });
}

export function savePlanner(token, planner) {
  return request('/planner/me', {
    method: 'PUT',
    token,
    body: { planner },
  });
}