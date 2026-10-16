/**
 * Lincoz Enterprise - Client-Side Secure API Client
 * Features:
 * - Rule 1: Uses import.meta.env.VITE_API_URL without exposing secrets
 * - Rule 2: Explicitly surfaces 429 Rate Limit errors to the UI
 * - Rule 4: Automatically attaches Bearer token & handles 401 refresh via httpOnly cookies
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('lincoz_auth_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('lincoz_auth_token', token);
    } else {
      localStorage.removeItem('lincoz_auth_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Includes httpOnly cookies for refresh tokens
      });

      // Handle Rate Limiting (Rule 2: Never silently swallow 429)
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        const retryAfter = response.headers.get('Retry-After');
        const message = errorData.error || `Too many requests. Please wait ${retryAfter ? `${retryAfter}s` : 'a moment'} before retrying.`;
        throw new Error(message);
      }

      // Handle Token Expiry
      if (response.status === 401 && !options._retry && this.token) {
        options._retry = true;
        const refreshed = await this.refreshToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.token}`;
          return this.request(endpoint, options);
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Log cleanly and rethrow for UI toast notifications
      console.warn(`[API Client] ${options.method || 'GET'} ${endpoint} failed:`, error.message);
      throw error;
    }
  }

  async refreshToken() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        this.setToken(data.token);
        return true;
      }
    } catch (e) {}
    this.setToken(null);
    return false;
  }

  // Domain Endpoints
  get(endpoint) { return this.request(endpoint, { method: 'GET' }); }
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); }
  patch(endpoint, body) { return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }); }
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
}

export const api = new ApiClient();
