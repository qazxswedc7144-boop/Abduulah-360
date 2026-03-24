import axios from 'axios';

const API_BASE = ''; // Same origin

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

class AuthService {
  private user: AuthUser | null = null;
  private accessToken: string | null = null;

  async login(email: string, password: string, deviceName?: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE}/auth/login`, {
        email,
        password,
        deviceName
      });
      
      this.accessToken = response.data.accessToken;
      this.user = response.data.user;
      
      // Store refresh token in localStorage for persistence across reloads
      // (Though the server also sets it as an httpOnly cookie)
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async refresh(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');

    try {
      const response = await axios.post<{ accessToken: string, refreshToken: string }>(`${API_BASE}/auth/refresh`, {
        refreshToken
      });
      
      this.accessToken = response.data.accessToken;
      localStorage.setItem('refreshToken', response.data.refreshToken);
      return this.accessToken;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await axios.post(`${API_BASE}/auth/logout`, { refreshToken });
    } catch (e) {
      // Ignore
    }
    this.user = null;
    this.accessToken = null;
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }

  getAccessToken() {
    return this.accessToken;
  }

  getUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.accessToken;
  }
}

export const authService = new AuthService();

// Axios interceptor for Zero Trust API Gateway
axios.interceptors.request.use(
  async (config) => {
    if (config.url?.includes('/api-gateway')) {
      let token = authService.getAccessToken();
      if (!token) {
        // Try to refresh if we have a refresh token
        try {
          token = await authService.refresh();
        } catch (e) {
          // Redirect to login if refresh fails
        }
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url?.includes('/api-gateway')) {
      originalRequest._retry = true;
      try {
        const token = await authService.refresh();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (e) {
        authService.logout();
      }
    }
    return Promise.reject(error);
  }
);
