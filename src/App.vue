<template>
  <div class="min-h-screen text-slate-800 dark:text-slate-200">
    <!-- Unauthenticated Layout (e.g., Login Page) -->
    <router-view v-if="!authStore.isAuthenticated" />

    <!-- Authenticated SaaS Layout -->
    <div v-else class="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
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
        <main class="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          <router-view v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </router-view>
        </main>
      </div>
    </div>

    <!-- Floating Global Toasts -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useSettingsStore } from './stores/settings';
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';
import Toast from './components/Toast.vue';

const authStore = useAuthStore();
const settingsStore = useSettingsStore();

// Initialize default Auth headers from localStorage tokens immediately on boot
authStore.initAuth();

const mobileSidebarOpen = ref(false);

const toggleMobileSidebar = () => {
  mobileSidebarOpen.value = !mobileSidebarOpen.value;
};

const closeMobileSidebar = () => {
  mobileSidebarOpen.value = false;
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.fetchProfile();
    settingsStore.fetchSettings();
  }
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
</style>
