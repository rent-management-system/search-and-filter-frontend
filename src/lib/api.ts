import axios, { AxiosInstance } from 'axios';
import { toast } from 'sonner';

const { VITE_RECO_API_BASE, VITE_SEARCH_API_BASE } = import.meta.env as {
  VITE_RECO_API_BASE?: string;
  VITE_SEARCH_API_BASE?: string;
};

// Defaults
const RECO_API_BASE = VITE_RECO_API_BASE || 'https://dagiteferi2011-ai-recommendation.hf.space/api/v1';
// Default to same-origin '/api' so Vercel rewrite can proxy -> avoids CORS
const SEARCH_API_BASE = VITE_SEARCH_API_BASE || '/api';
export const SEARCH_BASE = SEARCH_API_BASE.replace(/\/api(\/v1)?\/?$/, '');

// Feature flag for property search UI
export const HAS_PROPERTY_SEARCH = !!SEARCH_API_BASE;

// Create axios instance with shared interceptors
function createAxios(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });
  // Request interceptor for auth token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );
  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const message = error.response?.data?.message || 'An error occurred';
      // Basic retry for transient errors (rate limit / service unavailable)
      if (status === 429 || status === 503) {
        const cfg = error.config || {};
        cfg.__retryCount = cfg.__retryCount || 0;
        const maxRetries = 2;
        if (cfg.__retryCount < maxRetries) {
          cfg.__retryCount += 1;
          const delay = Math.min(1000 * 2 ** (cfg.__retryCount - 1), 4000);
          await new Promise((res) => setTimeout(res, delay));
          return instance(cfg);
        }
      }
      // Do not auto-redirect or clear token on background 401s.
      // Surface a clear toast but keep user state intact.
      if (status === 401) {
        console.warn('Unauthorized API response (401) from', error.config?.url);
        toast.error('Session issue with a service. Please try again.');
      } else {
        // Avoid overly noisy toasts from background requests; still inform the user.
        toast.error(message);
      }
      return Promise.reject(error);
    }
  );
  return instance;
}

export const api = createAxios(RECO_API_BASE);
export const searchApi = createAxios(SEARCH_API_BASE);

// API functions
export const propertyAPI = {
  search: async (params: any) => {
    // Render service returns an array; normalize to { results }
    const { data } = await searchApi.get('/search', { params });
    return Array.isArray(data) ? { results: data } : data;
  },
  
  getById: async (id: string) => {
    const { data } = await searchApi.get(`/property/${id}`);
    return data;
  },
  saveSearch: async (payload: any) => {
    const { data } = await searchApi.post('/saved-searches', payload);
    return data;
  },
  health: async () => {
    const { data } = await searchApi.get('/health');
    return data;
  },
};

export const recommendationAPI = {
  health: async () => {
    const { data } = await axios.get(RECO_API_BASE.replace('/api/v1', '') + '/health');
    return data;
  },
  generate: async (payload: any) => {
    const { data } = await api.post('/recommendations', payload);
    return data;
  },
  
  getMine: async () => {
    const { data } = await api.get('/recommendations/mine');
    return data;
  },
  getLatest: async () => {
    const { data } = await api.get('/recommendations/latest');
    return data;
  },
  getByPreferenceId: async (tenant_preference_id: number) => {
    const { data } = await api.get(`/recommendations/${tenant_preference_id}`);
    return data;
  },
  
  sendFeedback: async (payload: {
    tenant_preference_id: number;
    property_id: string;
    liked: boolean;
    note?: string;
  }) => {
    const { data } = await api.post(`/recommendations/feedback`, payload);
    return data;
  },
};
