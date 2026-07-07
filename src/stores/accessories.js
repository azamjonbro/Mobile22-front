import { defineStore } from 'pinia';
import axios from 'axios';
import { useNotificationStore } from './notifications';

export const useAccessoriesStore = defineStore('accessories', {
  state: () => ({
    accessories: [],
    loading: false,
    total: 0,
    pages: 1,
    currentPage: 1
  }),
  actions: {
    async fetchAccessories(params = {}) {
      this.loading = true;
      try {
        const res = await axios.get('/api/accessories', { params });
        this.accessories = res.data.data;
        this.total = res.data.total;
        this.pages = res.data.pages;
        this.currentPage = res.data.currentPage;
      } catch (error) {
        useNotificationStore().error('Accessory Error', 'Failed to fetch accessories');
      } finally {
        this.loading = false;
      }
    },
    async createAccessory(data) {
      try {
        const res = await axios.post('/api/accessories', data);
        useNotificationStore().success('Success', 'Accessory added to inventory');
        return res.data.success;
      } catch (error) {
        useNotificationStore().error('Error', error.response?.data?.message || 'Failed to add accessory');
        return false;
      }
    },
    async updateAccessory(id, data) {
      try {
        const res = await axios.put(`/api/accessories/${id}`, data);
        useNotificationStore().success('Success', 'Accessory updated');
        return res.data.success;
      } catch (error) {
        useNotificationStore().error('Error', error.response?.data?.message || 'Failed to update accessory');
        return false;
      }
    },
    async deleteAccessory(id) {
      try {
        await axios.delete(`/api/accessories/${id}`);
        useNotificationStore().success('Success', 'Accessory deleted');
        return true;
      } catch (error) {
        useNotificationStore().error('Error', 'Failed to delete accessory');
        return false;
      }
    }
  }
});
