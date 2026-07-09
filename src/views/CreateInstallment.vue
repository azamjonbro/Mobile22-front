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

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      <!-- Left: Product Selection & Customer -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Phone Search -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <h3 class="text-sm font-bold text-slate-800 dark:text-white">
            Telefon qidirish va qo'shish
          </h3>

          <div class="relative">
            <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              v-model="phoneSearch"
              @input="searchPhones"
              type="text"
              placeholder="Model yoki brand nomini kiriting..."
              class="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border rounded-xl focus:outline-none"
            />

            <!-- Phone Results -->
            <div
              v-if="phoneResults.length > 0"
              class="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y dark:divide-slate-800"
            >
              <div
                v-for="phone in phoneResults"
                :key="phone._id"
                @click="addPhoneToCart(phone)"
                class="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs flex justify-between items-center"
              >
                <div class="min-w-0">
                  <div class="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {{ phone.brand || '-' }} {{ phone.name || 'Nomsiz' }}
                  </div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {{ phone.storage || '-' }} • {{ phone.condition || '-' }} • Omborda: {{ phone.quantity }} ta
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-primary-600 dark:text-primary-400 font-mono">
                    ${{ phone.sellingPrice ?? 0 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Accessory Search -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <h3 class="text-sm font-bold text-slate-800 dark:text-white">
            Aksessuar qidirish va qo'shish
          </h3>

          <div class="relative">
            <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              v-model="accSearch"
              @input="searchAccessories"
              type="text"
              placeholder="Aksessuar nomini kiriting..."
              class="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border rounded-xl focus:outline-none"
            />

            <!-- Accessory Results -->
            <div
              v-if="accResults.length > 0"
              class="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y dark:divide-slate-800"
            >
              <div
                v-for="acc in accResults"
                :key="acc._id"
                @click="addAccessoryToCart(acc)"
                class="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs flex justify-between items-center"
              >
                <div class="min-w-0">
                  <div class="font-semibold text-slate-800 dark:text-slate-200 truncate">{{ acc.name }}</div>
                  <div class="text-[10px] text-slate-500">{{ acc.category }} • Omborda: {{ acc.quantity }}</div>
                </div>
                <div class="font-bold text-primary-600 dark:text-primary-400 font-mono">${{ acc.sellingPrice }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Items with Editable Selling Price -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <span class="text-xs font-semibold text-slate-400">Savatchadagi mahsulotlar</span>

          <div v-if="cart.length === 0" class="text-center py-6 text-slate-400 text-xs border border-dashed rounded-xl">
            Mahsulot tanlanmagan. Qidiruv orqali qo'shing.
          </div>

          <div
            v-for="(item, index) in cart"
            :key="index"
            class="p-4 rounded-xl border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 text-xs space-y-3"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                  :class="item.type === 'Phone' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'"
                >
                  <SmartphoneIcon v-if="item.type === 'Phone'" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <TagIcon v-else class="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-slate-800 dark:text-white truncate">{{ item.name }}</p>
                  <p class="text-[10px] text-slate-400">
                    Soni: {{ item.quantity }} ta
                  </p>
                  <p v-if="item.condition" class="text-[10px] text-slate-400">Holati: {{ item.condition }}</p>
                </div>
              </div>
              <button
                type="button"
                @click="removeFromCart(index)"
                class="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>

            <!-- Price Section for Phones -->
            <div v-if="item.type === 'Phone'" class="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <div class="space-y-1">
                <label class="text-[10px] font-semibold text-slate-400">Sotish soni *</label>
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  :max="item.maxQuantity"
                  @input="item.totalPrice = item.unitPrice * item.quantity"
                  class="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded font-mono text-center font-bold"
                />
              </div>
              <div class="space-y-1">
                <span class="text-[10px] text-slate-400">Kirim narxi (Avg)</span>
                <p class="font-bold text-slate-500 font-mono pt-1.5">${{ item.purchasePrice }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-semibold text-primary-500">Sotish narxi ($/dona) *</label>
                <input
                  v-model.number="item.unitPrice"
                  type="number"
                  step="1"
                  min="0"
                  @input="item.totalPrice = item.unitPrice * item.quantity"
                  class="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-primary-300 dark:border-primary-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono text-right font-bold"
                />
              </div>
            </div>

            <!-- Price for Accessories -->
            <div v-else class="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <div class="space-y-1">
                <label class="text-[10px] font-semibold text-slate-400">Miqdori *</label>
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  :max="item.maxQuantity"
                  @input="item.totalPrice = item.unitPrice * item.quantity"
                  class="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded font-mono text-center font-bold"
                />
              </div>
              <div class="space-y-1">
                <span class="text-[10px] text-slate-400">Dona narxi</span>
                <p class="font-bold text-slate-500 font-mono pt-1.5">${{ item.unitPrice }}</p>
              </div>
              <div class="space-y-1">
                <span class="text-[10px] text-slate-400">Jami narxi</span>
                <p class="font-bold text-primary-600 dark:text-primary-400 font-mono pt-1.5">${{ item.totalPrice }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <h3 class="text-sm font-bold text-slate-800 dark:text-white">
            Mijoz ma'lumotlari
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Mijoz ismi *</label>
              <input
                v-model="form.customerName"
                type="text"
                placeholder="To'liq ism-familiya"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                required
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Telefon raqami *</label>
              <input
                v-model="form.customerPhone"
                type="text"
                placeholder="+998901234567"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Installment Terms & Summary -->
      <div class="space-y-6">
        <!-- Installment Terms -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <h3 class="text-sm font-bold text-slate-800 dark:text-white">
            Nasiya shartlari
          </h3>

          <div class="space-y-3 text-xs">
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Dastlabki to'lov ($)</label>
              <input
                v-model.number="form.initialPayment"
                type="number"
                min="0"
                class="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl focus:outline-none font-mono"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Muddati (Oy)</label>
              <select
                v-model.number="form.numberOfMonths"
                class="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl focus:outline-none"
              >
                <option :value="1">1 oy</option>
                <option :value="2">2 oy</option>
                <option :value="3">3 oy</option>
                <option :value="6">6 oy</option>
                <option :value="9">9 oy</option>
                <option :value="12">12 oy</option>
                <option :value="24">24 oy</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Birinchi to'lov sanasi</label>
              <input
                v-model="form.firstPaymentDate"
                type="date"
                class="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl focus:outline-none font-mono"
                required
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Izohlar</label>
              <textarea
                v-model="form.notes"
                rows="2"
                placeholder="Nasiya bo'yicha maxsus shartlar yoki izohlar..."
                class="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl focus:outline-none"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Payment Calculations Summary -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <h3 class="text-sm font-bold text-slate-800 dark:text-white pb-2 border-b">
            Hisob-kitob summary
          </h3>

          <div class="space-y-3 text-xs">
            <div class="flex justify-between text-slate-500">
              <span>Umumiy qiymati:</span>
              <span class="font-mono font-bold text-slate-700 dark:text-slate-350">${{ formatCurrency(calculateCartTotal()) }}</span>
            </div>
            <div class="flex justify-between text-slate-500">
              <span>Dastlabki to'lov:</span>
              <span class="font-mono text-slate-600 dark:text-slate-400">-${{ formatCurrency(form.initialPayment) }}</span>
            </div>
            <div class="flex justify-between text-slate-550 border-t border-dashed pt-2 font-bold">
              <span>Nasiya qarzdorligi:</span>
              <span class="font-mono text-rose-500">${{ formatCurrency(calculateRemainingDebt()) }}</span>
            </div>
            <div class="flex justify-between items-center text-primary-600 dark:text-primary-400 font-extrabold text-sm pt-1">
              <span>Oylik to'lov:</span>
              <span class="font-mono">${{ formatCurrency(calculateMonthlyPayment()) }} / oy</span>
            </div>
          </div>

          <button
            @click="submitInstallment"
            :disabled="loading || cart.length === 0"
            class="w-full py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg hover:from-primary-700 hover:to-indigo-700 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {{ loading ? 'Rasmiylashtirilmoqda...' : 'Nasiya shartnomasini yaratish' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../stores/notifications';
import {
  ArrowLeft as ArrowLeftIcon,
  Search as SearchIcon,
  Smartphone as SmartphoneIcon,
  Tag as TagIcon,
  Trash2 as TrashIcon
} from 'lucide-vue-next';
import axios from 'axios';
import gsap from 'gsap';

const router = useRouter();
const notifications = useNotificationStore();

const viewRef = ref(null);
const loading = ref(false);

const phoneSearch = ref('');
const phoneResults = ref([]);

const accSearch = ref('');
const accResults = ref([]);

const cart = ref([]);

const form = reactive({
  customerName: '',
  customerPhone: '',
  initialPayment: 0,
  numberOfMonths: 3,
  firstPaymentDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
  notes: ''
});

const calculateCartTotal = () => {
  return cart.value.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
};

const calculateRemainingDebt = () => {
  return Math.max(0, calculateCartTotal() - (parseFloat(form.initialPayment) || 0));
};

const calculateMonthlyPayment = () => {
  const debt = calculateRemainingDebt();
  return debt > 0 ? (debt / form.numberOfMonths) : 0;
};

const formatCurrency = (val) => {
  return (val || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

// Phone search
let phoneDebounce;
const searchPhones = () => {
  clearTimeout(phoneDebounce);
  phoneDebounce = setTimeout(async () => {
    if (phoneSearch.value.trim().length < 2) {
      phoneResults.value = [];
      return;
    }
    try {
      const res = await axios.get('/api/phones', {
        params: { search: phoneSearch.value, limit: 8 }
      });
      // Filter out products with no stock
      phoneResults.value = res.data.data.filter(p => p.quantity > 0);
    } catch (error) {
      console.error('Phone search failed:', error.message);
    }
  }, 300);
};

// Accessory search
let accDebounce;
const searchAccessories = () => {
  clearTimeout(accDebounce);
  accDebounce = setTimeout(async () => {
    if (accSearch.value.trim().length < 2) {
      accResults.value = [];
      return;
    }
    try {
      const res = await axios.get('/api/accessories', {
        params: { search: accSearch.value, limit: 8 }
      });
      accResults.value = res.data.data;
    } catch (error) {
      console.error('Accessory search failed:', error.message);
    }
  }, 300);
};

const addPhoneToCart = (phone) => {
  if (cart.value.some(i => i.id === phone._id && i.type === 'Phone')) {
    notifications.warning('Ogohlantirish', 'Bu mahsulot allaqachon qo\'shilgan');
    return;
  }
  cart.value.push({
    type: 'Phone',
    id: phone._id,
    name: `${phone.brand || ''} ${phone.name || ''}`.trim() || 'Unknown',
    purchasePrice: phone.averageBuyPrice || phone.buyPrice || 0,
    suggestedPrice: phone.sellingPrice || 0,
    unitPrice: phone.sellingPrice || 0,
    quantity: 1,
    maxQuantity: phone.quantity,
    totalPrice: phone.sellingPrice || 0,
    condition: phone.condition || 'New'
  });
  phoneSearch.value = '';
  phoneResults.value = [];
};

const addAccessoryToCart = (acc) => {
  const existing = cart.value.find(i => i.id === acc._id && i.type === 'Accessory');
  if (existing) {
    if (existing.quantity < acc.quantity) {
      existing.quantity += 1;
      existing.totalPrice = existing.unitPrice * existing.quantity;
    } else {
      notifications.warning('Ogohlantirish', 'Omborda yetarli mahsulot yo\'q');
    }
    accSearch.value = '';
    accResults.value = [];
    return;
  }
  cart.value.push({
    type: 'Accessory',
    id: acc._id,
    name: acc.name,
    unitPrice: acc.sellingPrice,
    quantity: 1,
    totalPrice: acc.sellingPrice,
    maxQuantity: acc.quantity
  });
  accSearch.value = '';
  accResults.value = [];
};

const removeFromCart = (index) => {
  cart.value.splice(index, 1);
};

const submitInstallment = async () => {
  if (cart.value.length === 0) {
    notifications.error('Xatolik', 'Kamida bitta mahsulot tanlang');
    return;
  }
  if (!form.customerName || !form.customerPhone) {
    notifications.error('Xatolik', 'Mijoz ismi va telefon raqami majburiy');
    return;
  }

  const phoneIds = cart.value.filter(i => i.type === 'Phone').map(i => i.id);
  const accessoryItems = cart.value
    .filter(i => i.type === 'Accessory')
    .map(i => ({ accessoryId: i.id, quantity: i.quantity }));

  const sellingPrices = {};
  const quantities = {};
  cart.value.filter(i => i.type === 'Phone').forEach(i => {
    sellingPrices[i.id] = i.unitPrice || 0;
    quantities[i.id] = i.quantity || 1;
  });

  const payload = {
    customerName: form.customerName,
    customerPhone: form.customerPhone,
    phoneIds,
    sellingPrices,
    quantities,
    accessoryItems,
    initialPayment: form.initialPayment,
    numberOfMonths: form.numberOfMonths,
    firstPaymentDate: form.firstPaymentDate,
    notes: form.notes
  };

  loading.value = true;
  try {
    const res = await axios.post('/api/installments', payload);
    if (res.data.success) {
      notifications.success('Muvaffaqiyatli', 'Nasiya shartnomasi rasmiylashtirildi');
      router.push(`/installments/${res.data.data.installment._id}`);
    }
  } catch (error) {
    notifications.error('Xatolik', error.response?.data?.message || 'Nasiyani yaratib bo\'lmadi');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  gsap.from(viewRef.value.children, {
    duration: 0.5,
    opacity: 0,
    y: 10,
    ease: 'power1.out'
  });
});
</script>
