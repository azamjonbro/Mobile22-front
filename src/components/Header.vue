<template>
  <header class="h-16 border-b border-slate-200/50 dark:border-slate-800/50 glass-card px-6 flex items-center justify-between sticky top-0 z-30">
    <!-- Left: Sidebar Toggle (mobile) & Title -->
    <div class="flex items-center gap-3">
      <button
        @click="$emit('toggle-sidebar')"
        class="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden cursor-pointer"
      >
        <MenuIcon class="w-5 h-5" />
      </button>
      <h2 class="text-lg font-bold text-slate-800 dark:text-white capitalize">
        {{ pageTitle }}
      </h2>
    </div>

    <!-- Right: Theme, Alerts, Search, User Info -->
    <div class="flex items-center gap-4">
      <!-- Dark Mode Switcher -->
      <button
        @click="toggleDark"
        class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
        title="Toggle Theme"
      >
        <SunIcon v-if="isDark" class="w-5 h-5 text-amber-500" />
        <MoonIcon v-else class="w-5 h-5 text-slate-600" />
      </button>

      <!-- Low Stock Alerts Notification Dropdown -->
      <div class="relative">
        <button
          @click="showNotificationDropdown = !showNotificationDropdown"
          class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors relative cursor-pointer"
          title="Stock Alerts"
        >
          <BellIcon class="w-5 h-5" />
          <span
            v-if="lowStockItems.length > 0"
            class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950 animate-pulse"
          ></span>
        </button>

        <!-- Dropdown Dialog -->
        <div
          v-if="showNotificationDropdown"
          v-outside-click="closeDropdown"
          class="absolute right-0 mt-2 w-80 glass-card border rounded-2xl shadow-xl z-50 py-2 text-sm"
        >
          <div class="px-4 py-2 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
            <span class="font-bold text-slate-800 dark:text-white">Ombor ogohlantirishlari</span>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
              {{ lowStockItems.length }} ta ogohlantirish
            </span>
          </div>
          
          <div class="max-h-64 overflow-y-auto">
            <div v-if="lowStockItems.length === 0" class="px-4 py-8 text-center text-slate-400">
              <CheckCircleIcon class="w-8 h-8 mx-auto text-emerald-500/60 mb-2" />
              Omborda kamchiliklar yo'q
            </div>
            <router-link
              v-for="item in lowStockItems"
              :key="item._id"
              to="/accessories?lowStock=true"
              @click="showNotificationDropdown = false"
              class="block px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors border-b border-slate-100/50 dark:border-slate-900/20 last:border-b-0"
            >
              <div class="flex justify-between items-start gap-2">
                <p class="font-medium text-xs text-slate-800 dark:text-slate-200 line-clamp-2">
                  {{ item.name }}
                </p>
                <span class="text-[10px] font-bold text-rose-500 shrink-0">
                  Soni: {{ item.quantity }}
                </span>
              </div>
              <p class="text-[10px] text-slate-400 mt-1">Kategoriya: {{ item.category }} (Chegara: {{ item.stockAlert }})</p>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAccessoriesStore } from '../stores/accessories';
import { useDark, useToggle } from '@vueuse/core';
import {
  Menu as MenuIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Bell as BellIcon,
  CheckCircle as CheckCircleIcon
} from 'lucide-vue-next';

defineEmits(['toggle-sidebar']);

const route = useRoute();
const accStore = useAccessoriesStore();
const showNotificationDropdown = ref(false);

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: ''
});
const toggleDark = useToggle(isDark);

const pageTitle = computed(() => {
  if (route.path === '/') return 'Boshqaruv paneli';
  switch (route.name) {
    case 'PhoneInventory': return 'Telefonlar ombori';
    case 'Accessories': return 'Aksessuarlar';
    case 'PhoneBuyback': return 'Telefon sotib olish';
    case 'SellPhones': return 'Telefon sotish';
    case 'ReceiveMoney': return 'Pul qabul qilish';
    case 'PayMoney': return 'Pul to\'lash';
    case 'Expenses': return 'Xarajatlar';
    case 'History': return 'Amallar tarixi';
    case 'Reports': return 'Hisobotlar';
    case 'Users': return 'Foydalanuvchilar';
    case 'Settings': return 'Sozlamalar';
    default: return route.name ? route.name.replace(/([A-Z])/g, ' $1').trim() : '';
  }
});

const lowStockItems = computed(() => {
  return accStore.accessories.filter(item => item.quantity <= item.stockAlert);
});

const closeDropdown = () => {
  showNotificationDropdown.value = false;
};

// Custom directive for clicking outside the dropdown to close it
const vOutsideClick = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target) || event.target.closest('button'))) {
        binding.value();
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  }
};

onMounted(() => {
  // Load accessories to fetch stock alerts immediately
  accStore.fetchAccessories({ limit: 100 });
});
</script>
