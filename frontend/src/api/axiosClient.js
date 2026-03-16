import axios from 'axios';

const configuredBaseUrl = (import.meta.env.VITE_API_URL || '').trim();
const shouldUseDevProxy =
  import.meta.env.DEV &&
  (!configuredBaseUrl || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/api\/?$/i.test(configuredBaseUrl));

const baseURL = shouldUseDevProxy ? '/api' : configuredBaseUrl || '/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('stms_token') || localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
