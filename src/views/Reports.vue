<template>
  <div class="space-y-6" ref="viewRef">
    <!-- Reports Period Selectors -->
    <div class="flex flex-col sm:flex-row gap-4 items-center justify-between no-print">
      <!-- Period toggles -->
      <div class="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 rounded-xl w-full sm:w-auto">
        <button
          v-for="p in ['daily', 'weekly', 'monthly', 'yearly']"
          :key="p"
          @click="changePeriod(p)"
          class="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer"
          :class="[
            period === p
              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          ]"
        >
          {{ translatePeriod(p) }}
        </button>
      </div>

      <!-- Action items -->
      <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          @click="triggerPrint"
          class="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border dark:border-slate-850 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <PrintIcon class="w-4 h-4" />
          Hisobotni chop etish
        </button>
      </div>
    </div>

    <!-- Printable Statement Layout Container -->
    <div class="print-area space-y-6">
      <!-- Statement title (Only visible during print) -->
      <div class="hidden print:block text-center space-y-1 mb-6">
        <h2 class="text-xl font-extrabold uppercase">Moliyaviy hisobot</h2>
        <p class="text-xs text-gray-500">Antigravity Mobile Solutions CRM</p>
        <p class="text-[10px] text-gray-400 font-mono">Davr: {{ formatDate(summary.dates?.start) }} dan {{ formatDate(summary.dates?.end) }} gacha</p>
      </div>

      <!-- Financial Snapshot Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Sales and COGS -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Savdo hisoboti</h4>
          <div class="space-y-2.5 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Tushum (Sotilgan telefonlar):</span>
              <span class="font-bold font-mono text-slate-800 dark:text-white">${{ summary.totalSales.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Sotilgan tovarlar tan narxi (COGS):</span>
              <span class="font-semibold font-mono text-slate-500">-${{ summary.totalCost.toLocaleString() }}</span>
            </div>
            <div class="pt-2 border-t flex justify-between font-bold">
              <span>Yalpi foyda:</span>
              <span class="font-mono text-emerald-600 dark:text-emerald-400">${{ summary.phoneProfit.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Operating Expenses -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Operatsion xarajatlar</h4>
          <div class="space-y-2.5 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">OPEX (Operatsion xarajatlar):</span>
              <span class="font-bold font-mono text-rose-500">-${{ summary.totalExpenses.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Chiqimlar oqimi (To'langan pullar):</span>
              <span class="font-mono text-slate-400">-${{ summary.totalPayments.toLocaleString() }}</span>
            </div>
            <div class="pt-2 border-t flex justify-between font-bold text-slate-600 dark:text-slate-400">
              <span>Kirimlar oqimi (Qabul qilingan pullar):</span>
              <span class="font-mono text-emerald-500">+${{ summary.totalReceipts.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Net Profit/Loss Card -->
        <div
          class="p-6 rounded-2xl border flex flex-col justify-between"
          :class="[
            summary.netProfitLoss >= 0
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-500/5 border-rose-500/20 text-rose-800 dark:text-rose-300'
          ]"
        >
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider opacity-70">Sof foyda / zarar</h4>
            <h2 class="text-3xl font-extrabold font-mono mt-3">
              {{ summary.netProfitLoss >= 0 ? '+' : '-' }}${{ Math.abs(summary.netProfitLoss).toLocaleString() }}
            </h2>
          </div>
          <div class="flex items-center gap-1 text-[10px] font-bold mt-4 uppercase">
            <component
              :is="summary.netProfitLoss >= 0 ? CheckIcon : AlertIcon"
              class="w-4 h-4 shrink-0"
            />
            Yakuniy holat: Tizim operatsiyalari {{ summary.netProfitLoss >= 0 ? 'foydada' : 'zararda' }}
          </div>
        </div>
      </div>

      <!-- Top Sellers Split Screen -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Selling Phones -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <h3 class="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Eng ko'p sotilgan telefon modellari
          </h3>
          <div class="space-y-3">
            <div
              v-for="(phone, index) in reportsStore.topPhones"
              :key="index"
              class="flex items-center justify-between p-3 rounded-xl border dark:border-slate-800/40 text-xs"
            >
              <div>
                <span class="font-bold text-slate-800 dark:text-slate-200">{{ phone.name }}</span>
                <p class="text-[10px] text-slate-400 font-semibold">{{ phone.quantity }} ta sotildi</p>
              </div>
              <div class="text-right font-bold text-primary-600 dark:text-primary-400 font-mono">
                ${{ phone.revenue.toLocaleString() }}
              </div>
            </div>
            <div v-if="reportsStore.topPhones.length === 0" class="text-center py-8 text-xs text-slate-400">
              Ushbu davrda sotuvlar amalga oshirilmagan
            </div>
          </div>
        </div>

        <!-- Top Selling Accessories -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <h3 class="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Eng ko'p sotilgan aksessuarlar
          </h3>
          <div class="space-y-3">
            <div
              v-for="(acc, index) in reportsStore.topAccessories"
              :key="index"
              class="flex items-center justify-between p-3 rounded-xl border dark:border-slate-800/40 text-xs"
            >
              <div>
                <span class="font-bold text-slate-800 dark:text-slate-200">{{ acc.name }}</span>
                <p class="text-[10px] text-slate-400 font-semibold">{{ acc.quantitySold }} ta sotildi</p>
              </div>
              <div class="text-right font-bold text-primary-600 dark:text-primary-400 font-mono">
                ${{ (acc.sellingPrice * acc.quantitySold).toLocaleString() }}
              </div>
            </div>
            <div v-if="reportsStore.topAccessories.length === 0" class="text-center py-8 text-xs text-slate-400">
              Katalogda aksessuarlar tahlili mavjud emas
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useReportsStore } from '../stores/reports';
import {
  Printer as PrintIcon,
  CheckCircle2 as CheckIcon,
  AlertTriangle as AlertIcon
} from 'lucide-vue-next';
import gsap from 'gsap';

const reportsStore = useReportsStore();
const viewRef = ref(null);
const period = ref('monthly');

const summary = computed(() => reportsStore.reportsSummary);

const fetchData = () => {
  reportsStore.fetchAnalyticsReports({ range: period.value });
};

const changePeriod = (p) => {
  period.value = p;
  fetchData();
};

const translatePeriod = (p) => {
  switch (p) {
    case 'daily': return 'Kunlik';
    case 'weekly': return 'Haftalik';
    case 'monthly': return 'Aylik';
    case 'yearly': return 'Yillik';
    default: return p;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const triggerPrint = () => {
  window.print();
};

onMounted(() => {
  fetchData();

  gsap.from(viewRef.value.children, {
    duration: 0.5,
    opacity: 0,
    y: 10,
    stagger: 0.08,
    ease: 'power1.out'
  });
});
</script>
