import { defineStore } from 'pinia';
import axios from 'axios';
import { useNotificationStore } from './notifications';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'Admin',
    hasPermission: (state) => (permission) => {
      if (state.user?.role === 'Admin') return true;
      return state.user?.permissions?.includes(permission) || false;
    }
  },
  actions: {
    initAuth() {
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      }
    },
    async login(username, password, rememberMe = false) {
      this.loading = true;
      const notifications = useNotificationStore();
      try {
        const response = await axios.post('/api/auth/login', { username, password, rememberMe });
        const { token, user } = response.data;
        
        this.token = token;
        this.user = user;
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        notifications.success('Welcome Back!', `Logged in successfully as ${user.name}`);
        return true;
      } catch (error) {
        const message = error.response?.data?.message || 'Login failed. Check your credentials.';
        notifications.error('Authentication Error', message);
        return false;
      } finally {
        this.loading = false;
      }
    },
    async fetchProfile() {
      if (!this.token) return;
      try {
        const response = await axios.get('/api/auth/me');
        this.user = response.data.user;
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch (error) {
        console.error('Fetch profile failed:', error.message);
        this.logout();
      }
    },
    async logout() {
      const notifications = useNotificationStore();
      try {
        await axios.post('/api/auth/logout');
      } catch (error) {
        console.error('Logout request failed:', error.message);
      } finally {
        this.token = null;
        this.user = null;
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear PWA offline queue on logout to prevent cross-account sync leaking
        localStorage.removeItem('crm_offline_queue');

        // Clear sensitive PWA cache storage
        if ('caches' in window) {
          try {
            const keys = await caches.keys();
            for (const key of keys) {
              await caches.delete(key);
            }
          } catch (e) {
            console.error('Cache clearing on logout failed:', e.message);
          }
        }

        notifications.info('Logged Out', 'You have been logged out of the system');
      }
    }
  }
});
