import axios from 'axios';
import { useAuthStore } from '@store/authStore';

const customAxios = axios.create({
  baseURL: (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://api2.boltabacus.com',
  // Credentials (cookies) are not needed; we authenticate via header tokens.
  // Keeping this false prevents CORS "Network Error" when the server doesn't allow credentials.
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
  // Some hosts (e.g., Render) can cold-start; use a generous timeout
  timeout: 120000,
});

// Simple, safe stringify for logging arbitrary values (avoids circular errors)
function safeStringify(value: unknown): string {
  try {
    if (value instanceof Error) {
      return JSON.stringify({
        name: value.name,
        message: value.message,
        stack: value.stack,
      });
    }
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

customAxios.interceptors.request.use(
  (config) => {
    return config; // no console log anymore
  },
  (error) => {
    return Promise.reject(error);
  }
);


customAxios.interceptors.response.use(
  (response) => {
    try {
      console.log('📥 [Axios] Response ←', response.status, response.config.url, {
        data: response.data,
      });
    } catch {}
    return response;
  },
  async (error) => {
    // Normalize common Axios error shape for easier debugging
    const status = error?.response?.status;
    const url = error?.config?.url;
    const method = error?.config?.method;
    const data = error?.response?.data;
    const code = error?.code;


    // Only force logout on explicit 401 (unauthorized) with token-not-valid.
    // Avoid logging out on 403 to prevent ejecting users due to endpoint-specific permissions.
    const isTokenNotValid =
      (status === 401) && (
        data?.code === 'token_not_valid' ||
        data?.detail?.toString()?.toLowerCase()?.includes('token')
      );

    if (isTokenNotValid) {
      try {
        console.warn('[Auth] Invalid or missing token. Logging out.');
        useAuthStore.getState().logout();
      } catch {}
      return Promise.reject(error);
    }

    //  less retries.only retry network error..
    const config = error.config || {};
    config.__retryCount = config.__retryCount || 0;
    
    if (status >= 500) {
      console.warn(`[Axios] Not retrying server error ${status} for`, method?.toUpperCase(), url);
      return Promise.reject(error);
    }
    
    // retry network errors..max retries from 3 to 1
    const shouldRetry = (code === 'ECONNABORTED' || code === 'ERR_NETWORK' || typeof status === 'undefined') && config.__retryCount < 1;

    if (shouldRetry) {
      config.__retryCount += 1;
      const delayMs = 2000; // fixed 2s delay
      console.warn(`⏳ [Axios] Retry ${config.__retryCount}/1 in ${delayMs}ms →`, method?.toUpperCase(), url);
      await new Promise((r) => setTimeout(r, delayMs));
      return customAxios(config);
    }

    return Promise.reject(error);
  }
);

export default customAxios;
