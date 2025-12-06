import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_KEY = process.env.REACT_APP_API_KEY;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add API key to all requests
    config.headers['x-api-key'] = API_KEY;
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add cache-busting for GET requests
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now() // Timestamp to prevent caching
      };
    }
    
    // Force no-cache headers
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/auth/refresh', { refreshToken });
        const { token } = response.data;

        localStorage.setItem('token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.error('API Key Error:', {
        headers: originalRequest.headers,
        response: error.response.data
      });
      toast.error('Invalid API key or unauthorized access');
      return Promise.reject(error);
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || 'An error occurred';
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  auth: {
    login: (credentials) => api.post('/api/auth/login', credentials),
    register: (userData) => api.post('/api/auth/register', userData),
    refresh: (refreshToken) => api.post('/api/auth/refresh', { refreshToken }),
    logout: () => api.post('/api/auth/logout'),
    getProfile: () => api.get('/api/auth/profile'),
    updateProfile: (profileData) => api.put('/api/auth/profile', profileData)
  },
  dashboard: {
    getAttackLogs: () => api.get('/api/dashboard/attack_logs'),
    getStatistics: () => api.get('/api/dashboard/statistics'),
    getDeviceStatus: () => api.get('/api/dashboard/device_status'),
    getTimeline: () => api.get('/api/dashboard/timeline'),
    getLiveData: () => api.get('/api/dashboard/live_data')
  },
  devices: {
    getStatus: () => api.get('/api/devices/status'),
    getMetrics: (deviceId) => api.get(`/api/devices/${deviceId}/metrics`),
    updateSettings: (deviceId, settings) => api.put(`/api/devices/${deviceId}/settings`, settings)
  },
  admin: {
    getSummary: () => api.get('/api/admin/summary'),
    getBlockchainRecords: () => api.get('/api/admin/blockchain_records'),
    getDeviceMetrics: () => api.get('/api/admin/device_metrics'),
    getAnomalyReport: () => api.get('/api/admin/anomaly_report')
  },
  statistics: `${API_BASE_URL}/api/dashboard/statistics`,
  deviceStatus: `${API_BASE_URL}/api/dashboard/device_status`,
  liveData: `${API_BASE_URL}/api/dashboard/live_data`,
  attackLogs: `${API_BASE_URL}/api/dashboard/attack_logs`,
  timeline: `${API_BASE_URL}/api/dashboard/timeline`
};

// Error handling utility
export const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Error:', error.response.data);
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Network Error:', error.request);
    return 'Network error - no response received';
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error:', error.message);
    return error.message;
  }
};

export const fetchWithAuth = async (endpoint, options = {}) => {
  const apiKey = process.env.REACT_APP_API_KEY;
  
  const defaultHeaders = {
    'x-api-key': apiKey,
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  try {
    const response = await axios({
      url: endpoint,
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export { api as default }; 