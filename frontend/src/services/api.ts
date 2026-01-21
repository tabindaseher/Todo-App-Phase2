import axios from 'axios';
import { getToken, getRefreshToken, removeTokens } from '../utils/auth';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and other errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh the token
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/auth/refresh`, {
            refresh_token: refreshToken
          });

          if (response.data.token) {
            // Store the new tokens
            import('../utils/auth').then(({ storeTokens }) => {
              storeTokens(response.data.token, response.data.refreshToken || getRefreshToken());
            });

            // Retry the original request with the new token
            originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, remove tokens and redirect to login
          removeTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, remove tokens and redirect to login
        removeTokens();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Export specific API functions for authentication
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/api/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post('/api/auth/register', { name, email, password }),

  logout: () =>
    apiClient.post('/api/auth/logout'),

  refreshToken: (refreshToken: string) =>
    apiClient.post('/api/auth/refresh', { refreshToken }),
};

// Export specific API functions for todos
export const todosApi = {
  getAll: (params?: { status?: string; priority?: string; limit?: number; offset?: number }) =>
    apiClient.get('/api/todos', { params }),

  getById: (id: string) =>
    apiClient.get(`/api/todos/${id}`),

  create: (data: { title: string; description?: string; dueDate?: string; priority?: string }) =>
    apiClient.post('/api/todos', data),

  update: (id: string, data: { title?: string; description?: string; completed?: boolean; dueDate?: string; priority?: string }) =>
    apiClient.put(`/api/todos/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/todos/${id}`),

  toggleComplete: (id: string, completed: boolean) =>
    apiClient.patch(`/api/todos/${id}/complete`, { completed }),
};