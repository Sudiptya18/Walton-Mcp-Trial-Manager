import { defineStore } from 'pinia';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token,
    isAdmin: (s) => s.user?.role === 'admin',
  },
  actions: {
    async login(username, password, remember) {
      const { data } = await api.post('/api/auth/login', { username, password });
      this.token = data.token;
      this.user = data.user;
      if (data.csrfToken) sessionStorage.setItem('csrfToken', data.csrfToken);
      if (remember) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    },
    async logout() {
      try {
        await api.post('/api/auth/logout');
      } catch {
        /* ignore */
      }
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('csrfToken');
    },
    async fetchProfile() {
      const { data } = await api.get('/api/auth/profile');
      this.user = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
    },
    hydrate() {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const user = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (token) this.token = token;
      if (user) this.user = JSON.parse(user);
    },
  },
});
