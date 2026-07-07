import { defineStore } from 'pinia';
import axios from 'axios';
import { useNotificationStore } from './notifications';

export const useReportsStore = defineStore('reports', {
  state: () => ({
    dashboardStats: {
      todaySales: 0,
      todayPurchases: 0,
      todayExpenses: 0,
      todayReceived: 0,
      todayPaid: 0,
      phonesInStock: 0,
      accessoriesInStock: 0,
      activeInstallments: 0,
      overdueInstallments: 0,
      totalInstallmentDebt: 0,
      todayInstallmentPayments: 0
    },
    chartData: [],
    recentActivities: [],
    reportsSummary: {
      totalSales: 0,
      totalCost: 0,
      phoneProfit: 0,
      totalExpenses: 0,
      totalReceipts: 0,
      totalPayments: 0,
      netProfitLoss: 0,
      profitStatus: 'Profit'
    },
    topPhones: [],
    topAccessories: [],
    loading: false
  }),
  actions: {
    async fetchDashboardStats() {
      this.loading = true;
      try {
        const res = await axios.get('/api/reports/dashboard');
        this.dashboardStats = res.data.stats;
        this.chartData = res.data.chartData;
        this.recentActivities = res.data.recentActivities;
      } catch (error) {
        console.error('Failed to load dashboard statistics:', error.message);
      } finally {
        this.loading = false;
      }
    },
    async fetchAnalyticsReports(params = {}) {
      this.loading = true;
      try {
        const res = await axios.get('/api/reports/analytics', { params });
        this.reportsSummary = {
          ...res.data.summary,
          dates: res.data.dates
        };
        this.topPhones = res.data.topPhones;
        this.topAccessories = res.data.topAccessories;
      } catch (error) {
        useNotificationStore().error('Analytics', 'Failed to load report analysis');
      } finally {
        this.loading = false;
      }
    }
  }
});
