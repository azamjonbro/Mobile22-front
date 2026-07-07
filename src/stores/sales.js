import { defineStore } from 'pinia';
import axios from 'axios';
import { useNotificationStore } from './notifications';
import { addToOfflineQueue } from '../utils/offlineQueue';

export const useSalesStore = defineStore('sales', {
  state: () => ({
    sales: [],
    customers: [],
    loading: false
  }),
  actions: {
    async fetchSales() {
      this.loading = true;
      try {
        const res = await axios.get('/api/sales');
        this.sales = res.data.data;
      } catch (error) {
        useNotificationStore().error('Sales History', 'Failed to retrieve sales logs');
      } finally {
        this.loading = false;
      }
    },
    async fetchCustomers() {
      try {
        const res = await axios.get('/api/sales/customers');
        this.customers = res.data.data;
      } catch (error) {
        console.error('Failed to load customers:', error.message);
      }
    },
    async createCustomer(customerData) {
      try {
        const res = await axios.post('/api/sales/customers', customerData);
        useNotificationStore().success('Success', 'Customer registered');
        this.customers.push(res.data.data);
        return res.data.data;
      } catch (error) {
        useNotificationStore().error('Error', 'Failed to add customer');
        return null;
      }
    },
    async processSale(saleData) {
      this.loading = true;
      try {
        if (!navigator.onLine) {
          addToOfflineQueue({
            url: '/api/sales',
            method: 'POST',
            payload: saleData,
            description: `Sotuv: ${saleData.customerName}`
          });
          useNotificationStore().warning('Oflayn rejim', 'Sotuv navbatga qo\'shildi. Internet tiklanganda serverga yuboriladi.');
          
          // Mock response for invoice print overlay
          const totalSelling = Object.values(saleData.sellingPrices || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0);
          return {
            invoiceNumber: `OFFLINE-INV-${Math.floor(1000 + Math.random() * 9000)}`,
            customerName: saleData.customerName || 'Walk-in Customer',
            phoneNumber: saleData.phoneNumber || '',
            phones: saleData.phoneIds.map(id => ({
              phoneId: id,
              brand: 'Telefon',
              model: 'Oflayn sotilgan',
              imei1: 'Oflayn tranzaksiya',
              sellingPrice: saleData.sellingPrices?.[id] || 0
            })),
            discount: saleData.discount,
            totalAmount: Math.max(0, totalSelling - saleData.discount),
            paymentType: saleData.paymentType,
            date: new Date().toISOString()
          };
        }

        const res = await axios.post('/api/sales', saleData);
        useNotificationStore().success('Sale Success', `Invoice generated: ${res.data.data.invoiceNumber}`);
        return res.data.data;
      } catch (error) {
        useNotificationStore().error('Sale Failed', error.response?.data?.message || 'Failed to process transaction');
        return null;
      } finally {
        this.loading = false;
      }
    },
    async fetchSaleByInvoice(invoiceNumber) {
      try {
        const res = await axios.get(`/api/sales/${invoiceNumber}`);
        return res.data.data;
      } catch (error) {
        useNotificationStore().error('Error', 'Invoice not found');
        return null;
      }
    }
  }
});
