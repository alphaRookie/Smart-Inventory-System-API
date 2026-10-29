import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Before send response: Automatically attach Bearer token to requests if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// After every response: if the token is expired/invalid, log the user out
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('access_token')) {
      // Clear all session data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      window.location.href = '/login'; // Force redirect to login page
    }
    return Promise.reject(error);
  }
);

export default API;
