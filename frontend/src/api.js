import axios from 'axios';

// In production, we use a relative path so Nginx handles the routing.
// Locally, we use the Port 8003 (updated from 8000 to match VPS).
export const BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8003' 
  : ''; 

const api = axios.create({
  baseURL: BASE_URL ? `${BASE_URL}/api` : '/api',
});

// Add interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  const response = await api.post('/auth/login', formData);
  localStorage.setItem('token', response.data.access_token);
  return response.data;
};

export const getVoices = () => api.get('/tts/voices');
export const listStations = () => api.get('/stations');
export const getCurrentUser = () => api.get('/auth/me');
export const getUsage = () => api.get('/tts/usage');
export const generateTTS = (data) => api.post('/tts/generate', data);
export const generateAIText = (prompt) => api.post('/tts/generate-ai-text', { prompt });
export const triggerDownload = (type, station) => api.post(`/downloads/trigger/${type}?station=${station}`);
export const listFiles = (station) => api.get(`/downloads/list/${station}`);
export const uploadFile = (station, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/downloads/upload/${station}`, formData);
};

// Custom Download Sources
export const listSources = () => api.get('/sources');
export const getStationSources = (stationId) => api.get(`/sources/station/${stationId}`);
export const createSource = (data) => api.post('/sources', data);
export const deleteSource = (id) => api.delete(`/sources/${id}`);
export const triggerSource = (id) => api.post(`/sources/${id}/trigger`);

// System Settings
export const listSettings = () => api.get('/settings');
export const updateSetting = (key, value) => api.post('/settings', { key, value });

export default api;
