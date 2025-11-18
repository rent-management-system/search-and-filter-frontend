import axios from 'axios';
import { toast } from 'sonner';

const { VITE_RECO_API_BASE } = import.meta.env as { VITE_RECO_API_BASE?: string };
const API_BASE_URL = VITE_RECO_API_BASE || 'https://dagiteferi2011-ai-recommendation.hf.space/api/v1';

// Expose a feature flag so the UI can skip calling /search on backends that don't implement it
export const HAS_PROPERTY_SEARCH = !/ai-recommendation\.hf\.space/.test(API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/';
      toast.error('Session expired. Please login again.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// API functions
export const propertyAPI = {
  search: async (params: any) => {
    try {
      const { data } = await api.get('/search', { params });
      return data;
    } catch (error: any) {
      // Some deployments (HF Space) don't provide /search. Gracefully return no results.
      if (error?.response?.status === 404) {
        return { results: [] };
      }
      throw error;
    }
  },
  
  getById: async (id: string) => {
    const { data } = await api.get(`/properties/${id}`);
    return data;
  },
};

export const recommendationAPI = {
  health: async () => {
    const { data } = await axios.get(API_BASE_URL.replace('/api/v1', '') + '/health');
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
