import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const runtimeHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const isLocalHost = runtimeHost === 'localhost' || runtimeHost === '127.0.0.1';

const baseURL =
  !isLocalHost && configuredBaseUrl.includes('localhost')
    ? configuredBaseUrl.replace('localhost', runtimeHost)
    : !isLocalHost && configuredBaseUrl.includes('127.0.0.1')
      ? configuredBaseUrl.replace('127.0.0.1', runtimeHost)
      : configuredBaseUrl;

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
