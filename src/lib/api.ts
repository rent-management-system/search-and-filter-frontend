import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:8005/api/v1';

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
    const { data } = await api.get('/search', { params });
    return data;
  },
  
  getById: async (id: string) => {
    const { data } = await api.get(`/properties/${id}`);
    return data;
  },
};

export const recommendationAPI = {
  generate: async (payload: any) => {
    const { data } = await api.post('/recommendations', payload);
    return data;
  },
  
  getMine: async () => {
    const { data } = await api.get('/recommendations/mine');
    return data;
  },
  
  sendFeedback: async (propertyId: string, feedback: 'like' | 'dislike') => {
    const { data } = await api.post(`/recommendations/feedback`, {
      property_id: propertyId,
      feedback,
    });
    return data;
  },
};
