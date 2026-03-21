// src/features/auth/services/authService.js

import axios from "axios";

// ─── Axios Instance ───────────────────────────────────────────────────────────
// Centralised config — base URL and headers are set once here, not scattered
// across every call. The Authorization header is injected automatically via the
// request interceptor below, so individual callers never touch tokens directly.

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // set in your .env file
  timeout: 10000,                              // fail fast after 10 s
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // send HttpOnly cookies (if your backend uses them)
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attaches the stored access token to every outgoing request.
// Token is read here, not embedded in service methods, keeping calls clean.

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_NAME);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Translates HTTP error codes into consistent, descriptive Error objects.
// This means service methods only deal with clean data — never raw HTTP noise.

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with a non-2xx status
      const { status } = error.response;

      if (status === 401) {
        // Credentials were rejected — clear any stale token
        localStorage.removeItem(ACCESS_TOKEN_NAME);
        throw new Error("Invalid username or password.");
      }
      if (status === 404) {
        throw new Error("Account not found. Please check your username.");
      }
      if (status === 429) {
        throw new Error("Too many login attempts. Please try again later.");
      }
      if (status >= 500) {
        throw new Error("Server error. Please try again later.");
      }
    } else if (error.request) {
      // Request was made but no response received (network issue / timeout)
      throw new Error("Network error. Please check your connection.");
    }

    // Fallback for anything else
    throw new Error("An unexpected error occurred.");
  }
);

// ─── Constants ────────────────────────────────────────────────────────────────

export const ACCESS_TOKEN_NAME = "access_token";

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Logs the user in.
   *
   * Security notes:
   * - Credentials travel over HTTPS only (enforced at infrastructure level).
   * - The payload is sent in the request body (never the URL / query string)
   *   so credentials don't appear in server logs or browser history.
   * - The raw password is never stored — only the token returned by the server.
   * - Token is stored in localStorage; if your backend supports HttpOnly cookies
   *   consider using those instead (withCredentials: true is already set above).
   *
   * @param {{ identifier: string, password: string }} credentials
   * @returns {{ token: string, user: object }}
   */
  login: async ({ identifier, password }) => {
    try {
      // Trim identifier to avoid accidental whitespace issues.
      // Never trim or mutate the password — it must reach the server as-is.
      const payload = {
        identifier: identifier.trim(),
        password,               // sent in body, not URL
      };

      const response = await apiClient.post("/user/login", payload);

      if (response.status === 200) {
        const { token, user } = response.data;

        // Persist the token — this is the only credential kept on the client
        localStorage.setItem(ACCESS_TOKEN_NAME, token);

        return { token, user };
      }
    } catch (error) {
      // Re-throw so the calling hook (useLogin) can surface the message in UI
      throw error;
    } finally {
      // Runs whether the call succeeded or failed.
      // Good place to clear any sensitive in-memory state if needed.
    }
  },

  /**
   * Logs the user out — removes the token from storage.
   * Call your backend logout endpoint here if it exists (to invalidate the token
   * server-side), then clear local state regardless of the response.
   */
  logout: async () => {
    try {
      await apiClient.post("/user/logout");
    } catch {
      // Swallow errors — we always want local cleanup to succeed
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_NAME);
    }
  },
};