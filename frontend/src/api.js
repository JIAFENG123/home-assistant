import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const familyName = localStorage.getItem('family_name');
  if (familyName) {
    config.headers['X-Family-Name'] = familyName;
  }
  return config;
});

export default api;
