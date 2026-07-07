<template>
  <div class="min-h-screen text-slate-800 dark:text-slate-200 flex flex-col">
    <!-- Offline Indicator Banner -->
    <div
      v-if="!isOnline"
      class="bg-amber-600 text-white text-[10px] font-bold py-1.5 px-4 text-center flex items-center justify-center gap-1.5 tracking-wider shadow-inner shrink-0 z-50"
    >
      <WifiOffIcon class="w-3.5 h-3.5" />
      OFLAYN REJIM: INTERNET ALOQASI YO'Q. BARCHA AMALLAR NAVBATGA SAQLANADI.
    </div>

    <!-- Unauthenticated Layout (e.g., Login Page) -->
    <router-view v-if="!authStore.isAuthenticated" class="flex-1" />

    <!-- Authenticated SaaS Layout -->
    <div v-else class="flex-1 flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <!-- Sidebar Navigation -->
      <Sidebar
        :mobile-open="mobileSidebarOpen"
        @toggle-mobile="toggleMobileSidebar"
        @close-mobile="closeMobileSidebar"
      />

      <!-- Main Layout Body -->
      <div class="flex-1 flex flex-col lg:pl-64 min-w-0">
        <!-- Top Nav Header -->
        <Header @toggle-sidebar="toggleMobileSidebar" />

        <!-- Router View Contents -->
        <main class="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto pb-10">
          <router-view v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </router-view>
        </main>
      </div>
    </div>

    <!-- PWA Update Notification Alert -->
    <div
      v-if="needRefresh"
      class="fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-2xl bg-slate-900 border border-slate-800 text-white max-w-sm flex flex-col gap-3"
    >
      <div class="flex items-start gap-3">
        <div class="p-2 rounded-lg bg-primary-600/10 text-primary-400">
          <RefreshIcon class="w-5 h-5 animate-spin-slow" />
        </div>
        <div>
          <h4 class="text-xs font-bold">Yangi versiya mavjud!</h4>
          <p class="text-[10px] text-slate-400 mt-0.5">Tizimga yangilanish kiritildi. Hozir yangilansinmi?</p>
        </div>
      </div>
      <div class="flex justify-end gap-2 text-[10px] font-bold">
        <button
          @click="needRefresh = false"
          class="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          Keyinroq
        </button>
        <button
          @click="updateServiceWorker"
          class="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors"
        >
          Hozir yangilash
        </button>
      </div>
    </div>

    <!-- Floating Global Toasts -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useSettingsStore } from './stores/settings';
import { useReportsStore } from './stores/reports';
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { syncOfflineQueue } from './utils/offlineQueue';
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';
import Toast from './components/Toast.vue';
import {
  RefreshCw as RefreshIcon,
  WifiOff as WifiOffIcon
} from 'lucide-vue-next';

const authStore = useAuthStore();
const settingsStore = useSettingsStore();

// Initialize default Auth headers from localStorage tokens immediately on boot
authStore.initAuth();

// PWA service worker check
const { needRefresh, updateServiceWorker } = useRegisterSW();

// Offline status tracking and synchronization
const isOnline = ref(navigator.onLine);
const mobileSidebarOpen = ref(false);

const toggleMobileSidebar = () => {
  mobileSidebarOpen.value = !mobileSidebarOpen.value;
};

const closeMobileSidebar = () => {
  mobileSidebarOpen.value = false;
};

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
  if (isOnline.value) {
    // Connection restored! Auto-synchronize pending operations
    syncOfflineQueue(() => {
      // Refresh inventory, sales, installments, and dashboard stats
      try {
        const reportsStore = useReportsStore();
        reportsStore.fetchDashboardStats();
      } catch (err) {
        console.error('Failed to reload dashboard stats:', err.message);
      }
    });
  }
};

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  if (authStore.isAuthenticated) {
    authStore.fetchProfile();
    settingsStore.fetchSettings();
  }
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>

<style>
/* Global Router Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}
</style>
