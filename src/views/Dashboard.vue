<template>
  <div class="space-y-6" ref="dashboardRef">
    <!-- Quick Actions Panel -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
      <router-link
        v-for="action in quickActions"
        :key="action.name"
        :to="action.path"
        v-show="action.show"
        class="flex flex-col items-center justify-center p-4 rounded-2xl glass-card border border-slate-200/50 dark:border-slate-800/40 text-center hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:-translate-y-0.5 transition-all group"
      >
        <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform text-slate-700 dark:text-slate-200">
          <component :is="action.icon" class="w-5 h-5" />
        </div>
        <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {{ action.name }}
        </span>
      </router-link>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Bugungi sotuvlar"
        :value="formatCurrency(stats.todaySales)"
        :icon="SalesIcon"
        color="purple"
      />
      <StatCard
        title="Bugungi xaridlar"
        :value="formatCurrency(stats.todayPurchases)"
        :icon="PurchasesIcon"
        color="amber"
      />
      <StatCard
        title="Bugungi xarajatlar"
        :value="formatCurrency(stats.todayExpenses)"
        :icon="ExpensesIcon"
        color="rose"
      />
      <StatCard
        title="Qabul qilingan pullar"
        :value="formatCurrency(stats.todayReceived)"
        :icon="CashInIcon"
        color="emerald"
      />
      <StatCard
        title="To'langan pullar"
        :value="formatCurrency(stats.todayPaid)"
        :icon="CashOutIcon"
        color="rose"
      />
      <StatCard
        title="Ombordagi telefonlar"
        :value="stats.phonesInStock"
        :icon="PhoneIcon"
        color="blue"
      />
      <StatCard
        title="Ombordagi aksessuarlar"
        :value="stats.accessoriesInStock"
        :icon="AccessoriesIcon"
        color="purple"
      />
      <StatCard
        title="Faol nasiyalar"
        :value="stats.activeInstallments || 0"
        :icon="WalletIcon"
        color="blue"
      />
      <StatCard
        title="Nasiya qarzi"
        :value="formatCurrency(stats.totalInstallmentDebt)"
        :icon="WalletIcon"
        color="amber"
      />
      <StatCard
        title="Bugungi nasiya to'lovlari"
        :value="formatCurrency(stats.todayInstallmentPayments)"
        :icon="WalletIcon"
        color="emerald"
      />
      <StatCard
        title="Muddati o'tgan nasiyalar"
        :value="stats.overdueInstallments || 0"
        :icon="WalletIcon"
        color="rose"
      />
    </div>

    <!-- Charts and Timelines -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Activity Chart -->
      <div class="lg:col-span-2 p-6 rounded-2xl glass-card border flex flex-col justify-between">
        <CustomChart :chart-data="reportsStore.chartData" />
      </div>

      <!-- Recent Activities Timeline -->
      <div class="p-6 rounded-2xl glass-card border flex flex-col h-[23.5rem]">
        <h3 class="text-sm font-bold text-slate-800 dark:text-white mb-4">
          So'nggi faollik xronologiyasi
        </h3>
        
        <div class="flex-1 overflow-y-auto pr-1 relative">
          <div v-if="reportsStore.recentActivities.length === 0" class="text-center text-slate-400 py-12">
            Yaqin orada amallar qayd etilmadi
          </div>

          <!-- Timeline entries -->
          <div class="space-y-4 relative pl-4 border-l border-slate-200 dark:border-slate-800">
            <div
              v-for="act in reportsStore.recentActivities"
              :key="act._id"
              class="relative text-xs space-y-1"
            >
              <!-- Timeline Dot -->
              <span class="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border bg-white dark:bg-slate-900 border-primary-500"></span>
              
              <div class="flex items-center justify-between gap-2">
                <span class="font-bold text-slate-800 dark:text-slate-200">
                  {{ act.action }}
                </span>
                <span class="text-[10px] text-slate-400">
                  {{ formatTime(act.date) }}
                </span>
              </div>
              <p class="text-slate-500 dark:text-slate-400">{{ act.details }}</p>
              <p class="text-[10px] font-medium text-slate-400">Tomonidan: {{ act.username || 'Tizim' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useReportsStore } from '../stores/reports';
import StatCard from '../components/StatCard.vue';
import CustomChart from '../components/CustomChart.vue';
import {
  Upload as SalesIcon,
  Download as PurchasesIcon,
  Receipt as ExpensesIcon,
  PlusCircle as CashInIcon,
  MinusCircle as CashOutIcon,
  Smartphone as PhoneIcon,
  Tag as AccessoriesIcon,
  Wallet as WalletIcon,
  FileSpreadsheet as HistoryIcon,
  Settings as SettingsIcon,
  Users as UsersIcon
} from 'lucide-vue-next';
import gsap from 'gsap';

const authStore = useAuthStore();
const reportsStore = useReportsStore();
const dashboardRef = ref(null);

const stats = computed(() => reportsStore.dashboardStats);

const quickActions = computed(() => [
  { name: 'Telefon sotib olish', path: '/receive-phones', icon: PurchasesIcon, show: authStore.hasPermission('inventory:write') },
  { name: 'Telefon sotish', path: '/sell-phones', icon: SalesIcon, show: authStore.hasPermission('sales') },
  { name: 'Xarajat kiritish', path: '/expenses', icon: ExpensesIcon, show: authStore.hasPermission('expenses') },
  { name: 'Pul qabul qilish', path: '/receive-money', icon: CashInIcon, show: authStore.hasPermission('sales') },
  { name: 'Pul to\'lash', path: '/pay-money', icon: CashOutIcon, show: authStore.hasPermission('inventory:write') }
]);

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
};

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  reportsStore.fetchDashboardStats();

  // GSAP animation
  gsap.from(dashboardRef.value.children, {
    duration: 0.6,
    opacity: 0,
    y: 15,
    stagger: 0.08,
    ease: 'power2.out'
  });
});
</script>
