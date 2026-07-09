<template>
  <div class="space-y-6" ref="viewRef">
    <!-- Back Button -->
    <router-link
      to="/installments"
      class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors"
    >
      <ArrowLeftIcon class="w-4 h-4" />
      Nasiya ro'yxatiga qaytish
    </router-link>

    <div v-if="instStore.loading && !installment" class="text-center py-20">
      <div class="text-slate-400 text-sm">Yuklanmoqda...</div>
    </div>

    <template v-if="installment">
      <!-- Header Row -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-extrabold text-slate-800 dark:text-white">
            {{ installment.customerName }}
          </h2>
          <p class="text-xs text-slate-400 font-mono">{{ installment.customerPhone }}</p>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="px-3 py-1 rounded-full text-xs font-bold"
            :class="statusClass(installment.status)"
          >
            {{ statusLabel(installment.status) }}
          </span>
          <button
            v-if="installment.status !== 'PaidOff' && authStore.hasPermission('sales')"
            @click="showPaymentModal = true"
            class="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/15"
          >
            <BanknoteIcon class="w-4 h-4" />
            To'lov qabul qilish
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Customer & Product Info -->
          <div class="p-6 rounded-2xl glass-card border space-y-4">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">Sotib olingan mahsulotlar</h3>
            <div class="space-y-2">
              <div
                v-for="(item, idx) in installment.items"
                :key="idx"
                class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <SmartphoneIcon v-if="item.itemType === 'Product'" class="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <TagIcon v-else class="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p class="text-xs font-bold text-slate-800 dark:text-white">{{ item.name }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-xs font-bold text-primary-600 dark:text-primary-400 font-mono">${{ formatNumber(item.sellingPrice) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Timeline -->
          <div class="p-6 rounded-2xl glass-card border space-y-4">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">To'lov tarixi</h3>

            <div v-if="installment.payments.length === 0" class="text-center py-6 text-slate-400 text-xs border border-dashed rounded-xl">
              Hali to'lov amalga oshirilmagan
            </div>

            <div v-else class="space-y-3 relative pl-6 border-l-2 border-slate-200 dark:border-slate-800">
              <!-- Initial Payment -->
              <div v-if="installment.initialPayment > 0" class="relative">
                <span class="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950"></span>
                <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                  <div class="flex items-center justify-between text-xs">
                    <div>
                      <span class="font-bold text-emerald-700 dark:text-emerald-400">Boshlang'ich to'lov</span>
                      <p class="text-[10px] text-slate-500 mt-0.5">{{ formatDate(installment.createdAt) }}</p>
                    </div>
                    <span class="font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">${{ formatNumber(installment.initialPayment) }}</span>
                  </div>
                </div>
              </div>

              <!-- Subsequent Payments -->
              <div
                v-for="payment in installment.payments"
                :key="payment._id"
                class="relative"
              >
                <span class="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-950"></span>
                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50">
                  <div class="flex items-center justify-between text-xs">
                    <div>
                      <span class="font-bold text-slate-700 dark:text-slate-200">{{ translateMethod(payment.method) }}</span>
                      <p class="text-[10px] text-slate-400 mt-0.5">{{ formatDate(payment.date) }}</p>
                      <p v-if="payment.receivedByName" class="text-[10px] text-slate-400">Qabul qilgan: {{ payment.receivedByName }}</p>
                      <p v-if="payment.notes" class="text-[10px] text-slate-500 italic mt-1">{{ payment.notes }}</p>
                    </div>
                    <span class="font-extrabold text-blue-700 dark:text-blue-400 font-mono">${{ formatNumber(payment.amount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Financial Summary -->
        <div class="space-y-6">
          <!-- Financial Card -->
          <div class="p-6 rounded-2xl glass-card border space-y-4">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">Moliyaviy xulosa</h3>
            <div class="space-y-3 text-xs">
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span class="text-slate-500">Jami narx</span>
                <span class="font-bold text-slate-800 dark:text-white font-mono">${{ formatNumber(installment.totalPrice) }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span class="text-slate-500">Boshlang'ich to'lov</span>
                <span class="font-semibold text-emerald-600 font-mono">${{ formatNumber(installment.initialPayment) }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span class="text-slate-500">To'langan (jami)</span>
                <span class="font-semibold text-blue-600 font-mono">${{ formatNumber(installment.totalPaid) }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span class="text-slate-500 font-bold">Qoldiq qarz</span>
                <span class="font-extrabold font-mono"
                  :class="installment.remainingDebt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'"
                >
                  ${{ formatNumber(installment.remainingDebt) }}
                </span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span class="text-slate-500">Oylik to'lov</span>
                <span class="font-semibold text-slate-700 dark:text-slate-200 font-mono">${{ formatNumber(installment.monthlyPayment) }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span class="text-slate-500">Oylar soni</span>
                <span class="font-semibold text-slate-700 dark:text-slate-200">{{ installment.numberOfMonths }} oy</span>
              </div>
              <div class="flex justify-between py-2">
                <span class="text-slate-500">Keyingi to'lov sanasi</span>
                <span class="font-semibold text-slate-700 dark:text-slate-200">
                  {{ installment.nextPaymentDate ? formatDate(installment.nextPaymentDate) : '—' }}
                </span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-[10px] text-slate-400">
                <span>To'lov jarayoni</span>
                <span class="font-bold">{{ paymentProgress }}%</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="installment.status === 'PaidOff' ? 'bg-emerald-500' : 'bg-primary-500'"
                  :style="{ width: paymentProgress + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="installment.notes" class="p-6 rounded-2xl glass-card border space-y-2">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">Izoh</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ installment.notes }}</p>
          </div>

          <!-- Metadata -->
          <div class="p-6 rounded-2xl glass-card border space-y-2 text-xs">
            <div class="flex justify-between text-slate-500">
              <span>Yaratilgan sana</span>
              <span class="text-slate-700 dark:text-slate-300">{{ formatDate(installment.createdAt) }}</span>
            </div>
            <div class="flex justify-between text-slate-500">
              <span>Xodim</span>
              <span class="text-slate-700 dark:text-slate-300">{{ installment.createdBy?.name || '—' }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

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

          <div v-if="installment" class="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50 space-y-1 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-400">Mijoz:</span>
              <span class="font-semibold text-slate-700 dark:text-slate-200">{{ installment.customerName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Qoldiq qarz:</span>
              <span class="font-bold text-rose-600 dark:text-rose-400">${{ formatNumber(installment.remainingDebt) }}</span>
            </div>
          </div>

          <form @submit.prevent="submitPayment" class="space-y-4 mt-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">To'lov summasi ($) *</label>
              <input
                v-model.number="paymentForm.amount"
                type="number"
                step="0.01"
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useInstallmentsStore } from '../stores/installments';
import {
  ArrowLeft as ArrowLeftIcon,
  Smartphone as SmartphoneIcon,
  Tag as TagIcon,
  Banknote as BanknoteIcon,
  X as XIcon
} from 'lucide-vue-next';
import gsap from 'gsap';

const route = useRoute();
const authStore = useAuthStore();
const instStore = useInstallmentsStore();
const viewRef = ref(null);
const showPaymentModal = ref(false);

const installment = computed(() => instStore.currentInstallment);

const paymentProgress = computed(() => {
  if (!installment.value || installment.value.totalPrice <= 0) return 0;
  return Math.min(100, Math.round((installment.value.totalPaid / installment.value.totalPrice) * 100));
});

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

const translateMethod = (method) => {
  switch (method) {
    case 'Cash': return 'Naqd';
    case 'Card': return 'Karta';
    case 'Transfer': return 'O\'tkazma';
    default: return method;
  }
};

const submitPayment = async () => {
  const result = await instStore.receivePayment(route.params.id, paymentForm);
  if (result) {
    showPaymentModal.value = false;
    paymentForm.amount = installment.value?.monthlyPayment || 0;
    paymentForm.notes = '';
  }
};

onMounted(async () => {
  await instStore.fetchInstallmentById(route.params.id);

  if (installment.value) {
    paymentForm.amount = installment.value.monthlyPayment;
  }

  gsap.from(viewRef.value.children, {
    duration: 0.5,
    opacity: 0,
    y: 10,
    stagger: 0.08,
    ease: 'power1.out'
  });
});
</script>
