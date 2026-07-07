<template>
  <div class="space-y-6" ref="viewRef">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      <!-- Left Column: Add Expense Form & Breakdown -->
      <div class="space-y-6">
        <!-- Add Expense -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <h3 class="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
            Do'kon xarajatini kiritish
          </h3>

          <form @submit.prevent="handleLogExpense" class="space-y-4">
            <!-- Category -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Kategoriya *</label>
              <select
                v-model="form.category"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                required
              >
                <option value="Electricity">Elektr energiya (Electricity)</option>
                <option value="Internet">Internet</option>
                <option value="Rent">Ijara (Rent)</option>
                <option value="Salary">Oylik maosh (Salary)</option>
                <option value="Transport">Transport</option>
                <option value="Food">Oziq-ovqat (Food)</option>
                <option value="Cleaning">Tozalash (Cleaning)</option>
                <option value="Office">Ofis xarajatlari (Office)</option>
                <option value="Other">Boshqa (Other)</option>
              </select>
            </div>

            <!-- Amount -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Xarajat summasi ($) *</label>
              <input
                v-model.number="form.amount"
                type="number"
                step="0.01"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none font-mono"
                required
              />
            </div>

            <!-- Description -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Tavsif</label>
              <textarea
                v-model="form.description"
                rows="2"
                placeholder="To'lov tafsilotlari..."
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
              Xarajatni saqlash
            </button>
          </form>
        </div>

        <!-- Category Breakdown Bars -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <h4 class="text-xs font-bold text-slate-700 dark:text-slate-200">
            Kategoriyalar bo'yicha taqsimot
          </h4>
          <div class="space-y-3">
            <div
              v-for="(amount, cat) in financeStore.categoryExpenses"
              :key="cat"
              class="space-y-1"
            >
              <div class="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                <span>{{ translateCategory(cat) }}</span>
                <span>${{ amount.toLocaleString() }} ({{ getCategoryPercentage(amount) }}%)</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  class="bg-rose-500 h-full rounded-full transition-all duration-500"
                  :style="{ width: `${getCategoryPercentage(amount)}%` }"
                ></div>
              </div>
            </div>
            <div v-if="Object.keys(financeStore.categoryExpenses).length === 0" class="text-center py-4 text-xs text-slate-400">
              Tahlil qilish uchun xarajatlar kiritilmagan
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Stats and Logs -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Stats Summary -->
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 rounded-xl border glass-card text-xs">
            <span class="text-slate-400">Bugungi xarajatlar</span>
            <p class="text-lg font-extrabold text-rose-600 dark:text-rose-400 mt-1">
              ${{ financeStore.dailyExpenses }}
            </p>
          </div>
          <div class="p-4 rounded-xl border glass-card text-xs">
            <span class="text-slate-400">Aylik xarajatlar</span>
            <p class="text-lg font-extrabold text-rose-600 dark:text-rose-400 mt-1">
              ${{ financeStore.monthlyExpenses }}
            </p>
          </div>
        </div>

        <!-- Logs Table -->
        <div class="glass-card border rounded-2xl overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/40 font-bold text-xs">
            Kunlik xarajatlar jurnali
          </div>
          
          <SkeletonTable v-if="financeStore.loading" :rows="5" />
          
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200/50 dark:border-slate-800/40 text-slate-500">
                  <th class="p-3">Sana</th>
                  <th class="p-3">Kategoriya</th>
                  <th class="p-3">Tavsif</th>
                  <th class="p-3 text-right">Summa</th>
                  <th class="p-3 text-center">Amallar</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/40">
                <tr v-if="expenses.length === 0">
                  <td colspan="5" class="p-8 text-center text-slate-400">
                    Xarajatlar hali ro'yxatga olinmagan
                  </td>
                </tr>
                <tr
                  v-for="exp in expenses"
                  :key="exp._id"
                  class="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
                >
                  <td class="p-3 text-slate-400 font-mono text-[10px]">
                    {{ formatDate(exp.date) }}
                  </td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/30">
                      {{ translateCategory(exp.category) }}
                    </span>
                  </td>
                  <td class="p-3 text-slate-500">
                    {{ exp.description || '-' }}
                  </td>
                  <td class="p-3 text-right font-bold text-rose-600 dark:text-rose-400 font-mono">
                    -${{ exp.amount }}
                  </td>
                  <td class="p-3 text-center">
                    <button
                      @click="deleteExpense(exp._id)"
                      class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                      title="Xarajatni o'chirish"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
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
import { Trash2 as TrashIcon } from 'lucide-vue-next';
import gsap from 'gsap';

const financeStore = useFinanceStore();
const viewRef = ref(null);

const expenses = computed(() => financeStore.expenses);

const translateCategory = (cat) => {
  switch (cat) {
    case 'Electricity': return 'Elektr energiya';
    case 'Internet': return 'Internet';
    case 'Rent': return 'Ijara';
    case 'Salary': return 'Oylik maosh';
    case 'Transport': return 'Transport';
    case 'Food': return 'Oziq-ovqat';
    case 'Cleaning': return 'Tozalash';
    case 'Office': return 'Ofis xarajatlari';
    case 'Other': return 'Boshqa';
    default: return cat;
  }
};

const form = reactive({
  category: 'Office',
  amount: 0,
  description: '',
  date: new Date().toISOString().substring(0, 10)
});

const fetchData = () => {
  financeStore.fetchExpenses();
};

const handleLogExpense = async () => {
  const success = await financeStore.createExpense(form);
  if (success) {
    Object.assign(form, {
      category: 'Office',
      amount: 0,
      description: '',
      date: new Date().toISOString().substring(0, 10)
    });
    fetchData();
  }
};

const deleteExpense = async (id) => {
  if (confirm('Are you sure you want to delete this expense record?')) {
    const success = await financeStore.deleteExpense(id);
    if (success) {
      fetchData();
    }
  }
};

const getCategoryPercentage = (amount) => {
  const total = Object.values(financeStore.categoryExpenses).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  return Math.round((amount / total) * 100);
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
