<template>
  <!-- Mobile Sidebar Toggle Backdrop -->
  <div
    v-if="mobileOpen"
    @click="$emit('toggle-mobile')"
    class="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
  ></div>

  <!-- Sidebar Container -->
  <aside
    class="fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 glass-panel transition-transform duration-300 lg:translate-x-0"
    :class="[mobileOpen ? 'translate-x-0' : '-translate-x-full']"
  >
    <!-- Brand / Logo -->
    <div class="flex items-center gap-3 px-6 py-5 border-b border-slate-200/50 dark:border-slate-800/50">
      <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 shadow-md shadow-primary-500/20 text-white">
        <SmartphoneIcon class="w-5 h-5" />
      </div>
      <div>
        <h1 class="text-sm font-bold tracking-wide text-slate-800 dark:text-slate-100">
          PhoneCRM
        </h1>
        <p class="text-[10px] text-slate-400 font-medium">v1.0 Enterprise</p>
      </div>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 px-4 py-6 overflow-y-auto space-y-1">
      <template v-for="item in menuItems" :key="item.name">
        <router-link
          v-if="item.show"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group duration-200"
          :class="[
            $route.path === item.path
              ? 'bg-gradient-to-r from-primary-600/10 to-indigo-600/5 dark:from-primary-500/15 dark:to-indigo-500/5 text-primary-600 dark:text-primary-400 shadow-sm border border-primary-500/10'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
          ]"
          @click="$emit('close-mobile')"
        >
          <component
            :is="item.icon"
            class="w-5 h-5 transition-transform duration-200 group-hover:scale-105"
            :class="[
              $route.path === item.path ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
            ]"
          />
          {{ item.name }}
        </router-link>
      </template>
    </nav>

    <!-- User Profile & Log out footer -->
    <div class="p-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-3">
      <div class="flex items-center gap-3 px-2">
        <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {{ userInitials }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{{ authStore.user?.name }}</p>
          <p class="text-[10px] text-slate-400 dark:text-slate-500 truncate">{{ authStore.user?.role }}</p>
        </div>
      </div>

      <button
        @click="handleLogout"
        class="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all border border-rose-200/30 dark:border-rose-900/10 cursor-pointer"
      >
        <LogOutIcon class="w-4 h-4" />
        Chiqish
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {
  LayoutDashboard as DashboardIcon,
  Smartphone as SmartphoneIcon,
  Tag as AccessoriesIcon,
  Download as ReceiveIcon,
  Upload as SellIcon,
  PlusCircle as CashInIcon,
  MinusCircle as CashOutIcon,
  Receipt as ExpensesIcon,
  History as HistoryIcon,
  BarChart3 as ReportsIcon,
  Users as UsersIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
  Wallet as WalletIcon
} from 'lucide-vue-next';

defineProps({
  mobileOpen: Boolean
});

const emit = defineEmits(['toggle-mobile', 'close-mobile']);

const authStore = useAuthStore();
const router = useRouter();

const userInitials = computed(() => {
  if (!authStore.user?.name) return 'U';
  return authStore.user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
});

const menuItems = computed(() => [
  { name: 'Boshqaruv paneli', path: '/', icon: DashboardIcon, show: true },
  { name: 'Telefonlar ombori', path: '/inventory', icon: SmartphoneIcon, show: true },
  { name: 'Aksessuarlar', path: '/accessories', icon: AccessoriesIcon, show: true },
  { name: 'Telefon sotib olish', path: '/receive-phones', icon: ReceiveIcon, show: authStore.hasPermission('inventory:write') },
  { name: 'Telefon sotish', path: '/sell-phones', icon: SellIcon, show: authStore.hasPermission('sales') },
  { name: 'Nasiya', path: '/installments', icon: WalletIcon, show: authStore.hasPermission('sales') },
  { name: 'Pul qabul qilish', path: '/receive-money', icon: CashInIcon, show: authStore.hasPermission('sales') },
  { name: 'Pul to\'lash', path: '/pay-money', icon: CashOutIcon, show: authStore.hasPermission('inventory:write') },
  { name: 'Xarajatlar', path: '/expenses', icon: ExpensesIcon, show: authStore.hasPermission('expenses') },
  { name: 'Amallar tarixi', path: '/history', icon: HistoryIcon, show: true },
  { name: 'Hisobotlar', path: '/reports', icon: ReportsIcon, show: authStore.hasPermission('reports') },
  { name: 'Foydalanuvchilar', path: '/users', icon: UsersIcon, show: authStore.isAdmin },
  { name: 'Sozlamalar', path: '/settings', icon: SettingsIcon, show: authStore.hasPermission('settings') }
]);

const handleLogout = async () => {
  emit('close-mobile');
  await authStore.logout();
  router.push('/login');
};
</script>
