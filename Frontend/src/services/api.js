import axios from 'axios';

// In production: Use VITE_API_URL env var
// In development: Use '/api' so Vite proxy handles it
const isProd = import.meta.env.PROD;
const baseUrl = import.meta.env.VITE_API_URL || '';
const API_URL = baseUrl ? `${baseUrl}/api` : '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Validate token - must exist and be a proper JWT (starts with 'eyJ')
    if (token && token !== 'undefined' && token !== 'null' && token.startsWith('eyJ')) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token === 'undefined' || token === 'null') {
      // Clean up invalid token
      localStorage.removeItem('token');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry for non-401 errors or if already retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't retry auth endpoints
    if (originalRequest.url?.includes('/auth/login') || 
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // If already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Try to refresh the token
      const refreshResponse = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const { accessToken } = refreshResponse.data;
      
      if (accessToken) {
        localStorage.setItem('token', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return api(originalRequest);
      }
      
      throw new Error('No access token returned');
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Only clear token if refresh explicitly failed (not network error)
      if (refreshError.response?.status === 401) {
        // Refresh token is invalid/expired - user needs to login again
        localStorage.removeItem('token');
        // Optionally redirect to login - but let components handle this
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
