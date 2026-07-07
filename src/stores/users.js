import { defineStore } from 'pinia';
import axios from 'axios';
import { useNotificationStore } from './notifications';

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    loading: false
  }),
  actions: {
    async fetchUsers() {
      this.loading = true;
      try {
        const res = await axios.get('/api/users');
        this.users = res.data.data;
      } catch (error) {
        useNotificationStore().error('Users', 'Failed to retrieve accounts');
      } finally {
        this.loading = false;
      }
    },
    async createUser(userData) {
      try {
        await axios.post('/api/users', userData);
        useNotificationStore().success('Success', 'User profile created');
        await this.fetchUsers();
        return true;
      } catch (error) {
        useNotificationStore().error('Error', error.response?.data?.message || 'Failed to create user');
        return false;
      }
    },
    async updateUser(id, userData) {
      try {
        await axios.put(`/api/users/${id}`, userData);
        useNotificationStore().success('Success', 'User profile updated');
        await this.fetchUsers();
        return true;
      } catch (error) {
        useNotificationStore().error('Error', 'Failed to update user');
        return false;
      }
    },
    async resetPassword(id, password) {
      try {
        await axios.post(`/api/users/${id}/reset-password`, { password });
        useNotificationStore().success('Success', 'Password reset successfully');
        return true;
      } catch (error) {
        useNotificationStore().error('Error', error.response?.data?.message || 'Failed to reset password');
        return false;
      }
    },
    async deleteUser(id) {
      try {
        await axios.delete(`/api/users/${id}`);
        useNotificationStore().success('Success', 'User profile removed');
        await this.fetchUsers();
        return true;
      } catch (error) {
        useNotificationStore().error('Error', error.response?.data?.message || 'Failed to delete user');
        return false;
      }
    }
  }
});
