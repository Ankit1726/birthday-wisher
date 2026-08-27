const API_BASE = "";

const Auth = {
  getToken() {
    return localStorage.getItem("bwa_token");
  },
  getUsername() {
    return localStorage.getItem("bwa_username");
  },
  getName() {
    return localStorage.getItem("bwa_name");
  },
  setSession({ access_token, username, name }) {
    localStorage.setItem("bwa_token", access_token);
    localStorage.setItem("bwa_username", username);
    localStorage.setItem("bwa_name", name);
  },
  clear() {
    localStorage.removeItem("bwa_token");
    localStorage.removeItem("bwa_username");
    localStorage.removeItem("bwa_name");
  },
  isLoggedIn() {
    return !!this.getToken();
  },
};

async function apiFetch(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  if (!(options.body instanceof FormData) && options.body) {
    headers["Content-Type"] = "application/json";
  }
  const token = Auth.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, { ...options, headers });
  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    /* no body */
  }

  if (!res.ok) {
    const message = (data && data.detail) || `Request failed (${res.status})`;
    throw new Error(
      typeof message === "string" ? message : JSON.stringify(message),
    );
  }
  return data;
}

function requireAuth() {
  if (!Auth.isLoggedIn()) window.location.href = "/";
}

function logout() {
  Auth.clear();
  window.location.href = "/";
}
