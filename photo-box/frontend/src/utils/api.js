import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Wedding API
export const weddingAPI = {
  create: (data) => api.post('/wedding/create', data),
  login: (data) => api.post('/wedding/login', data),
  getInfo: (code) => api.get(`/wedding/${code}`),
};

// Media API
export const mediaAPI = {
  getList: (code, params = {}) => api.get(`/${code}/media`, { params }),
  getStats: (code) => api.get(`/${code}/stats`),
  like: (code, id) => api.post(`/${code}/media/${id}/like`),
  delete: (code, id) => api.delete(`/${code}/media/${id}`),
  download: (code) => {
    const token = localStorage.getItem('adminToken');
    return axios({
      method: 'GET',
      url: `${API_BASE_URL}/api/${code}/download`,
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

// Upload API
export const uploadAPI = {
  uploadFiles: (code, formData, onProgress) => {
    return api.post(`/${code}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
};

export default api;