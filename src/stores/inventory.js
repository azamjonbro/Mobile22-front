import { defineStore } from 'pinia';
import axios from 'axios';
import { useNotificationStore } from './notifications';

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    phones: [],
    suppliers: [],
    loading: false,
    totalPhones: 0,
    pages: 1,
    currentPage: 1
  }),
  actions: {
    async fetchPhones(params = {}) {
      this.loading = true;
      try {
        const res = await axios.get('/api/phones', { params });
        this.phones = res.data.data;
        this.totalPhones = res.data.total;
        this.pages = res.data.pages;
        this.currentPage = res.data.currentPage;
      } catch (error) {
        useNotificationStore().error('Inventory Error', 'Failed to fetch phones');
      } finally {
        this.loading = false;
      }
    },
    async createPhone(phoneData) {
      try {
        const res = await axios.post('/api/phones', phoneData);
        useNotificationStore().success('Success', 'Phone added successfully');
        return res.data.success;
      } catch (error) {
        useNotificationStore().error('Error', error.response?.data?.message || 'Failed to add phone');
        return false;
      }
    },
    async updatePhone(id, phoneData) {
      try {
        const res = await axios.put(`/api/phones/${id}`, phoneData);
        useNotificationStore().success('Success', 'Phone inventory updated');
        return res.data.success;
      } catch (error) {
        useNotificationStore().error('Error', error.response?.data?.message || 'Failed to update phone');
        return false;
      }
    },
    async deletePhone(id) {
      try {
        await axios.delete(`/api/phones/${id}`);
        useNotificationStore().success('Success', 'Phone deleted from catalog');
        return true;
      } catch (error) {
        useNotificationStore().error('Error', 'Failed to delete phone');
        return false;
      }
    },
    async fetchSuppliers() {
      try {
        const res = await axios.get('/api/purchases/suppliers');
        this.suppliers = res.data.data;
      } catch (error) {
        console.error('Failed to load suppliers:', error.message);
      }
    },
    async createSupplier(supplierData) {
      try {
        const res = await axios.post('/api/purchases/suppliers', supplierData);
        useNotificationStore().success('Success', 'Supplier registered');
        this.suppliers.push(res.data.data);
        return res.data.data;
      } catch (error) {
        useNotificationStore().error('Error', error.response?.data?.message || 'Failed to add supplier');
        return null;
      }
    },
    async receivePhones(purchaseData) {
      this.loading = true;
      try {
        const res = await axios.post('/api/purchases', purchaseData);
        const isBuyback = !!purchaseData.customerName;
        const title = isBuyback ? 'Purchase Complete' : 'Restock Successful';
        const msg = isBuyback
          ? `Bought back ${res.data.phonesCreated} phone(s) from customer`
          : `Received ${res.data.phonesCreated} phones`;
        useNotificationStore().success(title, msg);
        return true;
      } catch (error) {
        useNotificationStore().error('Transaction Failed', error.response?.data?.message || 'Failed to process purchase');
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});
