<template>
  <div class="space-y-6" ref="viewRef">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      <!-- Left Column: Log Payment Form -->
      <div class="p-6 rounded-2xl border glass-card space-y-4 h-fit">
        <h3 class="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
          Chiqim orderini rasmiylashtirish (Chiqim)
        </h3>

        <form @submit.prevent="handleLogPayment" class="space-y-4">
          <!-- Amount -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-slate-400">To'langan summa ($) *</label>
            <input
              v-model.number="form.amount"
              type="number"
              step="0.01"
              class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
              required
            />
          </div>

          <!-- Reason -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-slate-400">Sababi / Izoh *</label>
            <input
              v-model="form.reason"
              type="text"
              placeholder="Masalan: Yetkazib beruvchi bilan hisob-kitob"
              class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
              required
            />
          </div>

          <!-- Supplier -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-slate-400">Yetkazib beruvchi ismi</label>
            <input
              v-model="form.supplier"
              type="text"
              placeholder="Yetkazib beruvchi nomi"
              class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
            />
          </div>

          <!-- Description -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-slate-400">Qo'shimcha izohlar</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none resize-none"
            ></textarea>
          </div>

          <!-- Date -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-slate-400">Sana</label>
            <input
              v-model="form.date"
              type="date"
              class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
            />
          </div>

          <button
            type="submit"
            :disabled="financeStore.loading"
            class="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            Chiqimni saqlash
          </button>
        </form>
      </div>

      <!-- Right Column: Stats and Payment Logs -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Stats Summary -->
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 rounded-xl border glass-card text-xs">
            <span class="text-slate-400">Bugungi jami chiqim</span>
            <p class="text-lg font-extrabold text-rose-600 dark:text-rose-400 mt-1">
              ${{ financeStore.dailyPayments }}
            </p>
          </div>
          <div class="p-4 rounded-xl border glass-card text-xs">
            <span class="text-slate-400">Aylik jami chiqim</span>
            <p class="text-lg font-extrabold text-rose-600 dark:text-rose-400 mt-1">
              ${{ financeStore.monthlyPayments }}
            </p>
          </div>
        </div>

        <!-- Payment log history -->
        <div class="glass-card border rounded-2xl overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/40 font-bold text-xs">
            Chiqim amallari tarixi
          </div>
          
          <SkeletonTable v-if="financeStore.loading" :rows="4" />
          
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200/50 dark:border-slate-800/40 text-slate-500">
                  <th class="p-3">Sana</th>
                  <th class="p-3">Sababi</th>
                  <th class="p-3">Yetkazib beruvchi</th>
                  <th class="p-3 text-right">Summa</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/40">
                <tr v-if="payments.length === 0">
                  <td colspan="4" class="p-8 text-center text-slate-400">
                    Chiqim amallari hali ro'yxatga olinmagan.
                  </td>
                </tr>
                <tr v-for="pay in payments" :key="pay._id" class="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td class="p-3 text-slate-400 font-mono text-[10px]">
                    {{ formatDate(pay.date) }}
                  </td>
                  <td class="p-3">
                    <div class="font-bold text-slate-700 dark:text-slate-300">{{ pay.reason }}</div>
                    <div class="text-[9px] text-slate-400">{{ pay.description }}</div>
                  </td>
                  <td class="p-3 text-slate-500">
                    {{ pay.supplier || '-' }}
                  </td>
                  <td class="p-3 text-right font-bold text-rose-600 dark:text-rose-400 font-mono">
                    -${{ pay.amount }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useFinanceStore } from '../stores/finance';
import SkeletonTable from '../components/SkeletonTable.vue';
import gsap from 'gsap';

const financeStore = useFinanceStore();
const viewRef = ref(null);

const payments = computed(() => financeStore.payments);

const form = reactive({
  amount: 0,
  reason: '',
  supplier: '',
  description: '',
  date: new Date().toISOString().substring(0, 10)
});

const fetchData = () => {
  financeStore.fetchPayments();
};

const handleLogPayment = async () => {
  const success = await financeStore.payMoney(form);
  if (success) {
    Object.assign(form, {
      amount: 0,
      reason: '',
      supplier: '',
      description: '',
      date: new Date().toISOString().substring(0, 10)
    });
    fetchData();
  }
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

onMounted(() => {
  fetchData();

  gsap.from(viewRef.value.children, {
    duration: 0.5,
    opacity: 0,
    y: 10,
    ease: 'power1.out'
  });
});
</script>
