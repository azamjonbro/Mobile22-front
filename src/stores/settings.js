import { defineStore } from 'pinia';
import axios from 'axios';
import { useNotificationStore } from './notifications';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: {
      shopName: 'Antigravity Mobile Solutions',
      currency: 'USD',
      lowStockThreshold: 5,
      receiptFooter: ''
    },
    loading: false
  }),
  actions: {
    async fetchSettings() {
      this.loading = true;
      try {
        const res = await axios.get('/api/settings');
        this.settings = res.data.data;
      } catch (error) {
        console.error('Failed to load store settings:', error.message);
      } finally {
        this.loading = false;
      }
    },
    async updateSettings(data) {
      try {
        const res = await axios.put('/api/settings', data);
        this.settings = res.data.data;
        useNotificationStore().success('Success', 'Shop configurations saved');
        return true;
      } catch (error) {
        useNotificationStore().error('Error', 'Failed to update settings');
        return false;
      }
    }
  }
});
