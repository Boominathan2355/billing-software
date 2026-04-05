import axios from 'axios';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || '/api' 
});

api.interceptors.request.use((config) => {
  let token = null;
  try {
    token = localStorage.getItem('token');
  } catch (err) {
    console.warn('Storage restricted:', err);
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
