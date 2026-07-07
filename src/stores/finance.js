import { defineStore } from 'pinia';
import axios from 'axios';
import { useNotificationStore } from './notifications';

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    receipts: [],
    payments: [],
    expenses: [],
    loading: false,
    dailyReceipts: 0,
    monthlyReceipts: 0,
    dailyPayments: 0,
    monthlyPayments: 0,
    dailyExpenses: 0,
    monthlyExpenses: 0,
    categoryExpenses: {}
  }),
  actions: {
    // Receipts (Cash In)
    async fetchReceipts(params = {}) {
      this.loading = true;
      try {
        const res = await axios.get('/api/money/receipts', { params });
        this.receipts = res.data.data;
        this.dailyReceipts = res.data.dailyTotal;
        this.monthlyReceipts = res.data.monthlyTotal;
      } catch (error) {
        useNotificationStore().error('Financials', 'Failed to retrieve receipts');
      } finally {
        this.loading = false;
      }
    },
    async receiveMoney(data) {
      try {
        await axios.post('/api/money/receipts', data);
        useNotificationStore().success('Success', 'Cash receipt logged successfully');
        return true;
      } catch (error) {
        useNotificationStore().error('Error', 'Failed to log receipt');
        return false;
      }
    },

    // Payments (Cash Out)
    async fetchPayments(params = {}) {
      this.loading = true;
      try {
        const res = await axios.get('/api/money/payments', { params });
        this.payments = res.data.data;
        this.dailyPayments = res.data.dailyTotal;
        this.monthlyPayments = res.data.monthlyTotal;
      } catch (error) {
        useNotificationStore().error('Financials', 'Failed to retrieve payments');
      } finally {
        this.loading = false;
      }
    },
    async payMoney(data) {
      try {
        await axios.post('/api/money/payments', data);
        useNotificationStore().success('Success', 'Cash payment logged successfully');
        return true;
      } catch (error) {
        useNotificationStore().error('Error', 'Failed to log payment');
        return false;
      }
    },

    // Expenses
    async fetchExpenses(params = {}) {
      this.loading = true;
      try {
        const res = await axios.get('/api/money/expenses', { params });
        this.expenses = res.data.data;
        this.dailyExpenses = res.data.dailyTotal;
        this.monthlyExpenses = res.data.monthlyTotal;
        this.categoryExpenses = res.data.categoryTotals || {};
      } catch (error) {
        useNotificationStore().error('Financials', 'Failed to retrieve expenses');
      } finally {
        this.loading = false;
      }
    },
    async createExpense(data) {
      try {
        await axios.post('/api/money/expenses', data);
        useNotificationStore().success('Success', 'Expense logged successfully');
        return true;
      } catch (error) {
        useNotificationStore().error('Error', 'Failed to log expense');
        return false;
      }
    },
    async deleteExpense(id) {
      try {
        await axios.delete(`/api/money/expenses/${id}`);
        useNotificationStore().success('Success', 'Expense deleted');
        return true;
      } catch (error) {
        useNotificationStore().error('Error', 'Failed to delete expense');
        return false;
      }
    }
  }
});
