import axios from 'axios';
import { useNotificationStore } from '../stores/notifications';

const QUEUE_KEY = 'crm_offline_queue';

export function getOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

export function addToOfflineQueue(item) {
  const queue = getOfflineQueue();
  queue.push({
    ...item,
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function removeFromQueue(id) {
  const queue = getOfflineQueue();
  const filtered = queue.filter(item => item.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
}

export function clearOfflineQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export async function syncOfflineQueue(refreshCallback) {
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  const notifications = useNotificationStore();
  notifications.info('Sinxronizatsiya', `${queue.length} ta oflayn amal sinxronizatsiya qilinmoqda...`);

  let successCount = 0;
  let failCount = 0;

  for (const item of queue) {
    try {
      if (item.method === 'POST' || item.method === 'post') {
        await axios.post(item.url, item.payload);
      } else if (item.method === 'PUT' || item.method === 'put') {
        await axios.put(item.url, item.payload);
      } else if (item.method === 'DELETE' || item.method === 'delete') {
        await axios.delete(item.url);
      }
      removeFromQueue(item.id);
      successCount++;
    } catch (error) {
      console.error('Failed to sync offline item:', item, error.message);
      failCount++;
    }
  }

  if (successCount > 0) {
    notifications.success('Sinxronizatsiya yakunlandi', `${successCount} ta amal muvaffaqiyatli serverga yuborildi!`);
    if (refreshCallback) {
      refreshCallback();
    }
  }

  if (failCount > 0) {
    notifications.error('Sinxronizatsiya xatosi', `${failCount} ta amalni yuborishda xatolik yuz berdi.`);
  }
}
