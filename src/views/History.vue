<template>
  <div class="space-y-6" ref="viewRef">
    <!-- Filters Header -->
    <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div class="flex flex-wrap gap-2 items-center w-full sm:w-auto">
        <div class="relative w-full sm:w-64">
          <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="filters.search"
            @input="handleSearch"
            type="text"
            placeholder="Harakat tavsifi, foydalanuvchi nomi..."
            class="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
          />
        </div>

        <input
          v-model="filters.startDate"
          type="date"
          @change="fetchLogs"
          class="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
        />

        <span class="text-xs text-slate-400">dan</span>

        <input
          v-model="filters.endDate"
          type="date"
          @change="fetchLogs"
          class="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
        />
      </div>

      <!-- Export Button -->
      <button
        @click="exportToCSV"
        class="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border dark:border-slate-850 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
      >
        <ExportIcon class="w-4 h-4" />
        CSV yuklab olish
      </button>
    </div>

    <!-- Logs Table -->
    <div class="glass-card border rounded-2xl overflow-hidden">
      <SkeletonTable v-if="loading" :rows="8" />
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200/50 dark:border-slate-800/40 text-slate-500">
              <th class="p-4">Sana va vaqt</th>
              <th class="p-4">Amal</th>
              <th class="p-4">Batafsil tavsif</th>
              <th class="p-4">Tomonidan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/40">
            <tr v-if="logs.length === 0">
              <td colspan="4" class="p-8 text-center text-slate-400">
                Tizim faollik jurnali topilmadi.
              </td>
            </tr>
            <tr
              v-for="log in logs"
              :key="log._id"
              class="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
            >
              <td class="p-4 text-slate-400 font-mono text-[10px]">
                {{ formatDate(log.date) }}
              </td>
              <td class="p-4">
                <span
                  class="px-2 py-0.5 rounded-full text-[9px] font-bold"
                  :class="getActionClasses(log.action)"
                >
                  {{ log.action }}
                </span>
              </td>
              <td class="p-4 text-slate-700 dark:text-slate-300">
                {{ log.details }}
              </td>
              <td class="p-4 text-slate-500 font-semibold">
                {{ log.username || 'System' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-4 py-3 border-t border-slate-200/50 dark:border-slate-800/40 flex items-center justify-between">
        <span class="text-[10px] text-slate-400">
          Sahifa {{ filters.page }} / {{ totalPages }} (jami {{ totalLogs }} ta faollik)
        </span>
        <div class="flex items-center gap-2">
          <button
            @click="changePage(filters.page - 1)"
            :disabled="filters.page === 1"
            class="p-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button
            @click="changePage(filters.page + 1)"
            :disabled="filters.page === totalPages"
            class="p-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import SkeletonTable from '../components/SkeletonTable.vue';
import { useNotificationStore } from '../stores/notifications';
import {
  Search as SearchIcon,
  Download as ExportIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next';
import gsap from 'gsap';

const viewRef = ref(null);
const loading = ref(false);
const logs = ref([]);
const totalLogs = ref(0);
const totalPages = ref(1);

const filters = reactive({
  search: '',
  startDate: '',
  endDate: '',
  page: 1,
  limit: 20
});

const getActionClasses = (action) => {
  switch (action) {
    case 'User Login':
    case 'Phone Sold':
    case 'Money Received':
      return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10';
    case 'Phone Added':
    case 'Accessory Added':
      return 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-500/10';
    case 'Expense Added':
    case 'Money Paid':
      return 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-500/10';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-500/10';
  }
};

const fetchLogs = async () => {
  loading.value = true;
  try {
    const res = await axios.get('/api/history', { params: filters });
    logs.value = res.data.data;
    totalLogs.value = res.data.total;
    totalPages.value = res.data.pages;
  } catch (error) {
    useNotificationStore().error('Audit Log', 'Failed to retrieve history logs');
  } finally {
    loading.value = false;
  }
};

let debounceTimeout;
const handleSearch = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    filters.page = 1;
    fetchLogs();
  }, 300);
};

const changePage = (page) => {
  filters.page = page;
  fetchLogs();
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString();
};

const exportToCSV = () => {
  if (logs.value.length === 0) return;
  
  const headers = ['Timestamp', 'Action', 'Details', 'Operator'];
  const rows = logs.value.map(log => [
    new Date(log.date).toISOString(),
    log.action,
    `"${log.details.replace(/"/g, '""')}"`,
    log.username || 'System'
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `system_audit_logs_${new Date().toISOString().substring(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(() => {
  fetchLogs();

  gsap.from(viewRef.value.children, {
    duration: 0.5,
    opacity: 0,
    y: 10,
    ease: 'power1.out'
  });
});
</script>
