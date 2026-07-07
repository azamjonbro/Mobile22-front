import { defineStore } from 'pinia';
import axios from 'axios';
import { useNotificationStore } from './notifications';

export const useInstallmentsStore = defineStore('installments', {
  state: () => ({
    installments: [],
    currentInstallment: null,
    stats: {
      activeInstallments: 0,
      overdueInstallments: 0,
      totalInstallmentDebt: 0,
      todayInstallmentPayments: 0,
      monthlyCollected: 0,
      dueTodayCount: 0
    },
    pagination: {
      total: 0,
      page: 1,
      pages: 1
    },
    loading: false
  }),
  actions: {
    async fetchInstallments(filters = {}) {
      this.loading = true;
      try {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.page) params.page = filters.page;
        if (filters.limit) params.limit = filters.limit;

        const res = await axios.get('/api/installments', { params });
        this.installments = res.data.data;
        this.pagination = res.data.pagination;
      } catch (error) {
        useNotificationStore().error('Xatolik', 'Nasiya roʻyxatini yuklashda xatolik');
      } finally {
        this.loading = false;
      }
    },

    async fetchInstallmentById(id) {
      this.loading = true;
      try {
        const res = await axios.get(`/api/installments/${id}`);
        this.currentInstallment = res.data.data;
        return res.data.data;
      } catch (error) {
        useNotificationStore().error('Xatolik', 'Nasiya ma\'lumotlarini yuklashda xatolik');
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createInstallment(data) {
      this.loading = true;
      try {
        if (!navigator.onLine) {
          addToOfflineQueue({
            url: '/api/installments',
            method: 'POST',
            payload: data,
            description: `Nasiya yaratish: ${data.customerName}`
          });
          useNotificationStore().warning('Oflayn rejim', 'Nasiya shartnomasi navbatga qo\'shildi. Internet tiklanganda yuboriladi.');

          // Mock response
          return {
            invoiceNumber: `OFFLINE-INV-${Math.floor(1000 + Math.random() * 9000)}`,
            installment: {
              customerName: data.customerName,
              customerPhone: data.customerPhone,
              totalPrice: Object.values(data.sellingPrices || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0) - (data.discount || 0),
              initialPayment: data.initialPayment,
              remainingDebt: (Object.values(data.sellingPrices || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0) - (data.discount || 0)) - data.initialPayment,
              numberOfMonths: data.numberOfMonths,
              monthlyPayment: Math.ceil(((Object.values(data.sellingPrices || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0) - (data.discount || 0)) - data.initialPayment) / data.numberOfMonths * 100) / 100,
              items: data.phoneIds.map(id => ({ name: 'Telefon (Oflayn)', sellingPrice: data.sellingPrices?.[id] || 0 }))
            }
          };
        }

        const res = await axios.post('/api/installments', data);
        useNotificationStore().success('Muvaffaqiyat', 'Nasiya sotuvi yaratildi');
        return res.data.data;
      } catch (error) {
        useNotificationStore().error('Xatolik', error.response?.data?.message || 'Nasiya yaratishda xatolik');
        return null;
      } finally {
        this.loading = false;
      }
    },

    async receivePayment(id, paymentData) {
      this.loading = true;
      try {
        if (!navigator.onLine) {
          addToOfflineQueue({
            url: `/api/installments/${id}/payments`,
            method: 'POST',
            payload: paymentData,
            description: `To'lov qabul qilish: $${paymentData.amount}`
          });
          useNotificationStore().warning('Oflayn rejim', 'To\'lov navbatga qo\'shildi. Internet tiklanganda serverga yuboriladi.');
          
          if (this.currentInstallment) {
            this.currentInstallment.totalPaid += paymentData.amount;
            this.currentInstallment.remainingDebt = Math.max(0, this.currentInstallment.remainingDebt - paymentData.amount);
            this.currentInstallment.payments.push({
              amount: paymentData.amount,
              date: paymentData.date || new Date().toISOString(),
              method: paymentData.method,
              notes: paymentData.notes + ' (Oflayn)',
              receivedByName: 'Oflayn tizim'
            });
            if (this.currentInstallment.remainingDebt <= 0) {
              this.currentInstallment.status = 'PaidOff';
            }
          }
          return this.currentInstallment;
        }

        const res = await axios.post(`/api/installments/${id}/payments`, paymentData);
        useNotificationStore().success('Muvaffaqiyat', 'To\'lov muvaffaqiyatli qabul qilindi');
        this.currentInstallment = res.data.data;
        return res.data.data;
      } catch (error) {
        useNotificationStore().error('Xatolik', error.response?.data?.message || 'To\'lov qabul qilishda xatolik');
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchStats() {
      try {
        const res = await axios.get('/api/installments/stats');
        this.stats = res.data.data;
      } catch (error) {
        console.error('Failed to load installment stats:', error.message);
      }
    },

    async fetchReport(params = {}) {
      this.loading = true;
      try {
        const res = await axios.get('/api/installments/report', { params });
        return res.data;
      } catch (error) {
        useNotificationStore().error('Xatolik', 'Nasiya hisobotini yuklashda xatolik');
        return null;
      } finally {
        this.loading = false;
      }
    }
  }
});
