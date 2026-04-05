import axios, { type AxiosError } from 'axios';

/**
 * Vite loads env files in priority order:
 *   .env.development  → used by `npm run dev`
 *   .env.production   → used by `npm run build`
 *   .env              → fallback for both
 *
 * When VITE_API_URL is NOT set (local dev), all requests go to `/api`
 * and Vite's dev-server proxy forwards them to http://localhost:5000.
 * When VITE_API_URL IS set (production build), requests go directly
 * to that URL (e.g. https://your-app.onrender.com/api).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15_000,
});

// ── Request: attach auth token ────────────────────────────────────
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // localStorage restricted (e.g. private browsing / iframe)
  }
  return config;
});

// ── Response: normalise errors ────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    if (error.response) {
      // The server responded with a non-2xx status
      const serverMsg =
        error.response.data?.error ||
        error.response.data?.message ||
        `Server error ${error.response.status}`;

      // Auto-logout on 401 (expired / invalid token)
      if (error.response.status === 401) {
        try { localStorage.removeItem('token'); } catch {}
        window.location.href = '/login';
      }

      return Promise.reject(new Error(serverMsg));
    }

    if (error.request) {
      // Request was sent but no response received (network down / server offline)
      return Promise.reject(new Error('Network error — cannot reach server'));
    }

    // Something else went wrong
    return Promise.reject(error);
  }
);

export default api;
