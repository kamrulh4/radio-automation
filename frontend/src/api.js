import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
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
export const getUsage = () => api.get('/tts/usage');
export const generateTTS = (data) => api.post('/tts/generate', data);
export const triggerDownload = (type, station) => api.post(`/downloads/trigger/${type}?station=${station}`);
export const listFiles = (station) => api.get(`/downloads/list/${station}`);
export const uploadFile = (station, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/downloads/upload/${station}`, formData);
};

export default api;
