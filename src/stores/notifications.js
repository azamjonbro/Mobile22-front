import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    toasts: []
  }),
  actions: {
    add({ type = 'info', title, message, timeout = 3000 }) {
      const id = Math.random().toString(36).substring(2, 9);
      this.toasts.push({ id, type, title, message });

      setTimeout(() => {
        this.remove(id);
      }, timeout);
    },
    success(title, message, timeout) {
      this.add({ type: 'success', title, message, timeout });
    },
    error(title, message, timeout) {
      this.add({ type: 'error', title, message, timeout });
    },
    warning(title, message, timeout) {
      this.add({ type: 'warning', title, message, timeout });
    },
    info(title, message, timeout) {
      this.add({ type: 'info', title, message, timeout });
    },
    remove(id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }
  }
});
