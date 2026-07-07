<template>
  <div class="space-y-6" ref="viewRef">
    <!-- Header Controls -->
    <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div class="flex flex-wrap gap-2 items-center w-full sm:w-auto">
        <!-- Search -->
        <div class="relative w-full sm:w-64">
          <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="filters.search"
            @input="handleSearch"
            type="text"
            placeholder="Mijoz, telefon, mahsulot qidirish..."
            class="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
          />
        </div>

        <!-- Status Filter -->
        <select
          v-model="filters.status"
          @change="fetchData"
          class="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
        >
          <option value="">Barcha statuslar</option>
          <option value="Active">Faol</option>
          <option value="PaidOff">To'langan</option>
          <option value="Overdue">Muddati o'tgan</option>
        </select>
      </div>

      <router-link
        v-if="authStore.hasPermission('sales')"
        to="/installments/new"
        class="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary-600/15"
      >
        <PlusIcon class="w-4 h-4" />
        Yangi nasiya
      </router-link>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div class="p-4 rounded-2xl glass-card border space-y-1">
        <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Faol nasiyalar</div>
        <div class="text-lg font-extrabold text-blue-600 dark:text-blue-400">{{ instStore.stats.activeInstallments }}</div>
      </div>
      <div class="p-4 rounded-2xl glass-card border space-y-1">
        <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Muddati o'tgan</div>
        <div class="text-lg font-extrabold text-rose-600 dark:text-rose-400">{{ instStore.stats.overdueInstallments }}</div>
      </div>
      <div class="p-4 rounded-2xl glass-card border space-y-1">
        <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Jami qarz</div>
        <div class="text-lg font-extrabold text-amber-600 dark:text-amber-400">${{ formatNumber(instStore.stats.totalInstallmentDebt) }}</div>
      </div>
      <div class="p-4 rounded-2xl glass-card border space-y-1">
        <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Bugungi to'lovlar</div>
        <div class="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">${{ formatNumber(instStore.stats.todayInstallmentPayments) }}</div>
      </div>
      <div class="p-4 rounded-2xl glass-card border space-y-1">
        <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Oylik yig'ilgan</div>
        <div class="text-lg font-extrabold text-purple-600 dark:text-purple-400">${{ formatNumber(instStore.stats.monthlyCollected) }}</div>
      </div>
      <div class="p-4 rounded-2xl glass-card border space-y-1">
        <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Bugun to'lov kuni</div>
        <div class="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{{ instStore.stats.dueTodayCount }}</div>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-card border rounded-2xl overflow-hidden">
      <SkeletonTable v-if="instStore.loading" :rows="5" />
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200/50 dark:border-slate-800/40 text-slate-500">
              <th class="p-4">Mijoz</th>
              <th class="p-4">Telefon raqami</th>
              <th class="p-4">Mahsulotlar</th>
              <th class="p-4 text-right">Jami narx</th>
              <th class="p-4 text-right">To'langan</th>
              <th class="p-4 text-right">Qoldiq qarz</th>
              <th class="p-4 text-right">Oylik to'lov</th>
              <th class="p-4">Keyingi to'lov</th>
              <th class="p-4 text-center">Status</th>
              <th class="p-4 text-center">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/40">
            <tr v-if="instStore.installments.length === 0">
              <td colspan="10" class="p-8 text-center text-slate-400">
                Nasiya yozuvlari topilmadi
              </td>
            </tr>
            <tr
              v-for="inst in instStore.installments"
              :key="inst._id"
              class="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
            >
              <td class="p-4">
                <div class="font-bold text-slate-800 dark:text-white">{{ inst.customerName }}</div>
              </td>
              <td class="p-4 font-mono text-[10px] text-slate-500">
                {{ inst.customerPhone }}
              </td>
              <td class="p-4">
                <div class="max-w-xs">
                  <span
                    v-for="(item, idx) in inst.items"
                    :key="idx"
                    class="inline-block mr-1 mb-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    {{ item.name }}
                  </span>
                </div>
              </td>
              <td class="p-4 text-right font-semibold text-slate-700 dark:text-slate-200 font-mono">
                ${{ formatNumber(inst.totalPrice) }}
              </td>
              <td class="p-4 text-right font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                ${{ formatNumber(inst.totalPaid) }}
              </td>
              <td class="p-4 text-right font-bold font-mono"
                :class="inst.remainingDebt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'"
              >
                ${{ formatNumber(inst.remainingDebt) }}
              </td>
              <td class="p-4 text-right text-slate-500 font-mono">
                ${{ formatNumber(inst.monthlyPayment) }}
              </td>
              <td class="p-4 text-slate-500 text-[10px]">
                {{ inst.nextPaymentDate ? formatDate(inst.nextPaymentDate) : '—' }}
              </td>
              <td class="p-4 text-center">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                  :class="statusClass(inst.status)"
                >
                  {{ statusLabel(inst.status) }}
                </span>
              </td>
              <td class="p-4 text-center">
                <div class="flex items-center justify-center gap-1">
                  <router-link
                    :to="`/installments/${inst._id}`"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                    title="Batafsil ko'rish"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </router-link>
                  <button
                    v-if="inst.status !== 'PaidOff' && authStore.hasPermission('sales')"
                    @click="openPaymentModal(inst)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                    title="To'lov qabul qilish"
                  >
                    <BanknoteIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="instStore.pagination.pages > 1" class="flex items-center justify-between p-4 border-t border-slate-200/50 dark:border-slate-800/50">
        <span class="text-[10px] text-slate-400">
          Jami: {{ instStore.pagination.total }} ta yozuv
        </span>
        <div class="flex gap-1">
          <button
            v-for="p in instStore.pagination.pages"
            :key="p"
            @click="goToPage(p)"
            class="px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer"
            :class="filters.page === p
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'"
          >
            {{ p }}
          </button>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <Transition name="fade">
      <div
        v-if="showPaymentModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      >
        <div class="w-full max-w-md p-6 rounded-2xl glass-card border shadow-2xl">
          <div class="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">
              To'lov qabul qilish
            </h3>
            <button @click="showPaymentModal = false" class="text-slate-400 hover:text-slate-600">
              <XIcon class="w-4 h-4" />
            </button>
          </div>

          <!-- Payment target info -->
          <div v-if="selectedInstallment" class="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50 space-y-1 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-400">Mijoz:</span>
              <span class="font-semibold text-slate-700 dark:text-slate-200">{{ selectedInstallment.customerName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Qoldiq qarz:</span>
              <span class="font-bold text-rose-600 dark:text-rose-400">${{ formatNumber(selectedInstallment.remainingDebt) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Oylik to'lov:</span>
              <span class="font-semibold text-slate-600 dark:text-slate-300">${{ formatNumber(selectedInstallment.monthlyPayment) }}</span>
            </div>
          </div>

          <form @submit.prevent="submitPayment" class="space-y-4 mt-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">To'lov summasi ($) *</label>
              <input
                v-model.number="paymentForm.amount"
                type="number"
                step="0.01"
                :max="selectedInstallment?.remainingDebt"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none font-mono"
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-[10px] font-semibold text-slate-400">To'lov sanasi</label>
                <input
                  v-model="paymentForm.date"
                  type="date"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-semibold text-slate-400">To'lov usuli</label>
                <select
                  v-model="paymentForm.method"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                >
                  <option value="Cash">Naqd</option>
                  <option value="Card">Karta</option>
                  <option value="Transfer">O'tkazma</option>
                </select>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Izoh (ixtiyoriy)</label>
              <textarea
                v-model="paymentForm.notes"
                rows="2"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none resize-none"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
              <button
                type="button"
                @click="showPaymentModal = false"
                class="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                :disabled="instStore.loading"
                class="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-lg cursor-pointer disabled:opacity-50"
              >
                {{ instStore.loading ? 'Saqlanmoqda...' : 'To\'lovni saqlash' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useInstallmentsStore } from '../stores/installments';
import SkeletonTable from '../components/SkeletonTable.vue';
import {
  Search as SearchIcon,
  Plus as PlusIcon,
  Eye as EyeIcon,
  Banknote as BanknoteIcon,
  X as XIcon
} from 'lucide-vue-next';
import gsap from 'gsap';

const authStore = useAuthStore();
const instStore = useInstallmentsStore();
const viewRef = ref(null);

const filters = reactive({
  search: '',
  status: '',
  page: 1,
  limit: 20
});

const showPaymentModal = ref(false);
const selectedInstallment = ref(null);

const paymentForm = reactive({
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  method: 'Cash',
  notes: ''
});

const formatNumber = (val) => {
  return (val || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const statusClass = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-500/10';
    case 'PaidOff':
      return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10';
    case 'Overdue':
      return 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-500/10';
    default:
      return 'bg-slate-50 text-slate-500';
  }
};

const statusLabel = (status) => {
  switch (status) {
    case 'Active': return 'Faol';
    case 'PaidOff': return 'To\'langan';
    case 'Overdue': return 'Muddati o\'tgan';
    default: return status;
  }
};

const fetchData = () => {
  instStore.fetchInstallments(filters);
  instStore.fetchStats();
};

let debounceTimeout;
const handleSearch = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    filters.page = 1;
    fetchData();
  }, 300);
};

const goToPage = (page) => {
  filters.page = page;
  instStore.fetchInstallments(filters);
};

const openPaymentModal = (inst) => {
  selectedInstallment.value = inst;
  paymentForm.amount = inst.monthlyPayment;
  paymentForm.date = new Date().toISOString().split('T')[0];
  paymentForm.method = 'Cash';
  paymentForm.notes = '';
  showPaymentModal.value = true;
};

const submitPayment = async () => {
  if (!selectedInstallment.value) return;
  const result = await instStore.receivePayment(selectedInstallment.value._id, paymentForm);
  if (result) {
    showPaymentModal.value = false;
    fetchData();
  }
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
